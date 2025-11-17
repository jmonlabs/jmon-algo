/**
 * JMON-ALGO TUTORIAL 01: GETTING STARTED
 * JavaScript translation of Djalgo's getting-started tutorial
 *
 * This tutorial introduces the basics of algo:
 * - JMON format (JavaScript Music Object Notation)
 * - Note structure: {pitch, duration, time, velocity}
 * - Tracks and compositions
 * - Basic playback and conversion
 */

import jm from '../../src/index.js';

console.log('=== JMON-ALGO TUTORIAL 01: GETTING STARTED ===\n');

// =====================================================
// 1. JMON Format Basics
// =====================================================
console.log('1. JMON Format Basics\n');

/*
In algo, music is represented in JMON format:
- A note is an object: {pitch, duration, time, velocity}
- A track is an array of notes
- A composition is an object with tracks array

Example note structure:
{
  pitch: 60,        // MIDI pitch (60 = C4)
  duration: 1,      // Duration in quarter notes
  time: 0,          // Start time in quarter notes
  velocity: 0.8     // Volume (0-1)
}

A rest is represented with pitch: null
*/

// Single note (C4, quarter note, starting at beat 0)
const note = { pitch: 60, duration: 1, time: 0, velocity: 0.8 };
console.log('Single note:', note);
console.log('');

// A track is an array of notes
const track = [
  { pitch: 60, duration: 1, time: 0, velocity: 0.8 },   // C
  { pitch: 62, duration: 1, time: 1, velocity: 0.8 },   // D
  { pitch: 64, duration: 1, time: 2, velocity: 0.8 },   // E
  { pitch: 65, duration: 1, time: 3, velocity: 0.8 }    // F
];
console.log('Track (4 notes):', track.length, 'notes');
console.log('');

// A composition has multiple tracks
const composition = {
  format: 'jmon',
  version: '1.0',
  tempo: 120,
  tracks: [
    {
      label: 'Melody',
      notes: [
        { pitch: 60, duration: 1, time: 0, velocity: 0.8 },
        { pitch: 62, duration: 1, time: 1, velocity: 0.8 },
        { pitch: 64, duration: 1, time: 2, velocity: 0.8 },
        { pitch: 65, duration: 1, time: 3, velocity: 0.8 }
      ]
    },
    {
      label: 'Bass',
      notes: [
        { pitch: 48, duration: 1, time: 0, velocity: 0.7 },
        { pitch: 50, duration: 1, time: 1, velocity: 0.7 },
        { pitch: 52, duration: 1, time: 2, velocity: 0.7 },
        { pitch: 53, duration: 1, time: 3, velocity: 0.7 }
      ]
    }
  ]
};
console.log('Composition:', composition.tracks.length, 'tracks');
console.log('');

// =====================================================
// 2. Creating Music with algo
// =====================================================
console.log('2. Creating Music with algo\n');

// Let's create "Twinkle Twinkle Little Star" in C major
const twinkle1 = [
  { pitch: 60, duration: 1, time: 0, velocity: 0.8 },   // C (twin)
  { pitch: 60, duration: 1, time: 1, velocity: 0.8 },   // C (kle)
  { pitch: 67, duration: 1, time: 2, velocity: 0.8 },   // G (twin)
  { pitch: 67, duration: 1, time: 3, velocity: 0.8 },   // G (kle)
  { pitch: 69, duration: 1, time: 4, velocity: 0.8 },   // A (lit)
  { pitch: 69, duration: 1, time: 5, velocity: 0.8 },   // A (tle)
  { pitch: 67, duration: 2, time: 6, velocity: 0.8 }    // G (star)
];

const twinkle2 = [
  { pitch: 65, duration: 1, time: 8, velocity: 0.8 },   // F (how)
  { pitch: 65, duration: 1, time: 9, velocity: 0.8 },   // F (I)
  { pitch: 64, duration: 1, time: 10, velocity: 0.8 },  // E (won)
  { pitch: 64, duration: 1, time: 11, velocity: 0.8 },  // E (der)
  { pitch: 62, duration: 1, time: 12, velocity: 0.8 },  // D (what)
  { pitch: 62, duration: 1, time: 13, velocity: 0.8 },  // D (you)
  { pitch: 60, duration: 2, time: 14, velocity: 0.8 }   // C (are)
];

// Merge tracks horizontally (in time)
const twinkle = [...twinkle1, ...twinkle2];
console.log('Twinkle Twinkle (full melody):', twinkle.length, 'notes');
console.log('');

// =====================================================
// 3. Format Conversion
// =====================================================
console.log('3. Format Conversion\n');

/*
algo can convert to various formats:
- MIDI files
- VexFlow (music notation)
- Tone.js (for playback)
- WAV audio
- SuperCollider code
*/

// Convert to MIDI
try {
  const midi = jm.converters.MIDI.fromJmon({
    format: 'jmon',
    version: '1.0',
    tempo: 120,
    tracks: [{
      label: 'Twinkle',
      notes: twinkle
    }]
  });
  console.log('✓ Converted to MIDI format');
} catch (error) {
  console.log('MIDI conversion requires browser environment');
}
console.log('');

// =====================================================
// 4. Key algo Features
// =====================================================
console.log('4. Key algo Features\n');

/*
algo offers a comprehensive toolkit:

- **Music Theory** (jm.theory.*)
  - Scales, chord progressions, voice leading
  - Ornaments and articulations
  - Rhythm generation

- **Generative Algorithms** (jm.generative.*)
  - Cellular Automata, Fractals
  - Random Walks, Markov Chains
  - Genetic Algorithms
  - Gaussian Processes
  - Minimalism techniques

- **Analysis** (jm.analysis.*)
  - 11+ musical metrics
  - Gini coefficient, syncopation, contour entropy, etc.

- **Conversion** (jm.converters.*)
  - MIDI, VexFlow, Tone.js, WAV, SuperCollider

- **Visualization**
  - Plotly-based visualizations
  - Score rendering
  - Algorithm visualizations
*/

console.log('algo modules loaded:');
console.log('  ✓ Theory:', Object.keys(jm.theory).join(', '));
console.log('  ✓ Generative:', Object.keys(jm.generative).join(', '));
console.log('  ✓ Analysis:', 'MusicalAnalysis');
console.log('  ✓ Converters:', Object.keys(jm.converters).join(', '));
console.log('');

// =====================================================
// 5. Next Steps
// =====================================================
console.log('5. Next Steps\n');

console.log('Continue with the following tutorials:');
console.log('  - 02_harmony.js - Scales, chords, voice, ornaments');
console.log('  - 03_loops.js - Polyloops and rhythmic patterns');
console.log('  - 04_minimalism.js - Additive/subtractive processes');
console.log('  - 05_walks.js - Random walks and chains');
console.log('  - 06_fractals.js - Cellular automata, Mandelbrot');
console.log('  - 07_genetic.js - Evolutionary music generation');
console.log('');

console.log('=== TUTORIAL COMPLETE ===');

// Export for use in other examples
export { note, track, twinkle, composition };
