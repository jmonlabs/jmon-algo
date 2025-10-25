/**
 * Comprehensive tests for musical analysis functions
 * Tests all 11 analysis metrics
 */

import { MusicalAnalysis } from '../src/algorithms/analysis/MusicalAnalysis.js';

console.log('=== Testing Musical Analysis Functions ===\n');

// Test data
const testPitches = [60, 62, 64, 65, 67, 69, 71, 72];
const testOnsets = [0, 1, 2, 3, 4, 5, 6, 7];
const testNotes = testPitches.map((pitch, i) => ({
  pitch,
  duration: 1,
  time: i
}));

// Test 1: Gini Coefficient
console.log('1. Testing Gini Coefficient');
try {
  const uniform = [1, 1, 1, 1, 1];
  const unequal = [1, 2, 3, 4, 10];

  const giniUniform = MusicalAnalysis.gini(uniform);
  const giniUnequal = MusicalAnalysis.gini(unequal);

  console.log('  ✓ Gini of uniform distribution:', giniUniform.toFixed(3), '(should be ~0)');
  console.log('  ✓ Gini of unequal distribution:', giniUnequal.toFixed(3), '(should be >0)');
  console.log('  ✓ Unequal > Uniform:', giniUnequal > giniUniform);

  // Test with weights
  const giniWeighted = MusicalAnalysis.gini([1, 2, 3], [1, 1, 1]);
  console.log('  ✓ Gini with weights:', giniWeighted.toFixed(3));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 2: Balance (Center of Mass)
console.log('2. Testing Balance');
try {
  const centered = [1, 2, 3, 2, 1];
  const leftHeavy = [5, 3, 1, 1, 1];

  const balanceCentered = MusicalAnalysis.balance(centered);
  const balanceLeft = MusicalAnalysis.balance(leftHeavy);

  console.log('  ✓ Balance of centered:', balanceCentered.toFixed(3));
  console.log('  ✓ Balance of left-heavy:', balanceLeft.toFixed(3));
  console.log('  ✓ Left-heavy < Centered:', balanceLeft < balanceCentered);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 3: Autocorrelation
console.log('3. Testing Autocorrelation');
try {
  const sequence = [1, 2, 3, 1, 2, 3, 1, 2, 3];
  const autocorr = MusicalAnalysis.autocorrelation(sequence, 5);

  console.log('  ✓ Autocorrelation computed, length:', autocorr.length);
  console.log('  ✓ First value (lag 0) is 1:', Math.abs(autocorr[0] - 1) < 0.01);
  console.log('  ✓ Sample values:', autocorr.slice(0, 4).map(v => v.toFixed(3)));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 4: Motif Detection
console.log('4. Testing Motif Detection');
try {
  const noRepeat = [1, 2, 3, 4, 5, 6, 7, 8];
  const withRepeat = [1, 2, 3, 1, 2, 3, 1, 2, 3];

  const motifNone = MusicalAnalysis.motif(noRepeat, 3);
  const motifYes = MusicalAnalysis.motif(withRepeat, 3);

  console.log('  ✓ Motif score (no repeat):', motifNone.toFixed(3));
  console.log('  ✓ Motif score (with repeat):', motifYes.toFixed(3));
  console.log('  ✓ Repeated > Non-repeated:', motifYes > motifNone);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 5: Dissonance
console.log('5. Testing Dissonance');
try {
  const cMajorScale = [0, 2, 4, 5, 7, 9, 11]; // C major scale (pitch classes)
  const inScale = [60, 62, 64, 65, 67, 69, 71]; // All in C major
  const outScale = [60, 61, 63, 66, 68, 70, 73]; // Many outside C major

  const dissonanceIn = MusicalAnalysis.dissonance(inScale, cMajorScale);
  const dissonanceOut = MusicalAnalysis.dissonance(outScale, cMajorScale);

  console.log('  ✓ Dissonance (in scale):', dissonanceIn.toFixed(3), '(should be ~0)');
  console.log('  ✓ Dissonance (out scale):', dissonanceOut.toFixed(3), '(should be >0)');
  console.log('  ✓ Out-of-scale > In-scale:', dissonanceOut > dissonanceIn);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 6: Rhythmic Fit
console.log('6. Testing Rhythmic Fit');
try {
  const onGrid = [0, 1, 2, 3, 4, 5]; // Perfectly on grid
  const offGrid = [0.1, 1.3, 2.7, 3.2, 4.8]; // Off grid

  const rhythmicOn = MusicalAnalysis.rhythmic(onGrid, 16);
  const rhythmicOff = MusicalAnalysis.rhythmic(offGrid, 16);

  console.log('  ✓ Rhythmic fit (on grid):', rhythmicOn.toFixed(3), '(should be ~1)');
  console.log('  ✓ Rhythmic fit (off grid):', rhythmicOff.toFixed(3), '(should be <1)');
  console.log('  ✓ On-grid > Off-grid:', rhythmicOn > rhythmicOff);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 7: Fibonacci Index
console.log('7. Testing Fibonacci Index');
try {
  const fibonacci = [1, 1, 2, 3, 5, 8, 13];
  const random = [1, 4, 2, 7, 3, 9];

  const fibIndexFib = MusicalAnalysis.fibonacciIndex(fibonacci);
  const fibIndexRand = MusicalAnalysis.fibonacciIndex(random);

  console.log('  ✓ Fibonacci index (Fibonacci):', fibIndexFib.toFixed(3));
  console.log('  ✓ Fibonacci index (Random):', fibIndexRand.toFixed(3));
  console.log('  ✓ Fibonacci > Random:', fibIndexFib > fibIndexRand);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 8: Syncopation
console.log('8. Testing Syncopation');
try {
  const onBeat = [0, 1, 2, 3, 4]; // All on strong beats
  const offBeat = [0.25, 0.75, 1.25, 1.75]; // All off beats

  const syncopOn = MusicalAnalysis.syncopation(onBeat, 4);
  const syncopOff = MusicalAnalysis.syncopation(offBeat, 4);

  console.log('  ✓ Syncopation (on beat):', syncopOn.toFixed(3), '(should be low)');
  console.log('  ✓ Syncopation (off beat):', syncopOff.toFixed(3), '(should be high)');
  console.log('  ✓ Off-beat > On-beat:', syncopOff > syncopOn);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 9: Contour Entropy
console.log('9. Testing Contour Entropy');
try {
  const monotonic = [1, 2, 3, 4, 5, 6, 7]; // All ascending
  const random = [1, 5, 2, 7, 3, 6, 4]; // Random directions

  const entropyMono = MusicalAnalysis.contourEntropy(monotonic);
  const entropyRand = MusicalAnalysis.contourEntropy(random);

  console.log('  ✓ Contour entropy (monotonic):', entropyMono.toFixed(3), '(should be low)');
  console.log('  ✓ Contour entropy (random):', entropyRand.toFixed(3), '(should be high)');
  console.log('  ✓ Random > Monotonic:', entropyRand > entropyMono);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 10: Interval Variance
console.log('10. Testing Interval Variance');
try {
  const uniform = [60, 62, 64, 66, 68, 70]; // All steps of 2
  const varied = [60, 65, 62, 72, 63, 69]; // Varied steps

  const varUniform = MusicalAnalysis.intervalVariance(uniform);
  const varVaried = MusicalAnalysis.intervalVariance(varied);

  console.log('  ✓ Interval variance (uniform):', varUniform.toFixed(3), '(should be ~0)');
  console.log('  ✓ Interval variance (varied):', varVaried.toFixed(3), '(should be >0)');
  console.log('  ✓ Varied > Uniform:', varVaried > varUniform);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 11: Note Density
console.log('11. Testing Note Density');
try {
  const sparse = [
    { pitch: 60, duration: 1, time: 0 },
    { pitch: 62, duration: 1, time: 4 },
    { pitch: 64, duration: 1, time: 8 }
  ];

  const dense = [
    { pitch: 60, duration: 0.5, time: 0 },
    { pitch: 62, duration: 0.5, time: 0.5 },
    { pitch: 64, duration: 0.5, time: 1 },
    { pitch: 65, duration: 0.5, time: 1.5 }
  ];

  const densitySparse = MusicalAnalysis.density(sparse, 1);
  const densityDense = MusicalAnalysis.density(dense, 1);

  console.log('  ✓ Density (sparse):', densitySparse.toFixed(3));
  console.log('  ✓ Density (dense):', densityDense.toFixed(3));
  console.log('  ✓ Dense > Sparse:', densityDense > densitySparse);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 12: Gap Variance
console.log('12. Testing Gap Variance');
try {
  const evenGaps = [0, 1, 2, 3, 4, 5]; // Gaps of 1
  const unevenGaps = [0, 0.5, 2, 2.2, 5]; // Varied gaps

  const gapVarEven = MusicalAnalysis.gapVariance(evenGaps);
  const gapVarUneven = MusicalAnalysis.gapVariance(unevenGaps);

  console.log('  ✓ Gap variance (even):', gapVarEven.toFixed(3), '(should be ~0)');
  console.log('  ✓ Gap variance (uneven):', gapVarUneven.toFixed(3), '(should be >0)');
  console.log('  ✓ Uneven > Even:', gapVarUneven > gapVarEven);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 13: Comprehensive Analysis
console.log('13. Testing Comprehensive Analysis');
try {
  const composition = [
    { pitch: 60, duration: 1, time: 0 },
    { pitch: 62, duration: 1, time: 1 },
    { pitch: 64, duration: 0.5, time: 2 },
    { pitch: 65, duration: 0.5, time: 2.5 },
    { pitch: 67, duration: 1, time: 3 }
  ];

  const analysis = MusicalAnalysis.analyze(composition, {
    scale: [0, 2, 4, 5, 7, 9, 11]
  });

  console.log('  ✓ Comprehensive analysis computed');
  console.log('  ✓ Has gini:', 'gini' in analysis);
  console.log('  ✓ Has balance:', 'balance' in analysis);
  console.log('  ✓ Has motif:', 'motif' in analysis);
  console.log('  ✓ Has dissonance:', 'dissonance' in analysis);
  console.log('  ✓ Has rhythmic:', 'rhythmic' in analysis);
  console.log('  ✓ Has fibonacciIndex:', 'fibonacciIndex' in analysis);
  console.log('  ✓ Has syncopation:', 'syncopation' in analysis);
  console.log('  ✓ Has contourEntropy:', 'contourEntropy' in analysis);
  console.log('  ✓ Has intervalVariance:', 'intervalVariance' in analysis);
  console.log('  ✓ Has density:', 'density' in analysis);
  console.log('  ✓ Has gapVariance:', 'gapVariance' in analysis);
  console.log('  ✓ All 11 metrics present:', Object.keys(analysis).length === 11);
  console.log('');
  console.log('  Analysis results:');
  Object.entries(analysis).forEach(([key, value]) => {
    console.log(`    ${key}: ${value.toFixed(3)}`);
  });
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

console.log('=== Musical Analysis Tests Complete ===\n');
