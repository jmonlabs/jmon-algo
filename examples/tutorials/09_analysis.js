/**
 * JMON-ALGO TUTORIAL 09: MUSICAL ANALYSIS
 *
 * This tutorial covers:
 * - 11+ musical analysis metrics
 * - Evaluating melodic and rhythmic patterns
 * - Comparing different compositions
 * - Using analysis for composition feedback
 * - Integration with generative algorithms
 */

import jm from '../../src/index.js';

const { MusicalAnalysis } = jm.analysis;

console.log('=== JMON-ALGO TUTORIAL 09: MUSICAL ANALYSIS ===\n');

// =====================================================
// 1. Analysis Basics
// =====================================================
console.log('1. Analysis Basics\n');

/*
jmon-algo provides 11+ metrics for analyzing music:
1. Gini coefficient - inequality/variety
2. Balance - distribution balance
3. Fibonacci index - golden ratio proportions
4. Syncopation - rhythmic complexity
5. Contour entropy - melodic predictability
6. Interval variance - pitch variation
7. Note density - temporal density
8. Gap variance - rest distribution
9. Motif detection - recurring patterns
10. Dissonance - harmonic tension
11. Rhythmic fit - groove/regularity
12. Autocorrelation - self-similarity
*/

console.log('Available analysis metrics:');
console.log('  ✓ Gini coefficient (variety/inequality)');
console.log('  ✓ Balance (distribution)');
console.log('  ✓ Fibonacci index (golden ratio)');
console.log('  ✓ Syncopation (rhythmic complexity)');
console.log('  ✓ Contour entropy (melodic predictability)');
console.log('  ✓ Interval variance (pitch variation)');
console.log('  ✓ Note density (temporal density)');
console.log('  ✓ Gap variance (rest distribution)');
console.log('  ✓ Motif detection (recurring patterns)');
console.log('  ✓ Dissonance (harmonic tension)');
console.log('  ✓ Rhythmic fit (groove/regularity)');
console.log('  ✓ Autocorrelation (self-similarity)');
console.log('');

// =====================================================
// 2. Gini Coefficient
// =====================================================
console.log('2. Gini Coefficient\n');

/*
Gini coefficient measures inequality in a distribution.
- 0.0: Perfect equality (all values the same)
- 1.0: Perfect inequality (all concentration in one value)

In music:
- Low Gini: repetitive, uniform
- High Gini: varied, unequal distribution
*/

const uniformValues = [1, 1, 1, 1, 1];
const variedValues = [1, 2, 4, 8, 16];
const moderateValues = [1, 2, 2, 3, 4];

console.log('Gini coefficient examples:');
console.log('  Uniform:', uniformValues, '→', MusicalAnalysis.gini(uniformValues).toFixed(3));
console.log('  Varied:', variedValues, '→', MusicalAnalysis.gini(variedValues).toFixed(3));
console.log('  Moderate:', moderateValues, '→', MusicalAnalysis.gini(moderateValues).toFixed(3));
console.log('');
console.log('Interpretation:');
console.log('  0.0-0.2: Very uniform (repetitive)');
console.log('  0.2-0.4: Moderate variety');
console.log('  0.4-0.6: High variety');
console.log('  0.6+: Extreme inequality');
console.log('');

// =====================================================
// 3. Balance Index
// =====================================================
console.log('3. Balance Index\n');

/*
Balance measures how evenly distributed values are.
- 1.0: Perfectly balanced
- < 1.0: Unbalanced

Great for rhythm analysis.
*/

const balanced = [1, 1, 1, 1];
const unbalanced = [1, 1, 1, 5];

console.log('Balance examples:');
console.log('  Balanced:', balanced, '→', MusicalAnalysis.balance(balanced).toFixed(3));
console.log('  Unbalanced:', unbalanced, '→', MusicalAnalysis.balance(unbalanced).toFixed(3));
console.log('');

// =====================================================
// 4. Fibonacci Index
// =====================================================
console.log('4. Fibonacci Index\n');

/*
Measures how close proportions are to the golden ratio (φ ≈ 1.618).
Sections with golden ratio proportions often sound pleasing.
*/

const goldenRatio = [8, 13];  // 13/8 ≈ 1.625 ≈ φ
const notGolden = [10, 10];   // 1.0

console.log('Fibonacci index examples:');
console.log('  Golden ratio [8, 13]:', MusicalAnalysis.fibonacci(goldenRatio).toFixed(3));
console.log('  Equal [10, 10]:', MusicalAnalysis.fibonacci(notGolden).toFixed(3));
console.log('');
console.log('Higher values indicate closer to golden ratio proportions');
console.log('');

// =====================================================
// 5. Syncopation
// =====================================================
console.log('5. Syncopation\n');

/*
Measures rhythmic complexity and off-beat accents.
Based on onset positions relative to metric grid.
*/

const onBeat = [0, 1, 2, 3, 4];  // All on the beat
const offBeat = [0.5, 1.5, 2.5, 3.5];  // All off-beat
const mixed = [0, 0.5, 1.5, 2, 3];  // Mixed

console.log('Syncopation examples:');
console.log('  On-beat:', onBeat, '→', MusicalAnalysis.syncopation(onBeat).toFixed(3));
console.log('  Off-beat:', offBeat, '→', MusicalAnalysis.syncopation(offBeat).toFixed(3));
console.log('  Mixed:', mixed, '→', MusicalAnalysis.syncopation(mixed).toFixed(3));
console.log('');
console.log('Higher values = more syncopation');
console.log('');

// =====================================================
// 6. Contour Entropy
// =====================================================
console.log('6. Contour Entropy\n');

/*
Measures melodic predictability based on direction changes.
- Low entropy: predictable, simple contours
- High entropy: unpredictable, complex contours
*/

const simpleMelody = [60, 62, 64, 65, 67];  // Ascending
const complexMelody = [60, 65, 62, 67, 64, 69, 63];  // Zigzag

console.log('Contour entropy examples:');
console.log('  Simple (ascending):', simpleMelody);
console.log('    Entropy:', MusicalAnalysis.contourEntropy(simpleMelody).toFixed(3));
console.log('  Complex (zigzag):', complexMelody);
console.log('    Entropy:', MusicalAnalysis.contourEntropy(complexMelody).toFixed(3));
console.log('');
console.log('Interpretation:');
console.log('  0.0-0.3: Very predictable');
console.log('  0.3-0.6: Moderate complexity');
console.log('  0.6+: High complexity');
console.log('');

// =====================================================
// 7. Interval Variance
// =====================================================
console.log('7. Interval Variance\n');

/*
Measures variability in melodic intervals.
- Low variance: stepwise motion
- High variance: large leaps
*/

const stepwise = [60, 62, 63, 65, 67];  // Small intervals
const leaping = [60, 72, 55, 79, 48];   // Large intervals

console.log('Interval variance examples:');
console.log('  Stepwise:', stepwise);
console.log('    Variance:', MusicalAnalysis.intervalVariance(stepwise).toFixed(2));
console.log('  Leaping:', leaping);
console.log('    Variance:', MusicalAnalysis.intervalVariance(leaping).toFixed(2));
console.log('');

// =====================================================
// 8. Note Density
// =====================================================
console.log('8. Note Density\n');

/*
Measures how many notes occur per unit time.
Useful for analyzing texture and activity level.
*/

const sparse = [
  { time: 0, duration: 2 },
  { time: 2, duration: 2 },
  { time: 4, duration: 2 }
];

const dense = [
  { time: 0, duration: 0.5 },
  { time: 0.5, duration: 0.5 },
  { time: 1, duration: 0.5 },
  { time: 1.5, duration: 0.5 },
  { time: 2, duration: 0.5 }
];

console.log('Note density examples:');
console.log('  Sparse (3 notes over 6 beats):',
  MusicalAnalysis.density(sparse).toFixed(2), 'notes/beat'
);
console.log('  Dense (5 notes over 2.5 beats):',
  MusicalAnalysis.density(dense).toFixed(2), 'notes/beat'
);
console.log('');

// =====================================================
// 9. Gap Variance
// =====================================================
console.log('9. Gap Variance\n');

/*
Measures variability in silent gaps (rests).
- Low variance: regular spacing
- High variance: irregular spacing
*/

const regularRests = [
  { time: 0 }, { time: 2 }, { time: 4 }, { time: 6 }
];

const irregularRests = [
  { time: 0 }, { time: 0.5 }, { time: 3 }, { time: 3.2 }, { time: 7 }
];

console.log('Gap variance examples:');
console.log('  Regular rests:', MusicalAnalysis.gapVariance(regularRests).toFixed(2));
console.log('  Irregular rests:', MusicalAnalysis.gapVariance(irregularRests).toFixed(2));
console.log('');

// =====================================================
// 10. Motif Detection
// =====================================================
console.log('10. Motif Detection\n');

/*
Detects recurring patterns (motifs) in a sequence.
*/

const sequence = [60, 62, 64, 60, 62, 64, 65, 67, 60, 62, 64];

const motifs = MusicalAnalysis.motifDetection(sequence, {
  minLength: 3,
  maxLength: 5,
  minOccurrences: 2
});

console.log('Motif detection:');
console.log('  Sequence:', sequence);
console.log('  Found motifs:', motifs.length);
motifs.forEach((motif, i) => {
  console.log(`    Motif ${i + 1}:`, motif.pattern, `(occurs ${motif.count} times)`);
});
console.log('');

// =====================================================
// 11. Dissonance
// =====================================================
console.log('11. Dissonance\n');

/*
Measures harmonic tension based on interval relationships.
*/

const consonant = [60, 64, 67];  // C major triad
const dissonant = [60, 61, 66];  // Minor 2nd + tritone

console.log('Dissonance examples:');
console.log('  Consonant (C major):', consonant);
console.log('    Dissonance:', MusicalAnalysis.dissonance(consonant).toFixed(3));
console.log('  Dissonant (clusters):', dissonant);
console.log('    Dissonance:', MusicalAnalysis.dissonance(dissonant).toFixed(3));
console.log('');

// =====================================================
// 12. Rhythmic Fit
// =====================================================
console.log('12. Rhythmic Fit\n');

/*
Measures how well onsets align with a rhythmic grid.
*/

const onGrid = [0, 1, 2, 3, 4];
const offGrid = [0.1, 1.2, 2.3, 3.1, 4.2];

console.log('Rhythmic fit examples:');
console.log('  On grid:', onGrid);
console.log('    Fit:', MusicalAnalysis.rhythmicFit(onGrid, 1).toFixed(3));
console.log('  Off grid:', offGrid);
console.log('    Fit:', MusicalAnalysis.rhythmicFit(offGrid, 1).toFixed(3));
console.log('');

// =====================================================
// 13. Autocorrelation
// =====================================================
console.log('13. Autocorrelation\n');

/*
Measures self-similarity at different time lags.
Useful for finding periodicities and patterns.
*/

const periodic = [1, 2, 3, 1, 2, 3, 1, 2, 3];
const random = [1, 5, 2, 8, 3, 1, 9, 2, 4];

console.log('Autocorrelation examples:');
console.log('  Periodic pattern:', periodic);
const autoCorrPeriodic = MusicalAnalysis.autocorrelation(periodic);
console.log('    Autocorrelation:', autoCorrPeriodic.slice(0, 5).map(a => a.toFixed(2)));

console.log('  Random pattern:', random);
const autoCorrRandom = MusicalAnalysis.autocorrelation(random);
console.log('    Autocorrelation:', autoCorrRandom.slice(0, 5).map(a => a.toFixed(2)));
console.log('');

// =====================================================
// 14. Comprehensive Analysis
// =====================================================
console.log('14. Comprehensive Analysis\n');

/*
Analyze a complete melody using all metrics.
*/

const testMelody = [
  { pitch: 60, duration: 1, time: 0 },
  { pitch: 62, duration: 0.5, time: 1 },
  { pitch: 64, duration: 0.5, time: 1.5 },
  { pitch: 65, duration: 1, time: 2 },
  { pitch: 64, duration: 1, time: 3 },
  { pitch: 67, duration: 2, time: 4 },
  { pitch: 65, duration: 1, time: 6 },
  { pitch: 64, duration: 1, time: 7 },
  { pitch: 62, duration: 1, time: 8 },
  { pitch: 60, duration: 2, time: 9 }
];

const pitches = testMelody.map(n => n.pitch);
const durations = testMelody.map(n => n.duration);
const onsets = testMelody.map(n => n.time);

console.log('Comprehensive analysis of test melody:');
console.log('  Pitches:', pitches);
console.log('');
console.log('Melodic metrics:');
console.log('  Contour entropy:', MusicalAnalysis.contourEntropy(pitches).toFixed(3));
console.log('  Interval variance:', MusicalAnalysis.intervalVariance(pitches).toFixed(2));
console.log('  Pitch range:', Math.max(...pitches) - Math.min(...pitches), 'semitones');
console.log('');
console.log('Rhythmic metrics:');
console.log('  Note density:', MusicalAnalysis.density(testMelody).toFixed(2), 'notes/beat');
console.log('  Balance:', MusicalAnalysis.balance(durations).toFixed(3));
console.log('  Syncopation:', MusicalAnalysis.syncopation(onsets).toFixed(3));
console.log('  Gini (durations):', MusicalAnalysis.gini(durations).toFixed(3));
console.log('');
console.log('Structural metrics:');
const motifResults = MusicalAnalysis.motifDetection(pitches, { minLength: 2, minOccurrences: 2 });
console.log('  Motifs found:', motifResults.length);
console.log('  Autocorrelation (lag 1):', MusicalAnalysis.autocorrelation(pitches)[1].toFixed(3));
console.log('');

// =====================================================
// 15. Comparative Analysis
// =====================================================
console.log('15. Comparative Analysis\n');

/*
Compare different versions of a melody.
*/

const version1 = [60, 62, 64, 65, 67, 69, 71, 72];  // Ascending scale
const version2 = [60, 64, 67, 72, 67, 64, 60, 60];  // Arpeggiated
const version3 = [60, 62, 60, 64, 62, 64, 65, 67];  // Ornamented

const versions = [version1, version2, version3];
const labels = ['Scale', 'Arpeggio', 'Ornamented'];

console.log('Comparing three melodic versions:\n');

versions.forEach((version, i) => {
  console.log(`${labels[i]}:`, version);
  console.log(`  Contour entropy: ${MusicalAnalysis.contourEntropy(version).toFixed(3)}`);
  console.log(`  Interval variance: ${MusicalAnalysis.intervalVariance(version).toFixed(2)}`);
  console.log(`  Gini coefficient: ${MusicalAnalysis.gini(version).toFixed(3)}`);
  console.log('');
});

console.log('Analysis summary:');
console.log('  Scale: Low entropy (predictable), low variance (stepwise)');
console.log('  Arpeggio: Medium entropy, high variance (leaps)');
console.log('  Ornamented: High entropy (complex), low variance (neighbor tones)');
console.log('');

// =====================================================
// 16. Using Analysis in Composition
// =====================================================
console.log('16. Using Analysis in Composition\n');

/*
Use analysis to guide compositional decisions.
*/

// Generate multiple variations and select the best
function generateVariation() {
  const length = 12;
  const variation = [];
  let pitch = 60;

  for (let i = 0; i < length; i++) {
    pitch += Math.floor(Math.random() * 5) - 2;  // Random walk
    pitch = Math.max(55, Math.min(75, pitch));   // Constrain range
    variation.push(pitch);
  }

  return variation;
}

// Generate 10 variations
const variations = Array.from({ length: 10 }, () => generateVariation());

// Score each variation
const scores = variations.map(v => {
  const entropy = MusicalAnalysis.contourEntropy(v);
  const variance = MusicalAnalysis.intervalVariance(v);

  // Prefer moderate values
  const entropyScore = 1 - Math.abs(entropy - 0.5);
  const varianceScore = 1 / (1 + variance / 10);

  return (entropyScore + varianceScore) / 2;
});

// Find best variation
const bestIndex = scores.indexOf(Math.max(...scores));
const bestVariation = variations[bestIndex];

console.log('Variation selection using analysis:');
console.log('  Generated:', variations.length, 'variations');
console.log('  Scored based on: contour entropy + interval variance');
console.log('  Best variation:', bestVariation);
console.log('  Score:', scores[bestIndex].toFixed(3));
console.log('  Entropy:', MusicalAnalysis.contourEntropy(bestVariation).toFixed(3));
console.log('  Variance:', MusicalAnalysis.intervalVariance(bestVariation).toFixed(2));
console.log('');

// =====================================================
// 17. Summary
// =====================================================
console.log('17. Summary\n');

console.log('Key concepts covered:');
console.log('  ✓ 12+ analysis metrics');
console.log('  ✓ Melodic analysis (contour, intervals, motifs)');
console.log('  ✓ Rhythmic analysis (syncopation, density, balance)');
console.log('  ✓ Harmonic analysis (dissonance)');
console.log('  ✓ Structural analysis (autocorrelation, motifs)');
console.log('  ✓ Comprehensive melody analysis');
console.log('  ✓ Comparative analysis');
console.log('  ✓ Analysis-guided composition');
console.log('');

console.log('Using analysis in your workflow:');
console.log('  1. Analyze existing pieces for insights');
console.log('  2. Compare variations to select best options');
console.log('  3. Use metrics as fitness functions in genetic algorithms');
console.log('  4. Guide real-time parameter adjustments');
console.log('  5. Validate that generated music meets criteria');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');

// Export for use in other examples
export { testMelody, bestVariation };
