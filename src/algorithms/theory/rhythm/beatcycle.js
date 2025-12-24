import { beatsToTime } from '../../../utils/jmon-utils.js';

/**
 * Map pitches to durations cyclically and accumulate their start times.
 * Returns modern JMON note objects by default, with an option to fall back to
 * the legacy tuple format `[pitch, duration, time]`.
 *
 * @param {Array<number>} pitches - Pitch values to iterate through
 * @param {Array<number>} durations - Durations applied cyclically to the pitches
 * @param {Object} [options]
 * @param {boolean} [options.legacy=false] - Return legacy tuples instead of objects
 * @param {boolean} [options.useStringTime=false] - Use bars:beats:ticks time strings
 * @returns {Array} Array of JMON notes or legacy tuples
 */
export function beatcycle(pitches, durations, options = {}) {
    if (!Array.isArray(pitches) || !Array.isArray(durations) || durations.length === 0) {
        return [];
    }

    const { legacy = false, useStringTime = false } = options;

    const tuples = [];
    let currentOffset = 0;
    let durationIndex = 0;
    
    for (const pitch of pitches) {
        const duration = durations[durationIndex % durations.length];
        tuples.push([pitch, duration, currentOffset]);
        currentOffset += duration;
        durationIndex++;
    }

    if (legacy) {
        return tuples;
    }

    return tuples.map(([pitch, duration, offset]) => ({
        pitch,
        duration,
        time: useStringTime ? beatsToTime(offset) : offset
    }));
}