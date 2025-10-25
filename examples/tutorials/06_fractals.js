/**
 * JMON-ALGO TUTORIAL 06: FRACTALS
 * JavaScript translation of Djalgo's fractals tutorial
 *
 * This tutorial covers:
 * - Cellular Automata (256 Wolfram rules)
 * - Mandelbrot fractals
 * - Logistic Map (chaos theory)
 */

import jm from '../../src/index.js';

console.log('=== JMON-ALGO TUTORIAL 06: FRACTALS ===\n');

// =====================================================
// 1. CELLULAR AUTOMATA
// =====================================================
console.log('1. Cellular Automata\n');

/*
Cellular Automata are self-organizing systems governed by simple rules.
The Wolfram Atlas contains 256 rules for 1D cellular automata.
Popular rules: 30, 110, 90, 150
*/

// 1.1 Rule 30 - Chaotic pattern
console.log('1.1 Rule 30 (Chaotic)');
const ca30 = new jm.generative.automata.Cellular({
  ruleNumber: 30,
  width: 20
});

const sequence30 = ca30.generate(10);
console.log('  Rule: 30');
console.log('  Width: 20 cells');
console.log('  Iterations: 10');
console.log('  Generated sequence length:', sequence30.length);
console.log('  First state:', sequence30[0].join(''));
console.log('');

// 1.2 Rule 110 - Complex patterns
console.log('1.2 Rule 110 (Complex)');
const ca110 = new jm.generative.automata.Cellular({
  ruleNumber: 110,
  width: 20
});

const sequence110 = ca110.generate(10);
console.log('  Rule: 110 (Turing complete!)');
console.log('  Generated sequence length:', sequence110.length);
console.log('');

// 1.3 Rule 90 - Sierpinski triangle pattern
console.log('1.3 Rule 90 (Sierpinski Triangle)');
const ca90 = new jm.generative.automata.Cellular({
  ruleNumber: 90,
  width: 20
});

const sequence90 = ca90.generate(10);
console.log('  Rule: 90 (fractal pattern)');
console.log('  Generated sequence length:', sequence90.length);
console.log('');

// 1.4 Converting CA to musical pitches
console.log('1.4 Converting to Music');
/*
To convert CA states to music:
1. Extract a strip from the 2D grid
2. Map cell values to pitches
3. Create notes with durations and timing
*/

// Use Rule 30 for this example
const caMusic = new jm.generative.automata.Cellular({
  ruleNumber: 30,
  width: 50
});

const caSequence = caMusic.generate(30);

// Extract a vertical strip (column 25) to get a melody
const strip = caSequence.map(row => row[25]);
console.log('  Extracted strip:', strip.length, 'values');

// Map to C minor pentatonic scale
const scale = [60, 63, 65, 67, 70];  // C, Eb, F, G, Bb
const melody = strip.slice(0, 16).map((value, i) => ({
  pitch: scale[value % scale.length],
  duration: 0.5,
  time: i * 0.5,
  velocity: 0.8
}));

console.log('  Generated melody:', melody.length, 'notes');
console.log('  Pitches:', melody.map(n => n.pitch));
console.log('');

// =====================================================
// 2. MANDELBROT FRACTALS
// =====================================================
console.log('2. Mandelbrot Fractals\n');

/*
The Mandelbrot set is a famous fractal with infinite complexity.
We can extract musical sequences from its iteration counts.
*/

// 2.1 Generate Mandelbrot set
console.log('2.1 Generating Mandelbrot Set');
const mandelbrot = new jm.generative.fractals.Mandelbrot({
  width: 40,
  height: 40,
  maxIterations: 50,
  xMin: -2,
  xMax: 1,
  yMin: -1.5,
  yMax: 1.5
});

const fractalData = mandelbrot.generate();
console.log('  Grid size: 40x40');
console.log('  Max iterations: 50');
console.log('  Generated data rows:', fractalData.length);
console.log('');

// 2.2 Extract sequences
console.log('2.2 Extracting Musical Sequences');

// Spiral extraction (most common)
const spiralSequence = mandelbrot.extractSequence('spiral');
console.log('  Spiral extraction:', spiralSequence.length, 'values');
console.log('  Sample values:', spiralSequence.slice(0, 10));
console.log('');

// Row extraction
const rowSequence = mandelbrot.extractSequence('row', 20);
console.log('  Row extraction:', rowSequence.length, 'values');
console.log('');

// Column extraction
const colSequence = mandelbrot.extractSequence('column', 20);
console.log('  Column extraction:', colSequence.length, 'values');
console.log('');

// Diagonal extraction
const diagSequence = mandelbrot.extractSequence('diagonal');
console.log('  Diagonal extraction:', diagSequence.length, 'values');
console.log('');

// 2.3 Map to pitches
console.log('2.3 Mapping to Pitches');

// Normalize to MIDI range
const minValue = Math.min(...spiralSequence);
const maxValue = Math.max(...spiralSequence);
const pitchMin = 48;  // C3
const pitchMax = 84;  // C6

const mandelbrotMelody = spiralSequence.slice(0, 32).map((value, i) => {
  // Normalize value to 0-1, then map to MIDI range
  const normalized = (value - minValue) / (maxValue - minValue);
  const pitch = Math.round(pitchMin + normalized * (pitchMax - pitchMin));

  return {
    pitch,
    duration: 0.25,
    time: i * 0.25,
    velocity: 0.7
  };
});

console.log('  Generated melody:', mandelbrotMelody.length, 'notes');
console.log('  Pitch range:',
  Math.min(...mandelbrotMelody.map(n => n.pitch)),
  '-',
  Math.max(...mandelbrotMelody.map(n => n.pitch))
);
console.log('');

// =====================================================
// 3. LOGISTIC MAP
// =====================================================
console.log('3. Logistic Map (Chaos Theory)\n');

/*
The Logistic Map is a simple mathematical model that exhibits
chaotic behavior. Formula: x(n+1) = r * x(n) * (1 - x(n))

Famous values of r:
- r < 3: Stable
- r = 3.57: Onset of chaos
- r = 3.8 to 4: Chaotic
*/

// 3.1 Stable regime (r = 2.8)
console.log('3.1 Stable Regime (r = 2.8)');
const logisticStable = new jm.generative.fractals.LogisticMap({
  r: 2.8,
  x0: 0.5,
  iterations: 20
});

const stableSequence = logisticStable.generate();
console.log('  r = 2.8 (stable)');
console.log('  Values converge to fixed point');
console.log('  Last 5 values:', stableSequence.slice(-5).map(v => v.toFixed(4)));
console.log('');

// 3.2 Chaotic regime (r = 3.8)
console.log('3.2 Chaotic Regime (r = 3.8)');
const logisticChaotic = new jm.generative.fractals.LogisticMap({
  r: 3.8,
  x0: 0.5,
  iterations: 50
});

const chaoticSequence = logisticChaotic.generate();
console.log('  r = 3.8 (chaotic)');
console.log('  Values never settle');
console.log('  Sample values:', chaoticSequence.slice(0, 10).map(v => v.toFixed(4)));
console.log('  All values in [0,1]:', chaoticSequence.every(v => v >= 0 && v <= 1));
console.log('');

// 3.3 Convert to music
console.log('3.3 Converting Chaos to Music');

// Map chaotic values to MIDI pitches
const chaosMelody = chaoticSequence.map((value, i) => ({
  pitch: Math.round(60 + value * 24),  // C4 to C6
  duration: 0.5,
  time: i * 0.5,
  velocity: 0.5 + value * 0.5  // Dynamic velocity based on chaos
}));

console.log('  Generated chaotic melody:', chaosMelody.length, 'notes');
console.log('  Pitch range: C4 to C6');
console.log('  Velocities vary with chaos');
console.log('  Sample pitches:', chaosMelody.slice(0, 8).map(n => n.pitch));
console.log('');

// =====================================================
// 4. COMBINING FRACTALS
// =====================================================
console.log('4. Combining Fractal Techniques\n');

/*
We can layer different fractal-generated melodies to create
complex, evolving textures.
*/

// CA for rhythm (Rule 110)
const caRhythm = new jm.generative.automata.Cellular({
  ruleNumber: 110,
  width: 30
});
const rhythmStrip = caRhythm.generate(20).map(row => row[15]);

// Mandelbrot for pitch
const mbPitch = new jm.generative.fractals.Mandelbrot({
  width: 20,
  height: 20,
  maxIterations: 30
});
const pitchSequence = mbPitch.extractSequence('spiral');

// Logistic Map for velocity
const lmVelocity = new jm.generative.fractals.LogisticMap({
  r: 3.9,
  x0: 0.3,
  iterations: 20
});
const velocitySequence = lmVelocity.generate();

// Combine all three
const hybridTrack = rhythmStrip.slice(0, 20).map((rhythm, i) => {
  const shouldPlay = rhythm === 1;  // Only play when CA cell is 1
  if (!shouldPlay) return null;

  const pitchValue = pitchSequence[i % pitchSequence.length];
  const velocityValue = velocitySequence[i];

  return {
    pitch: 48 + (pitchValue % 24),
    duration: 0.5,
    time: i * 0.5,
    velocity: 0.3 + velocityValue * 0.7
  };
}).filter(note => note !== null);  // Remove rests

console.log('Hybrid fractal composition:');
console.log('  CA (Rule 110) → Rhythm');
console.log('  Mandelbrot → Pitch');
console.log('  Logistic Map → Velocity');
console.log('  Result:', hybridTrack.length, 'notes');
console.log('');

// =====================================================
// 5. COMPLETE FRACTAL COMPOSITION
// =====================================================
console.log('5. Complete Fractal Composition\n');

// Guitar-like part (CA Rule 150)
const guitarCA = new jm.generative.automata.Cellular({
  ruleNumber: 150,
  width: 100
});
const guitarStrip = guitarCA.generate(64).map(row => row[50]);
const guitarTrack = guitarStrip.map((value, i) => ({
  pitch: [60, 64, 67, 71, 74][value % 5],  // C major pentatonic
  duration: 0.25,
  time: i * 0.25,
  velocity: 0.6
}));

// Bass part (Mandelbrot)
const bassData = new jm.generative.fractals.Mandelbrot({
  width: 16,
  height: 16,
  maxIterations: 20
});
const bassSequence = bassData.extractSequence('row', 8);
const bassTrack = bassSequence.map((value, i) => ({
  pitch: 36 + (value % 12),  // Bass range
  duration: 1,
  time: i,
  velocity: 0.7
}));

// Create composition
const fractalComposition = {
  format: 'jmon',
  version: '1.0',
  tempo: 140,
  tracks: [
    {
      label: 'Guitar (CA-150)',
      notes: guitarTrack
    },
    {
      label: 'Bass (Mandelbrot)',
      notes: bassTrack.slice(0, 16)  // Keep it shorter
    },
    {
      label: 'Chaos Melody (Logistic)',
      notes: chaosMelody.slice(0, 32)
    }
  ]
};

console.log('Fractal composition:');
console.log('  Tempo:', fractalComposition.tempo, 'BPM');
console.log('  Track 1 (Guitar):', guitarTrack.length, 'notes (CA-150)');
console.log('  Track 2 (Bass):', fractalComposition.tracks[1].notes.length, 'notes (Mandelbrot)');
console.log('  Track 3 (Melody):', fractalComposition.tracks[2].notes.length, 'notes (Chaos)');
console.log('');

// =====================================================
// 6. TIPS FOR FRACTAL MUSIC
// =====================================================
console.log('6. Tips for Fractal Music\n');

console.log('Cellular Automata:');
console.log('  • Rule 30: Chaotic, unpredictable');
console.log('  • Rule 90: Sierpinski triangle (rhythmic)');
console.log('  • Rule 110: Complex, Turing-complete');
console.log('  • Rule 150: Balanced complexity');
console.log('');

console.log('Mandelbrot Sets:');
console.log('  • Spiral extraction: Gradual evolution');
console.log('  • Row/column: Linear progression');
console.log('  • Diagonal: Interesting contours');
console.log('  • Use low maxIterations (20-50) for variety');
console.log('');

console.log('Logistic Map:');
console.log('  • r < 3: Too predictable');
console.log('  • r = 3.57-4.0: Best for chaos');
console.log('  • Try different x0 values for variety');
console.log('  • Great for velocity/dynamics');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');
console.log('Next: 07_genetic.js - Evolutionary music generation');

// Export for use in other examples
export { fractalComposition, melody, mandelbrotMelody, chaosMelody };
