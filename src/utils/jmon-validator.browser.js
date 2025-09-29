// Browser-compatible JMON validator (simplified version without ajv)
// For full validation, use the Node.js version with ajv

export class JmonValidator {
  constructor() {
    console.warn(
      "[JMON] Using simplified browser validator. For full validation, use Node.js environment.",
    );
  }

  /**
   * Basic validation and normalization for browser use
   * @param {Object} obj - JMON object to validate
   * @returns {Object} { valid, errors, normalized }
   */
  validateAndNormalize(obj) {
    const errors = [];
    let normalized = { ...obj };

    try {
      // Basic structure validation
      if (!obj || typeof obj !== "object") {
        errors.push("Object must be a valid object");
        return { valid: false, errors, normalized: null };
      }

      // Ensure tracks exist
      if (!normalized.tracks && !normalized.notes) {
        // Try to create a basic track structure
        if (Array.isArray(obj)) {
          normalized = { tracks: [{ notes: obj }] };
        } else {
          normalized.tracks = normalized.tracks || [];
        }
      }

      // Normalize single track to tracks array
      if (normalized.notes && !normalized.tracks) {
        normalized.tracks = [{ notes: normalized.notes }];
        delete normalized.notes;
      }

      // Ensure tracks is an array
      if (!Array.isArray(normalized.tracks)) {
        normalized.tracks = [normalized.tracks];
      }

      // Basic note validation
      normalized.tracks.forEach((track, trackIndex) => {
        if (!track.notes) {
          errors.push(`Track ${trackIndex} missing notes array`);
          return;
        }

        if (!Array.isArray(track.notes)) {
          errors.push(`Track ${trackIndex} notes must be an array`);
          return;
        }

        track.notes.forEach((note, noteIndex) => {
          if (typeof note !== "object") {
            errors.push(
              `Track ${trackIndex}, note ${noteIndex}: must be an object`,
            );
            return;
          }

          // Ensure required properties
          if (note.pitch === undefined) {
            note.pitch = null; // Default to rest
          }
          if (note.duration === undefined) {
            note.duration = 1; // Default to quarter note
          }
          if (note.time === undefined) {
            note.time = 0; // Will be calculated if needed
          }
        });
      });

      // Set basic defaults
      normalized.format = normalized.format || "jmon";
      normalized.version = normalized.version || "1.0";
      normalized.timeSignature = normalized.timeSignature || "4/4";
      normalized.keySignature = normalized.keySignature || "C";

      return {
        valid: errors.length === 0,
        errors,
        normalized,
      };
    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
      return {
        valid: false,
        errors,
        normalized: null,
      };
    }
  }

  /**
   * Simple validation without normalization
   * @param {Object} obj - JMON object to validate
   * @returns {boolean} true if valid
   */
  isValid(obj) {
    const result = this.validateAndNormalize(obj);
    return result.valid;
  }
}
