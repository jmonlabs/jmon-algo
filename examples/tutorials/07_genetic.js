/**
 * JMON-ALGO TUTORIAL 07: GENETIC ALGORITHMS
 * JavaScript translation of Djalgo's genetic algorithms tutorial
 *
 * This tutorial covers:
 * - Darwin class for musical evolution
 * - Fitness functions for musical quality
 * - Population evolution through generations
 * - Musical phrase optimization
 */

import jm from '../../src/index.js';

const Darwin = jm.generative.genetic.Darwin;

console.log('=== JMON-ALGO TUTORIAL 07: GENETIC ALGORITHMS ===\n');

// =====================================================
// 1. Genetic Algorithm Basics
// =====================================================
console.log('1. Genetic Algorithm Basics\n');

/*
Genetic algorithms evolve solutions through:
1. Initialize population of random phrases
2. Evaluate fitness of each phrase
3. Select best phrases as parents
4. Create offspring through crossover
5. Apply mutations for diversity
6. Replace old population
7. Repeat for N generations
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
// 2. Creating Initial Phrases
// =====================================================
console.log('2. Creating Initial Phrases\n');

/*
Darwin expects initial phrases in [pitch, duration, offset] format
*/

// Create a simple melodic seed phrase
const seedPhrase1 = [
  [60, 1, 0],    // C4, quarter note, at beat 0
  [62, 1, 1],    // D4, quarter note, at beat 1
  [64, 1, 2],    // E4, quarter note, at beat 2
  [65, 1, 3]     // F4, quarter note, at beat 3
];

// Create a more rhythmic seed phrase
const seedPhrase2 = [
  [60, 0.5, 0],
  [60, 0.5, 0.5],
  [64, 1, 1],
  [62, 0.5, 2],
  [65, 0.5, 2.5],
  [67, 1, 3]
];

console.log('Seed phrase 1 (melodic):');
console.log('  Notes:', seedPhrase1.length);
console.log('  Pitches:', seedPhrase1.map(n => n[0]));
console.log('');

console.log('Seed phrase 2 (rhythmic):');
console.log('  Notes:', seedPhrase2.length);
console.log('  Pitches:', seedPhrase2.map(n => n[0]));
console.log('  Durations:', seedPhrase2.map(n => n[1]));
console.log('');

// =====================================================
// 3. Initialize Darwin with Seed Phrases
// =====================================================
console.log('3. Initialize Darwin\n');

/*
Darwin constructor takes:
- initialPhrases: Array of seed phrases to evolve from
- populationSize: Number of individuals in each generation
- mutationRate: Probability of mutation (0.0 - 1.0)
- scale: Optional scale to constrain pitches
- weights: Fitness weights for different metrics
- targets: Target values for fitness metrics
*/

const darwin = new Darwin({
  initialPhrases: [seedPhrase1, seedPhrase2],
  populationSize: 20,
  mutationRate: 0.1,
  scale: [0, 2, 4, 5, 7, 9, 11],  // C major scale intervals
  measureLength: 4,

  // Fitness weights (higher = more important)
  weights: {
    gini: [1.0, 1.0, 0.0],        // Pitch/duration variety
    balance: [1.0, 1.0, 0.0],     // Pitch/duration balance
    motif: [5.0, 1.0, 0.0],       // Melodic motifs
    dissonance: [2.0, 0.0, 0.0],  // Scale conformance
    rhythmic: [0.0, 3.0, 0.0],    // Rhythmic fit
    rest: [1.0, 0.0, 0.0]         // Rest management
  },

  // Target values (goals for evolution)
  targets: {
    gini: [0.3, 0.5, 0.0],        // Moderate variety
    balance: [0.2, 0.2, 0.0],     // Balanced distribution
    motif: [1.0, 1.0, 0.0],       // Some repetition
    dissonance: [0.0, 0.0, 0.0],  // Stay in scale
    rhythmic: [0.0, 1.0, 0.0],    // Good rhythmic fit
    rest: [0.0, 0.0, 0.0]         // Rest target
  }
});

console.log('Darwin initialized:');
console.log('  Population size:', 20);
console.log('  Initial phrases:', 2);
console.log('  Mutation rate:', 0.1);
console.log('  Scale:', 'C major');
console.log('');

// =====================================================
// 4. Evolve for Multiple Generations
// =====================================================
console.log('4. Evolution Process\n');

/*
evolveGenerations(generations, k) runs the evolutionary process:
- generations: Number of generations to evolve
- k: Number of top individuals to select as parents (default 25)
*/

const generations = 10;
const evolutionStats = darwin.evolveGenerations(generations, 25);

console.log(`Evolved for ${generations} generations:`);
console.log('  Generation 1:');
console.log('    Best fitness:', evolutionStats[0].bestFitness.toFixed(3));
console.log('    Avg fitness:', evolutionStats[0].averageFitness.toFixed(3));
console.log('');
console.log(`  Generation ${generations}:`);
console.log('    Best fitness:', evolutionStats[generations-1].bestFitness.toFixed(3));
console.log('    Avg fitness:', evolutionStats[generations-1].averageFitness.toFixed(3));
console.log('');

// Show fitness improvement
const initialFitness = evolutionStats[0].bestFitness;
const finalFitness = evolutionStats[generations-1].bestFitness;
const improvement = ((finalFitness - initialFitness) / initialFitness * 100);

console.log('Evolution results:');
console.log('  Initial best fitness:', initialFitness.toFixed(3));
console.log('  Final best fitness:', finalFitness.toFixed(3));
console.log('  Improvement:', improvement.toFixed(1) + '%');
console.log('');

// =====================================================
// 5. Get Best Individual
// =====================================================
console.log('5. Best Evolved Phrase\n');

const bestPhrase = darwin.getBestIndividual();

console.log('Best evolved phrase:');
console.log('  Notes:', bestPhrase.length);
console.log('  Pitches:', bestPhrase.map(n => n[0]));
console.log('  Durations:', bestPhrase.map(n => n[1]));
console.log('');

// Convert to JMON format
const jmonNotes = bestPhrase.map(note => ({
  pitch: note[0],
  duration: note[1],
  time: note[2],
  velocity: 0.8
}));

console.log('JMON format (first 4 notes):');
console.log(jmonNotes.slice(0, 4));
console.log('');

// =====================================================
// 6. Evolution History
// =====================================================
console.log('6. Evolution History\n');

const history = darwin.getEvolutionHistory();

console.log('Evolution history:');
console.log('  Generations:', history.generations);
console.log('  Best scores:', history.scores.slice(0, 5).map(s => s.toFixed(2)), '...');
console.log('');

// Show how fitness improved over time
console.log('Fitness progression:');
for (let i = 0; i < Math.min(5, evolutionStats.length); i++) {
  console.log(`  Gen ${i+1}: ${evolutionStats[i].bestFitness.toFixed(3)}`);
}
if (evolutionStats.length > 5) {
  console.log('  ...');
  console.log(`  Gen ${evolutionStats.length}: ${evolutionStats[evolutionStats.length-1].bestFitness.toFixed(3)}`);
}
console.log('');

// =====================================================
// 7. Multiple Evolution Runs
// =====================================================
console.log('7. Multiple Evolution Runs\n');

/*
You can run evolution multiple times with different parameters
*/

// Create new Darwin with different parameters
const darwin2 = new Darwin({
  initialPhrases: [seedPhrase1],
  populationSize: 15,
  mutationRate: 0.2,  // Higher mutation for more exploration
  scale: [0, 2, 3, 5, 7, 8, 10],  // C minor scale
  measureLength: 4
});

const stats2 = darwin2.evolveGenerations(5, 20);
const best2 = darwin2.getBestIndividual();

console.log('Second evolution (higher mutation, minor scale):');
console.log('  Mutation rate:', 0.2);
console.log('  Scale: C minor');
console.log('  Generations:', 5);
console.log('  Final fitness:', stats2[stats2.length-1].bestFitness.toFixed(3));
console.log('  Best phrase pitches:', best2.map(n => n[0]));
console.log('');

// =====================================================
// 8. Practical Tips
// =====================================================
console.log('8. Practical Tips\n');

console.log('Genetic algorithm tips:');
console.log('  • Start with good seed phrases');
console.log('  • Use scale constraints for tonal music');
console.log('  • Balance weights to control evolution direction');
console.log('  • Higher mutation = more exploration');
console.log('  • More generations = better convergence');
console.log('  • Population size affects diversity vs. speed');
console.log('  • Adjust targets to guide evolution');
console.log('');

console.log('=== TUTORIAL 07 COMPLETE ===\n');
console.log('Key Concepts Covered:');
console.log('• Darwin class for musical evolution');
console.log('• Fitness functions and weights');
console.log('• Seed phrases and initial population');
console.log('• Multi-generation evolution');
console.log('• Evolution history and best individuals');
console.log('• Scale constraints for tonal music');
console.log('• Converting results to JMON format');
