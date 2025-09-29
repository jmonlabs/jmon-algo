import { setOffsetsAccordingToDurations } from '../../utils.js';
import { beatsToTime } from '../../../utils/jmon-utils.js';

/**
 * Merges durations and pitches until both ends coincide, then sets offsets according to successive durations
 * @param {Array} pitches - Array of pitches or tuples
 * @param {Array} durations - Array of durations
 * @param {Object} options - Options for output format
 * @param {boolean} options.legacy - If true, return legacy tuple format (default: false)
 * @param {boolean} options.useStringTime - If true, use bars:beats:ticks time format (default: false for MIDI consistency)
 * @returns {Array} Array of JMON notes with numeric time (MIDI-consistent) or legacy tuples
 */
export function isorhythm(pitches, durations, options = {}) {
    // Extract pitches if they are tuples
    const cleanPitches = pitches.map(p => Array.isArray(p) || (typeof p === 'object' && p.length) ? p[0] : p);
    
    // Calculate LCM using helper function
    const lcm = calculateLCM(cleanPitches.length, durations.length);
    
    // Repeat patterns to match LCM length
    const pRepeated = [];
    const dRepeated = [];
    
    for (let i = 0; i < lcm; i++) {
        pRepeated.push(cleanPitches[i % cleanPitches.length]);
        dRepeated.push(durations[i % durations.length]);
    }
    
    // Create notes with placeholder offsets
    const notes = pRepeated.map((pitch, i) => [pitch, dRepeated[i], 1]);
    
    // Set proper offsets based on durations
    const tuplesWithOffsets = setOffsetsAccordingToDurations(notes);
    
    // Return legacy format if requested
    if (options.legacy) {
        return tuplesWithOffsets;
    }
    
    // Convert to JMON format - use numeric time by default for MIDI consistency
    return tuplesWithOffsets.map(([pitch, duration, offset]) => ({
        pitch,
        duration,
        time: options.useStringTime ? beatsToTime(offset) : offset
    }));
}

/**
 * Calculate Least Common Multiple of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} LCM of a and b
 */
function calculateLCM(a, b) {
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    return Math.abs(a * b) / gcd(a, b);
}