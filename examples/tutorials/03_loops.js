/**
 * JMON-ALGO TUTORIAL 03: LOOPS
 * JavaScript translation of Djalgo's loops tutorial
 *
 * This tutorial covers:
 * - Loop class for creating repeating musical patterns
 * - Polyloops (multiple independent loops)
 * - Beatcycles and isorhythm
 * - Phase shifting and rhythmic complexity
 */

import { Loop } from '../../src/algorithms/generative/loops/index.js';
import { isorhythm } from '../../src/algorithms/theory/rhythm/isorhythm.js';
import { beatcycle } from '../../src/algorithms/theory/rhythm/beatcycle.js';

console.log('=== JMON-ALGO TUTORIAL 03: LOOPS ===\n');

// =====================================================
// 1. Basic Loop
// =====================================================
console.log('1. Basic Loop\n');

/*
A Loop in jmon-algo creates repeating musical patterns with:
- A sequence of pitches or patterns
- Duration for each element
- Number of iterations
- Optional transformations per iteration
*/

// Simple melodic loop
const simpleLoop = new Loop({
  pitches: [60, 62, 64, 65],  // C, D, E, F
  durations: [0.5, 0.5, 0.5, 0.5],
  iterations: 4
});

const simplePattern = simpleLoop.generate();
console.log('Simple loop:', simplePattern.length, 'notes');
console.log('First few notes:', simplePattern.slice(0, 4).map(n => ({
  pitch: n.pitch,
  duration: n.duration,
  time: n.time
})));
console.log('');

// =====================================================
// 2. Loop with Transformations
// =====================================================
console.log('2. Loop with Transformations\n');

/*
Loops can transform on each iteration:
- Transpose up/down
- Change duration
- Apply rhythmic variations
*/

// Ascending loop that transposes up by 2 semitones each iteration
const ascendingLoop = new Loop({
  pitches: [60, 64, 67],  // C major triad
  durations: [1, 1, 1],
  iterations: 4,
  transpose: 2  // Transpose up 2 semitones per iteration
});

const ascendingPattern = ascendingLoop.generate();
console.log('Ascending loop:', ascendingPattern.length, 'notes');
console.log('Pitches over iterations:');
for (let i = 0; i < 12; i += 3) {
  const iteration = Math.floor(i / 3) + 1;
  const pitches = ascendingPattern.slice(i, i + 3).map(n => n.pitch);
  console.log(`  Iteration ${iteration}:`, pitches);
}
console.log('');

// =====================================================
// 3. Polyloops (Multiple Independent Loops)
// =====================================================
console.log('3. Polyloops (Multiple Independent Loops)\n');

/*
Polyloops are multiple loops playing simultaneously
with different cycle lengths, creating complex
rhythmic and melodic patterns.
*/

// Loop 1: Fast cycle (3 notes)
const loop1 = new Loop({
  pitches: [60, 64, 67],
  durations: [0.5, 0.5, 0.5],
  iterations: 8
});

// Loop 2: Medium cycle (4 notes)
const loop2 = new Loop({
  pitches: [48, 52, 55, 48],
  durations: [1, 1, 1, 1],
  iterations: 3
});

// Loop 3: Slow cycle (5 notes)
const loop3 = new Loop({
  pitches: [72, 76, 79, 76, 72],
  durations: [2, 2, 2, 2, 2],
  iterations: 2
});

const pattern1 = loop1.generate();
const pattern2 = loop2.generate();
const pattern3 = loop3.generate();

console.log('Polyloop patterns:');
console.log('  Loop 1 (3-cycle):', pattern1.length, 'notes');
console.log('  Loop 2 (4-cycle):', pattern2.length, 'notes');
console.log('  Loop 3 (5-cycle):', pattern3.length, 'notes');

// When combined, these create a complex polyrhythmic texture
// The patterns align every LCM(3,4,5) = 60 beats
console.log('  Patterns fully align after:', 60, 'beats');
console.log('');

// =====================================================
// 4. Isorhythm
// =====================================================
console.log('4. Isorhythm\n');

/*
Isorhythm is a medieval technique where a repeating
pitch pattern (color) is combined with a repeating
rhythm pattern (talea) of different lengths.
*/

// Color (pitch pattern) - 5 pitches
const color = [60, 62, 64, 65, 67, 69, 71, 72];

// Talea (rhythm pattern) - 3 durations
const talea = [1, 0.5, 0.5, 1];

// Generate isorhythmic pattern
const isoPattern = isorhythm(color, talea);

console.log('Isorhythm:');
console.log('  Color length:', color.length, 'pitches');
console.log('  Talea length:', talea.length, 'durations');
console.log('  Result:', isoPattern.length, 'notes');
console.log('  Pattern repeats after:', color.length * talea.length, 'notes (LCM)');

// Show first cycle
console.log('  First 8 notes:', isoPattern.slice(0, 8).map(n => ({
  pitch: n.pitch,
  duration: n.duration
})));
console.log('');

// =====================================================
// 5. Beatcycle
// =====================================================
console.log('5. Beatcycle\n');

/*
Beatcycle creates rhythmic patterns by cycling through
pitch and duration lists independently, similar to
isorhythm but with time-based alignment.
*/

const pitches = [60, 64, 67, 72];
const durations = [1, 0.5, 0.5];

const beatPattern = beatcycle(pitches, durations);

console.log('Beatcycle:');
console.log('  Pitches:', pitches);
console.log('  Durations:', durations);
console.log('  Result:', beatPattern.length, 'notes');

console.log('  Pattern:', beatPattern.slice(0, 6).map(n => ({
  pitch: n.pitch,
  duration: n.duration,
  time: n.time
})));
console.log('');

// =====================================================
// 6. Phase Shifting Loops
// =====================================================
console.log('6. Phase Shifting Loops\n');

/*
Phase shifting creates Steve Reich-style minimalism
where identical patterns start at different times
and gradually drift in and out of phase.
*/

// Base pattern
const basePattern = [60, 62, 64, 62];
const baseDuration = 0.25;

// Create multiple loops with slight phase shifts
const phaseShift1 = new Loop({
  pitches: basePattern,
  durations: Array(4).fill(baseDuration),
  iterations: 16,
  offset: 0  // Start immediately
});

const phaseShift2 = new Loop({
  pitches: basePattern,
  durations: Array(4).fill(baseDuration),
  iterations: 16,
  offset: 0.05  // Start 0.05 beats later
});

const phaseShift3 = new Loop({
  pitches: basePattern,
  durations: Array(4).fill(baseDuration),
  iterations: 16,
  offset: 0.10  // Start 0.10 beats later
});

console.log('Phase-shifted loops:');
console.log('  Base pattern:', basePattern);
console.log('  Phase shift 1: 0.00 beats');
console.log('  Phase shift 2: 0.05 beats');
console.log('  Phase shift 3: 0.10 beats');
console.log('  Creates gradually shifting polyrhythmic texture');
console.log('');

// =====================================================
// 7. Complex Polyloop Example
// =====================================================
console.log('7. Complex Polyloop Example\n');

/*
Combining multiple techniques for rich textures
*/

// Prime number cycles for maximum complexity
const prime3Loop = new Loop({
  pitches: [60, 63, 67],  // C minor triad
  durations: [1, 1, 1],
  iterations: 7
});

const prime5Loop = new Loop({
  pitches: [48, 50, 52, 53, 55],  // Bass line
  durations: [0.5, 0.5, 0.5, 0.5, 0.5],
  iterations: 5
});

const prime7Loop = new Loop({
  pitches: [72, 74, 76, 77, 79, 81, 83],  // High melody
  durations: [2, 2, 2, 2, 2, 2, 2],
  iterations: 2,
  transpose: -1  // Descend 1 semitone per iteration
});

const primePattern3 = prime3Loop.generate();
const primePattern5 = prime5Loop.generate();
const primePattern7 = prime7Loop.generate();

console.log('Complex polyloop (prime cycles):');
console.log('  3-cycle:', primePattern3.length, 'notes');
console.log('  5-cycle:', primePattern5.length, 'notes');
console.log('  7-cycle:', primePattern7.length, 'notes');
console.log('  Full alignment after:', 3 * 5 * 7, '=', 105, 'beats');
console.log('');

// =====================================================
// 8. Practical Example: Minimalist Composition
// =====================================================
console.log('8. Practical Example: Minimalist Composition\n');

/*
Create a minimalist composition using multiple loops
with different cycle lengths and rhythmic densities.
*/

// High sustained notes (slow)
const sustained = new Loop({
  pitches: [84, 86, 88, 89],
  durations: [4, 4, 4, 4],
  iterations: 2
});

// Mid-range arpeggios (medium)
const arpeggios = new Loop({
  pitches: [60, 64, 67, 64, 60, 67],
  durations: [1, 1, 1, 1, 1, 1],
  iterations: 4
});

// Bass pulse (fast)
const bass = new Loop({
  pitches: [36, 36, 43, 36],
  durations: [0.5, 0.5, 0.5, 0.5],
  iterations: 12
});

// Rhythmic hihat pattern
const rhythm = new Loop({
  pitches: [72, 72, 72, null, 72, 72],  // null = rest
  durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
  iterations: 16
});

const sustainedNotes = sustained.generate();
const arpeggioNotes = arpeggios.generate();
const bassNotes = bass.generate();
const rhythmNotes = rhythm.generate().filter(n => n.pitch !== null);

console.log('Minimalist composition tracks:');
console.log('  Sustained:', sustainedNotes.length, 'notes (32 beats)');
console.log('  Arpeggios:', arpeggioNotes.length, 'notes (24 beats)');
console.log('  Bass:', bassNotes.length, 'notes (24 beats)');
console.log('  Rhythm:', rhythmNotes.length, 'notes (24 beats)');

// Convert to JMON composition
const composition = {
  format: 'jmon',
  version: '1.0',
  tempo: 120,
  tracks: [
    { label: 'Sustained', notes: sustainedNotes },
    { label: 'Arpeggios', notes: arpeggioNotes },
    { label: 'Bass', notes: bassNotes },
    { label: 'Rhythm', notes: rhythmNotes }
  ]
};

console.log('  ✓ Created 4-track minimalist composition');
console.log('');

// =====================================================
// 9. Summary
// =====================================================
console.log('9. Summary\n');

console.log('Key concepts covered:');
console.log('  ✓ Basic loops with iterations');
console.log('  ✓ Loop transformations (transpose)');
console.log('  ✓ Polyloops (multiple independent cycles)');
console.log('  ✓ Isorhythm (color + talea)');
console.log('  ✓ Beatcycle rhythmic patterns');
console.log('  ✓ Phase shifting (Steve Reich style)');
console.log('  ✓ Prime number cycles for complexity');
console.log('  ✓ Complete minimalist composition');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');

// Export for use in other examples
export { simpleLoop, composition };
