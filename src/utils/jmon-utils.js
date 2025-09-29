/**
 * JMON Utilities - Official helpers for working with JMON format
 * These utilities provide a consistent API for creating and manipulating JMON objects
 */

/**
 * Convert beats (quarter notes) to bars:beats:ticks format
 * @param {number} beats - Time in beats (quarter notes)
 * @param {number} beatsPerBar - Beats per bar (default: 4 for 4/4 time)
 * @param {number} ticksPerBeat - Ticks per quarter note (default: 480, MIDI standard)
 * @returns {string} Time in "bars:beats:ticks" format
 */
export function beatsToTime(beats, beatsPerBar = 4, ticksPerBeat = 480) {
  const bars = Math.floor(beats / beatsPerBar);
  const remainingBeats = beats - bars * beatsPerBar;
  const wholeBeats = Math.floor(remainingBeats);
  const fractionalBeat = remainingBeats - wholeBeats;
  const ticks = Math.round(fractionalBeat * ticksPerBeat);
  
  return `${bars}:${wholeBeats}:${ticks}`;
}

/**
 * Convert bars:beats:ticks format to beats (quarter notes)
 * @param {string|number} timeString - Time in "bars:beats:ticks" format or number
 * @param {number} beatsPerBar - Beats per bar (default: 4 for 4/4 time)
 * @param {number} ticksPerBeat - Ticks per quarter note (default: 480, MIDI standard)
 * @returns {number} Time in beats (quarter notes)
 */
export function timeToBeats(timeString, beatsPerBar = 4, ticksPerBeat = 480) {
  if (typeof timeString === 'number') return timeString;
  if (typeof timeString !== 'string') return 0;
  
  const parts = timeString.split(':').map(x => parseFloat(x || '0'));
  const [bars = 0, beats = 0, ticks = 0] = parts;
  
  return bars * beatsPerBar + beats + ticks / ticksPerBeat;
}

/**
 * Create a JMON part from a sequence of notes
 * @param {Array} notes - Array of notes in various formats
 * @param {string} name - Part name
 * @param {Object} options - Additional options
 * @returns {Object} JMON part object
 */
export function createPart(notes, name = 'Untitled Part', options = {}) {
  const normalizedNotes = normalizeNotes(notes);
  
  return {
    name,
    notes: normalizedNotes,
    ...options
  };
}

/**
 * Create a complete JMON composition
 * @param {Array} parts - Array of parts or note sequences
 * @param {Object} metadata - Composition metadata
 * @returns {Object} Complete JMON composition
 */
export function createComposition(parts, metadata = {}) {
  // Normalize parts
  const normalizedParts = parts.map((part, index) => {
    if (Array.isArray(part)) {
      // If it's just an array of notes, create a part
      return createPart(part, `Track ${index + 1}`);
    } else if (part.name && part.notes) {
      // Already a part, normalize the notes
      return {
        ...part,
        notes: normalizeNotes(part.notes)
      };
    } else {
      return part;
    }
  });

  // Create basic JMON structure
  const composition = {
    format: 'jmon',
    version: '1.0',
    bpm: metadata.bpm || 120,
    keySignature: metadata.keySignature || 'C',
    timeSignature: metadata.timeSignature || '4/4',
    tracks: normalizedParts,
    ...metadata
  };

  // Remove metadata fields that are now top-level
  delete composition.metadata?.bpm;
  delete composition.metadata?.keySignature;
  delete composition.metadata?.timeSignature;

  return composition;
}

/**
 * Normalize notes from various formats to JMON format
 * @param {Array} notes - Notes in various formats
 * @returns {Array} JMON-compliant note objects
 */
export function normalizeNotes(notes) {
  if (!Array.isArray(notes)) return [];
  
  return notes.map((note, index) => {
    // Handle tuple format [pitch, duration, offset]
    if (Array.isArray(note)) {
      const [pitch, duration, offset = 0] = note;
      return {
        pitch,
        duration,
        time: beatsToTime(offset)
      };
    }
    
    // Handle object format
    if (typeof note === 'object' && note !== null) {
      const { pitch, duration } = note;
      let time = '0:0:0';
      
      // Convert various time formats
      if (typeof note.time === 'string') {
        time = note.time;
      } else if (typeof note.time === 'number') {
        time = beatsToTime(note.time);
      } else if (typeof note.offset === 'number') {
        time = beatsToTime(note.offset);
      }
      
      return {
        pitch,
        duration,
        time,
        // Preserve other properties
        ...Object.fromEntries(
          Object.entries(note).filter(([key]) => 
            !['time', 'offset'].includes(key)
          )
        )
      };
    }
    
    // Fallback for unexpected formats
    console.warn(`Unexpected note format at index ${index}:`, note);
    return {
      pitch: 60, // Default to middle C
      duration: 1,
      time: '0:0:0'
    };
  });
}

/**
 * Convert legacy tuple sequences to JMON notes
 * @param {Array} tuples - Array of [pitch, duration, offset] tuples
 * @returns {Array} JMON note objects
 */
export function tuplesToJmon(tuples) {
  return tuples.map(([pitch, duration, offset = 0]) => ({
    pitch,
    duration,
    time: beatsToTime(offset)
  }));
}

/**
 * Convert JMON notes to legacy tuple format
 * @param {Array} notes - JMON note objects
 * @returns {Array} Array of [pitch, duration, offset] tuples
 */
export function jmonToTuples(notes) {
  return notes.map(note => [
    note.pitch,
    note.duration,
    timeToBeats(note.time)
  ]);
}

/**
 * Create a basic scale sequence in JMON format
 * @param {Array} pitches - Array of MIDI note numbers
 * @param {number} duration - Duration for each note (default: 1 beat)
 * @param {number} startTime - Starting time in beats (default: 0)
 * @returns {Array} JMON note objects
 */
export function createScale(pitches, duration = 1, startTime = 0) {
  let currentTime = startTime;
  
  return pitches.map(pitch => {
    const note = {
      pitch,
      duration,
      time: beatsToTime(currentTime)
    };
    currentTime += duration;
    return note;
  });
}

/**
 * Offset all notes in a sequence by a given time
 * @param {Array} notes - JMON notes
 * @param {number} offsetBeats - Offset in beats
 * @returns {Array} Offset notes
 */
export function offsetNotes(notes, offsetBeats) {
  return notes.map(note => ({
    ...note,
    time: beatsToTime(timeToBeats(note.time) + offsetBeats)
  }));
}

/**
 * Concatenate multiple note sequences with proper timing
 * @param {Array} sequences - Array of note sequences
 * @returns {Array} Concatenated notes
 */
export function concatenateSequences(sequences) {
  if (sequences.length === 0) return [];
  
  const result = [];
  let currentOffset = 0;
  
  for (const sequence of sequences) {
    // Offset this sequence by the current offset
    const offsetSequence = offsetNotes(sequence, currentOffset);
    result.push(...offsetSequence);
    
    // Calculate the end time of this sequence
    const endTimes = offsetSequence.map(note => 
      timeToBeats(note.time) + note.duration
    );
    currentOffset = Math.max(...endTimes, currentOffset);
  }
  
  return result;
}

/**
 * Combine multiple sequences to play simultaneously
 * @param {Array} sequences - Array of note sequences
 * @returns {Array} Combined notes
 */
export function combineSequences(sequences) {
  return sequences.flat();
}

/**
 * Extract timing information from notes
 * @param {Array} notes - JMON notes
 * @returns {Object} Timing statistics
 */
export function getTimingInfo(notes) {
  if (notes.length === 0) return { start: 0, end: 0, duration: 0 };
  
  const startTimes = notes.map(note => timeToBeats(note.time));
  const endTimes = notes.map(note => timeToBeats(note.time) + note.duration);
  
  const start = Math.min(...startTimes);
  const end = Math.max(...endTimes);
  
  return {
    start,
    end,
    duration: end - start,
    startTime: beatsToTime(start),
    endTime: beatsToTime(end)
  };
}
