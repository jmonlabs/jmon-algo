/**
 * Articulation System for JMON
 * Handles articulation application with automatic validation and synchronization
 */

import { ARTICULATION_TYPES } from "../../constants/ArticulationTypes.js";

export class Articulation {
  /**
   * Add articulation to a note in a sequence
   * @param {Array} sequence - The note sequence
   * @param {string} articulationType - Type of articulation
   * @param {number} noteIndex - Index of note to articulate
   * @param {Object} params - Parameters for complex articulations
   * @returns {Object} Result with success status and any warnings
   */
  static addArticulation(sequence, articulationType, noteIndex, params = {}) {
    const result = {
      success: false,
      warnings: [],
      errors: [],
    };

    // Validate inputs
    if (!Array.isArray(sequence)) {
      result.errors.push("Sequence must be an array");
      return result;
    }

    if (noteIndex < 0 || noteIndex >= sequence.length) {
      result.errors.push(
        `Note index ${noteIndex} out of bounds (sequence length: ${sequence.length})`,
      );
      return result;
    }

    const articulationDef = ARTICULATION_TYPES[articulationType];
    if (!articulationDef) {
      result.errors.push(`Unknown articulation type: ${articulationType}`);
      return result;
    }

    const note = sequence[noteIndex];
    if (!note || typeof note !== "object") {
      result.errors.push(`Invalid note at index ${noteIndex}`);
      return result;
    }

    // Handle simple articulations
    if (!articulationDef.complex) {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      note.articulations = [...arr, articulationType];
      result.success = true;
      return result;
    }

    // Handle complex articulations
    return this._addComplexArticulation(
      note,
      articulationType,
      articulationDef,
      params,
      result,
    );
  }

  /**
   * Add complex articulation with parameter validation and synchronization
   */
  static _addComplexArticulation(
    note,
    articulationType,
    articulationDef,
    params,
    result,
  ) {
    // Validate required parameters
    if (articulationDef.requiredParams) {
      for (const param of articulationDef.requiredParams) {
        if (!(param in params)) {
          result.errors.push(
            `Missing required parameter '${param}' for ${articulationType}`,
          );
          return result;
        }
      }
    }

    // Apply articulation based on type
    switch (articulationType) {
      case "glissando":
      case "portamento":
        return this._applyGlissando(note, articulationType, params, result);

      case "bend":
        return this._applyBend(note, params, result);

      case "vibrato":
        return this._applyVibrato(note, params, result);

      case "tremolo":
        return this._applyTremolo(note, params, result);

      case "crescendo":
      case "diminuendo":
        return this._applyDynamicChange(note, articulationType, params, result);

      default:
        result.errors.push(
          `Complex articulation ${articulationType} not implemented`,
        );
        return result;
    }
  }

  /**
   * Apply glissando/portamento articulation
   */
  static _applyGlissando(note, type, params, result) {
    const arr = Array.isArray(note.articulations) ? note.articulations : [];
    note.articulations = [...arr, { type, ...params }];
    result.success = true;
    return result;
  }

  /**
   * Apply pitch bend articulation
   */
  static _applyBend(note, params, result) {
    const arr = Array.isArray(note.articulations) ? note.articulations : [];
    note.articulations = [...arr, { type: "bend", ...params }];
    result.success = true;
    return result;
  }

  /**
   * Apply vibrato articulation
   */
  static _applyVibrato(note, params, result) {
    const arr = Array.isArray(note.articulations) ? note.articulations : [];
    note.articulations = [...arr, { type: "vibrato", ...params }];
    result.success = true;
    return result;
  }

  /**
   * Apply tremolo articulation
   */
  static _applyTremolo(note, params, result) {
    const arr = Array.isArray(note.articulations) ? note.articulations : [];
    note.articulations = [...arr, { type: "tremolo", ...params }];
    result.success = true;
    return result;
  }

  /**
   * Apply dynamic change (crescendo/diminuendo)
   */
  static _applyDynamicChange(note, type, params, result) {
    const arr = Array.isArray(note.articulations) ? note.articulations : [];
    note.articulations = [...arr, { type, ...params }];
    result.success = true;
    return result;
  }

  /**
   * Remove articulation from a note
   */
  static removeArticulation(sequence, noteIndex) {
    if (
      !Array.isArray(sequence) || noteIndex < 0 || noteIndex >= sequence.length
    ) {
      return { success: false, error: "Invalid sequence or note index" };
    }

    const note = sequence[noteIndex];
    if (!note || typeof note !== "object") {
      return { success: false, error: "Invalid note" };
    }

    const removed = Array.isArray(note.articulations)
      ? note.articulations.slice()
      : [];

    // Remove declarative articulations only
    note.articulations = [];

    return {
      success: true,
      removed,
      message: "Removed articulations from note",
    };
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
   */ static getAvailableTypes() {
    return Object.entries(ARTICULATION_TYPES).map(([type, def]) => ({
      type,
      complex: def.complex,
      description: def.description,
      requiredParams: def.requiredParams || [],
      optionalParams: def.optionalParams || [],
    }));
  }

  /**
   * Apply articulation to a note (modifies note in-place)
   * This is a simpler API that directly modifies note properties
   * @param {Object} note - The note object to modify
   * @param {string} articulationType - Type of articulation
   * @param {Object} params - Parameters for complex articulations
   * @returns {Object} Result with success status
   */
  static apply(note, articulationType, params = {}) {
    const result = { success: false, warnings: [], errors: [] };

    if (!note || typeof note !== "object") {
      result.errors.push("Invalid note");
      return result;
    }

    const articulationDef = ARTICULATION_TYPES[articulationType];
    if (!articulationDef) {
      result.errors.push(`Unknown articulation type: ${articulationType}`);
      return result;
    }

    // Modify note properties based on articulation type
    switch (articulationType) {
      case 'staccato':
        // Shorten duration to 50% of original
        note.duration = note.duration * 0.5;
        break;

      case 'staccatissimo':
        // Very short - 25% of original
        note.duration = note.duration * 0.25;
        break;

      case 'accent':
        // Increase velocity by 20%
        if (note.velocity === undefined) note.velocity = 0.8;
        note.velocity = Math.min(1.0, note.velocity * 1.2);
        break;

      case 'marcato':
        // Strong accent - increase velocity by 30%
        if (note.velocity === undefined) note.velocity = 0.8;
        note.velocity = Math.min(1.0, note.velocity * 1.3);
        break;

      case 'tenuto':
        // Hold full duration - ensure duration is not shortened
        // This is more of a marking, no modification needed
        break;

      case 'legato':
        // Extend duration slightly to connect with next note
        note.duration = note.duration * 1.05;
        break;
    }

    // Add to articulations array
    const arr = Array.isArray(note.articulations) ? note.articulations : [];
    if (articulationDef.complex && Object.keys(params).length > 0) {
      note.articulations = [...arr, { type: articulationType, ...params }];
    } else {
      note.articulations = [...arr, articulationType];
    }

    result.success = true;
    return result;
  }
}

// Export for use in sequences
// Deprecated mutating helpers (kept for backward compatibility)




export function validateArticulations(sequence) {
  return Articulation.validateSequence(sequence);
}

// Immutable Option B helpers (preferred)
// addArticulation(notes, indexOrSelector, type, params?)
export function addArticulation(notes, index, type, params = {}) {
  if (!Array.isArray(notes)) return notes;
  const next = notes.slice();
  const src = notes[index];
  if (!src || typeof src !== "object") return next;

  const isSimple = (t) =>
    t === "staccato" || t === "accent" || t === "tenuto" || t === "marcato";

  const articulations = Array.isArray(src.articulations)
    ? src.articulations.slice()
    : [];

  if (isSimple(type)) {
    articulations.push(type);
  } else {
    articulations.push({ type, ...params });
  }

  const updated = {
    ...src,
    articulations,
  };

  next[index] = updated;
  return next;
}

// removeArticulation(notes, index, predicate?)
export function removeArticulation(notes, index, predicate) {
  if (!Array.isArray(notes)) return notes;
  const next = notes.slice();
  const src = notes[index];
  if (!src || typeof src !== "object") return next;

  const shouldRemove = (t) =>
    (typeof predicate === "function" ? predicate(t) : true);

  const arts = Array.isArray(src.articulations)
    ? src.articulations.filter((a) => {
      const t = typeof a === "string" ? a : a.type;
      return !shouldRemove(t);
    })
    : [];

  const updated = { ...src, articulations: arts };

  next[index] = updated;
  return next;
}

/**
 * Immutable helpers: return new arrays/objects without mutating input.
 * These are recommended for reactive environments (e.g., Observable).
 */

/**
 * Add an articulation to a note immutably (returns a new notes array).
 * Simple types: 'staccato', 'accent', 'tenuto', 'marcato'
 * Complex types (e.g., 'glissando') can include params (e.g., { target }).
 */


/**
 * Batch-apply articulations immutably.
 * specs: Array<{ type, index, params? }>
 */


/**
 * Remove articulations immutably from a given note.
 * If predicate is omitted, removes all articulations on that note.
 * predicate receives the articulation type string.
 */
