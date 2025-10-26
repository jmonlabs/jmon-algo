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

const RandomWalk = jm.generative.walks.Random;
const Chain = jm.generative.walks.Chain;
const Phasor = jm.generative.walks.Phasor.Vector;
const PhasorSystem = jm.generative.walks.Phasor.System;

console.log('=== JMON-ALGO TUTORIAL 05: WALKS ===\n');

// =====================================================
// 1. Random Walk Basics
// =====================================================
console.log('1. Random Walk Basics\n');

/*
Random walks create melodies by taking steps in random directions.
In jmon-algo:
- Create RandomWalk with options (length, dimensions, stepSize, bounds)
- Call generate([startPosition]) to create walk
- Use mapToScale() to convert to musical pitches
*/

// Simple random walk starting at C4 (MIDI 60)
const walk1 = new RandomWalk({
  length: 20,
  dimensions: 1,
  stepSize: 2,
  bounds: [55, 72]
});

walk1.generate([60]);
const pitches1 = walk1.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 2);  // C major scale, octave 2
console.log('Random walk:');
console.log('  Start: 60 (C4)');
console.log('  Steps: 20');
console.log('  Range: 55-72');
console.log('  Generated:', pitches1.length, 'pitches');
console.log('  Melody:', pitches1.slice(0, 10));
console.log('  Min pitch:', Math.min(...pitches1));
console.log('  Max pitch:', Math.max(...pitches1));
console.log('');

// =====================================================
// 2. Constrained Random Walk
// =====================================================
console.log('2. Constrained Random Walk\n');

/*
Using bounds to keep walks within a specific range
*/

const walk2 = new RandomWalk({
  length: 30,
  dimensions: 1,
  stepSize: 3,
  bounds: [48, 84]  // Constrained to C3-C6
});

walk2.generate([60]);
const pitches2 = walk2.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 3);
console.log('Constrained walk:');
console.log('  Bounds: 48-84 (C3-C6)');
console.log('  Generated:', pitches2.length, 'pitches');
console.log('  Sample:', pitches2.slice(0, 10));
console.log('  Stayed in bounds:', Math.min(...pitches2) >= 48 && Math.max(...pitches2) <= 84);
console.log('');

// =====================================================
// 3. Attractor-Based Walk
// =====================================================
console.log('3. Attractor-Based Walk\n');

/*
Attractors pull the walk toward a center point
*/

const walk3 = new RandomWalk({
  length: 40,
  dimensions: 1,
  stepSize: 4,
  bounds: [40, 100],
  attractorStrength: 0.1,
  attractorPosition: [60]  // Pull toward C4
});

walk3.generate([50]);
const pitches3 = walk3.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 3);
console.log('Attractor walk:');
console.log('  Attractor at: 60');
console.log('  Start: 50');
console.log('  Generated:', pitches3.length, 'pitches');
console.log('  Sample:', pitches3.slice(0, 10));
console.log('  Average pitch:', Math.round(pitches3.reduce((a, b) => a + b) / pitches3.length));
console.log('');

// =====================================================
// 4. Markov Chains - First Order
// =====================================================
console.log('4. Markov Chains - First Order\n');

/*
Markov chains generate sequences based on transition probabilities.
First-order chains consider only the current state.
*/

// Create a chain with transition probabilities
const chain = new Chain({
  order: 1,
  states: [60, 62, 64, 65, 67],  // C major pentatonic
  transitionMatrix: [
    [0.2, 0.3, 0.2, 0.2, 0.1],  // From C
    [0.3, 0.2, 0.2, 0.2, 0.1],  // From D
    [0.2, 0.2, 0.2, 0.3, 0.1],  // From E
    [0.2, 0.2, 0.3, 0.2, 0.1],  // From F
    [0.1, 0.1, 0.1, 0.2, 0.5]   // From G
  ]
});

const markovSequence = chain.generate(20);
console.log('First-order Markov chain:');
console.log('  States: [C, D, E, F, G]');
console.log('  Generated:', markovSequence.length, 'notes');
console.log('  Sequence:', markovSequence);
console.log('');

// =====================================================
// 5. Markov Chains - Second Order
// =====================================================
console.log('5. Markov Chains - Second Order\n');

/*
Second-order chains consider the last two states,
creating more complex, contextual patterns.
*/

// Learn from a training sequence
const trainingSequence = [60, 62, 64, 65, 67, 65, 64, 62, 60, 62, 64, 62, 60];
const chain2 = Chain.fromSequence(trainingSequence, { order: 2 });
const learnedSequence = chain2.generate(20);

console.log('Second-order Markov chain:');
console.log('  Training sequence:', trainingSequence);
console.log('  Order: 2 (considers last 2 notes)');
console.log('  Generated:', learnedSequence.length, 'notes');
console.log('  Sequence:', learnedSequence);
console.log('');

// =====================================================
// 6. Phasor Systems
// =====================================================
console.log('6. Phasor Systems\n');

/*
Phasors are rotating vectors that create cyclical patterns.
Think of them like clock hands moving at different speeds.
*/

// Create individual phasors
const phasor1 = new Phasor({
  frequency: 1,     // One rotation per unit time
  amplitude: 7,     // Range: ±7 semitones
  phase: 0          // Starting angle
});

const phasor2 = new Phasor({
  frequency: 0.5,   // Half rotation per unit time
  amplitude: 4,
  phase: Math.PI / 2  // 90° offset
});

// Combine into a system
const system = new PhasorSystem();
system.addPlanet(phasor1);
system.addPlanet(phasor2);

// Simulate the system over time
const steps = 32;
const phasorValues = [];
for (let t = 0; t < steps; t++) {
  const state = system.simulate(t / 4);  // Time in quarter notes
  const combinedValue = state.reduce((sum, val) => sum + val, 0);
  phasorValues.push(Math.round(60 + combinedValue));  // Center at C4
}

console.log('Phasor system:');
console.log('  Phasors: 2 (freq 1.0 & 0.5)');
console.log('  Steps:', steps);
console.log('  Generated:', phasorValues.length, 'pitches');
console.log('  Sample:', phasorValues.slice(0, 12));
console.log('  Min:', Math.min(...phasorValues));
console.log('  Max:', Math.max(...phasorValues));
console.log('');

// =====================================================
// 7. Combining Walks and Chains
// =====================================================
console.log('7. Combining Walks and Chains\n');

/*
Hybrid approach: Use random walk for contour,
Markov chain for rhythmic/pitch relationships
*/

// Random walk for overall contour
const contourWalk = new RandomWalk({
  length: 24,
  dimensions: 1,
  stepSize: 3,
  bounds: [48, 72],
  attractorStrength: 0.05,
  attractorPosition: [60]
});

contourWalk.generate([60]);
const contourPitches = contourWalk.mapToScale(0, [0, 2, 3, 5, 7, 8, 10], 3);  // Minor scale

// Markov chain for local variations
const localChain = Chain.fromSequence([0, 1, -1, 0, 2, -2, 0], { order: 1 });
const variations = localChain.generate(24);

// Combine: contour + local variations
const hybridMelody = contourPitches.map((pitch, i) => {
  const variation = variations[i] || 0;
  return pitch + variation;
});

console.log('Hybrid (Walk + Chain):');
console.log('  Contour (walk):', contourPitches.slice(0, 8));
console.log('  Variations (chain):', variations.slice(0, 8));
console.log('  Combined:', hybridMelody.slice(0, 8));
console.log('  Total notes:', hybridMelody.length);
console.log('');

// =====================================================
// 8. Multi-Voice Generation
// =====================================================
console.log('8. Multi-Voice Generation\n');

/*
Generate multiple voices using different techniques
*/

// Voice 1: Random walk
const voice1Walk = new RandomWalk({
  length: 16,
  dimensions: 1,
  stepSize: 2,
  bounds: [60, 84]
});
voice1Walk.generate([72]);
const voice1 = voice1Walk.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 4);

// Voice 2: Markov chain
const voice2Chain = Chain.fromSequence([48, 50, 52, 53, 55, 53, 52, 50], { order: 1 });
const voice2 = voice2Chain.generate(16);

// Voice 3: Phasor
const voice3Phasor = new Phasor({ frequency: 0.75, amplitude: 5, phase: 0 });
const voice3 = [];
for (let t = 0; t < 16; t++) {
  const val = voice3Phasor.getPosition(t / 4);
  voice3.push(Math.round(64 + val));
}

console.log('Multi-voice composition:');
console.log('  Voice 1 (random walk):', voice1.slice(0, 8));
console.log('  Voice 2 (Markov chain):', voice2.slice(0, 8));
console.log('  Voice 3 (phasor):', voice3.slice(0, 8));
console.log('  Each voice:', 16, 'notes');
console.log('');

console.log('=== TUTORIAL 05 COMPLETE ===\n');
console.log('Key Concepts Covered:');
console.log('• Random walks for organic melodic motion');
console.log('• Constraints (bounds, attractors) for control');
console.log('• First and second-order Markov chains');
console.log('• Learning patterns from existing sequences');
console.log('• Phasor systems for cyclical patterns');
console.log('• Hybrid approaches combining techniques');
console.log('• Multi-voice generation with different methods');
