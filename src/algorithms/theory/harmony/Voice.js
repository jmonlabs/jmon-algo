import { MusicTheoryConstants } from '../../constants/MusicTheoryConstants.js';
import { Scale } from './Scale.js';
import { getDegreeFromPitch, getOctave, cdeToMidi } from '../../utils.js';

/**
 * A class to represent a musical voice
 */
export class Voice extends MusicTheoryConstants {
    /**
     * Constructs all the necessary attributes for the voice object
     * @param {string} mode - The type of the scale (default: 'major')
     * @param {string} tonic - The tonic note of the scale (default: 'C')
     * @param {Array} degrees - Relative degrees for chord formation (default: [0, 2, 4])
     */
    constructor(mode = 'major', tonic = 'C', degrees = [0, 2, 4]) {
        super();
        this.tonic = tonic;
        this.scale = new Scale(tonic, mode).generate(); // List of MIDI notes for the scale
        this.degrees = degrees; // Relative degrees for chord formation
    }

    /**
     * Convert a MIDI note to a chord based on the scale using the specified degrees
     * @param {number} pitch - The MIDI note to convert
     * @returns {Array} Array of MIDI notes representing the chord
     */
    pitchToChord(pitch) {
        // Get the tonic in the right octave
        const octave = getOctave(pitch);
        const tonicCdePitch = this.tonic + octave.toString();
        const tonicMidiPitch = cdeToMidi(tonicCdePitch);

        // The degrees of the whole scale
        const scaleDegrees = this.scale.map(p => getDegreeFromPitch(p, this.scale, tonicMidiPitch));
        const pitchDegree = Math.round(getDegreeFromPitch(pitch, this.scale, tonicMidiPitch));

        const chord = [];
        for (const degree of this.degrees) {
            const absoluteDegree = pitchDegree + degree;
            const absoluteIndex = scaleDegrees.indexOf(absoluteDegree);
            if (absoluteIndex !== -1) {
                chord.push(this.scale[absoluteIndex]);
            }
        }
        return chord; // Chord is now directly from the scale
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
}
