import { MusicTheoryConstants } from '../../constants/MusicTheoryConstants.js';
import { Scale } from './Scale.js';
import { chordify } from './Chordify.js';
import { getDegreeFromPitch, getOctave, cdeToMidi } from '../../utils.js';

/**
 * A class to represent a musical voice
 */
export class Voice extends MusicTheoryConstants {
    /**
     * Constructs all the necessary attributes for the voice object
     * @param {string|Object} modeOrOptions - The type of the scale or options object
     * @param {string} tonic - The tonic note of the scale (default: 'C')
     * @param {Array} degrees - Relative degrees for chord formation (default: [0, 2, 4])
     */
    constructor(modeOrOptions = 'major', tonic = 'C', degrees = [0, 2, 4]) {
        super();

        // Support both constructor patterns
        if (typeof modeOrOptions === 'object' && modeOrOptions !== null) {
            // Options object pattern
            const options = modeOrOptions;
            this.tonic = options.key || options.tonic || 'C';
            const mode = options.mode || 'major';
            this.voices = options.voices || 4; // Number of voices for harmonization
            this.degrees = options.degrees || [0, 2, 4]; // Relative degrees for chord formation
            this.scale = new Scale(this.tonic, mode).generate(); // List of MIDI notes for the scale
        } else {
            // Original pattern (mode, tonic, degrees)
            this.tonic = tonic;
            this.scale = new Scale(tonic, modeOrOptions).generate(); // List of MIDI notes for the scale
            this.degrees = degrees; // Relative degrees for chord formation
        }
    }

    /**
     * Convert a MIDI note to a chord based on the scale using the specified degrees
     * @param {number} pitch - The MIDI note to convert
     * @returns {Array} Array of MIDI notes representing the chord
     */
    pitchToChord(pitch) {
        return chordify(pitch, {
            tonic: this.tonic,
            degrees: this.degrees,
            scale: this.scale
        });
    }

    /**
     * Generate chords or arpeggios based on the given notes
     * @param {Array} notes - The notes to generate chords or arpeggios from
     * @param {Array} durations - The durations of each note (optional)
     * @param {boolean} arpeggios - If true, generate arpeggios instead of chords (default: false)
     * @returns {Array} The generated chords or arpeggios
     */
    generate(notes, durations = null, arpeggios = false) {
        // Handle different input formats
        if (!Array.isArray(notes) || notes.length === 0) {
            return [];
        }

        // Convert to tuple format if needed
        let processedNotes = notes;
        if (typeof notes[0] === 'number') { // If notes are just pitches
            if (durations === null) {
                durations = [1];
            }
            let durationsIndex = 0;
            let currentOffset = 0;
            processedNotes = notes.map(p => {
                const d = durations[durationsIndex % durations.length];
                const result = [p, d, currentOffset];
                currentOffset += d;
                durationsIndex++;
                return result;
            });
        }

        // Generate chords for each note
        const chords = processedNotes.map(([pitch, duration, offset]) => {
            const chordPitches = this.pitchToChord(pitch);
            return [chordPitches, duration, offset];
        });

        if (!arpeggios) {
            return chords;
        } else {
            // Convert chords to arpeggios
            const arpeggioNotes = [];
            for (const [chordPitches, duration, offset] of chords) {
                const noteDuration = duration / chordPitches.length;
                chordPitches.forEach((pitch, index) => {
                    arpeggioNotes.push([pitch, noteDuration, offset + index * noteDuration]);
                });
            }
            return arpeggioNotes;
        }
    }

    /**
     * Voice leading - smooth transition from one chord to another
     * @param {Array} chord1 - First chord (array of MIDI notes)
     * @param {Array} chord2 - Second chord (array of MIDI notes)
     * @returns {Array} Voice-led chord2 (notes reordered/adjusted for smooth transition)
     */
    lead(chord1, chord2) {
        if (!Array.isArray(chord1) || !Array.isArray(chord2)) {
            return chord2;
        }

        // Simple voice leading: minimize total movement
        const led = [];
        const available = [...chord2];

        for (const note1 of chord1) {
            // Find the closest note in chord2
            let minDistance = Infinity;
            let closestNote = available[0];
            let closestIndex = 0;

            for (let i = 0; i < available.length; i++) {
                const distance = Math.abs(available[i] - note1);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestNote = available[i];
                    closestIndex = i;
                }
            }

            led.push(closestNote);
            available.splice(closestIndex, 1);

            // If we've exhausted chord2, add remaining notes from chord1 octave-adjusted
            if (available.length === 0 && led.length < chord1.length) {
                break;
            }
        }

        // Add any remaining notes from chord2
        led.push(...available);

        return led;
    }

    /**
     * Harmonize a melody with chords
     * @param {Array} melody - Array of MIDI pitches
     * @param {Object} options - Harmonization options
     * @returns {Array} Array of harmonized voices
     */
    harmonize(melody, options = {}) {
        const { voices = this.voices || 4 } = options;
        const harmonization = [];

        for (let i = 0; i < voices; i++) {
            harmonization.push([]);
        }

        // Assign melody to top voice
        harmonization[0] = [...melody];

        // Generate harmony for other voices
        for (let noteIdx = 0; noteIdx < melody.length; noteIdx++) {
            const pitch = melody[noteIdx];
            const chord = this.pitchToChord(pitch);

            // Distribute chord notes to remaining voices
            for (let voiceIdx = 1; voiceIdx < voices && voiceIdx < chord.length + 1; voiceIdx++) {
                const chordNoteIdx = voiceIdx - 1;
                if (chordNoteIdx < chord.length) {
                    harmonization[voiceIdx].push(chord[chordNoteIdx]);
                } else {
                    // If we need more voices than chord notes, repeat lower octaves
                    harmonization[voiceIdx].push(chord[chordNoteIdx % chord.length] - 12);
                }
            }
        }

        return harmonization;
    }
}
