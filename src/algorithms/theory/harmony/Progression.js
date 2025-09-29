import { MusicTheoryConstants } from '../../constants/MusicTheoryConstants.js';
import { cdeToMidi } from '../../utils.js';

/**
 * A class representing a musical progression generator based on the circle of fifths (or any other interval)
 */
export class Progression extends MusicTheoryConstants {
    /**
     * Initialize a Progression object
     * @param {string} tonicPitch - The tonic pitch of the progression (default: 'C4')
     * @param {string} circleOf - The interval to form the circle (default: 'P5')
     * @param {string} type - The type of progression ('chords' or 'pitches')
     * @param {Array} radius - Range for major, minor, and diminished chords [3, 3, 1]
     * @param {Array} weights - Weights for selecting chord types
     */
    constructor(tonicPitch = 'C4', circleOf = 'P5', type = 'chords', radius = [3, 3, 1], weights = null) {
        super();
        
        this.tonicMidi = cdeToMidi(tonicPitch);
        this.circleOf = circleOf;
        this.type = type;
        this.radius = radius;
        this.weights = weights || radius;

        if (!Object.keys(this.intervals).includes(this.circleOf)) {
            throw new Error(`Select a circleOf among ${Object.keys(this.intervals).join(', ')}.`);
        }
        if (!['chords', 'pitches'].includes(this.type)) {
            throw new Error("Type must either be 'pitches' or 'chords'.");
        }
    }

    /**
     * Compute chords based on the circle of fifths, thirds, etc., within the specified radius
     * @returns {Object} Object containing major, minor, and diminished chord roots
     */
    computeCircle() {
        const nSemitones = this.intervals[this.circleOf];
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
     * @param {number} length - The length of the progression in number of chords (default: 4)
     * @param {number} seed - The seed value for the random number generator
     * @returns {Array} Array of chord arrays representing the progression
     */
    generate(length = 4, seed = null) {
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