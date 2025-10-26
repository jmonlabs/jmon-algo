/**
 * JMON-ALGO TUTORIAL 07: GENETIC ALGORITHMS
 * JavaScript translation of Djalgo's genetic algorithms tutorial
 *
 * This tutorial covers:
 * - Genetic algorithm basics (Darwin class)
 * - Population initialization
 * - Fitness functions for music
 * - Selection, crossover, and mutation
 * - Evolving melodies and rhythms
 */

import jm from '../../src/index.js';

const { Darwin } = jm.generative.genetic;
const { MusicalAnalysis } = jm.analysis;

console.log('=== JMON-ALGO TUTORIAL 07: GENETIC ALGORITHMS ===\n');

// =====================================================
// 1. Genetic Algorithm Basics
// =====================================================
console.log('1. Genetic Algorithm Basics\n');

/*
Genetic algorithms evolve solutions through:
1. Population - A set of candidate solutions
2. Fitness - Evaluating quality of each candidate
3. Selection - Choosing the best candidates
4. Crossover - Combining candidates to create offspring
5. Mutation - Random variations for diversity
6. Evolution - Repeat for multiple generations
*/

console.log('Genetic algorithm workflow:');
console.log('  1. Initialize random population');
console.log('  2. Evaluate fitness of each individual');
console.log('  3. Select parents based on fitness');
console.log('  4. Create offspring through crossover');
console.log('  5. Apply mutations for diversity');
console.log('  6. Replace old population');
console.log('  7. Repeat for N generations');
console.log('');

// =====================================================
// 2. Simple Fitness Function
// =====================================================
console.log('2. Simple Fitness Function\n');

/*
Fitness functions evaluate how "good" a melody is.
Example criteria:
- Melodic contour (smoothness)
- Pitch variety
- Rhythmic patterns
- Harmonic consonance
*/

// Simple fitness: prefer melodies with good contour and variety
function simpleFitness(melody) {
  const pitches = melody.map(n => n.pitch);

  // Calculate pitch variety (higher is better)
  const uniquePitches = new Set(pitches).size;
  const varietyScore = uniquePitches / pitches.length;

  // Calculate smoothness (prefer smaller intervals)
  let totalInterval = 0;
  for (let i = 1; i < pitches.length; i++) {
    totalInterval += Math.abs(pitches[i] - pitches[i-1]);
  }
  const avgInterval = totalInterval / (pitches.length - 1);
  const smoothnessScore = 1 / (1 + avgInterval / 3);  // Normalize

  // Combined fitness
  return (varietyScore * 0.5 + smoothnessScore * 0.5);
}

console.log('Simple fitness function:');
console.log('  Variety score: # unique pitches / total pitches');
console.log('  Smoothness score: 1 / (1 + average interval)');
console.log('  Combined: 50% variety + 50% smoothness');
console.log('');

// =====================================================
// 3. Initialize Population
// =====================================================
console.log('3. Initialize Population\n');

// Create initial population of random melodies
function createRandomMelody(length, pitchRange = [60, 72]) {
  const melody = [];
  let time = 0;

  for (let i = 0; i < length; i++) {
    const pitch = Math.floor(
      pitchRange[0] + Math.random() * (pitchRange[1] - pitchRange[0])
    );
    const duration = [0.5, 1, 1.5, 2][Math.floor(Math.random() * 4)];

    melody.push({ pitch, duration, time, velocity: 0.8 });
    time += duration;
  }

  return melody;
}

// Initialize population
const populationSize = 20;
const melodyLength = 16;
let population = Array.from({ length: populationSize }, () =>
  createRandomMelody(melodyLength)
);

console.log('Initial population:');
console.log('  Size:', populationSize, 'individuals');
console.log('  Melody length:', melodyLength, 'notes');
console.log('  Example melody:', population[0].slice(0, 4).map(n => n.pitch));
console.log('');

// =====================================================
// 4. Evolve with Darwin
// =====================================================
console.log('4. Evolve with Darwin\n');

/*
The Darwin class handles the evolutionary process
*/

const darwin = new Darwin({
  populationSize: 20,
  geneLength: 16,
  mutationRate: 0.1,
  crossoverRate: 0.7,
  eliteCount: 2,  // Keep top 2 individuals
  tournamentSize: 3
});

// Initialize with pitch range
darwin.initialize({ min: 60, max: 72 });

// Define fitness function for Darwin
function darwinFitness(individual) {
  // Convert individual (array of numbers) to melody
  const melody = individual.map((pitch, i) => ({
    pitch: Math.round(pitch),
    duration: 1,
    time: i,
    velocity: 0.8
  }));

  return simpleFitness(melody);
}

console.log('Darwin configuration:');
console.log('  Population size:', 20);
console.log('  Gene length:', 16, 'notes');
console.log('  Mutation rate:', 0.1, '(10%)');
console.log('  Crossover rate:', 0.7, '(70%)');
console.log('  Elite count:', 2, '(keep best 2)');
console.log('');

// =====================================================
// 5. Run Evolution
// =====================================================
console.log('5. Run Evolution\n');

// Evolve for multiple generations
const generations = 10;
const fitnessHistory = [];

for (let gen = 0; gen < generations; gen++) {
  // Evaluate fitness
  const fitness = darwin.population.map(ind => darwinFitness(ind));

  // Track best fitness
  const bestFitness = Math.max(...fitness);
  const avgFitness = fitness.reduce((a, b) => a + b, 0) / fitness.length;
  fitnessHistory.push({ best: bestFitness, avg: avgFitness });

  // Evolve to next generation
  darwin.evolve(darwinFitness);

  if ((gen + 1) % 2 === 0) {
    console.log(`  Gen ${gen + 1}: best=${bestFitness.toFixed(3)}, avg=${avgFitness.toFixed(3)}`);
  }
}

console.log('');
console.log('Evolution complete:');
console.log('  Initial best fitness:', fitnessHistory[0].best.toFixed(3));
console.log('  Final best fitness:', fitnessHistory[generations-1].best.toFixed(3));
console.log('  Improvement:',
  ((fitnessHistory[generations-1].best - fitnessHistory[0].best) * 100).toFixed(1) + '%'
);
console.log('');

// =====================================================
// 6. Advanced Fitness Function
// =====================================================
console.log('6. Advanced Fitness Function\n');

/*
Use jmon-algo's analysis tools for sophisticated
fitness evaluation.
*/

function advancedFitness(melody) {
  const pitches = melody.map(n => n.pitch);
  const durations = melody.map(n => n.duration);

  // Use MusicalAnalysis metrics
  const contourEntropy = MusicalAnalysis.contourEntropy(pitches);
  const balance = MusicalAnalysis.balance(durations);
  const intervalVariance = MusicalAnalysis.intervalVariance(pitches);

  // Prefer:
  // - Moderate contour entropy (0.5-0.8)
  // - Good balance (close to 1.0)
  // - Moderate interval variance (not too static, not too jumpy)

  const contourScore = 1 - Math.abs(contourEntropy - 0.65) / 0.65;
  const balanceScore = balance;
  const varianceScore = 1 / (1 + intervalVariance / 10);

  return (contourScore * 0.4 + balanceScore * 0.3 + varianceScore * 0.3);
}

console.log('Advanced fitness using MusicalAnalysis:');
console.log('  Contour entropy: prefer 0.5-0.8 range');
console.log('  Balance: prefer values close to 1.0');
console.log('  Interval variance: prefer moderate values');
console.log('  Weights: 40% contour + 30% balance + 30% variance');
console.log('');

// =====================================================
// 7. Multi-Objective Fitness
// =====================================================
console.log('7. Multi-Objective Fitness\n');

/*
Optimize for multiple objectives simultaneously
*/

function multiObjectiveFitness(melody) {
  const pitches = melody.map(n => n.pitch);

  // Objective 1: Melodic interest (variety)
  const uniquePitches = new Set(pitches).size;
  const variety = uniquePitches / pitches.length;

  // Objective 2: Smoothness (small intervals)
  let totalInterval = 0;
  for (let i = 1; i < pitches.length; i++) {
    totalInterval += Math.abs(pitches[i] - pitches[i-1]);
  }
  const smoothness = 1 / (1 + totalInterval / pitches.length);

  // Objective 3: Range (use full pitch space)
  const range = Math.max(...pitches) - Math.min(...pitches);
  const rangeScore = range / 12;  // Normalize to octave

  // Objective 4: Contour shape (prefer arc shapes)
  const midpoint = Math.floor(pitches.length / 2);
  const firstHalfAvg = pitches.slice(0, midpoint).reduce((a,b) => a+b, 0) / midpoint;
  const secondHalfAvg = pitches.slice(midpoint).reduce((a,b) => a+b, 0) / (pitches.length - midpoint);
  const arcScore = 1 - Math.abs(firstHalfAvg - secondHalfAvg) / 12;

  // Weighted combination
  return (
    variety * 0.3 +
    smoothness * 0.3 +
    rangeScore * 0.2 +
    arcScore * 0.2
  );
}

console.log('Multi-objective fitness:');
console.log('  1. Variety (30%): pitch diversity');
console.log('  2. Smoothness (30%): small intervals');
console.log('  3. Range (20%): use pitch space');
console.log('  4. Arc shape (20%): balanced contour');
console.log('');

// =====================================================
// 8. Constrained Evolution (Scale)
// =====================================================
console.log('8. Constrained Evolution (Scale)\n');

/*
Evolve melodies constrained to a specific scale
*/

const cMajorScale = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81];

function createScalarMelody(length) {
  const melody = [];
  let time = 0;

  for (let i = 0; i < length; i++) {
    const pitch = cMajorScale[Math.floor(Math.random() * cMajorScale.length)];
    const duration = [0.5, 1, 1.5][Math.floor(Math.random() * 3)];

    melody.push({ pitch, duration, time, velocity: 0.8 });
    time += duration;
  }

  return melody;
}

// Mutation that respects scale
function scalarMutation(individual, rate = 0.1) {
  return individual.map(pitch => {
    if (Math.random() < rate) {
      // Mutate to nearby scale degree
      const currentIndex = cMajorScale.indexOf(Math.round(pitch));
      if (currentIndex !== -1) {
        const shift = Math.random() < 0.5 ? -1 : 1;
        const newIndex = Math.max(0, Math.min(cMajorScale.length - 1, currentIndex + shift));
        return cMajorScale[newIndex];
      }
    }
    return pitch;
  });
}

console.log('Scale-constrained evolution:');
console.log('  Scale:', cMajorScale);
console.log('  Mutations respect scale degrees');
console.log('  All melodies remain in C major');
console.log('');

// =====================================================
// 9. Rhythmic Evolution
// =====================================================
console.log('9. Rhythmic Evolution\n');

/*
Evolve rhythmic patterns using durations as genes
*/

const rhythmicFitness = (pattern) => {
  // Prefer:
  // - Syncopation (off-beat accents)
  // - Variety (different durations)
  // - Balance (not too dense or sparse)

  const durations = pattern;
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  // Variety score
  const uniqueDurations = new Set(durations).size;
  const variety = uniqueDurations / durations.length;

  // Balance score
  const avgDuration = totalDuration / durations.length;
  const idealAvg = 1.0;  // Quarter note average
  const balance = 1 - Math.abs(avgDuration - idealAvg) / idealAvg;

  // Syncopation score (complexity)
  const syncopation = MusicalAnalysis.syncopation(
    durations.map((d, i) => i * d)  // Convert to onsets
  );

  return variety * 0.4 + balance * 0.3 + syncopation * 0.3;
};

const rhythmDarwin = new Darwin({
  populationSize: 20,
  geneLength: 16,
  mutationRate: 0.15,
  crossoverRate: 0.7
});

// Initialize with duration values [0.25, 0.5, 1, 1.5, 2]
rhythmDarwin.initialize({ min: 0.25, max: 2 });

console.log('Rhythmic evolution:');
console.log('  Gene = duration (0.25 to 2.0)');
console.log('  Fitness: variety + balance + syncopation');
console.log('  Evolving rhythmic patterns...');

// Evolve rhythm for a few generations
for (let i = 0; i < 5; i++) {
  rhythmDarwin.evolve(rhythmicFitness);
}

const bestRhythm = rhythmDarwin.getBest(rhythmicFitness);
console.log('  Best rhythm:', bestRhythm.slice(0, 8).map(d => d.toFixed(2)));
console.log('');

// =====================================================
// 10. Complete Example: Evolve a Melody
// =====================================================
console.log('10. Complete Example: Evolve a Melody\n');

// Create comprehensive fitness function
function comprehensiveFitness(melody) {
  const pitches = melody.map(n => n.pitch);
  const durations = melody.map(n => n.duration);

  // Multiple criteria
  const contourEntropy = MusicalAnalysis.contourEntropy(pitches);
  const intervalVar = MusicalAnalysis.intervalVariance(pitches);
  const balance = MusicalAnalysis.balance(durations);

  // Prefer moderate values
  const contourScore = 1 - Math.abs(contourEntropy - 0.65);
  const intervalScore = 1 / (1 + intervalVar / 10);
  const balanceScore = balance;

  return (contourScore * 0.4 + intervalScore * 0.3 + balanceScore * 0.3);
}

// Create and evolve
const melodicDarwin = new Darwin({
  populationSize: 30,
  geneLength: 20,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  eliteCount: 3
});

melodicDarwin.initialize({ min: 60, max: 76 });

console.log('Evolving melodic material:');
console.log('  Population: 30');
console.log('  Length: 20 notes');
console.log('  Generations: 20');

const evolutionHistory = [];
for (let gen = 0; gen < 20; gen++) {
  // Convert individuals to melodies and evaluate
  const melodyFitness = individual => {
    const melody = individual.map((pitch, i) => ({
      pitch: Math.round(pitch),
      duration: 1,
      time: i,
      velocity: 0.8
    }));
    return comprehensiveFitness(melody);
  };

  melodicDarwin.evolve(melodyFitness);

  const best = melodicDarwin.getBest(melodyFitness);
  const bestMelody = best.map((pitch, i) => ({
    pitch: Math.round(pitch),
    duration: 1,
    time: i,
    velocity: 0.8
  }));

  evolutionHistory.push({
    generation: gen,
    fitness: melodyFitness(best),
    melody: bestMelody
  });
}

console.log('');
const final = evolutionHistory[evolutionHistory.length - 1];
console.log('Evolution complete:');
console.log('  Initial fitness:', evolutionHistory[0].fitness.toFixed(3));
console.log('  Final fitness:', final.fitness.toFixed(3));
console.log('  Best melody:', final.melody.slice(0, 10).map(n => n.pitch));
console.log('');

// Create composition with evolved melody
const evolvedComposition = {
  format: 'jmon',
  version: '1.0',
  tempo: 120,
  tracks: [{
    label: 'Evolved Melody',
    notes: final.melody
  }]
};

console.log('  ✓ Created evolved composition');
console.log('');

// =====================================================
// 11. Summary
// =====================================================
console.log('11. Summary\n');

console.log('Key concepts covered:');
console.log('  ✓ Genetic algorithm principles');
console.log('  ✓ Population initialization');
console.log('  ✓ Simple fitness functions');
console.log('  ✓ Advanced fitness with MusicalAnalysis');
console.log('  ✓ Multi-objective optimization');
console.log('  ✓ Scale-constrained evolution');
console.log('  ✓ Rhythmic pattern evolution');
console.log('  ✓ Complete melody evolution');
console.log('');

console.log('Genetic algorithms excel at:');
console.log('  - Exploring large solution spaces');
console.log('  - Optimizing complex criteria');
console.log('  - Discovering unexpected patterns');
console.log('  - Creating variations on themes');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');

// Export for use in other examples
export { darwin, evolvedComposition, comprehensiveFitness };
