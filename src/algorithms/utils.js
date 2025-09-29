/**
 * Utility functions for JMON algorithmic composition
 * JavaScript implementation of djalgo's utils.py
 */

/**
 * Convert list of tracks to dict with default names
 * @param {Array|Object} tracks - Tracks to convert
 * @returns {Object} Dictionary with track names
 */
export function tracksToDict(tracks) {
    if (typeof tracks === 'object' && !Array.isArray(tracks)) {
        return tracks;
    }
    if (Array.isArray(tracks)) {
        if (tracks.length === 0) {
            return {};
        }
        // If it's a list of notes (not a list of tracks)
        if (tracks.every(note => Array.isArray(note) && note.length === 3)) {
            return { 'track 1': tracks };
        }
        // If it's a list of tracks
        const result = {};
        tracks.forEach((track, i) => {
            result[`track ${i + 1}`] = track;
        });
        return result;
    }
    throw new Error("Input must be a list or dict of tracks.");
}

/**
 * Rounds the given value to the nearest value in the scale list
 * @param {number} value - The value to be rounded
 * @param {Array} scale - A list of values to round to
 * @returns {number} The value from the scale list that is closest to the given value
 */
export function roundToList(value, scale) {
    return scale.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
}

/**
 * Get octave from MIDI note number
 * @param {number} midiNote - MIDI note number
 * @returns {number} Octave number
 */
export function getOctave(midiNote) {
    return Math.floor(midiNote / 12) - 1;
}

/**
 * Convert flat notes to sharp equivalents
 * @param {string} noteString - Note string to convert
 * @returns {string} Converted note string
 */
export function getSharp(noteString) {
    const dictFlat = {
        'D-': 'C#', 'E-': 'D#', 'G-': 'F#', 'A-': 'G#', 'B-': 'A#',
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    return dictFlat[noteString] || noteString;
}

/**
 * Get scale degree from pitch
 * @param {number|string} pitch - Pitch (MIDI number or string)
 * @param {Array} scaleList - List of scale pitches
 * @param {number|string} tonicPitch - Tonic pitch
 * @returns {number} Scale degree
 */
export function getDegreeFromPitch(pitch, scaleList, tonicPitch) {
    if (typeof pitch === 'string') {
        pitch = cdeToMidi(pitch);
    }
    if (typeof tonicPitch === 'string') {
        tonicPitch = cdeToMidi(tonicPitch);
    }

    const tonicIndex = scaleList.indexOf(tonicPitch);

    // If the pitch is in the mode
    if (scaleList.includes(pitch)) {
        const pitchIndex = scaleList.indexOf(pitch);
        return pitchIndex - tonicIndex;
    } else {
        // If pitch is not in mode, find the two pitches it falls between
        const upperPitch = roundToList(pitch, scaleList);
        const upperIndex = scaleList.indexOf(upperPitch);
        const lowerIndex = upperIndex > 0 ? upperIndex - 1 : upperIndex;
        const lowerPitch = scaleList[lowerIndex];

        // Compute weighted average of degrees
        const distanceToUpper = upperPitch - pitch;
        const distanceToLower = pitch - lowerPitch;
        const totalDistance = distanceToUpper + distanceToLower;
        
        if (totalDistance === 0) return upperIndex - tonicIndex;
        
        const upperWeight = 1 - distanceToUpper / totalDistance;
        const lowerWeight = 1 - distanceToLower / totalDistance;
        const upperDegree = upperIndex - tonicIndex;
        const lowerDegree = lowerIndex - tonicIndex;
        
        return upperDegree * upperWeight + lowerDegree * lowerWeight;
    }
}

/**
 * Get pitch from scale degree
 * @param {number} degree - Scale degree
 * @param {Array} scaleList - List of scale pitches  
 * @param {number} tonicPitch - Tonic pitch
 * @returns {number} Pitch value
 */
export function getPitchFromDegree(degree, scaleList, tonicPitch) {
    const tonicIndex = scaleList.indexOf(tonicPitch);
    const pitchIndex = Math.round(tonicIndex + degree);

    // If degree is within the scale
    if (pitchIndex >= 0 && pitchIndex < scaleList.length) {
        return scaleList[pitchIndex];
    } else {
        // If degree is not within scale, find two pitches it falls between
        const lowerIndex = Math.max(0, Math.min(pitchIndex, scaleList.length - 1));
        const upperIndex = Math.min(scaleList.length - 1, Math.max(pitchIndex, 0));
        const lowerPitch = scaleList[lowerIndex];
        const upperPitch = scaleList[upperIndex];

        // Compute weighted average
        const distanceToUpper = upperIndex - pitchIndex;
        const distanceToLower = pitchIndex - lowerIndex;
        const totalDistance = distanceToUpper + distanceToLower;
        
        if (totalDistance === 0) {
            return (upperPitch + lowerPitch) / 2;
        }
        
        const upperWeight = 1 - distanceToUpper / totalDistance;
        const lowerWeight = 1 - distanceToLower / totalDistance;
        
        return upperPitch * upperWeight + lowerPitch * lowerWeight;
    }
}

/**
 * Set offsets according to durations
 * @param {Array} notes - Array of [pitch, duration, offset] notes
 * @returns {Array} Notes with adjusted offsets
 */
export function setOffsetsAccordingToDurations(notes) {
    // Handle case where notes only have [pitch, duration]
    if (notes.length > 0 && notes[0].length === 2) {
        notes = notes.map(note => [note[0], note[1], 0]);
    }
    
    const adjustedNotes = [];
    let currentOffset = 0;
    
    for (const [pitch, duration, _] of notes) {
        adjustedNotes.push([pitch, duration, currentOffset]);
        currentOffset += duration;
    }
    
    return adjustedNotes;
}

/**
 * Fill gaps with rests
 * @param {Array} notes - Array of notes
 * @param {number} parentOffset - Parent offset for recursion
 * @returns {Array} Notes with rests inserted
 */
export function fillGapsWithRests(notes, parentOffset = 0.0) {
    // Sort notes by offset
    const notesSorted = [...notes].sort((a, b) => a[2] - b[2]);
    
    let lastOffset = 0.0;
    const filledNotes = [];
    
    for (const note of notesSorted) {
        const [pitch, duration, offset] = note;
        const currentOffset = parentOffset + offset;
        
        if (currentOffset > lastOffset) {
            // There is a gap that needs to be filled with a rest
            const gapDuration = currentOffset - lastOffset;
            const restToInsert = [null, gapDuration, lastOffset - parentOffset];
            filledNotes.push(restToInsert);
        }
        
        filledNotes.push(note);
        lastOffset = Math.max(lastOffset, currentOffset + duration);
    }
    
    return filledNotes;
}

/**
 * Adjust note durations to prevent overlaps
 * @param {Array} notes - Array of notes
 * @returns {Array} Notes with adjusted durations
 */
export function adjustNoteDurationsToPreventOverlaps(notes) {
    // Sort by offset
    notes.sort((a, b) => a[2] - b[2]);
    
    for (let i = 0; i < notes.length - 1; i++) {
        const currentNote = notes[i];
        const nextNote = notes[i + 1];
        const currentNoteEnd = currentNote[2] + currentNote[1];
        
        // If current note ends after next note starts, adjust duration
        if (currentNoteEnd > nextNote[2]) {
            const newDuration = nextNote[2] - currentNote[2];
            notes[i] = [currentNote[0], newDuration, currentNote[2]];
        }
    }
    
    return notes;
}

/**
 * Repair notes by filling gaps and preventing overlaps
 * @param {Array} notes - Array of notes
 * @returns {Array} Repaired notes
 */
export function repairNotes(notes) {
    return adjustNoteDurationsToPreventOverlaps(fillGapsWithRests(notes));
}

/**
 * Convert CDE notation to MIDI number
 * @param {string} pitch - Pitch string (e.g., 'C4', 'F#3')
 * @returns {number} MIDI note number
 */
export function cdeToMidi(pitch) {
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatToSharp = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
        'Cb': 'B'
    };
    
    let octave = 4; // Default octave
    let noteStr = pitch;
    
    // Handle flat notes
    if (pitch.includes('b')) {
        const noteBase = pitch.slice(0, -1);
        if (flatToSharp[noteBase]) {
            noteStr = flatToSharp[noteBase] + pitch.slice(-1);
        }
    }
    
    // Extract note and octave
    let note;
    if (noteStr.length > 2 || (noteStr.length === 2 && !isNaN(noteStr[1]))) {
        note = noteStr.slice(0, -1);
        octave = parseInt(noteStr.slice(-1));
    } else {
        note = noteStr[0];
    }
    
    const midi = 12 * (octave + 1) + pitches.indexOf(note);
    return midi;
}

/**
 * Convert MIDI number to CDE notation
 * @param {number} midi - MIDI note number
 * @returns {string} Pitch string
 */
export function midiToCde(midi) {
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const key = midi % 12;
    return pitches[key] + octave.toString();
}

/**
 * Remove note overlaps by adjusting offsets
 * @param {Array} notes - Array of notes
 * @param {string} adjust - Adjustment method ('offsets' or 'durations')
 * @returns {Array} Notes without overlaps
 */
export function noOverlap(notes, adjust = 'offsets') {
    const adjustedNotes = [];
    let currentOffset = 0;
    
    for (const [pitch, duration, _] of notes) {
        adjustedNotes.push([pitch, duration, currentOffset]);
        currentOffset += duration;
    }
    
    return adjustedNotes;
}

/**
 * Check input type
 * @param {Array} inputList - Input to check
 * @returns {string} Input type description
 */
export function checkInput(inputList) {
    if (inputList.every(item => Array.isArray(item))) {
        return 'list of tuples';
    } else if (inputList.every(item => !Array.isArray(item))) {
        return 'list';
    } else {
        return 'unknown';
    }
}

/**
 * Scale a list of numbers to a new range
 * @param {Array} numbers - Numbers to scale
 * @param {number} toMin - Target minimum value
 * @param {number} toMax - Target maximum value
 * @param {number} minNumbers - Current minimum (optional)
 * @param {number} maxNumbers - Current maximum (optional)
 * @returns {Array} Scaled numbers
 */
export function scaleList(numbers, toMin, toMax, minNumbers = null, maxNumbers = null) {
    const minNum = minNumbers !== null ? minNumbers : Math.min(...numbers);
    const maxNum = maxNumbers !== null ? maxNumbers : Math.max(...numbers);
    
    if (minNum === maxNum) {
        return new Array(numbers.length).fill((toMin + toMax) / 2);
    }
    
    return numbers.map(num => 
        (num - minNum) * (toMax - toMin) / (maxNum - minNum) + toMin
    );
}

/**
 * Offset track by given amount
 * @param {Array} track - Array of notes
 * @param {number} by - Offset amount
 * @returns {Array} Offset track
 */
export function offsetTrack(track, by) {
    return track.map(([pitch, duration, offset]) => [pitch, duration, offset + by]);
}

/**
 * Quantize note durations and offsets
 * @param {Array} notes - Array of notes
 * @param {number} measureLength - Measure length
 * @param {number} timeResolution - Time resolution for quantization
 * @returns {Array} Quantized notes
 */
export function quantizeNotes(notes, measureLength, timeResolution) {
    const quantizedNotes = [];
    
    for (const [pitch, duration, offset] of notes) {
        const quantizedOffset = Math.round(offset / timeResolution) * timeResolution;
        const measureEnd = (Math.floor(quantizedOffset / measureLength) + 1) * measureLength;
        let quantizedDuration = Math.round(duration / timeResolution) * timeResolution;
        quantizedDuration = Math.min(quantizedDuration, measureEnd - quantizedOffset);
        
        if (quantizedDuration > 0) {
            quantizedNotes.push([pitch, quantizedDuration, quantizedOffset]);
        }
    }
    
    return quantizedNotes;
}

/**
 * Find closest pitch at measure start
 * @param {Array} notes - Array of notes
 * @param {number} measureLength - Measure length
 * @returns {Array} Array of pitches at measure starts
 */
export function findClosestPitchAtMeasureStart(notes, measureLength) {
    // Filter out notes with null values
    const validNotes = notes.filter(([pitch, , offset]) => pitch !== null && offset !== null);
    
    // Sort by offset
    const notesSorted = validNotes.sort((a, b) => a[2] - b[2]);
    
    // Find max offset to determine number of measures
    const maxOffset = Math.max(...notesSorted.map(([, , offset]) => offset));
    const numMeasures = Math.floor(maxOffset / measureLength) + 1;
    
    const closestPitches = [];
    
    for (let measureNum = 0; measureNum < numMeasures; measureNum++) {
        const measureStart = measureNum * measureLength;
        let closestPitch = null;
        let closestDistance = Infinity;
        
        for (const [pitch, , offset] of notesSorted) {
            const distance = measureStart - offset;
            
            if (distance >= 0 && distance < closestDistance) {
                closestDistance = distance;
                closestPitch = pitch;
            }
            
            if (offset > measureStart) break;
        }
        
        if (closestPitch !== null) {
            closestPitches.push(closestPitch);
        }
    }
    
    return closestPitches;
}

/**
 * Tune pitch to nearest scale pitch
 * @param {number} pitch - MIDI pitch to tune
 * @param {Array} scale - Scale pitches
 * @returns {number} Tuned pitch
 */
export function tune(pitch, scale) {
    return scale.reduce((prev, curr) => 
        Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev
    );
}

/**
 * Convert quarter-length duration to seconds
 * @param {number} ql - Duration in quarter-length units
 * @param {number} bpm - Beats per minute
 * @returns {number} Duration in seconds
 */
export function qlToSeconds(ql, bpm) {
    return 60 / bpm * ql;
}

/**
 * Generate Fibonacci sequence
 * @param {number} a - First number (default: 0)
 * @param {number} b - Second number (default: 1)
 * @param {number} base - Base value added to each number (default: 0)
 * @param {number} scale - Scale factor (default: 1)
 * @returns {Generator} Fibonacci generator
 */
export function* fibonacci(a = 0, b = 1, base = 0, scale = 1) {
    while (true) {
        yield base + scale * a;
        [a, b] = [b, a + b];
    }
}

/**
 * Repeat polyloops for specified measures
 * @param {Object} polyloopsDict - Dictionary of polyloops
 * @param {number} nMeasures - Number of measures to repeat
 * @param {number} measureLength - Length of a measure
 * @returns {Object} Dictionary of repeated polyloops
 */
export function repeatPolyloops(polyloopsDict, nMeasures, measureLength) {
    const repeatedDict = {};
    
    for (const [name, polyloop] of Object.entries(polyloopsDict)) {
        const repeatedPolyloop = [];
        
        for (let m = 0; m < nMeasures; m++) {
            const measureOffset = m * measureLength;
            const offsetPolyloop = offsetTrack(polyloop, measureOffset);
            repeatedPolyloop.push(...offsetPolyloop);
        }
        
        repeatedDict[name] = repeatedPolyloop;
    }
    
    return repeatedDict;
}

/**
 * MIDI instrument mapping
 */
export const instrumentMapping = {
    'Acoustic Grand Piano': 0,
    'Bright Acoustic Piano': 1,
    'Electric Grand Piano': 2,
    'Honky-tonk Piano': 3,
    'Electric Piano 1': 4,
    'Electric Piano 2': 5,
    'Harpsichord': 6,
    'Clavinet': 7,
    // ... (full mapping truncated for brevity, but would include all 128 instruments)
    'Gunshot': 127
};