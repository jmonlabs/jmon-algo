/**
 * Articulation System for JMON
 * Handles articulation application with immutable transformations
 */

import { ARTICULATION_TYPES } from "../../constants/ArticulationTypes.js";

export class Articulation {
  /**
   * Apply articulation to notes array (returns new array, immutable)
   * This API matches the Ornament pattern for consistency
   * @param {Array} notes - The notes array
   * @param {number|Array} noteIndex - Index of note to articulate, or array of indices
   * @param {string} articulationType - Type of articulation
   * @param {Object} params - Parameters for complex articulations
   * @returns {Array} New notes array with articulation applied
   */
  static apply(notes, noteIndex, articulationType, params = {}) {
    if (!Array.isArray(notes) || notes.length === 0) {
      return notes;
    }

    // Handle array of indices
    if (Array.isArray(noteIndex)) {
      let result = notes;
      // Sort indices in descending order to handle insertions correctly
      // (when staccato inserts rests, later indices shift)
      const sortedIndices = [...noteIndex].sort((a, b) => b - a);

      for (const idx of sortedIndices) {
        result = this.apply(result, idx, articulationType, params);
      }
      return result;
    }

    // Handle single index
    if (noteIndex < 0 || noteIndex >= notes.length) {
      console.warn(`Note index ${noteIndex} out of bounds`);
      return notes;
    }

    const articulationDef = ARTICULATION_TYPES[articulationType];
    if (!articulationDef) {
      console.warn(`Unknown articulation type: ${articulationType}`);
      return notes;
    }

    const note = notes[noteIndex];
    if (!note || typeof note !== "object") {
      console.warn(`Invalid note at index ${noteIndex}`);
      return notes;
    }

    // Create new notes array
    const newNotes = notes.slice();

    // Handle articulation based on type
    switch (articulationType) {
      case 'staccato':
        return this._applyStaccato(newNotes, noteIndex);

      case 'staccatissimo':
        return this._applyStaccatissimo(newNotes, noteIndex);

      case 'accent':
      case 'marcato':
        return this._applyAccent(newNotes, noteIndex, articulationType);

      case 'tenuto':
        return this._applyTenuto(newNotes, noteIndex);

      case 'legato':
        return this._applyLegato(newNotes, noteIndex);

      case 'glissando':
      case 'portamento':
      case 'bend':
      case 'vibrato':
      case 'tremolo':
      case 'crescendo':
      case 'diminuendo':
        return this._applyComplexArticulation(newNotes, noteIndex, articulationType, params);

      default:
        return notes;
    }
  }

  /**
   * Apply staccato - shorten duration and insert rest
   */
  static _applyStaccato(notes, noteIndex) {
    const note = notes[noteIndex];
    const originalDuration = note.duration;
    const shortenedDuration = originalDuration * 0.5;
    const restDuration = originalDuration - shortenedDuration;

    // Create shortened note with articulation
    const shortenedNote = {
      ...note,
      duration: shortenedDuration,
      articulations: [...(Array.isArray(note.articulations) ? note.articulations : []), 'staccato']
    };

    // Create rest to fill the gap
    const rest = {
      pitch: null,
      duration: restDuration,
      time: note.time + shortenedDuration
    };

    // Insert shortened note and rest
    notes[noteIndex] = shortenedNote;
    notes.splice(noteIndex + 1, 0, rest);

    return notes;
  }

  /**
   * Apply staccatissimo - very short duration with rest
   */
  static _applyStaccatissimo(notes, noteIndex) {
    const note = notes[noteIndex];
    const originalDuration = note.duration;
    const shortenedDuration = originalDuration * 0.25;
    const restDuration = originalDuration - shortenedDuration;

    const shortenedNote = {
      ...note,
      duration: shortenedDuration,
      articulations: [...(Array.isArray(note.articulations) ? note.articulations : []), 'staccatissimo']
    };

    const rest = {
      pitch: null,
      duration: restDuration,
      time: note.time + shortenedDuration
    };

    notes[noteIndex] = shortenedNote;
    notes.splice(noteIndex + 1, 0, rest);

    return notes;
  }

  /**
   * Apply accent or marcato - increase velocity
   */
  static _applyAccent(notes, noteIndex, type) {
    const note = notes[noteIndex];
    const multiplier = type === 'marcato' ? 1.3 : 1.2;
    const velocity = note.velocity !== undefined ? note.velocity : 0.8;

    notes[noteIndex] = {
      ...note,
      velocity: Math.min(1.0, velocity * multiplier),
      articulations: [...(Array.isArray(note.articulations) ? note.articulations : []), type]
    };

    return notes;
  }

  /**
   * Apply tenuto - mark for full duration
   */
  static _applyTenuto(notes, noteIndex) {
    const note = notes[noteIndex];

    notes[noteIndex] = {
      ...note,
      articulations: [...(Array.isArray(note.articulations) ? note.articulations : []), 'tenuto']
    };

    return notes;
  }

  /**
   * Apply legato - extend duration slightly
   */
  static _applyLegato(notes, noteIndex) {
    const note = notes[noteIndex];

    notes[noteIndex] = {
      ...note,
      duration: note.duration * 1.05,
      articulations: [...(Array.isArray(note.articulations) ? note.articulations : []), 'legato']
    };

    return notes;
  }

  /**
   * Apply complex articulation with parameters
   */
  static _applyComplexArticulation(notes, noteIndex, type, params) {
    const note = notes[noteIndex];

    notes[noteIndex] = {
      ...note,
      articulations: [
        ...(Array.isArray(note.articulations) ? note.articulations : []),
        { type, ...params }
      ]
    };

    return notes;
  }

  /**
   * Validate articulation consistency in a sequence
   */
  static validateSequence(sequence) {
    const issues = [];

    sequence.forEach((note, index) => {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      for (const a of arr) {
        const type = typeof a === "string" ? a : a?.type;
        const articulationDef = ARTICULATION_TYPES[type];

        if (!type || !articulationDef) {
          issues.push({
            type: "unknown_articulation",
            noteIndex: index,
            articulation: type,
            message: `Unknown articulation type: ${type}`,
          });
          continue;
        }

        if (Array.isArray(articulationDef.requiredParams)) {
          for (const param of articulationDef.requiredParams) {
            if (typeof a !== "object" || !(param in a)) {
              issues.push({
                type: "missing_parameter",
                noteIndex: index,
                articulation: type,
                message: `Missing required parameter '${param}' for ${type}`,
              });
            }
          }
        }
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get available articulation types with descriptions
   */
  static getAvailableTypes() {
    return Object.entries(ARTICULATION_TYPES).map(([type, def]) => ({
      type,
      complex: def.complex,
      description: def.description,
      requiredParams: def.requiredParams || [],
      optionalParams: def.optionalParams || [],
    }));
  }
}
