import { MusicTheoryConstants } from '../../constants/MusicTheoryConstants.js';

/**
 * Represents a musical scale
 */
export class Scale {
    /**
     * Create a Scale
     * @param {string} tonic - The tonic note of the scale
     * @param {string} mode - The type of scale
     */
    constructor(tonic, mode = 'major') {
        const convertedTonic = MusicTheoryConstants.convertFlatToSharp(tonic);
        if (!MusicTheoryConstants.chromatic_scale.includes(convertedTonic)) {
            throw new Error(`'${tonic}' is not a valid tonic note. Select one among '${MusicTheoryConstants.chromatic_scale.join(', ')}'.`);
        }
        this.tonic = convertedTonic;

        if (!Object.keys(MusicTheoryConstants.scale_intervals).includes(mode)) {
            throw new Error(`'${mode}' is not a valid scale. Select one among '${Object.keys(MusicTheoryConstants.scale_intervals).join(', ')}'.`);
        }
        this.mode = mode;
    }/**
     * Generate a scale with flexible start/end points
     * @param {Object} options - Configuration object
     * @param {number|string} [options.start] - Starting MIDI note number or note name (e.g. 'C4')
     * @param {number|string} [options.end] - Ending MIDI note number or note name
     * @param {number} [options.length] - Number of notes to generate
     * @returns {Array} Array of MIDI note numbers representing the scale
     */
    generate(options = {}) {
        const intervals = MusicTheoryConstants.scale_intervals[this.mode];
        if (!intervals) {
            console.warn(`Unknown scale mode: ${this.mode}`);
            return [];
        }

        // Convert note names to MIDI numbers if provided
        if (typeof options.start === 'string') {
            options.start = MusicTheoryConstants.noteNameToMidi(options.start);
        }
        if (typeof options.end === 'string') {
            options.end = MusicTheoryConstants.noteNameToMidi(options.end);
        }

        // Default to C4 if no start point specified
        const startNote = options.start ?? 60;

        // Get scale pattern
        const tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(this.tonic);
        if (tonicIndex === -1) {
            console.warn(`Unknown tonic: ${this.tonic}`);
            return [];
        }

        // Helper to get next scale note
        const getNextNote = (baseNote, step) => {
            const scaleIndex = step % intervals.length;
            const octaveOffset = Math.floor(step / intervals.length) * 12;
            const interval = intervals[scaleIndex];
            return baseNote + interval + octaveOffset;
        };

        // Generate notes
        const result = [];
        if (options.end !== undefined) {
            // Generate until we reach or exceed end note
            for (let i = 0; ; i++) {
                const note = getNextNote(startNote, i);
                if (note > options.end) break;
                result.push(note);
            }
        } else if (options.length) {
            // Generate specified number of notes
            for (let i = 0; i < options.length; i++) {
                result.push(getNextNote(startNote, i));
            }
        } else {
            // Default to one octave
            return intervals.map(interval => startNote + interval);
        }

        return result;
    }

    /**
     * Get the note names of the scale
     * @returns {Array} Array of note names in the scale
     */
    getNoteNames() {
        const intervals = MusicTheoryConstants.scale_intervals[this.mode];
        if (!intervals) return [];
        
        const tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(this.tonic);
        if (tonicIndex === -1) return [];
        
        return intervals.map(interval => {
            const noteIndex = (tonicIndex + interval) % 12;
            return MusicTheoryConstants.chromatic_scale[noteIndex];
        });
    }

    /**
     * Check if a given pitch is in the scale
     * @param {number} pitch - MIDI note number
     * @returns {boolean} True if the pitch class is in the scale
     */
    isInScale(pitch) {
        const pitchClass = pitch % 12;
        const scalePitches = this.generate().map(p => p % 12);
        return scalePitches.includes(pitchClass);
    }
}