/**
 * Comprehensive tests for generative algorithms
 * Tests: Cellular Automata, Fractals, Genetic, Loops, Minimalism, Walks, Phasors
 */

import { CellularAutomata } from '../src/algorithms/generative/cellular-automata/CellularAutomata.js';
import { Mandelbrot } from '../src/algorithms/generative/fractals/Mandelbrot.js';
import { LogisticMap } from '../src/algorithms/generative/fractals/LogisticMap.js';
import { Darwin } from '../src/algorithms/generative/genetic/Darwin.js';
import { Loop } from '../src/algorithms/generative/loops/Loop.js';
import { MinimalismProcess, Tintinnabuli } from '../src/algorithms/generative/minimalism/MinimalismProcess.js';
import { RandomWalk } from '../src/algorithms/generative/walks/RandomWalk.js';
import { Chain } from '../src/algorithms/generative/walks/Chain.js';
import { Phasor } from '../src/algorithms/generative/walks/PhasorWalk.js';

console.log('=== Testing Generative Algorithms ===\n');

// Test 1: Cellular Automata
console.log('1. Testing Cellular Automata (Rule 30)');
try {
  const ca = new CellularAutomata({
    rule: 30,
    width: 10,
    iterations: 5
  });

  const caSequence = ca.generate();
  console.log('  ✓ Generated CA sequence, length:', caSequence.length);
  console.log('  ✓ First value:', caSequence[0]);

  // Test mapping to pitches
  const pitches = ca.toPitches({ scale: [0, 2, 4, 5, 7, 9, 11], octave: 4 });
  console.log('  ✓ Mapped to pitches, count:', pitches.length);
  console.log('  ✓ Sample pitch:', pitches[0]);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 2: Mandelbrot Fractals
console.log('2. Testing Mandelbrot Fractals');
try {
  const mandelbrot = new Mandelbrot({
    width: 20,
    height: 20,
    maxIterations: 50
  });

  const fractalData = mandelbrot.generate();
  console.log('  ✓ Generated fractal data, rows:', fractalData.length);

  const sequence = mandelbrot.extractSequence('spiral');
  console.log('  ✓ Extracted spiral sequence, length:', sequence.length);

  const pitches = mandelbrot.toPitches(sequence, { min: 48, max: 72 });
  console.log('  ✓ Mapped to pitches, range:', Math.min(...pitches), '-', Math.max(...pitches));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 3: Logistic Map
console.log('3. Testing Logistic Map');
try {
  const logistic = new LogisticMap({
    r: 3.8,
    x0: 0.5,
    iterations: 50
  });

  const sequence = logistic.generate();
  console.log('  ✓ Generated sequence, length:', sequence.length);
  console.log('  ✓ Values in range [0,1]:', sequence.every(v => v >= 0 && v <= 1));

  const pitches = logistic.toPitches({ min: 60, max: 84 });
  console.log('  ✓ Mapped to pitches, sample:', pitches.slice(0, 5));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 4: Genetic Algorithm (Darwin)
console.log('4. Testing Genetic Algorithm (Darwin)');
try {
  const darwin = new Darwin({
    populationSize: 10,
    generations: 5,
    mutationRate: 0.1,
    phraseLength: 8
  });

  const seedPhrase = [
    { pitch: 60, duration: 1, time: 0 },
    { pitch: 62, duration: 1, time: 1 },
    { pitch: 64, duration: 1, time: 2 },
    { pitch: 65, duration: 1, time: 3 }
  ];

  const evolved = darwin.evolve(seedPhrase, {
    targetGini: 0.3,
    targetBalance: 0.5
  });

  console.log('  ✓ Evolved phrase, length:', evolved.length);
  console.log('  ✓ Sample notes:', evolved.slice(0, 3).map(n => n.pitch));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 5: Loop Composition
console.log('5. Testing Loop Composition');
try {
  const loop = new Loop({
    measureLength: 4,
    layers: 2
  });

  const basePattern = [
    { pitch: 60, duration: 1, time: 0 },
    { pitch: 64, duration: 1, time: 1 }
  ];

  const accumulated = loop.accumulate(basePattern, 3);
  console.log('  ✓ Accumulated loop, iterations:', 3);
  console.log('  ✓ Result length:', accumulated.length);

  const varied = loop.variate(basePattern, { intensity: 0.3 });
  console.log('  ✓ Created variation, length:', varied.length);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 6: Minimalism - Additive Process
console.log('6. Testing Minimalism - Additive Process');
try {
  const minimalism = new MinimalismProcess({
    operation: 'additive',
    direction: 'forward',
    repetition: 1
  });

  const baseSequence = [
    { pitch: 60, duration: 0.5, time: 0 },
    { pitch: 62, duration: 0.5, time: 0.5 },
    { pitch: 64, duration: 0.5, time: 1 },
    { pitch: 65, duration: 0.5, time: 1.5 }
  ];

  const processed = minimalism.generate(baseSequence);
  console.log('  ✓ Processed additive-forward, length:', processed.length);
  console.log('  ✓ Result is longer than input:', processed.length > baseSequence.length);
  console.log('  ✓ Sample pitches:', processed.slice(0, 5).map(n => n.pitch));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 7: Minimalism - Subtractive Process
console.log('7. Testing Minimalism - Subtractive Process');
try {
  const minimalism = new MinimalismProcess({
    operation: 'subtractive',
    direction: 'inward',
    repetition: 0
  });

  const baseSequence = [
    { pitch: 60, duration: 0.5, time: 0 },
    { pitch: 62, duration: 0.5, time: 0.5 },
    { pitch: 64, duration: 0.5, time: 1 },
    { pitch: 65, duration: 0.5, time: 1.5 },
    { pitch: 67, duration: 0.5, time: 2 },
    { pitch: 69, duration: 0.5, time: 2.5 }
  ];

  const processed = minimalism.generate(baseSequence);
  console.log('  ✓ Processed subtractive-inward, length:', processed.length);
  console.log('  ✓ Sample pitches:', processed.slice(0, 5).map(n => n.pitch));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 8: Tintinnabuli
console.log('8. Testing Tintinnabuli');
try {
  // T-chord: C major triad
  const tChord = [60, 64, 67]; // C, E, G

  const tintinnabuli = new Tintinnabuli(tChord, 'down', 0);

  // M-voice (melody)
  const mVoice = [
    { pitch: 62, duration: 1, time: 0 }, // D
    { pitch: 65, duration: 1, time: 1 }, // F
    { pitch: 69, duration: 1, time: 2 }, // A
    { pitch: 64, duration: 1, time: 3 }  // E
  ];

  const tVoice = tintinnabuli.generate(mVoice);
  console.log('  ✓ Generated T-voice, length:', tVoice.length);
  console.log('  ✓ T-voice pitches:', tVoice.map(n => n.pitch));
  console.log('  ✓ All pitches in T-chord:', tVoice.every(n => tChord.includes(n.pitch)));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 9: Random Walk
console.log('9. Testing Random Walk');
try {
  const walk = new RandomWalk({
    length: 20,
    dimensions: 1,
    stepSize: 2,
    bounds: [0, 100]
  });

  const walkData = walk.generate([50]); // Start at 50
  console.log('  ✓ Generated walk, steps:', walkData.length);

  const pitches = walk.mapToScale(0, [0, 2, 4, 5, 7, 9, 11], 2);
  console.log('  ✓ Mapped to scale, count:', pitches.length);
  console.log('  ✓ Sample pitches:', pitches.slice(0, 5));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 10: Chain (Markov-like)
console.log('10. Testing Chain');
try {
  const chain = new Chain({
    walkRange: [40, 80],
    walkStart: 60,
    walkProbability: [-2, -1, 0, 1, 2],
    branchingProbability: 0.1,
    mergingProbability: 0.05
  });

  const sequences = chain.generate(15);
  console.log('  ✓ Generated chain sequences:', sequences.length);
  console.log('  ✓ Each sequence length:', sequences[0]?.length);
  console.log('  ✓ Sample values:', sequences[0]?.slice(0, 5));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 11: Phasor System
console.log('11. Testing Phasor System');
try {
  const phasor = new Phasor({
    frequency: 1,
    amplitude: 10,
    phase: 0,
    center: 60
  });

  const sequence = phasor.generate(20);
  console.log('  ✓ Generated phasor sequence, length:', sequence.length);
  console.log('  ✓ Oscillating values:', sequence.slice(0, 5).map(v => Math.round(v)));

  const pitches = phasor.toPitches({ quantize: true });
  console.log('  ✓ Quantized to pitches:', pitches.slice(0, 5));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

console.log('=== Generative Algorithms Tests Complete ===\n');
