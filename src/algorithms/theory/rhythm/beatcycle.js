/**
 * Pitches are mapped to durations in a cyclical manner, then offsets are set according to successive durations
 * @param {Array} pitches - Array of pitches
 * @param {Array} durations - Array of durations
 * @returns {Array} Array of notes as [pitch, duration, offset] tuples
 */
export function beatcycle(pitches, durations) {
    const notes = [];
    let currentOffset = 0;
    let durationIndex = 0;
    
    for (const pitch of pitches) {
        const duration = durations[durationIndex % durations.length];
        notes.push([pitch, duration, currentOffset]);
        currentOffset += duration;
        durationIndex++;
    }
    
    return notes;
}