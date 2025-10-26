import { MusicTheoryConstants } from '../../constants/MusicTheoryConstants.js';
import { cdeToMidi } from '../../utils.js';

/**
 * A class representing a musical progression generator based on the circle of fifths (or any other interval)
 */
export class Progression extends MusicTheoryConstants {
    /**
     * Initialize a Progression object
     * @param {string} tonicPitch - The tonic pitch or key of the progression (e.g., 'C4', 'C', 'D')
     * @param {string} scaleOrCircleOf - The scale/mode ('major', 'minor') or interval to form the circle (default: 'P5')
     * @param {string} type - The type of progression ('chords' or 'pitches')
     * @param {Array} radius - Range for major, minor, and diminished chords [3, 3, 1]
     * @param {Array} weights - Weights for selecting chord types
     */
    constructor(tonicPitch = 'C4', scaleOrCircleOf = 'major', type = 'chords', radius = [3, 3, 1], weights = null) {
        super();

        // Parse tonic - handle both 'C' and 'C4' formats
        if (tonicPitch.length <= 2) {
            // Just note name, add octave
            this.tonicMidi = cdeToMidi(tonicPitch + '4');
            this.tonicNote = tonicPitch;
        } else {
            this.tonicMidi = cdeToMidi(tonicPitch);
            this.tonicNote = tonicPitch.replace(/[0-9]/g, '');
        }

        // Check if second argument is a scale/mode or an interval
        if (scaleOrCircleOf === 'major' || scaleOrCircleOf === 'minor' ||
            scaleOrCircleOf === 'dorian' || scaleOrCircleOf === 'lydian' ||
            scaleOrCircleOf === 'mixolydian' || scaleOrCircleOf === 'aeolian' ||
            scaleOrCircleOf === 'locrian' || scaleOrCircleOf === 'phrygian') {
            this.scale = scaleOrCircleOf;
            this.mode = scaleOrCircleOf;
            this.circleOf = 'P5'; // Default to circle of fifths
        } else {
            this.circleOf = scaleOrCircleOf;
            this.scale = 'major'; // Default scale
            this.mode = 'major';
        }

        this.type = type;
        this.radius = radius;
        this.weights = weights || radius;

        if (!['chords', 'pitches'].includes(this.type)) {
            throw new Error("Type must either be 'pitches' or 'chords'.");
        }
    }

    /**
     * Compute chords based on the circle of fifths, thirds, etc., within the specified radius
     * @returns {Object} Object containing major, minor, and diminished chord roots
     */
    computeCircle() {
        const nSemitones = MusicTheoryConstants.intervals[this.circleOf];
        const circleNotes = [this.tonicMidi];
        
        for (let i = 0; i < Math.max(...this.radius); i++) {
            const nextNote = (circleNotes[circleNotes.length - 1] + nSemitones) % 12 + 
                           Math.floor(circleNotes[circleNotes.length - 1] / 12) * 12;
            circleNotes.push(nextNote);
        }

        return {
            major: circleNotes.slice(0, this.radius[0]),
            minor: circleNotes.slice(0, this.radius[1]),
            diminished: circleNotes.slice(0, this.radius[2])
        };
    }

    /**
     * Generate a chord based on root MIDI note and chord type
     * @param {number} rootNoteMidi - The root MIDI note of the chord
     * @param {string} chordType - The type of chord ('major', 'minor', 'diminished')
     * @returns {Array} Array of MIDI notes representing the chord
     */
    generateChord(rootNoteMidi, chordType) {
        const chordIntervals = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'diminished': [0, 3, 6]
        };

        const intervals = chordIntervals[chordType] || [0, 4, 7];
        const chordNotes = intervals.map(interval => rootNoteMidi + interval);
        
        // Ensure notes don't exceed MIDI range
        return chordNotes.map(note => note > 127 ? note - 12 : note);
    }

    /**
     * Generate a musical progression
     * @param {number|Array} lengthOrNumerals - Either number of chords or array of roman numerals
     * @param {number} seed - The seed value for the random number generator
     * @returns {Array} Array of chord arrays representing the progression
     */
    generate(lengthOrNumerals = 4, seed = null) {
        // Check if first argument is an array of roman numerals
        if (Array.isArray(lengthOrNumerals)) {
            return this.generateFromRomanNumerals(lengthOrNumerals);
        }

        const length = lengthOrNumerals;

        if (seed !== null) {
            Math.seedrandom = seed; // Note: requires seedrandom library for deterministic results
        }

        const { major, minor, diminished } = this.computeCircle();
        const chordRoots = [major, minor, diminished];
        const chordTypes = ['major', 'minor', 'diminished'];
        const progression = [];

        for (let i = 0; i < length; i++) {
            // Weighted random selection of chord type
            const chordTypeIndex = this.weightedRandomChoice(this.weights);

            if (chordRoots[chordTypeIndex].length > 0) {
                const rootNoteMidi = chordRoots[chordTypeIndex][
                    Math.floor(Math.random() * chordRoots[chordTypeIndex].length)
                ];
                const chordType = chordTypes[chordTypeIndex];

                // Handle case where rootNoteMidi might be an array (safety check)
                const actualRoot = Array.isArray(rootNoteMidi) ? rootNoteMidi[0] : rootNoteMidi;
                const chosenChord = this.generateChord(actualRoot, chordType);
                progression.push(chosenChord);
            }
        }

        return progression;
    }

    /**
     * Generate chords from roman numerals (e.g., ['I', 'IV', 'V', 'I'])
     * @param {Array} numerals - Array of roman numerals
     * @returns {Array} Array of chord arrays
     */
    generateFromRomanNumerals(numerals) {
        const progression = [];

        // Define scale degrees (in semitones from tonic)
        const scaleDegreesMap = {
            'major': [0, 2, 4, 5, 7, 9, 11],      // I, II, III, IV, V, VI, VII
            'minor': [0, 2, 3, 5, 7, 8, 10],      // i, ii, III, iv, v, VI, VII
            'dorian': [0, 2, 3, 5, 7, 9, 10],
            'phrygian': [0, 1, 3, 5, 7, 8, 10],
            'lydian': [0, 2, 4, 6, 7, 9, 11],
            'mixolydian': [0, 2, 4, 5, 7, 9, 10],
            'aeolian': [0, 2, 3, 5, 7, 8, 10],
            'locrian': [0, 1, 3, 5, 6, 8, 10]
        };

        const scaleDegrees = scaleDegreesMap[this.scale] || scaleDegreesMap['major'];

        // Define chord qualities for each degree in major scale
        const majorChordQualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
        const minorChordQualities = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];

        const chordQualities = this.scale === 'minor' ? minorChordQualities : majorChordQualities;

        for (const numeral of numerals) {
            const { degree, quality } = this.parseRomanNumeral(numeral);

            if (degree < 1 || degree > 7) {
                console.warn(`Invalid degree ${degree} in ${numeral}`);
                continue;
            }

            // Get root note (scale degree, 1-indexed to 0-indexed)
            const rootOffset = scaleDegrees[degree - 1];
            const rootMidi = this.tonicMidi + rootOffset;

            // Determine chord quality
            let chordType = quality || chordQualities[degree - 1];

            const chord = this.generateChord(rootMidi, chordType);
            progression.push(chord);
        }

        return progression;
    }

    /**
     * Parse roman numeral to get degree and quality
     * @param {string} numeral - Roman numeral (e.g., 'I', 'iv', 'V/V')
     * @returns {Object} Object with degree and quality
     */
    parseRomanNumeral(numeral) {
        // Handle secondary dominants (e.g., 'V/V')
        if (numeral.includes('/')) {
            const parts = numeral.split('/');
            // For now, just use the first part
            numeral = parts[0];
        }

        // Check if lowercase (minor) or uppercase (major)
        const isLowerCase = numeral === numeral.toLowerCase();

        // Remove quality indicators
        const cleanNumeral = numeral.replace(/[°+ᵒ#♭b]/g, '').toUpperCase();

        // Convert roman to number
        const romanToNumber = {
            'I': 1, 'II': 2, 'III': 3, 'IV': 4,
            'V': 5, 'VI': 6, 'VII': 7
        };

        const degree = romanToNumber[cleanNumeral] || 1;

        // Determine quality from indicators
        let quality = null;
        if (numeral.includes('°') || numeral.includes('ᵒ')) {
            quality = 'diminished';
        } else if (numeral.includes('+')) {
            quality = 'augmented';
        } else if (isLowerCase) {
            quality = 'minor';
        } else {
            quality = 'major';
        }

        return { degree, quality };
    }

    /**
     * Generate a circle of fifths progression
     * @param {number} length - Number of chords in the progression
     * @returns {Array} Array of chords
     */
    circleOfFifths(length = 4) {
        const progression = [];
        let currentRoot = this.tonicMidi;

        for (let i = 0; i < length; i++) {
            // Generate major chord at current root
            const chord = this.generateChord(currentRoot, 'major');
            progression.push(chord);

            // Move to next fifth (7 semitones up)
            currentRoot = (currentRoot + 7) % 12 + Math.floor(currentRoot / 12) * 12;
        }

        return progression;
    }

    /**
     * Weighted random choice helper
     * @param {Array} weights - Array of weights
     * @returns {number} Selected index
     */
    weightedRandomChoice(weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i;
            }
        }
        return weights.length - 1; // Fallback
    }
}