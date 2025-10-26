/**
 * JMON-ALGO TUTORIAL 05: WALKS
 * JavaScript translation of Djalgo's walks tutorial
 *
 * This tutorial covers:
 * - Random Walks (Markov chain behavior)
 * - Probabilistic step generation
 * - Phasor Systems (rotating vectors)
 * - Branching and merging walks
 */

import jm from '../../src/index.js';

const RandomWalk = jm.generative.walks.Random;
const Chain = jm.generative.walks.Chain;
const Phasor = jm.generative.walks.Phasor.Vector;
const PhasorSystem = jm.generative.walks.Phasor.System;

console.log('=== JMON-ALGO TUTORIAL 05: WALKS ===\n');

// =====================================================
// 1. Random Walk Basics (using RandomWalk class)
// =====================================================
console.log('1. Random Walk Basics\n');

/*
Random walks create melodies by taking steps in random directions.
Each step depends only on the current position (Markov property).
*/

const walk1 = new RandomWalk({
  length: 20,
  dimensions: 1,
  stepSize: 2,
  bounds: [55, 72]
});

walk1.generate([60]);
const pitches1 = walk1.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 2);  // C major scale
console.log('Random walk:');
console.log('  Start: 60 (C4)');
console.log('  Steps: 20');
console.log('  Range: 55-72');
console.log('  Generated:', pitches1.length, 'pitches');
console.log('  Melody:', pitches1.slice(0, 10));
console.log('  Min:', Math.min(...pitches1), 'Max:', Math.max(...pitches1));
console.log('');

// =====================================================
// 2. Constrained Random Walk
// =====================================================
console.log('2. Constrained Random Walk\n');

const walk2 = new RandomWalk({
  length: 30,
  dimensions: 1,
  stepSize: 3,
  bounds: [48, 84]
});

walk2.generate([60]);
const pitches2 = walk2.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 3);
console.log('Constrained walk:');
console.log('  Bounds: 48-84 (C3-C6)');
console.log('  Generated:', pitches2.length, 'pitches');
console.log('  Sample:', pitches2.slice(0, 10));
console.log('');

// =====================================================
// 3. Attractor-Based Walk
// =====================================================
console.log('3. Attractor-Based Walk\n');

const walk3 = new RandomWalk({
  length: 40,
  dimensions: 1,
  stepSize: 4,
  bounds: [40, 100],
  attractorStrength: 0.1,
  attractorPosition: [60]
});

walk3.generate([50]);
const pitches3 = walk3.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 3);
console.log('Attractor walk:');
console.log('  Attractor at: 60');
console.log('  Start: 50');
console.log('  Generated:', pitches3.length, 'pitches');
console.log('  Sample:', pitches3.slice(0, 10));
console.log('  Average:', Math.round(pitches3.reduce((a, b) => a + b) / pitches3.length));
console.log('');

// =====================================================
// 4. Chain - Probabilistic Walks (Markov Chains)
// =====================================================
console.log('4. Chain - Probabilistic Walks\n');

/*
Chain implements random walks with discrete step probabilities.
The walkProbability array defines possible steps (Markov transitions).
*/

// Simple symmetric walk: can go down 1, stay, or up 1
const chain1 = new Chain({
  walkStart: 0,
  walkRange: [-10, 10],
  walkProbability: [-1, 0, 1]  // Equal probability for each step
});

const walk1Steps = chain1.generate(20)[0];  // Returns array of walks
console.log('Symmetric chain walk:');
console.log('  Start: 0');
console.log('  Steps: [-1, 0, +1]');
console.log('  Walk:', walk1Steps.slice(0, 15));
console.log('');

// Biased walk: more likely to go up
const chain2 = new Chain({
  walkStart: 0,
  walkRange: [-20, 20],
  walkProbability: [-1, 0, 0, 1, 1, 2]  // Biased toward positive steps
});

const walk2Steps = chain2.generate(30)[0];
console.log('Biased chain walk:');
console.log('  Start: 0');
console.log('  Steps: [-1, 0, 0, +1, +1, +2] (biased up)');
console.log('  Walk:', walk2Steps.slice(0, 15));
console.log('  Final position:', walk2Steps[walk2Steps.length - 1]);
console.log('');

// =====================================================
// 5. Branching Walks
// =====================================================
console.log('5. Branching Walks\n');

/*
Walks can branch into multiple paths, creating polyphonic textures.
*/

const branchingChain = new Chain({
  walkStart: 60,
  walkRange: [48, 72],
  walkProbability: [-2, -1, 0, 1, 2],
  branchingProbability: 0.15,  // 15% chance to branch at each step
  mergingProbability: 0.05     // 5% chance to merge
});

const branches = branchingChain.generate(25);
console.log('Branching walk:');
console.log('  Branches created:', branches.length);
console.log('  Branch 1 length:', branches[0].length);
if (branches.length > 1) {
  console.log('  Branch 2 length:', branches[1].length);
  console.log('  Branch 1 sample:', branches[0].slice(0, 10).map(v => v !== null ? Math.round(v) : 'merged'));
  console.log('  Branch 2 sample:', branches[1].slice(0, 10).map(v => v !== null ? Math.round(v) : 'merged'));
}
console.log('');

// =====================================================
// 6. Phasor Systems
// =====================================================
console.log('6. Phasor Systems\n');

/*
Phasors are rotating vectors that create cyclical patterns.
They're perfect for creating periodic musical structures.
*/

const phasor1 = new Phasor({
  frequency: 1,
  amplitude: 7,
  phase: 0
});

const phasor2 = new Phasor({
  frequency: 0.5,
  amplitude: 4,
  phase: Math.PI / 2
});

const system = new PhasorSystem();
system.addPlanet(phasor1);
system.addPlanet(phasor2);

const phasorValues = [];
const times = Array.from({length: 32}, (_, i) => i / 4);
const systemResults = system.simulate(times);

// Extract values from all phasors at each time
for (let t = 0; t < times.length; t++) {
  let combined = 0;
  for (const phasorResults of systemResults) {
    const resultAtTime = phasorResults.find(r => r.time === times[t]);
    if (resultAtTime) {
      combined += resultAtTime.position.x;  // Use x position as the value
    }
  }
  phasorValues.push(Math.round(60 + combined));
}

console.log('Phasor system:');
console.log('  Phasors: 2 (freq 1.0 & 0.5)');
console.log('  Steps:', phasorValues.length);
console.log('  Sample:', phasorValues.slice(0, 12));
console.log('  Min:', Math.min(...phasorValues));
console.log('  Max:', Math.max(...phasorValues));
console.log('');

// =====================================================
// 7. Combining Walks for Composition
// =====================================================
console.log('7. Combining Walks for Composition\n');

/*
Use different walk types for different musical parameters
*/

// Melody: Random walk with attractor
const melodyWalk = new RandomWalk({
  length: 16,
  dimensions: 1,
  stepSize: 2,
  bounds: [60, 84],
  attractorStrength: 0.05,
  attractorPosition: [67]
});
melodyWalk.generate([67]);
const melody = melodyWalk.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 4);

// Bass: Chain walk
const bassChain = new Chain({
  walkStart: 48,
  walkRange: [36, 60],
  walkProbability: [-2, -1, 0, 0, 1, 2]
});
const bassWalk = bassChain.generate(16)[0];
const bass = bassWalk.map(v => Math.round(v));

// Rhythm: Phasor for velocity
const rhythmPhasor = new Phasor({ frequency: 0.75, amplitude: 0.3, phase: 0 });
const velocities = [];
for (let t = 0; t < 16; t++) {
  const val = rhythmPhasor.getPosition(t / 4);
  velocities.push(Math.max(0.4, Math.min(1.0, 0.7 + val)));
}

console.log('Multi-parameter composition:');
console.log('  Melody (random walk):', melody.slice(0, 8));
console.log('  Bass (chain walk):', bass.slice(0, 8));
console.log('  Velocities (phasor):', velocities.slice(0, 8).map(v => v.toFixed(2)));
console.log('');

// =====================================================
// 8. Creating JMON Notes from Walks
// =====================================================
console.log('8. Creating JMON Notes from Walks\n');

/*
Convert walk data to JMON format for playback
*/

const jmonNotes = melody.map((pitch, i) => ({
  pitch,
  duration: 1,
  time: i,
  velocity: velocities[i] || 0.8
}));

console.log('JMON track from walks:');
console.log('  Total notes:', jmonNotes.length);
console.log('  Sample notes:', jmonNotes.slice(0, 3));
console.log('');

console.log('=== TUTORIAL 05 COMPLETE ===\n');
console.log('Key Concepts Covered:');
console.log('• Random walks for organic melodic motion');
console.log('• Constraints (bounds, attractors) for musical control');
console.log('• Chain class for discrete Markov transitions');
console.log('• Branching walks for polyphonic textures');
console.log('• Phasor systems for cyclical patterns');
console.log('• Combining multiple walk types in composition');
console.log('• Converting walks to JMON format');
