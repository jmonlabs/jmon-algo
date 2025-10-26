/**
 * JMON-ALGO TUTORIAL 05: WALKS
 * JavaScript translation of Djalgo's walks tutorial
 *
 * This tutorial covers:
 * - Random Walks (Brownian motion)
 * - Markov Chains (state transitions)
 * - Phasor Systems (rotating vectors)
 * - Probability-based composition
 */

import jm from '../../src/index.js';

const { RandomWalk, Chain, Phasor, PhasorSystem } = jm.generative.walks;

console.log('=== JMON-ALGO TUTORIAL 05: WALKS ===\n');

// =====================================================
// 1. Random Walk Basics
// =====================================================
console.log('1. Random Walk Basics\n');

/*
A Random Walk is a path that consists of successive
random steps. In music, this creates melodies that
wander up and down unpredictably.

Parameters:
- start: Starting pitch
- steps: Number of steps to take
- stepSize: Maximum interval for each step
- bounds: Optional [min, max] pitch range
*/

// Simple random walk starting at C4 (MIDI 60)
const walk1 = new RandomWalk({
  start: 60,
  stepSize: 2,  // Move up or down by 0-2 semitones
  bounds: [55, 72]  // Keep within E3-C5 range
});

const melody1 = walk1.generate(20);  // Generate 20 notes
console.log('Random walk:');
console.log('  Start:', 60, '(C4)');
console.log('  Steps:', 20);
console.log('  Range:', 55, '-', 72);
console.log('  Generated:', melody1.length, 'pitches');
console.log('  Melody:', melody1.slice(0, 10), '...');
console.log('  Min pitch:', Math.min(...melody1));
console.log('  Max pitch:', Math.max(...melody1));
console.log('');

// =====================================================
// 2. Biased Random Walk
// =====================================================
console.log('2. Biased Random Walk\n');

/*
Biased walks have a tendency to move in one direction.
This creates melodies with an overall ascending or
descending contour.
*/

// Walk with upward bias
const walkUp = new RandomWalk({
  start: 60,
  stepSize: 3,
  bias: 0.6,  // 60% chance of moving up
  bounds: [60, 84]
});

const melodyUp = walkUp.generate(30);
console.log('Biased walk (upward):');
console.log('  Bias: 0.6 (60% up)');
console.log('  Start:', melodyUp[0]);
console.log('  End:', melodyUp[melodyUp.length - 1]);
console.log('  Net change:', melodyUp[melodyUp.length - 1] - melodyUp[0], 'semitones');
console.log('');

// Walk with downward bias
const walkDown = new RandomWalk({
  start: 72,
  stepSize: 3,
  bias: 0.3,  // 30% chance of moving up = 70% down
  bounds: [48, 72]
});

const melodyDown = walkDown.generate(30);
console.log('Biased walk (downward):');
console.log('  Bias: 0.3 (30% up, 70% down)');
console.log('  Start:', melodyDown[0]);
console.log('  End:', melodyDown[melodyDown.length - 1]);
console.log('  Net change:', melodyDown[melodyDown.length - 1] - melodyDown[0], 'semitones');
console.log('');

// =====================================================
// 3. Constrained Random Walk (Scale)
// =====================================================
console.log('3. Constrained Random Walk (Scale)\n');

/*
Walks can be constrained to specific scales,
creating tonally coherent melodies.
*/

// C major scale
const cMajorScale = [60, 62, 64, 65, 67, 69, 71, 72];

const scaleWalk = new RandomWalk({
  start: 64,  // E (3rd of scale)
  stepSize: 2,  // Move 0-2 scale degrees
  constrainToSet: cMajorScale,
  bounds: [60, 72]
});

const scalarMelody = scaleWalk.generate(20);
console.log('Scale-constrained walk:');
console.log('  Scale:', cMajorScale);
console.log('  Melody:', scalarMelody.slice(0, 10), '...');
console.log('  All notes in scale:', scalarMelody.every(p => cMajorScale.includes(p)));
console.log('');

// =====================================================
// 4. Markov Chains - First Order
// =====================================================
console.log('4. Markov Chains - First Order\n');

/*
Markov chains use transition probabilities to determine
the next state based on the current state. In music,
this creates patterns based on learned probabilities.
*/

// Define transition probabilities
// State 0 (C): 50% to D, 30% to E, 20% to G
// State 1 (D): 40% to C, 40% to E, 20% to F
// State 2 (E): 30% to D, 40% to F, 30% to G
// etc.
const transitionMatrix = [
  [0.1, 0.5, 0.3, 0.0, 0.2, 0.0, 0.0],  // From C
  [0.4, 0.1, 0.4, 0.2, 0.0, 0.0, 0.0],  // From D
  [0.0, 0.3, 0.1, 0.4, 0.0, 0.3, 0.0],  // From E
  [0.0, 0.0, 0.3, 0.1, 0.5, 0.0, 0.1],  // From F
  [0.2, 0.0, 0.0, 0.3, 0.1, 0.3, 0.2],  // From G
  [0.0, 0.0, 0.3, 0.0, 0.4, 0.1, 0.2],  // From A
  [0.1, 0.0, 0.0, 0.1, 0.3, 0.2, 0.3]   // From B
];

const states = [60, 62, 64, 65, 67, 69, 71];  // C D E F G A B

const chain = new Chain({
  states: states,
  transitions: transitionMatrix,
  order: 1  // First-order Markov chain
});

const markovMelody = chain.generate(20, { start: 0 });  // Start from C
console.log('First-order Markov chain:');
console.log('  States:', states.length, '(C major scale)');
console.log('  Start state: C (60)');
console.log('  Generated melody:', markovMelody.length, 'notes');
console.log('  Melody:', markovMelody.slice(0, 10), '...');
console.log('');

// =====================================================
// 5. Markov Chains - Second Order
// =====================================================
console.log('5. Markov Chains - Second Order\n');

/*
Second-order chains consider the previous TWO states,
creating more contextual and musical patterns.
*/

// Simplified: Learn from a training sequence
const trainingSequence = [60, 62, 64, 65, 67, 65, 64, 62, 60, 62, 64, 62, 60];

// Create chain from training data
const chain2 = Chain.fromSequence(trainingSequence, { order: 2 });
const learned Melody = chain2.generate(20);

console.log('Second-order Markov chain:');
console.log('  Training sequence:', trainingSequence);
console.log('  Order: 2 (considers last 2 notes)');
console.log('  Generated:', learnedMelody.length, 'notes');
console.log('  Melody:', learnedMelody.slice(0, 12), '...');
console.log('');

// =====================================================
// 6. Phasors - Rotating Vectors
// =====================================================
console.log('6. Phasors - Rotating Vectors\n');

/*
Phasors are rotating vectors in 2D space. Their
distance and angle from the origin can be mapped
to musical parameters.

Great for creating smooth, cyclical variations.
*/

// Single phasor
const phasor1 = new Phasor(
  10,    // distance (radius)
  1.0,   // frequency (rotations per time unit)
  0      // phase offset
);

// Simulate over time
const timePoints = Array.from({ length: 20 }, (_, i) => i * 0.1);
const phasorData = phasor1.simulate(timePoints);

console.log('Single phasor:');
console.log('  Distance:', 10);
console.log('  Frequency:', 1.0);
console.log('  Time points:', timePoints.length);
console.log('  First few distances:',
  phasorData.slice(0, 5).map(d => d.distance.toFixed(2))
);
console.log('  First few angles:',
  phasorData.slice(0, 5).map(d => d.angle.toFixed(1) + '°')
);
console.log('');

// =====================================================
// 7. Phasor System - Multiple Phasors
// =====================================================
console.log('7. Phasor System - Multiple Phasors\n');

/*
Multiple phasors rotating at different frequencies
create complex, evolving patterns - like epicycles
or Lissajous curves in music.
*/

const system = new PhasorSystem();

// Add phasors with different frequencies
system.addPhasor(new Phasor(10, 1.0, 0));           // Fundamental
system.addPhasor(new Phasor(5, 2.0, Math.PI/4));    // First harmonic
system.addPhasor(new Phasor(2, 3.0, Math.PI/2));    // Second harmonic

const systemData = system.simulate(Array.from({ length: 50 }, (_, i) => i * 0.1));

console.log('Phasor system:');
console.log('  Number of phasors:', 3);
console.log('  Frequencies: 1.0, 2.0, 3.0 (harmonic series)');
console.log('  Creates complex periodic pattern');
console.log('  Data points per phasor:', systemData[0].length);
console.log('');

// =====================================================
// 8. Mapping Phasors to Music
// =====================================================
console.log('8. Mapping Phasors to Music\n');

/*
Map phasor properties to musical parameters:
- Distance → Pitch
- Angle → Duration or velocity
- Multiple phasors → Polyphonic voices
*/

// Create phasor for pitch modulation
const pitchPhasor = new Phasor(10, 0.5, 0);
const pitchData = pitchPhasor.simulate(
  Array.from({ length: 30 }, (_, i) => i * 0.2)
);

// Map distance to pitch (oscillates around middle C)
const phasorMelody = pitchData.map(d => {
  const basePitch = 60;  // Middle C
  const modulation = d.distance;  // 0-10 range
  return Math.round(basePitch + modulation);
});

console.log('Phasor-based melody:');
console.log('  Base pitch: 60 (C4)');
console.log('  Modulation range: ±10 semitones');
console.log('  Generated:', phasorMelody.length, 'pitches');
console.log('  Melody:', phasorMelody.slice(0, 10), '...');
console.log('  Creates smooth, wave-like contour');
console.log('');

// =====================================================
// 9. Combining Walk Types
// =====================================================
console.log('9. Combining Walk Types\n');

/*
Combine different walk types for rich, varied music.
*/

// Use random walk for overall contour
const contourWalk = new RandomWalk({
  start: 60,
  stepSize: 3,
  bias: 0.55,  // Slight upward tendency
  bounds: [55, 75]
});

const contour = contourWalk.generate(40);

// Use Markov chain for local pitch decisions
const localChain = Chain.fromSequence([0, 2, 4, 5, 7, 5, 4, 2], { order: 1 });

// Combine: contour provides overall shape, chain provides details
const hybridMelody = contour.map(basePitch => {
  const offset = localChain.generate(1)[0];
  return basePitch + offset;
});

console.log('Hybrid walk (Random + Markov):');
console.log('  Random walk provides: overall contour');
console.log('  Markov chain provides: local intervals');
console.log('  Result:', hybridMelody.length, 'pitches');
console.log('  Melody:', hybridMelody.slice(0, 10), '...');
console.log('');

// =====================================================
// 10. Practical Example: Generative Composition
// =====================================================
console.log('10. Practical Example: Generative Composition\n');

// Create multiple voices using different walk types
const voice1Walk = new RandomWalk({
  start: 72,
  stepSize: 2,
  constrainToSet: cMajorScale,
  bounds: [67, 84]
});

const voice2Chain = new Chain({
  states: [60, 62, 64, 65, 67],
  transitions: [
    [0.2, 0.4, 0.2, 0.1, 0.1],
    [0.3, 0.2, 0.3, 0.2, 0.0],
    [0.1, 0.3, 0.2, 0.3, 0.1],
    [0.0, 0.2, 0.4, 0.2, 0.2],
    [0.2, 0.0, 0.2, 0.3, 0.3]
  ]
});

const voice3Phasor = new Phasor(5, 0.3, 0);

// Generate voices
const voice1Pitches = voice1Walk.generate(32);
const voice2Pitches = voice2Chain.generate(32, { start: 0 });
const voice3Data = voice3Phasor.simulate(
  Array.from({ length: 32 }, (_, i) => i * 0.25)
);
const voice3Pitches = voice3Data.map(d => 48 + Math.round(d.distance));

// Create tracks with different rhythms
const voice1 = voice1Pitches.map((pitch, i) => ({
  pitch,
  duration: 0.5,
  time: i * 0.5,
  velocity: 0.7
}));

const voice2 = voice2Pitches.map((pitch, i) => ({
  pitch,
  duration: 1,
  time: i * 1,
  velocity: 0.8
}));

const voice3 = voice3Pitches.map((pitch, i) => ({
  pitch,
  duration: 2,
  time: i * 2,
  velocity: 0.6
}));

const composition = {
  format: 'jmon',
  version: '1.0',
  tempo: 120,
  tracks: [
    { label: 'Voice 1 (Random Walk)', notes: voice1 },
    { label: 'Voice 2 (Markov Chain)', notes: voice2 },
    { label: 'Voice 3 (Phasor)', notes: voice3 }
  ]
};

console.log('Generative composition:');
console.log('  Voice 1: Random walk (fast, scalar)');
console.log('  Voice 2: Markov chain (medium, probabilistic)');
console.log('  Voice 3: Phasor (slow, cyclical)');
console.log('  ✓ Created 3-voice composition');
console.log('');

// =====================================================
// 11. Summary
// =====================================================
console.log('11. Summary\n');

console.log('Key concepts covered:');
console.log('  ✓ Random walks (Brownian motion)');
console.log('  ✓ Biased walks (directional tendency)');
console.log('  ✓ Scale-constrained walks');
console.log('  ✓ First-order Markov chains');
console.log('  ✓ Second-order Markov chains');
console.log('  ✓ Learning chains from sequences');
console.log('  ✓ Phasors (rotating vectors)');
console.log('  ✓ Phasor systems (multiple frequencies)');
console.log('  ✓ Mapping phasors to pitch/rhythm');
console.log('  ✓ Hybrid approaches (combining walks)');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');

// Export for use in other examples
export { walk1, chain, phasor1, composition };
