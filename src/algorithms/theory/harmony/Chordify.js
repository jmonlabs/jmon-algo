import { Scale } from './Scale.js';
import { getDegreeFromPitch, getOctave, cdeToMidi } from '../../utils.js';

/**
 * Build a chord from a pitch based on a scale and degree pattern
 * @param {number} pitch - The MIDI pitch to build a chord from
 * @param {Object} options - Chord building options
 * @param {string} options.tonic - The tonic note (e.g., 'C', 'D')
 * @param {string} options.mode - The scale mode (e.g., 'major', 'minor', 'dorian')
 * @param {Array<number>} options.degrees - Relative degrees for chord formation (default: [0, 2, 4] for triads)
 * @param {Array<number>} options.scale - Pre-generated scale to use (optional, overrides tonic/mode)
 * @returns {Array<number>} Array of MIDI notes representing the chord
 *
 * @example
 * // Build a C major triad
 * chordify(60, { tonic: 'C', mode: 'major' })
 * // => [60, 64, 67]
 *
 * @example
 * // Build a seventh chord
 * chordify(60, { tonic: 'C', mode: 'major', degrees: [0, 2, 4, 6] })
 * // => [60, 64, 67, 71]
 */
export function chordify(pitch, options = {}) {
    const {
        tonic = 'C',
        mode = 'major',
        degrees = [0, 2, 4],
        scale = null
    } = options;

    // Generate scale if not provided
    const scaleNotes = scale || new Scale(tonic, mode).generate();

    // Get the tonic in the right octave
    const octave = getOctave(pitch);
    const tonicCdePitch = tonic + octave.toString();
    const tonicMidiPitch = cdeToMidi(tonicCdePitch);

    // Find the base pitch degree within the scale pattern (0-6 for a 7-note scale)
    const scalePattern = scaleNotes.slice(0, 7); // Use first octave as pattern
    const scaleDegrees = scalePattern.map(p => getDegreeFromPitch(p, scalePattern, tonicMidiPitch));
    const basePitchDegree = Math.round(getDegreeFromPitch(pitch, scaleNotes, tonicMidiPitch));

    // Find which note in the scale pattern corresponds to our pitch
    const pitchInPattern = pitch % 12; // Get pitch class
    const tonicPitchClass = scalePattern[0] % 12;

    const chord = [];
    for (const degree of degrees) {
        const targetDegree = (basePitchDegree + degree) % scaleDegrees.length;
        const octaveOffset = Math.floor((basePitchDegree + degree) / scaleDegrees.length);

        // Find the target note in the scale pattern
        const targetIndex = scaleDegrees.indexOf(targetDegree);
        if (targetIndex !== -1) {
            const targetPitch = scalePattern[targetIndex] + (octaveOffset * 12);
            chord.push(targetPitch);
        }
    }

    return chord;
}

/**
 * Build chords for multiple pitches
 * @param {Array<number>} pitches - Array of MIDI pitches
 * @param {Object} options - Chord building options (same as chordify)
 * @returns {Array<Array<number>>} Array of chord arrays
 *
 * @example
 * const scale = new Scale('C', 'major').generate({ start: 60, end: 72 });
 * const chords = chordifyMany([60, 62, 64], { tonic: 'C', mode: 'major' });
 * // => [[60, 64, 67], [62, 65, 69], [64, 67, 71]]
 */
export function chordifyMany(pitches, options = {}) {
    // Generate scale once if not provided
    const { tonic = 'C', mode = 'major', scale = null } = options;
    const scaleNotes = scale || new Scale(tonic, mode).generate();

    return pitches.map(pitch => chordify(pitch, { ...options, scale: scaleNotes }));
}
