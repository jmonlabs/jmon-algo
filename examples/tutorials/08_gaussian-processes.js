/**
 * JMON-ALGO TUTORIAL 08: GAUSSIAN PROCESSES
 *
 * This tutorial covers:
 * - Gaussian Process Regression basics
 * - Different kernel functions (RBF, Periodic, Rational Quadratic)
 * - Interpolating melodies
 * - Generating smooth variations
 * - Uncertainty quantification in music
 */

import jm from '../../src/index.js';

const { GaussianProcessRegressor } = jm.generative.gaussian.Regressor;

console.log('=== JMON-ALGO TUTORIAL 08: GAUSSIAN PROCESSES ===\n');

// =====================================================
// 1. Gaussian Process Basics
// =====================================================
console.log('1. Gaussian Process Basics\n');

/*
Gaussian Processes (GPs) are powerful tools for:
- Interpolating between known points
- Generating smooth, continuous curves
- Quantifying uncertainty
- Creating controlled randomness

In music, GPs can:
- Interpolate sparse melodies
- Generate smooth pitch/rhythm variations
- Create expressive performance curves
- Model musical gestures
*/

console.log('Gaussian Process capabilities:');
console.log('  ✓ Smooth interpolation between known notes');
console.log('  ✓ Generate variations with controlled randomness');
console.log('  ✓ Uncertainty quantification (confidence bounds)');
console.log('  ✓ Different kernels for different musical effects');
console.log('');

// =====================================================
// 2. Simple Interpolation with RBF Kernel
// =====================================================
console.log('2. Simple Interpolation with RBF Kernel\n');

/*
RBF (Radial Basis Function) kernel creates smooth,
bell-shaped curves. Great for general-purpose
interpolation.
*/

// Create GP with RBF kernel
const gp = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 1.0,  // Controls smoothness
  variance: 1.0      // Controls amplitude
});

// Training data: sparse melody (time, pitch)
const X_train = [[0], [2], [4], [6], [8]];
const y_train = [60, 65, 62, 67, 64];  // C, F, D, G, E

// Fit the GP
gp.fit(X_train, y_train);
console.log('Fitted GP to sparse melody:');
console.log('  Known points:', X_train.flat());
console.log('  Known pitches:', y_train);

// Interpolate at many points
const X_test = Array.from({ length: 40 }, (_, i) => [i * 0.2]);
const predictions = gp.predict(X_test);

console.log('  ✓ Interpolated to', X_test.length, 'points');
console.log('  Sample interpolated pitches:', predictions.slice(0, 10).map(p => p.toFixed(1)));
console.log('  Creates smooth curve through known points');
console.log('');

// =====================================================
// 3. Uncertainty Quantification
// =====================================================
console.log('3. Uncertainty Quantification\n');

/*
GPs provide uncertainty estimates - useful for
knowing where the model is confident vs uncertain.
*/

const { mean, std } = gp.predictWithUncertainty(X_test);

console.log('Uncertainty estimates:');
console.log('  Mean predictions:', mean.slice(0, 5).map(m => m.toFixed(1)));
console.log('  Standard deviations:', std.slice(0, 5).map(s => s.toFixed(2)));
console.log('');
console.log('Interpretation:');
console.log('  - Low std: high confidence (near training points)');
console.log('  - High std: low confidence (far from training points)');
console.log('  - Can use std for expressive dynamics or articulation');
console.log('');

// =====================================================
// 4. Periodic Kernel for Cyclic Patterns
// =====================================================
console.log('4. Periodic Kernel for Cyclic Patterns\n');

/*
Periodic kernel is perfect for repeating patterns,
oscillations, and cyclic structures.
*/

const gpPeriodic = new GaussianProcessRegressor({
  kernel: 'periodic',
  lengthScale: 1.0,
  periodLength: 4.0,  // Period of oscillation
  variance: 1.0
});

// Training data: one cycle of a pattern
const X_period = [[0], [1], [2], [3], [4]];
const y_period = [60, 64, 67, 64, 60];  // C-E-G-E-C

gpPeriodic.fit(X_period, y_period);

// Predict over multiple cycles
const X_cycles = Array.from({ length: 40 }, (_, i) => [i * 0.2]);
const periodicPreds = gpPeriodic.predict(X_cycles);

console.log('Periodic GP:');
console.log('  Period length:', 4.0, 'beats');
console.log('  Training cycle:', y_period);
console.log('  Predictions repeat the pattern');
console.log('  Sample:', periodicPreds.slice(0, 12).map(p => p.toFixed(0)));
console.log('  Perfect for ostinatos and cyclic motifs');
console.log('');

// =====================================================
// 5. Rational Quadratic Kernel (Multi-Scale)
// =====================================================
console.log('5. Rational Quadratic Kernel (Multi-Scale)\n');

/*
Rational Quadratic kernel can model multiple scales
simultaneously - both smooth trends and local variations.
*/

const gpRQ = new GaussianProcessRegressor({
  kernel: 'rational_quadratic',
  lengthScale: 1.0,
  alpha: 1.0,  // Scale mixture parameter
  variance: 1.0
});

// More complex training data
const X_complex = [[0], [1], [2], [3], [4], [5], [6]];
const y_complex = [60, 62, 65, 63, 67, 64, 69];

gpRQ.fit(X_complex, y_complex);

const X_rq_test = Array.from({ length: 30 }, (_, i) => [i * 0.2]);
const rqPreds = gpRQ.predict(X_rq_test);

console.log('Rational Quadratic GP:');
console.log('  Captures both smooth trends and local details');
console.log('  Alpha parameter controls scale mixture');
console.log('  Sample predictions:', rqPreds.slice(0, 10).map(p => p.toFixed(1)));
console.log('');

// =====================================================
// 6. Generating Random Samples
// =====================================================
console.log('6. Generating Random Samples\n');

/*
GPs can generate random samples that respect the
learned structure - great for variations.
*/

// Generate multiple samples
const samples = gp.sample(X_test, 3);  // 3 samples

console.log('Generated samples:');
console.log('  Number of samples:', samples.length);
console.log('  Points per sample:', samples[0].length);
console.log('');
console.log('Sample 1:', samples[0].slice(0, 10).map(s => s.toFixed(1)));
console.log('Sample 2:', samples[1].slice(0, 10).map(s => s.toFixed(1)));
console.log('Sample 3:', samples[2].slice(0, 10).map(s => s.toFixed(1)));
console.log('');
console.log('All samples respect the training data constraints');
console.log('but vary randomly in between - perfect for variations!');
console.log('');

// =====================================================
// 7. Melody Smoothing
// =====================================================
console.log('7. Melody Smoothing\n');

/*
Use GP to smooth rough melodic contours
*/

// Rough melody with jumps
const roughMelody = [60, 58, 65, 59, 70, 62, 68, 64];
const X_rough = roughMelody.map((_, i) => [i]);

const smoothGP = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 2.0,  // Larger = smoother
  variance: 5.0
});

smoothGP.fit(X_rough, roughMelody);

// Get smooth version
const X_smooth = Array.from({ length: 40 }, (_, i) => [i * 0.2]);
const smoothedMelody = smoothGP.predict(X_smooth);

console.log('Melody smoothing:');
console.log('  Rough melody:', roughMelody);
console.log('  Smoothed (first 10):', smoothedMelody.slice(0, 10).map(p => p.toFixed(1)));
console.log('  Length scale controls smoothness');
console.log('  Larger values = smoother curves');
console.log('');

// =====================================================
// 8. Dynamic Curves (Velocity, Expression)
// =====================================================
console.log('8. Dynamic Curves (Velocity, Expression)\n');

/*
Model expressive parameters like dynamics,
vibrato depth, or tempo fluctuations
*/

// Define dynamic curve: soft -> loud -> soft
const X_dynamics = [[0], [2], [4], [6], [8]];
const y_dynamics = [0.3, 0.5, 0.9, 0.6, 0.3];  // Velocity values

const dynGP = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 1.5,
  variance: 0.1
});

dynGP.fit(X_dynamics, y_dynamics);

// Generate smooth dynamic curve
const X_dyn_curve = Array.from({ length: 40 }, (_, i) => [i * 0.2]);
const velocityCurve = dynGP.predict(X_dyn_curve);

console.log('Dynamic curve generation:');
console.log('  Key dynamics:', y_dynamics);
console.log('  Smooth curve (first 10):', velocityCurve.slice(0, 10).map(v => v.toFixed(2)));
console.log('  Apply to note velocities for expressive phrasing');
console.log('');

// =====================================================
// 9. Harmonizing with GP
// =====================================================
console.log('9. Harmonizing with GP\n');

/*
Use GP to generate smooth harmonies that follow
a melody's contour
*/

// Main melody
const melody = [60, 62, 64, 65, 67, 69, 71, 72];
const X_melody = melody.map((_, i) => [i]);

// Train GP on melody
const melodyGP = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 1.5,
  variance: 2.0
});

melodyGP.fit(X_melody, melody);

// Generate harmony at -5 semitones (4th below)
const X_harmony = Array.from({ length: 32 }, (_, i) => [i * 0.25]);
const harmonyPitches = melodyGP.predict(X_harmony).map(p => p - 5);

console.log('GP-based harmonization:');
console.log('  Melody:', melody);
console.log('  Harmony (transposed -5):', harmonyPitches.slice(0, 10).map(p => p.toFixed(0)));
console.log('  Smooth parallel motion');
console.log('');

// =====================================================
// 10. Practical Example: Expressive Phrase
// =====================================================
console.log('10. Practical Example: Expressive Phrase\n');

/*
Create a complete musical phrase with GP-generated
pitch, dynamics, and timing variations.
*/

// Sparse melody with key points
const keyPitches = [[0], [3], [6], [9], [12]];
const pitchValues = [60, 65, 62, 69, 64];

// Dynamics curve
const keyDynamics = [[0], [6], [12]];
const dynamicValues = [0.4, 0.9, 0.3];

// Timing variations (rubato)
const keyTimings = [[0], [4], [8], [12]];
const timingValues = [0, 4.1, 7.8, 12];  // Slight stretching

// Create GPs for each parameter
const pitchGP = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 2.0,
  variance: 5.0
});

const dynamicsGP = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 3.0,
  variance: 0.1
});

const timingGP = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 2.0,
  variance: 0.5
});

// Fit all GPs
pitchGP.fit(keyPitches, pitchValues);
dynamicsGP.fit(keyDynamics, dynamicValues);
timingGP.fit(keyTimings, timingValues);

// Generate dense phrase
const numNotes = 24;
const X_phrase = Array.from({ length: numNotes }, (_, i) => [i * 0.5]);

const phrasePitches = pitchGP.predict(X_phrase);
const phraseDynamics = dynamicsGP.predict(X_phrase);
const phraseTimings = timingGP.predict(X_phrase);

// Create JMON notes
const expressivePhrase = phrasePitches.map((pitch, i) => ({
  pitch: Math.round(pitch),
  duration: 0.5,
  time: phraseTimings[i],
  velocity: Math.max(0.2, Math.min(1.0, phraseDynamics[i]))
}));

console.log('Expressive phrase with GP:');
console.log('  Notes:', expressivePhrase.length);
console.log('  Pitch (smooth interpolation): ✓');
console.log('  Dynamics (crescendo/diminuendo): ✓');
console.log('  Timing (subtle rubato): ✓');
console.log('');
console.log('First 5 notes:');
expressivePhrase.slice(0, 5).forEach((note, i) => {
  console.log(`  Note ${i + 1}: pitch=${note.pitch}, vel=${note.velocity.toFixed(2)}, time=${note.time.toFixed(2)}`);
});
console.log('');

// Create composition
const composition = {
  format: 'jmon',
  version: '1.0',
  tempo: 100,
  tracks: [{
    label: 'Expressive GP Phrase',
    notes: expressivePhrase
  }]
};

console.log('  ✓ Created expressive composition with GP');
console.log('');

// =====================================================
// 11. Summary
// =====================================================
console.log('11. Summary\n');

console.log('Key concepts covered:');
console.log('  ✓ GP basics and interpolation');
console.log('  ✓ RBF kernel (general smoothing)');
console.log('  ✓ Periodic kernel (cyclic patterns)');
console.log('  ✓ Rational Quadratic kernel (multi-scale)');
console.log('  ✓ Uncertainty quantification');
console.log('  ✓ Generating random samples');
console.log('  ✓ Melody smoothing');
console.log('  ✓ Dynamic curves');
console.log('  ✓ Harmonization');
console.log('  ✓ Expressive phrase generation');
console.log('');

console.log('Gaussian Processes excel at:');
console.log('  - Smooth interpolation between sparse data');
console.log('  - Controlled random variation');
console.log('  - Modeling expressive parameters');
console.log('  - Creating coherent variations');
console.log('  - Uncertainty-aware generation');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');

// Export for use in other examples
export { gp, composition };
