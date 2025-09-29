/**
 * Represents a collection of loops, which are sequences of musical notes.
 * JMON-compliant implementation inspired by the Python version but using JMON format.
 */
export class Loop {
  /**
   * Initializes a Loop object.
   * 
   * @param {Object|Array} loops - Dictionary or array of JMON tracks. Each track has notes: [{pitch, duration, time, velocity}, ...]
   * @param {number} measureLength - The length of a measure in beats. Defaults to 4.
   * @param {boolean} insertRests - Whether to insert rests. Defaults to true.
   */
  constructor(loops, measureLength = 4, insertRests = true) {
    // Input validation
    if (!loops) {
      throw new Error('Loops parameter is required');
    }
    
    if (typeof measureLength !== 'number' || measureLength <= 0) {
      throw new Error('measureLength must be a positive number');
    }
    
    if (typeof insertRests !== 'boolean') {
      throw new Error('insertRests must be a boolean');
    }

    this.measureLength = measureLength;
    
    // Convert array to object if needed
    if (Array.isArray(loops)) {
      if (loops.length === 0) {
        throw new Error('Loops array cannot be empty');
      }
      const loopObj = {};
      loops.forEach((loop, i) => {
        const label = loop?.label || `Loop ${i + 1}`;
        loopObj[label] = loop;
      });
      loops = loopObj;
    }
    
    // Validate that loops object is not empty
    if (typeof loops !== 'object' || Object.keys(loops).length === 0) {
      throw new Error('Loops must be a non-empty object or array');
    }
    
    // Store loops as JMON tracks
    this.loops = {};
    for (const [name, loopData] of Object.entries(loops)) {
      // Validate loop data
      if (!loopData) {
        throw new Error(`Loop data for "${name}" is null or undefined`);
      }
      
      // Extract notes and validate them
      const notes = Array.isArray(loopData) ? loopData : (loopData.notes || []);
      
      if (!Array.isArray(notes)) {
        throw new Error(`Notes for loop "${name}" must be an array`);
      }
      
      // Validate each note has required JMON properties
      const validatedNotes = notes.map((note, index) => {
        if (!note || typeof note !== 'object') {
          throw new Error(`Note ${index} in loop "${name}" must be an object`);
        }
        
        if (note.pitch !== null && (typeof note.pitch !== 'number' || note.pitch < 0 || note.pitch > 127)) {
          throw new Error(`Note ${index} in loop "${name}" has invalid pitch: ${note.pitch}`);
        }
        
        if (typeof note.time !== 'number' || note.time < 0) {
          throw new Error(`Note ${index} in loop "${name}" has invalid time: ${note.time}`);
        }
        
        if (typeof note.duration !== 'number' || note.duration <= 0) {
          throw new Error(`Note ${index} in loop "${name}" has invalid duration: ${note.duration}`);
        }
        
        return {
          pitch: note.pitch,
          time: note.time,
          duration: note.duration,
          velocity: typeof note.velocity === 'number' ? Math.max(0, Math.min(1, note.velocity)) : 0.8
        };
      });
      
      this.loops[name] = {
        label: loopData.label || name,
        notes: insertRests ? this.fillGapsWithRests(validatedNotes) : validatedNotes,
        synth: loopData.synth || {
          type: 'Synth',
          options: {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
          }
        }
      };
    }
  }

  /**
   * Fill gaps between notes with rests (JMON format)
   */
  fillGapsWithRests(notes) {
    if (notes.length === 0) return notes;
    
    const result = [];
    let currentTime = 0;
    
    // Sort by time
    const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
    
    for (const note of sortedNotes) {
      // Add rest if there's a gap
      if (note.time > currentTime) {
        result.push({
          pitch: null, // null indicates rest
          duration: note.time - currentTime,
          time: currentTime,
          velocity: 0
        });
      }
      
      // Add the note
      result.push({
        pitch: note.pitch,
        duration: note.duration,
        time: note.time,
        velocity: note.velocity || 0.8
      });
      currentTime = note.time + note.duration;
    }
    
    return result;
  }

  /**
   * Create a loop from a single JMON track
   */
  static fromTrack(track, measureLength = 4) {
    const notes = track.notes || [];
    if (notes.length === 0) {
      throw new Error('Track must have notes to create loop');
    }

    return new Loop({ [track.label || 'Track']: track }, measureLength);
  }

  /**
   * Create loop from Euclidean rhythm (JMON format)
   */
  static euclidean(beats, pulses, pitches = [60], label = null) {
    // Input validation
    if (typeof beats !== 'number' || beats <= 0 || !Number.isInteger(beats)) {
      throw new Error('beats must be a positive integer');
    }
    
    if (typeof pulses !== 'number' || pulses < 0 || !Number.isInteger(pulses)) {
      throw new Error('pulses must be a non-negative integer');
    }
    
    if (pulses > beats) {
      throw new Error('pulses cannot be greater than beats');
    }
    
    if (!Array.isArray(pitches) || pitches.length === 0) {
      throw new Error('pitches must be a non-empty array');
    }

    const pattern = this.generateEuclideanRhythm(beats, pulses);
    const notes = [];
    const beatDuration = 1.0; // Each beat is 1 quarter note
    
    pattern.forEach((active, index) => {
      if (active) {
        const time = index * beatDuration;
        const pitch = pitches[index % pitches.length];
        notes.push({
          pitch,
          duration: beatDuration * 0.8,
          time,
          velocity: 0.8
        });
      }
    });

    const track = {
      label: label || `Euclidean ${pulses}/${beats}`,
      notes,
      synth: {
        type: 'Synth',
        options: {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
        }
      }
    };

    return new Loop({ [track.label]: track }, beats);
  }

  /**
   * Generate Euclidean rhythm pattern using Bjorklund algorithm
   * This creates the most even distribution of pulses across beats
   */
  static generateEuclideanRhythm(beats, pulses) {
    if (pulses === 0) {
      return Array(beats).fill(false);
    }
    
    if (pulses >= beats) {
      return Array(beats).fill(true);
    }
    
    // Bjorklund algorithm implementation
    const pattern = [];
    
    // Initialize with pulses and remaining beats
    let groups = [
      { pattern: [1], count: pulses },           // Groups with pulses
      { pattern: [0], count: beats - pulses }    // Groups without pulses
    ];
    
    // Apply Bjorklund algorithm
    while (groups.length > 1) {
      const [first, second] = groups;
      
      if (first.count <= second.count) {
        // Merge first group into second
        const newCount = first.count;
        const remaining = second.count - first.count;
        
        groups = [
          { pattern: [...second.pattern, ...first.pattern], count: newCount }
        ];
        
        if (remaining > 0) {
          groups.push({ pattern: second.pattern, count: remaining });
        }
      } else {
        // Merge second group into first
        const newCount = second.count;
        const remaining = first.count - second.count;
        
        groups = [
          { pattern: [...first.pattern, ...second.pattern], count: newCount }
        ];
        
        if (remaining > 0) {
          groups.push({ pattern: first.pattern, count: remaining });
        }
      }
    }
    
    // Flatten the final pattern
    const finalGroup = groups[0];
    const result = [];
    
    for (let i = 0; i < finalGroup.count; i++) {
      result.push(...finalGroup.pattern);
    }
    
    // Convert to boolean array
    return result.map(x => x === 1);
  }

  /**
   * Get loops as JMON tracks (already in JMON format)
   */
  toJMonSequences() {
    return Object.values(this.loops);
  }

  /**
   * Simple plotting method matching Python implementation
   */
  async plot(pulse = 1/4, colors = null, options = {}) {
    const { LoopVisualizer } = await import('../../visualization/loops/LoopVisualizer.js');
    return LoopVisualizer.plotLoops(
      this.loops, 
      this.measureLength,
      pulse,
      colors,
      options
    );
  }
}