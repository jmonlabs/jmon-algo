/**
 * JMON-ALGO TUTORIAL 04: MINIMALISM
 * JavaScript translation of Djalgo's minimalism tutorial
 *
 * This tutorial covers:
 * - Isorhythm
 * - Additive processes (forward, backward, inward, outward)
 * - Subtractive processes
 * - Tintinnabuli technique
 */

import jm from '../../src/index.js';

console.log('=== JMON-ALGO TUTORIAL 04: MINIMALISM ===\n');

// =====================================================
// 1. ISORHYTHM
// =====================================================
console.log('1. Isorhythm\n');

/*
Isorhythm maps durations to pitches. The process repeats until
the lengths of pitch and duration sequences coincide (their LCM).
*/

// Simple isorhythm: C major scale
const cMajorScale = new jm.theory.Scale('C', 'major');
const pitches = cMajorScale.generate({ octave: 4 }).slice(0, 8);
const durations = Array(8).fill(1);  // All quarter notes

const solfege = jm.theory.isorhythm(pitches, durations);
console.log('Solfege (simple):');
console.log('  Pitches:', pitches.length);
console.log('  Durations:', durations.length);
console.log('  Result:', solfege.length, 'notes');
console.log('');

// Interesting pattern with non-matching lengths
const complexDurations = [2, 1, 1, 2, 1, 1, 2, 1];  // 8 items
const complexPitches = [60, 62, 64, 65, 67];         // 5 items
const complexIso = jm.theory.isorhythm(complexPitches, complexDurations);

console.log('Complex isorhythm:');
console.log('  Pitches:', complexPitches.length);
console.log('  Durations:', complexDurations.length);
console.log('  Result:', complexIso.length, 'notes (LCM: 40)');
console.log('  Pattern creates interesting evolution');
console.log('');

// =====================================================
// 2. ADDITIVE PROCESSES
// =====================================================
console.log('2. Additive Processes\n');

// Base sequence for demonstrations
const baseSequence = [
  { pitch: 60, duration: 0.5, time: 0, velocity: 0.8 },   // C
  { pitch: 62, duration: 0.5, time: 0.5, velocity: 0.8 }, // D
  { pitch: 64, duration: 0.5, time: 1, velocity: 0.8 },   // E
  { pitch: 65, duration: 0.5, time: 1.5, velocity: 0.8 }  // F
];

// 2.1 Additive Forward
/*
Gradually adds notes from the beginning:
C
C, D
C, D, E
C, D, E, F
*/
console.log('2.1 Additive Forward Process');
const additiveForward = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'forward',
  repetition: 1
});
const afResult = additiveForward.generate(baseSequence);
console.log('  Original:', baseSequence.length, 'notes');
console.log('  Result:', afResult.length, 'notes');
console.log('  Pattern: Builds from start');
console.log('  Sample pitches:', afResult.slice(0, 6).map(n => n.pitch));
console.log('');

// 2.2 Additive Backward
/*
Gradually adds notes from the end:
F
E, F
D, E, F
C, D, E, F
*/
console.log('2.2 Additive Backward Process');
const additiveBackward = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'backward',
  repetition: 1
});
const abResult = additiveBackward.generate(baseSequence);
console.log('  Original:', baseSequence.length, 'notes');
console.log('  Result:', abResult.length, 'notes');
console.log('  Pattern: Builds from end');
console.log('  Sample pitches:', abResult.slice(0, 6).map(n => n.pitch));
console.log('');

// 2.3 Additive Inward
/*
Gradually adds notes from outside to inside:
C, F
C, E, F
C, D, E, F
*/
console.log('2.3 Additive Inward Process');
const additiveInward = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'inward',
  repetition: 0
});
const aiResult = additiveInward.generate(baseSequence);
console.log('  Original:', baseSequence.length, 'notes');
console.log('  Result:', aiResult.length, 'notes');
console.log('  Pattern: Builds from edges to center');
console.log('  Sample pitches:', aiResult.slice(0, 6).map(n => n.pitch));
console.log('');

// 2.4 Additive Outward
/*
Gradually adds notes from inside to outside:
D, E
C, D, E, F
... (pattern continues)
*/
console.log('2.4 Additive Outward Process');
const additiveOutward = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'outward',
  repetition: 0
});
const aoResult = additiveOutward.generate(baseSequence);
console.log('  Original:', baseSequence.length, 'notes');
console.log('  Result:', aoResult.length, 'notes');
console.log('  Pattern: Builds from center to edges');
console.log('  Sample pitches:', aoResult.slice(0, 4).map(n => n.pitch));
console.log('');

// =====================================================
// 3. SUBTRACTIVE PROCESSES
// =====================================================
console.log('3. Subtractive Processes\n');

// Longer sequence for subtractive demonstrations
const longSequence = [
  { pitch: 60, duration: 0.5, time: 0, velocity: 0.8 },
  { pitch: 62, duration: 0.5, time: 0.5, velocity: 0.8 },
  { pitch: 64, duration: 0.5, time: 1, velocity: 0.8 },
  { pitch: 65, duration: 0.5, time: 1.5, velocity: 0.8 },
  { pitch: 67, duration: 0.5, time: 2, velocity: 0.8 },
  { pitch: 69, duration: 0.5, time: 2.5, velocity: 0.8 }
];

// 3.1 Subtractive Forward
/*
Gradually removes notes from the beginning:
C, D, E, F, G, A
D, E, F, G, A
E, F, G, A
...
*/
console.log('3.1 Subtractive Forward Process');
const subtractiveForward = new jm.generative.MinimalismProcess({
  operation: 'subtractive',
  direction: 'forward',
  repetition: 0
});
const sfResult = subtractiveForward.generate(longSequence);
console.log('  Original:', longSequence.length, 'notes');
console.log('  Result:', sfResult.length, 'notes');
console.log('  Pattern: Removes from start');
console.log('  Last pitches:', sfResult.slice(-3).map(n => n.pitch));
console.log('');

// 3.2 Subtractive Backward
/*
Gradually removes notes from the end:
C, D, E, F, G, A
C, D, E, F, G
C, D, E, F
...
*/
console.log('3.2 Subtractive Backward Process');
const subtractiveBackward = new jm.generative.MinimalismProcess({
  operation: 'subtractive',
  direction: 'backward',
  repetition: 0
});
const sbResult = subtractiveBackward.generate(longSequence);
console.log('  Original:', longSequence.length, 'notes');
console.log('  Result:', sbResult.length, 'notes');
console.log('  Pattern: Removes from end');
console.log('  First pitches:', sbResult.slice(0, 6).map(n => n.pitch));
console.log('');

// 3.3 Subtractive Inward
/*
Gradually removes notes from outside edges:
C, D, E, F, G, A
D, E, F, G
E, F
*/
console.log('3.3 Subtractive Inward Process');
const subtractiveInward = new jm.generative.MinimalismProcess({
  operation: 'subtractive',
  direction: 'inward',
  repetition: 0
});
const siResult = subtractiveInward.generate(longSequence);
console.log('  Original:', longSequence.length, 'notes');
console.log('  Result:', siResult.length, 'notes');
console.log('  Pattern: Removes from edges');
console.log('  Final pitches:', siResult.slice(-2).map(n => n.pitch));
console.log('');

// =====================================================
// 4. REPETITION PARAMETER
// =====================================================
console.log('4. Repetition Parameter\n');

/*
The repetition parameter controls how many times each stage repeats
before moving to the next. This slows down the process.
*/

const withoutRepetition = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'forward',
  repetition: 0  // No repetition
});
const withRepetition = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'forward',
  repetition: 2  // Each stage repeats twice
});

const noRepResult = withoutRepetition.generate(baseSequence);
const repResult = withRepetition.generate(baseSequence);

console.log('Without repetition:', noRepResult.length, 'notes');
console.log('With repetition=2:', repResult.length, 'notes');
console.log('  Repetition makes process more gradual');
console.log('');

// =====================================================
// 5. TINTINNABULI TECHNIQUE
// =====================================================
console.log('5. Tintinnabuli Technique\n');

/*
Tintinnabuli is Arvo Pärt's minimalist technique.
It pairs a melodic voice (M-voice) with a harmonic voice (T-voice)
that always plays notes from a fixed chord (T-chord).
*/

// T-chord: C major triad
const tChord = [60, 64, 67];  // C, E, G

// M-voice: melodic line
const mVoice = [
  { pitch: 62, duration: 1, time: 0, velocity: 0.8 },  // D
  { pitch: 65, duration: 1, time: 1, velocity: 0.8 },  // F
  { pitch: 69, duration: 1, time: 2, velocity: 0.8 },  // A
  { pitch: 64, duration: 1, time: 3, velocity: 0.8 }   // E
];

// Generate T-voice using 'down' direction and position 0
const tintinnabuli = new jm.generative.Tintinnabuli(tChord, 'down', 0);
const tVoice = tintinnabuli.generate(mVoice);

console.log('Tintinnabuli:');
console.log('  T-chord:', tChord);
console.log('  M-voice pitches:', mVoice.map(n => n.pitch));
console.log('  T-voice pitches:', tVoice.map(n => n.pitch));
console.log('  All T-voice pitches in chord:',
  tVoice.every(n => tChord.includes(n.pitch)));
console.log('');

// Different positions
const tDown1 = new jm.generative.Tintinnabuli(tChord, 'down', 1);
const tVoice1 = tDown1.generate(mVoice);
console.log('  T-voice (position 1):', tVoice1.map(n => n.pitch));
console.log('');

const tUp = new jm.generative.Tintinnabuli(tChord, 'up', 0);
const tVoiceUp = tUp.generate(mVoice);
console.log('  T-voice (up):', tVoiceUp.map(n => n.pitch));
console.log('');

// =====================================================
// 6. COMPLETE MINIMALIST COMPOSITION
// =====================================================
console.log('6. Complete Minimalist Composition\n');

// Start with a simple motif
const motif = [
  { pitch: 60, duration: 0.5, time: 0, velocity: 0.8 },
  { pitch: 64, duration: 0.5, time: 0.5, velocity: 0.8 },
  { pitch: 67, duration: 0.5, time: 1, velocity: 0.8 },
  { pitch: 72, duration: 0.5, time: 1.5, velocity: 0.8 }
];

// Apply additive forward with repetition
const mainTrack = new jm.generative.MinimalismProcess({
  operation: 'additive',
  direction: 'forward',
  repetition: 1
}).generate(motif);

// Add tintinnabuli harmony
const harmonyTrack = new jm.generative.Tintinnabuli([60, 64, 67], 'down', 0)
  .generate(mainTrack);

// Create composition
const composition = {
  format: 'jmon',
  version: '1.0',
  tempo: 90,  // Slow, meditative
  keySignature: 'C',
  tracks: [
    {
      label: 'Melody (Additive)',
      notes: mainTrack
    },
    {
      label: 'Harmony (Tintinnabuli)',
      notes: harmonyTrack
    }
  ]
};

console.log('Minimalist composition:');
console.log('  Tempo:', composition.tempo, 'BPM (slow)');
console.log('  Track 1 (Melody):', mainTrack.length, 'notes');
console.log('  Track 2 (Harmony):', harmonyTrack.length, 'notes');
console.log('  Style: Additive process + Tintinnabuli');
console.log('');

// =====================================================
// 7. PRACTICAL TIPS
// =====================================================
console.log('7. Practical Tips\n');

console.log('Minimalist composition techniques:');
console.log('  • Start with simple motifs (2-4 notes)');
console.log('  • Use repetition to create gradual change');
console.log('  • Combine additive/subtractive for dynamic form');
console.log('  • Layer tintinnabuli for harmonic richness');
console.log('  • Keep tempo slow (60-90 BPM) for clarity');
console.log('  • Use isorhythm to create interesting rhythmic cycles');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');
console.log('Next: 05_walks.js - Random walks and Markov chains');
console.log('      06_fractals.js - Cellular automata and fractals');

// Export for use in other examples
export { composition, tintinnabuli, additiveForward };
