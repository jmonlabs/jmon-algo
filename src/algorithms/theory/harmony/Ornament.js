import { MusicTheoryConstants } from '../../constants/MusicTheoryConstants.js';
import { ORNAMENT_TYPES } from '../../constants/OrnamentTypes.js';
import { Voice } from './Voice.js';

/**
 * A class to represent and validate musical ornaments
 */
export class Ornament {
    /**
     * Validate ornament parameters and compatibility
     * @param {Object} note - The note to apply the ornament to
     * @param {string} type - The type of ornament
     * @param {Object} params - Parameters for the ornament
     * @returns {Object} Validation result with success status and any messages
     */
    static validateOrnament(note, type, params = {}) {
        const result = {
            valid: false,
            warnings: [],
            errors: []
        };

        // 1. Check if ornament type exists
        const ornamentDef = ORNAMENT_TYPES[type];
        if (!ornamentDef) {
            result.errors.push(`Unknown ornament type: ${type}`);
            return result;
        }

        // 2. Check required parameters
        if (ornamentDef.requiredParams) {
            for (const param of ornamentDef.requiredParams) {
                if (!(param in params)) {
                    result.errors.push(`Missing required parameter '${param}' for ${type}`);
                    return result;
                }
            }
        }

        // 3. Check minimum duration if specified
        if (ornamentDef.minDuration) {
            // TODO: Add duration check logic
            result.warnings.push(`Duration check not implemented for ${type}`);
        }

        // 4. Check conflicts with existing ornaments
        if (note.ornaments && ornamentDef.conflicts) {
            const existingConflicts = note.ornaments
                .filter(o => ornamentDef.conflicts.includes(o.type))
                .map(o => o.type);
            
            if (existingConflicts.length > 0) {
                result.errors.push(`${type} conflicts with existing ornaments: ${existingConflicts.join(', ')}`);
                return result;
            }
        }

        // 5. Run ornament-specific validation
        if (ornamentDef.validate) {
            const specificValidation = ornamentDef.validate(note, params);
            if (!specificValidation.valid) {
                result.errors.push(specificValidation.error);
                return result;
            }
        }

        result.valid = true;
        return result;
    }

    /**
     * Create a new ornament instance with validation
     * @param {Object} options - Ornament configuration
     */
    constructor(options) {
        const ornamentDef = ORNAMENT_TYPES[options.type];
        if (!ornamentDef) {
            throw new Error(`Unknown ornament type: ${options.type}`);
        }

        this.type = options.type;
        this.params = {
            ...ornamentDef.defaultParams,
            ...options.parameters
        };

        if (options.tonic && options.mode) {
            this.tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(options.tonic);
            this.scale = this.generateScale(options.tonic, options.mode);
        } else {
            this.scale = null;
        }
    }

    /**
     * Generate a scale for pitch-based ornaments
     */
    generateScale(tonic, mode) {
        const scalePattern = MusicTheoryConstants.scale_intervals[mode];
        const tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(tonic);
        const scaleNotes = scalePattern.map(interval => (tonicIndex + interval) % 12);
        const completeScale = [];

        for (let octave = -1; octave < 10; octave++) {
            for (const note of scaleNotes) {
                const midiNote = 12 * octave + note;
                if (midiNote >= 0 && midiNote <= 127) {
                    completeScale.push(midiNote);
                }
            }
        }
        return completeScale;
    }

    /**
     * Apply the ornament to notes
     */
    apply(notes, noteIndex = null) {
        if (!Array.isArray(notes) || notes.length === 0) {
            return notes;
        }

        // Use random note index if none provided
        if (noteIndex === null) {
            noteIndex = Math.floor(Math.random() * notes.length);
        }

        if (noteIndex < 0 || noteIndex >= notes.length) {
            return notes;
        }

        const note = notes[noteIndex];
        const validation = Ornament.validateOrnament(note, this.type, this.params);

        if (!validation.valid) {
            console.warn(`Ornament validation failed: ${validation.errors.join(', ')}`);
            return notes;
        }

        // Apply the ornament based on type
        switch (this.type) {
            case 'grace_note':
                return this.addGraceNote(notes, noteIndex);
            case 'trill':
                return this.addTrill(notes, noteIndex);
            case 'mordent':
                return this.addMordent(notes, noteIndex);
            case 'turn':
                return this.addTurn(notes, noteIndex);
            case 'arpeggio':
                return this.addArpeggio(notes, noteIndex);
            default:
                return notes;
        }
    }

    /**
     * Add a grace note
     */
    addGraceNote(notes, noteIndex) {
        const mainNote = notes[noteIndex];
        const mainPitch = mainNote.pitch;
        const mainDuration = mainNote.duration;
        const mainOffset = mainNote.time;
        
        const ornamentPitch = this.params.gracePitches ? 
            this.params.gracePitches[Math.floor(Math.random() * this.params.gracePitches.length)] :
            mainPitch + 1;

        if (this.params.graceNoteType === 'acciaccatura') {
            // Very brief, does not alter main note's start time
            const graceDuration = mainDuration * 0.125;
            const modifiedMain = { pitch: mainPitch, duration: mainDuration, time: mainOffset + graceDuration };
            return [
                ...notes.slice(0, noteIndex),
                { pitch: ornamentPitch, duration: graceDuration, time: mainOffset },
                modifiedMain,
                ...notes.slice(noteIndex + 1)
            ];
        } else { // appoggiatura
            // Takes half the time of the main note
            const graceDuration = mainDuration / 2;
            const modifiedMain = { pitch: mainPitch, duration: graceDuration, time: mainOffset + graceDuration };
            return [
                ...notes.slice(0, noteIndex),
                { pitch: ornamentPitch, duration: graceDuration, time: mainOffset },
                modifiedMain,
                ...notes.slice(noteIndex + 1)
            ];
        }
    }

    /**
     * Add a trill
     */
    addTrill(notes, noteIndex) {
        const mainNote = notes[noteIndex];
        const mainPitch = mainNote.pitch;
        const mainDuration = mainNote.duration;
        const mainOffset = mainNote.time;
        
        const trillNotes = [];
        let currentOffset = mainOffset;

        const by = this.params.by || 1;
        const trillRate = this.params.trillRate || 0.125;

        // Determine the trill pitch
        let trillPitch;
        if (this.scale && this.scale.includes(mainPitch)) {
            const pitchIndex = this.scale.indexOf(mainPitch);
            const trillIndex = (pitchIndex + Math.round(by)) % this.scale.length;
            trillPitch = this.scale[trillIndex];
        } else {
            trillPitch = mainPitch + by;
        }

        // Generate trill sequence
        while (currentOffset < mainOffset + mainDuration) {
            const remainingTime = mainOffset + mainDuration - currentOffset;
            const noteLength = Math.min(trillRate, remainingTime / 2);
            
            if (remainingTime >= noteLength * 2) {
                trillNotes.push({ pitch: mainPitch, duration: noteLength, time: currentOffset });
                trillNotes.push({ pitch: trillPitch, duration: noteLength, time: currentOffset + noteLength });
                currentOffset += 2 * noteLength;
            } else {
                break;
            }
        }

        return [
            ...notes.slice(0, noteIndex),
            ...trillNotes,
            ...notes.slice(noteIndex + 1)
        ];
    }

    /**
     * Add a mordent
     */
    addMordent(notes, noteIndex) {
        const mainNote = notes[noteIndex];
        const mainPitch = mainNote.pitch;
        const mainDuration = mainNote.duration;
        const mainOffset = mainNote.time;
        
        const by = this.params.by || 1;

        let mordentPitch;
        if (this.scale && this.scale.includes(mainPitch)) {
            const pitchIndex = this.scale.indexOf(mainPitch);
            const mordentIndex = pitchIndex + Math.round(by);
            mordentPitch = this.scale[mordentIndex] || mainPitch + by;
        } else {
            mordentPitch = mainPitch + by;
        }

        const partDuration = mainDuration / 3;
        const mordentNotes = [
            { pitch: mainPitch, duration: partDuration, time: mainOffset },
            { pitch: mordentPitch, duration: partDuration, time: mainOffset + partDuration },
            { pitch: mainPitch, duration: partDuration, time: mainOffset + 2 * partDuration }
        ];

        return [
            ...notes.slice(0, noteIndex),
            ...mordentNotes,
            ...notes.slice(noteIndex + 1)
        ];
    }

    /**
     * Add a turn
     */
    addTurn(notes, noteIndex) {
        const mainNote = notes[noteIndex];
        const mainPitch = mainNote.pitch;
        const mainDuration = mainNote.duration;
        const mainOffset = mainNote.time;
        
        const partDuration = mainDuration / 4;

        let upperPitch, lowerPitch;
        if (this.scale && this.scale.includes(mainPitch)) {
            const pitchIndex = this.scale.indexOf(mainPitch);
            upperPitch = this.scale[pitchIndex + 1] || mainPitch + 2;
            lowerPitch = this.scale[pitchIndex - 1] || mainPitch - 2;
        } else {
            upperPitch = mainPitch + 2;
            lowerPitch = mainPitch - 2;
        }

        const turnNotes = [
            { pitch: mainPitch, duration: partDuration, time: mainOffset },
            { pitch: upperPitch, duration: partDuration, time: mainOffset + partDuration },
            { pitch: mainPitch, duration: partDuration, time: mainOffset + 2 * partDuration },
            { pitch: lowerPitch, duration: partDuration, time: mainOffset + 3 * partDuration }
        ];

        return [
            ...notes.slice(0, noteIndex),
            ...turnNotes,
            ...notes.slice(noteIndex + 1)
        ];
    }

    /**
     * Add an arpeggio
     */
    addArpeggio(notes, noteIndex) {
        const mainNote = notes[noteIndex];
        const mainPitch = mainNote.pitch;
        const mainDuration = mainNote.duration;
        const mainOffset = mainNote.time;
        
        const { arpeggioDegrees, direction = 'up' } = this.params;

        if (!arpeggioDegrees || !Array.isArray(arpeggioDegrees)) {
            return notes;
        }

        const pitches = [];
        if (this.scale && this.scale.includes(mainPitch)) {
            const pitchIndex = this.scale.indexOf(mainPitch);
            pitches.push(...arpeggioDegrees.map(degree => this.scale[pitchIndex + degree] || mainPitch + degree));
        } else {
            pitches.push(...arpeggioDegrees.map(degree => mainPitch + degree));
        }

        if (direction === 'down') pitches.reverse();
        if (direction === 'both') pitches.push(...pitches.slice(0, -1).reverse());

        const partDuration = mainDuration / pitches.length;
        const arpeggioNotes = pitches.map((pitch, i) => ({
            pitch: pitch,
            duration: partDuration,
            time: mainOffset + i * partDuration
        }));

        return [
            ...notes.slice(0, noteIndex),
            ...arpeggioNotes,
            ...notes.slice(noteIndex + 1)
        ];
    }
}
