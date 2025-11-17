/**
 * JMON-ALGO TUTORIAL 03: LOOPS
 * JavaScript translation of Djalgo's loops tutorial
 *
 * This tutorial covers:
 * - Loop class for creating repeating musical patterns
 * - Polyloops (multiple independent loops)
 * - Euclidean rhythms
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
A Loop in algo creates repeating musical patterns.
The easiest way is to use Loop.fromPattern() which converts
simple pitch/duration arrays to JMON format automatically.
*/

// Simple melodic loop using fromPattern()
const simpleLoop = Loop.fromPattern(
  [60, 62, 64, 65],  // C, D, E, F
  [0.5, 0.5, 0.5, 0.5],
  {
    iterations: 4,
    label: 'Simple Melody'
  }
);

const simpleSequences = simpleLoop.toJMonSequences();
console.log('Simple loop tracks:', simpleSequences.length);
console.log('Total notes:', simpleSequences[0].notes.length);
console.log('First few notes:', simpleSequences[0].notes.slice(0, 4).map(n => ({
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
Loops can transform on each iteration using the transpose option:
*/

// Ascending loop that transposes up by 2 semitones each iteration
const ascendingLoop = Loop.fromPattern(
  [60, 64, 67],  // C major triad
  [1, 1, 1],
  {
    iterations: 4,
    transpose: 2,  // Transpose up 2 semitones per iteration
    label: 'Ascending'
  }
);

const ascendingSeq = ascendingLoop.toJMonSequences()[0];
console.log('Ascending loop notes:', ascendingSeq.notes.length);
console.log('Pitches over iterations:');
for (let i = 0; i < 12; i += 3) {
  const iteration = Math.floor(i / 3) + 1;
  const pitches = ascendingSeq.notes.slice(i, i + 3).map(n => n.pitch);
  console.log(`  Iteration ${iteration}:`, pitches);
}
console.log('');

// =====================================================
// 3. Polyloops (Multiple Independent Loops)
// =====================================================
console.log('3. Polyloops (Multiple Independent Loops)\n');

/*
Polyloops are multiple independent loops playing simultaneously.
In algo, you create separate Loop instances for each voice.
*/

const loop1 = Loop.fromPattern(
  [60, 64, 67],
  [0.5, 0.5, 0.5],
  { iterations: 8, label: 'Loop 1' }
);

const loop2 = Loop.fromPattern(
  [48, 52, 55, 48],
  [1, 1, 1, 1],
  { iterations: 3, label: 'Loop 2' }
);

const loop3 = Loop.fromPattern(
  [72, 76, 79, 76, 72],
  [2, 2, 2, 2, 2],
  { iterations: 2, label: 'Loop 3' }
);

console.log('Polyloop created with 3 independent loops:');
console.log('  Loop 1: 3 notes × 8 iterations =', loop1.toJMonSequences()[0].notes.length, 'notes');
console.log('  Loop 2: 4 notes × 3 iterations =', loop2.toJMonSequences()[0].notes.length, 'notes');
console.log('  Loop 3: 5 notes × 2 iterations =', loop3.toJMonSequences()[0].notes.length, 'notes');
console.log('');

// =====================================================
// 4. Euclidean Rhythms
// =====================================================
console.log('4. Euclidean Rhythms\n');

/*
Euclidean rhythms distribute beats evenly across a time span.
Loop.euclidean(steps, pulses, pitches) creates these patterns.
*/

// Classic patterns
const euclidean_3_8 = Loop.euclidean(8, 3, [60], 'Three over Eight');
const euclidean_5_8 = Loop.euclidean(8, 5, [64], 'Five over Eight');
const euclidean_5_12 = Loop.euclidean(12, 5, [67, 69], 'Five over Twelve');

console.log('Euclidean rhythms:');
console.log('  3 pulses in 8 steps:', euclidean_3_8.toJMonSequences()[0].notes.length, 'active notes');
console.log('  5 pulses in 8 steps:', euclidean_5_8.toJMonSequences()[0].notes.length, 'active notes');
console.log('  5 pulses in 12 steps:', euclidean_5_12.toJMonSequences()[0].notes.length, 'active notes');

// Visualize the 5/8 pattern
const pattern_5_8 = euclidean_5_8.toJMonSequences()[0].notes;
const times_5_8 = pattern_5_8.map(n => Math.round(n.time));
console.log('  5/8 pattern times:', times_5_8);
console.log('');

// =====================================================
// 5. Isorhythm
// =====================================================
console.log('5. Isorhythm\n');

/*
Isorhythm maps durations to pitches, repeating until their
least common multiple is reached.
*/

const pitches = [60, 62, 64, 65, 67];     // 5 pitches
const durations = [1, 0.5, 0.5, 1, 0.5];  // 5 durations
const isoPattern = isorhythm(pitches, durations);

console.log('Isorhythm:');
console.log('  Pitches:', pitches.length);
console.log('  Durations:', durations.length);
console.log('  Result:', isoPattern.length, 'notes');
console.log('  First few:', isoPattern.slice(0, 5).map(n => ({
    pitch: n.pitch,
    duration: n.duration
  })));
console.log('');

// Interesting pattern with different lengths
const complexPitches = [60, 64, 67];           // 3 pitches
const complexDurations = [1, 0.5, 0.5, 1];    // 4 durations
const complexPattern = isorhythm(complexPitches, complexDurations);

console.log('Complex isorhythm (3 pitches × 4 durations):');
console.log('  LCM(3, 4) = 12 notes');
console.log('  Result:', complexPattern.length, 'notes');
console.log('');

// =====================================================
// 6. Beatcycle
// =====================================================
console.log('6. Beatcycle\n');

/*
Beatcycle maps pitches to durations cyclically, setting offsets
based on cumulative durations.
*/

const beatPitches = [60, 62, 64, 65, 67, 69, 71, 72];
const beatDurations = [1, 0.5, 0.5, 1, 0.5, 0.5, 1, 1];
const beatPattern = beatcycle(beatPitches, beatDurations);
console.log('Beatcycle pattern:');
console.log('  Pitches:', beatPitches.length);
console.log('  Result:', beatPattern.length, 'notes');
console.log('  Format: [pitch, duration, offset]');
console.log('  First few:', beatPattern.slice(0, 3));
console.log('');

// =====================================================
// 7. Phase Shifting (Steve Reich style)
// =====================================================
console.log('7. Phase Shifting\n');

/*
Phase shifting creates multiple copies of the same pattern
starting at different times, creating complex polyrhythms.
*/

const basePattern = [60, 62, 64, 62];
const baseDuration = 0.25;

// Create three loops with increasing offsets
const phaseLoop1 = Loop.fromPattern(
  basePattern,
  Array(4).fill(baseDuration),
  { iterations: 16, offset: 0, label: 'Phase 1' }
);

const phaseLoop2 = Loop.fromPattern(
  basePattern,
  Array(4).fill(baseDuration),
  { iterations: 16, offset: 0.05, label: 'Phase 2' }
);

const phaseLoop3 = Loop.fromPattern(
  basePattern,
  Array(4).fill(baseDuration),
  { iterations: 16, offset: 0.10, label: 'Phase 3' }
);

console.log('Phase shifting (Steve Reich technique):');
console.log('  Base pattern:', basePattern);
console.log('  Loop 1 offset: 0.00 beats');
console.log('  Loop 2 offset: 0.05 beats');
console.log('  Loop 3 offset: 0.10 beats');
console.log('  Each loop: 16 iterations');

const phase1Notes = phaseLoop1.toJMonSequences()[0].notes;
const phase2Notes = phaseLoop2.toJMonSequences()[0].notes;
console.log(`  First note times: ${phase1Notes[0].time.toFixed(2)}, ${phase2Notes[0].time.toFixed(2)}`);
console.log('');

// =====================================================
// 8. Prime Number Cycles
// =====================================================
console.log('8. Prime Number Cycles\n');

/*
Using prime numbers for loop lengths creates interesting
polyrhythmic patterns that take time to align.
*/

const prime3Loop = Loop.fromPattern(
  [60, 63, 67],  // C minor triad
  [1, 1, 1],
  { iterations: 7, label: 'Prime 3' }
);

const prime5Loop = Loop.fromPattern(
  [48, 50, 52, 53, 55],  // Bass line
  [0.5, 0.5, 0.5, 0.5, 0.5],
  { iterations: 5, label: 'Prime 5' }
);

const prime7Loop = Loop.fromPattern(
  [72, 74, 76, 77, 79, 81, 83],  // High melody
  [2, 2, 2, 2, 2, 2, 2],
  { iterations: 2, transpose: -1, label: 'Prime 7' }
);

console.log('Prime number cycles:');
console.log('  3-note pattern (×7) =', prime3Loop.toJMonSequences()[0].notes.length, 'notes');
console.log('  5-note pattern (×5) =', prime5Loop.toJMonSequences()[0].notes.length, 'notes');
console.log('  7-note pattern (×2) =', prime7Loop.toJMonSequences()[0].notes.length, 'notes');
console.log('  These patterns align at different times creating evolving textures');
console.log('');

// =====================================================
// 9. Complex Polyloop Example
// =====================================================
console.log('9. Complex Polyloop Example\n');

/*
Combining everything: sustained notes, arpeggios, bass, and rhythm
*/

const sustained = Loop.fromPattern(
  [84, 86, 88, 89],
  [4, 4, 4, 4],
  { iterations: 2, label: 'Sustained' }
);

const arpeggios = Loop.fromPattern(
  [60, 64, 67, 64, 60, 67],
  [1, 1, 1, 1, 1, 1],
  { iterations: 4, label: 'Arpeggios' }
);

const bass = Loop.fromPattern(
  [36, 36, 43, 36],
  [0.5, 0.5, 0.5, 0.5],
  { iterations: 12, label: 'Bass' }
);

const rhythm = Loop.fromPattern(
  [72, 72, 72, null, 72, 72],  // null = rest
  [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
  { iterations: 16, label: 'Rhythm' }
);

console.log('Complex polyloop composition:');
console.log('  Sustained layer:', sustained.toJMonSequences()[0].notes.length, 'notes (slow)');
console.log('  Arpeggio layer:', arpeggios.toJMonSequences()[0].notes.length, 'notes (medium)');
console.log('  Bass layer:', bass.toJMonSequences()[0].notes.length, 'notes (steady)');
console.log('  Rhythm layer:', rhythm.toJMonSequences()[0].notes.length, 'events (fast)');
console.log('  Total events:',
  sustained.toJMonSequences()[0].notes.length +
  arpeggios.toJMonSequences()[0].notes.length +
  bass.toJMonSequences()[0].notes.length +
  rhythm.toJMonSequences()[0].notes.length
);
console.log('');

// =====================================================
// 10. Direct JMON Format
// =====================================================
console.log('10. Direct JMON Format\n');

/*
You can also create loops directly in JMON format for maximum control:
*/

const directLoop = new Loop({
  'Direct Pattern': {
    notes: [
      { pitch: 60, duration: 0.5, time: 0, velocity: 0.8 },
      { pitch: 62, duration: 0.5, time: 0.5, velocity: 0.7 },
      { pitch: 64, duration: 0.5, time: 1.0, velocity: 0.9 },
      { pitch: 65, duration: 0.5, time: 1.5, velocity: 0.8 }
    ]
  }
});

console.log('Direct JMON loop:');
console.log('  Created with explicit note objects');
console.log('  Full control over time, velocity, and duration');
console.log('  Notes:', directLoop.toJMonSequences()[0].notes.length);
console.log('');

console.log('=== TUTORIAL 03 COMPLETE ===\n');
console.log('Key Concepts Covered:');
console.log('• Loop.fromPattern() for simple patterns');
console.log('• Loop.euclidean() for Euclidean rhythms');
console.log('• Isorhythm for cyclic pitch/duration patterns');
console.log('• Beatcycle for rhythm generation');
console.log('• Phase shifting for Steve Reich-style minimalism');
console.log('• Prime number cycles for complex polyrhythms');
console.log('• Direct JMON format for maximum control');
