import { MusicalNote } from '../types/music.js';

/**
 * Musical utility functions matching the Python djalgo utils module
 */
export class MusicUtils {

  /**
   * Check input type of a sequence
   */
  static checkInput(sequence) {
    if (!Array.isArray(sequence)) return 'unknown';
    if (sequence.length === 0) return 'list';
    
    const firstItem = sequence[0];
    if (Array.isArray(firstItem) || (typeof firstItem === 'object' && 'pitch' in firstItem)) {
      return 'list of tuples';
    }
    
    return 'list';
  }

  /**
   * Fill gaps with rests in a musical sequence
   */
  static fillGapsWithRests(notes, tolerance = 0.01) {
    if (notes.length === 0) return [];
    
    // Sort notes by offset
    const sortedNotes = [...notes].sort((a, b) => a.offset - b.offset);
    const result = [];
    
    let currentTime = 0;
    
    for (const note of sortedNotes) {
      // Check if there's a gap before this note
      if (note.offset > currentTime + tolerance) {
        // Add a rest to fill the gap
        result.push({
          pitch: undefined, // Rest
          duration: note.offset - currentTime,
          offset: currentTime,
          velocity: 0
        });
      }
      
      result.push(note);
      currentTime = Math.max(currentTime, note.offset + note.duration);
    }
    
    return result;
  }

  /**
   * Set offsets according to durations (sequential timing)
   */
  static setOffsetsAccordingToDurations(notes) {
    let currentOffset = 0;
    
    return notes.map(note => {
      const newNote = {
        ...note,
        offset: currentOffset
      };
      currentOffset += note.duration;
      return newNote;
    });
  }

  /**
   * Convert CDE notation to MIDI (e.g., "C4" -> 60)
   */
  static cdeToMidi(note) {
    const noteRegex = /^([A-G][#b]?)(-?\d+)$/;
    const match = note.match(noteRegex);
    
    if (!match) {
      throw new Error(`Invalid note format: ${note}`);
    }
    
    const noteName = match[1];
    const octave = parseInt(match[2]);
    
    const noteToSemitone: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const semitone = noteToSemitone[noteName];
    if (semitone === undefined) {
      throw new Error(`Unknown note name: ${noteName}`);
    }
    
    return (octave + 1) * 12 + semitone;
  }

  /**
   * Convert MIDI to CDE notation (e.g., 60 -> "C4")
   */
  static midiToCde(midi) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    
    return noteNames[noteIndex] + octave;
  }

  /**
   * Get octave from MIDI note number
   */
  static getOctave(midi) {
    return Math.floor(midi / 12) - 1;
  }

  /**
   * Get degree from pitch in a scale
   */
  static getDegreeFromPitch(pitch, scaleList, tonicPitch) {
    // Convert to pitch classes
    const pitchClass = ((pitch % 12) + 12) % 12;
    const tonicClass = ((tonicPitch % 12) + 12) % 12;
    
    // Find the closest scale degree
    let minDistance = Infinity;
    let closestDegree = 1;
    
    for (let i = 0; i < scaleList.length; i++) {
      const scaleNoteClass = ((scaleList[i] % 12) + 12) % 12;
      const scaleDegreeClass = ((scaleNoteClass - tonicClass + 12) % 12);
      const distance = Math.abs(pitchClass - scaleDegreeClass);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestDegree = i + 1; // Scale degrees start from 1
      }
    }
    
    // Adjust for octave
    const octaveOffset = Math.floor((pitch - tonicPitch) / 12) * scaleList.length;
    return closestDegree + octaveOffset;
  }

  /**
   * Quantize timing to a grid
   */
  static quantize(notes, gridDivision = 16) {
    const gridSize = 1 / gridDivision;
    
    return notes.map(note => ({
      ...note,
      offset: Math.round(note.offset / gridSize) * gridSize
    }));
  }

  /**
   * Transpose a sequence by semitones
   */
  static transpose(notes, semitones) {
    return notes.map(note => ({
      ...note,
      pitch: note.pitch !== undefined ? note.pitch + semitones : undefined
    }));
  }

  /**
   * Invert a melody around a pivot point
   */
  static invert(notes, pivot) {
    const pitches = notes.map(n => n.pitch).filter(p => p !== undefined);
    if (pitches.length === 0) return notes;
    
    const actualPivot = pivot !== undefined ? pivot : 
      (Math.max(...pitches) + Math.min(...pitches)) / 2;
    
    return notes.map(note => ({
      ...note,
      pitch: note.pitch !== undefined ? 2 * actualPivot - note.pitch : undefined
    }));
  }

  /**
   * Retrograde (reverse) a sequence
   */
  static retrograde(notes) {
    const reversed = [...notes].reverse();
    const totalDuration = notes.reduce((sum, note) => Math.max(sum, note.offset + note.duration), 0);
    
    return this.setOffsetsAccordingToDurations(reversed.map(note => ({
      ...note,
      offset: 0 // Will be recalculated
    })));
  }

  /**
   * Create augmentation (stretch) or diminution (compress) of durations
   */
  static augment(notes, factor) {
    let currentOffset = 0;
    
    return notes.map(note => {
      const newNote = {
        ...note,
        duration: note.duration * factor,
        offset: currentOffset
      };
      currentOffset += newNote.duration;
      return newNote;
    });
  }

  /**
   * Remove duplicate consecutive notes
   */
  static removeDuplicates(notes) {
    if (notes.length <= 1) return notes;
    
    const result = [notes[0]];
    
    for (let i = 1; i < notes.length; i++) {
      const current = notes[i];
      const previous = result[result.length - 1];
      
      if (current.pitch !== previous.pitch || 
          Math.abs(current.offset - (previous.offset + previous.duration)) > 0.01) {
        result.push(current);
      } else {
        // Extend duration of previous note instead of adding duplicate
        previous.duration += current.duration;
      }
    }
    
    return result;
  }

  /**
   * Split long notes into smaller ones
   */
  static splitLongNotes(notes, maxDuration) {
    const result = [];
    
    for (const note of notes) {
      if (note.duration <= maxDuration) {
        result.push(note);
      } else {
        // Split into multiple notes
        const numSplits = Math.ceil(note.duration / maxDuration);
        const splitDuration = note.duration / numSplits;
        
        for (let i = 0; i < numSplits; i++) {
          result.push({
            ...note,
            duration: splitDuration,
            offset: note.offset + i * splitDuration
          });
        }
      }
    }
    
    return result;
  }

  /**
   * Calculate the total duration of a sequence
   */
  static getTotalDuration(notes) {
    if (notes.length === 0) return 0;
    return Math.max(...notes.map(note => note.offset + note.duration));
  }

  /**
   * Get pitch range (lowest and highest pitches)
   */
  static getPitchRange(notes) {
    const pitches = notes.map(n => n.pitch).filter(p => p !== undefined);
    if (pitches.length === 0) return null;
    
    return {
      min: Math.min(...pitches),
      max: Math.max(...pitches)
    };
  }

  /**
   * Normalize velocities to a range
   */
  static normalizeVelocities(notes, min = 0.1, max = 1.0) {
    const velocities = notes.map(n => n.velocity || 0.8);
    const currentMin = Math.min(...velocities);
    const currentMax = Math.max(...velocities);
    const range = currentMax - currentMin;
    
    if (range === 0) {
      return notes.map(note => ({ ...note, velocity: (min + max) / 2 }));
    }
    
    return notes.map(note => {
      const normalizedVelocity = ((note.velocity || 0.8) - currentMin) / range;
      return {
        ...note,
        velocity: min + normalizedVelocity * (max - min)
      };
    });
  }

  /**
   * Create a rhythmic pattern from note onsets
   */
  static extractRhythm(notes) {
    return notes.map(note => note.offset).sort((a, b) => a - b);
  }

  /**
   * Apply swing timing to notes
   */
  static applySwing(notes, swingRatio = 0.67) {
    const beatDuration = 1; // Assuming quarter note beat
    const subdivisionDuration = beatDuration / 2;
    
    return notes.map(note => {
      const beatPosition = note.offset % beatDuration;
      const isOffBeat = Math.abs(beatPosition - subdivisionDuration) < 0.01;
      
      if (isOffBeat) {
        const swingOffset = subdivisionDuration * swingRatio;
        const beatStart = note.offset - beatPosition;
        return {
          ...note,
          offset: beatStart + swingOffset
        };
      }
      
      return note;
    });
  }
}