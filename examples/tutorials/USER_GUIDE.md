# JMON-ALGO User Guide
**Complete JavaScript Translation of Djalgo Python Library**

This user guide provides a complete introduction to algo, the JavaScript counterpart to Djalgo. All examples from the Djalgo Python documentation have been translated to JavaScript with the JMON (JSON Music Object Notation) format.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Harmony](#2-harmony)
3. [Loops](#3-loops)
4. [Minimalism](#4-minimalism)
5. [Walks](#5-walks)
6. [Fractals](#6-fractals)
7. [Genetic Algorithms](#7-genetic-algorithms)
8. [Gaussian Processes](#8-gaussian-processes)
9. [Analysis](#9-analysis)

---

## Tutorial Overview

| Tutorial | File | Topics Covered | Djalgo Equivalent |
|----------|------|----------------|-------------------|
| 01 | `01_getting-started.js` | JMON format, basic concepts | Getting Started |
| 02 | `02_harmony.js` | Scales, chords, ornaments, progressions | Harmony |
| 03 | `03_loops.js` | Loops, polyloops, isorhythm, phase shifting | Loops |
| 04 | `04_minimalism.js` | Additive/subtractive processes, tintinnabuli | Minimalism |
| 05 | `05_walks.js` | Random walks, Markov chains, phasors | Walks |
| 06 | `06_fractals.js` | Cellular automata, Mandelbrot, logistic map | Fractals |
| 07 | `07_genetic.js` | Genetic algorithms, evolution, fitness functions | Genetic Algorithms |
| 08 | `08_gaussian-processes.js` | GP regression, kernels, interpolation | Gaussian Processes |
| 09 | `09_analysis.js` | 12+ analysis metrics, evaluation | Analysis |

---

## 1. Getting Started

**File:** `01_getting-started.js`

### What You'll Learn
- JMON format basics (algo's music representation)
- Note structure: `{pitch, duration, time, velocity}`
- Creating tracks and compositions
- Format conversion (MIDI, VexFlow, Tone.js, WAV)

### Key Concepts

```javascript
// Single note
const note = {
  pitch: 60,        // MIDI pitch (60 = C4)
  duration: 1,      // Duration in quarter notes
  time: 0,          // Start time in quarter notes
  velocity: 0.8     // Volume (0-1)
};

// Track (array of notes)
const track = [
  { pitch: 60, duration: 1, time: 0, velocity: 0.8 },
  { pitch: 62, duration: 1, time: 1, velocity: 0.8 },
  { pitch: 64, duration: 1, time: 2, velocity: 0.8 }
];

// Composition (multiple tracks)
const composition = {
  format: 'jmon',
  version: '1.0',
  tempo: 120,
  tracks: [
    { label: 'Melody', notes: [...] },
    { label: 'Bass', notes: [...] }
  ]
};
```

### Djalgo Comparison
- **Djalgo:** Uses Python tuples `(pitch, duration, offset)`
- **algo:** Uses JavaScript objects with named properties
- **Advantage:** More readable, extensible, JSON-compatible

---

## 2. Harmony

**File:** `02_harmony.js`

### What You'll Learn
- 14+ musical scales and modes
- Chord progressions (roman numerals supported)
- Voice leading and harmonization
- Ornaments (trills, grace notes, mordents, turns)
- Rhythm generation

### Key Features

```javascript
// Scales
const scale = new Scale('C', 'major');
const notes = scale.generate({ octave: 4 });

// Progressions
const progression = new Progression('C', 'major');
const chords = progression.generate(['I', 'IV', 'V', 'I']);

// Voice leading
const voice = new Voice({ key: 'C', mode: 'major', voices: 4 });
const led = voice.lead(chord1, chord2);

// Ornaments
const ornamented = Ornament.apply(note, 'trill', {
  interval: 2,
  rate: 4
});
```

### Available Scales
- Major, Minor, Harmonic Minor, Melodic Minor
- Dorian, Phrygian, Lydian, Mixolydian, Locrian, Aeolian
- Major/Minor Pentatonic, Chromatic
- All modes fully supported

---

## 3. Loops

**File:** `03_loops.js`

### What You'll Learn
- Creating repeating musical patterns
- Polyloops (multiple independent cycles)
- Isorhythm (color + talea)
- Beatcycles and phase shifting
- Steve Reich-style minimalism

### Key Concepts

```javascript
// Simple loop
const loop = new Loop({
  pitches: [60, 62, 64, 65],
  durations: [0.5, 0.5, 0.5, 0.5],
  iterations: 4,
  transpose: 2  // Transpose each iteration
});

// Isorhythm
const color = [60, 62, 64, 65, 67];  // Pitch pattern
const talea = [1, 0.5, 0.5];         // Rhythm pattern
const pattern = isorhythm(color, talea);

// Phase shifting
const loop1 = new Loop({ pitches, durations, offset: 0 });
const loop2 = new Loop({ pitches, durations, offset: 0.05 });
```

### Applications
- Minimalist composition
- Polyrhythmic textures
- Prime number cycles (3, 5, 7) for maximum complexity
- Gradual process music

---

## 4. Minimalism

**File:** `04_minimalism.js`

### What You'll Learn
- Additive processes (forward, backward, inward, outward)
- Subtractive processes
- Tintinnabuli technique (Arvo Pärt)
- Isorhythm
- Process-based composition

### Key Techniques

```javascript
// Additive process
const process = new MinimalismProcess({
  operation: 'additive',
  direction: 'forward',
  repetition: 1
});
const music = process.generate(motif);

// Tintinnabuli
const tintinnabuli = new Tintinnabuli(
  [60, 64, 67],  // T-voice (triad)
  'down',         // Direction
  1              // Position
);
const harmonized = tintinnabuli.generate(melody);
```

### Composers & Styles
- Steve Reich (phasing, additive processes)
- Philip Glass (repetitive structures)
- Arvo Pärt (tintinnabuli)
- Terry Riley (looping, tape delays)

---

## 5. Walks

**File:** `05_walks.js`

### What You'll Learn
- Random walks (Brownian motion)
- Biased and constrained walks
- Markov chains (1st and 2nd order)
- Phasor systems (rotating vectors)
- Probability-based composition

### Algorithms

```javascript
// Random walk
const walk = new RandomWalk({
  start: 60,
  stepSize: 2,
  bias: 0.6,        // 60% chance up
  bounds: [55, 72],
  constrainToSet: scale  // Optional scale constraint
});

// Markov chain
const chain = new Chain({
  states: [60, 62, 64, 65, 67],
  transitions: transitionMatrix,
  order: 1  // or 2 for second-order
});

// Phasor
const phasor = new Phasor(10, 1.0, 0);  // distance, frequency, phase
const data = phasor.simulate(timeArray);
```

### Applications
- Melodic generation with natural contours
- Probabilistic composition
- Learning from existing music
- Smooth cyclic variations

---

## 6. Fractals

**File:** `06_fractals.js`

### What You'll Learn
- Cellular Automata (all 256 Wolfram rules)
- Mandelbrot fractals
- Logistic map (chaos theory)
- Mapping algorithmic patterns to music

### Generators

```javascript
// Cellular Automata
const ca = new CellularAutomata({
  rule: 30,      // Wolfram rule
  width: 50,
  iterations: 100
});
const pattern = ca.generate();

// Mandelbrot
const mandelbrot = new Mandelbrot({
  width: 100,
  height: 100,
  maxIterations: 100
});
const data = mandelbrot.generate();

// Logistic Map
const logistic = new LogisticMap({
  r: 3.9,        // Chaotic regime
  iterations: 100
});
const chaos = logistic.generate();
```

### Musical Mapping
- CA evolution → pitch sequences
- Mandelbrot values → rhythmic patterns
- Chaos → controlled randomness
- Bifurcation diagrams → gestural shapes

---

## 7. Genetic Algorithms

**File:** `07_genetic.js`

### What You'll Learn
- Population-based evolution
- Fitness functions for music evaluation
- Selection, crossover, mutation
- Multi-objective optimization
- Evolving melodies and rhythms

### Darwin Class

```javascript
// Create genetic algorithm
const darwin = new Darwin({
  populationSize: 20,
  geneLength: 16,
  mutationRate: 0.1,
  crossoverRate: 0.7,
  eliteCount: 2
});

// Define fitness function
function fitness(individual) {
  const melody = convertToMelody(individual);
  return evaluateQuality(melody);
}

// Evolve
for (let gen = 0; gen < 50; gen++) {
  darwin.evolve(fitness);
}

const best = darwin.getBest(fitness);
```

### Fitness Strategies
- Simple: variety + smoothness
- Advanced: using MusicalAnalysis metrics
- Multi-objective: variety + smoothness + range + arc shape
- Scale-constrained: mutations respect scale degrees

---

## 8. Gaussian Processes

**File:** `08_gaussian-processes.js`

### What You'll Learn
- GP regression for smooth interpolation
- RBF, Periodic, and Rational Quadratic kernels
- Uncertainty quantification
- Generating random samples
- Expressive parameter curves

### Kernels

```javascript
// RBF kernel (general smoothing)
const gpRBF = new GaussianProcessRegressor({
  kernel: 'rbf',
  lengthScale: 1.0,
  variance: 1.0
});

// Periodic kernel (cyclic patterns)
const gpPeriodic = new GaussianProcessRegressor({
  kernel: 'periodic',
  lengthScale: 1.0,
  periodLength: 4.0
});

// Fit and predict
gp.fit(X_train, y_train);
const predictions = gp.predict(X_test);
const { mean, std } = gp.predictWithUncertainty(X_test);
```

### Applications
- Interpolating sparse melodies
- Smooth dynamics curves
- Controlled random variations
- Harmonic textures
- Expressive timing (rubato)

---

## 9. Analysis

**File:** `09_analysis.js`

### What You'll Learn
- 12+ musical analysis metrics
- Melodic, rhythmic, and harmonic analysis
- Comparative analysis
- Using analysis in composition
- Integration with generative algorithms

### Metrics

```javascript
// Melodic metrics
MusicalAnalysis.contourEntropy(pitches);      // Complexity
MusicalAnalysis.intervalVariance(pitches);    // Variation
MusicalAnalysis.motifDetection(pitches);      // Patterns
MusicalAnalysis.autocorrelation(pitches);     // Self-similarity

// Rhythmic metrics
MusicalAnalysis.syncopation(onsets);          // Off-beat accents
MusicalAnalysis.density(notes);               // Notes per beat
MusicalAnalysis.balance(durations);           // Distribution
MusicalAnalysis.rhythmicFit(onsets, grid);    // Grid alignment

// Harmonic metrics
MusicalAnalysis.dissonance(chord);            // Tension
MusicalAnalysis.gini(values);                 // Inequality
MusicalAnalysis.fibonacci(proportions);       // Golden ratio

// Structural metrics
MusicalAnalysis.gapVariance(notes);           // Rest patterns
```

### Integration Examples
- Use metrics as fitness functions in genetic algorithms
- Compare variations to select best options
- Validate generated music meets criteria
- Guide parameter adjustments in real-time

---

## Feature Comparison: Djalgo vs algo

| Feature | Djalgo (Python) | algo (JavaScript) |
|---------|----------------|------------------------|
| **Format** | Tuples `(p,d,o)` | Objects `{pitch, duration, time}` |
| **Scales** | 14 modes | 14+ modes ✓ |
| **Progressions** | Basic | Roman numerals + advanced ✓ |
| **Loops** | Basic | Polyloops + phase ✓ |
| **CA** | 256 rules | 256 rules ✓ |
| **Fractals** | Mandelbrot, Logistic | Mandelbrot, Logistic ✓ |
| **Walks** | Random, Markov | Random, Markov, Phasors ✓ |
| **Genetic** | Darwin | Darwin ✓ |
| **GP** | Basic | RBF, Periodic, RQ ✓ |
| **Analysis** | 11 metrics | 12+ metrics ✓ |
| **AI/ML** | TensorFlow | Excluded (as requested) |
| **Visualization** | Plotly (Jupyter) | Plotly.js (Browser) ✓ |
| **MIDI** | Export | Import + Export ✓ |
| **Audio** | Python | Tone.js, WAV ✓ |
| **Notation** | ABCjs | VexFlow ✓ |
| **SuperCollider** | No | Yes ✓ |

**Legend:** ✓ = Fully implemented

---

## Running the Tutorials

### Node.js
```bash
# Run a single tutorial
node examples/tutorials/01_getting-started.js

# Run all tutorials
for f in examples/tutorials/*.js; do
  echo "Running $f"
  node "$f"
done
```

### Browser
```html
<!-- Include algo -->
<script type="module">
  import jm from './src/index.js';

  // Use algo
  const scale = new jm.theory.harmony.Scale('C', 'major');
  const notes = scale.generate({ octave: 4 });
  console.log(notes);
</script>
```

### Deno
```bash
deno run --allow-read examples/tutorials/01_getting-started.js
```

---

## Complete Feature List

### Music Theory
- ✓ 14+ scales and modes
- ✓ Chord progressions (roman numerals)
- ✓ Voice leading (4+ voices)
- ✓ Ornaments (8+ types)
- ✓ Articulations (10+ types)
- ✓ Rhythm generation
- ✓ Isorhythm
- ✓ Beatcycle

### Generative Algorithms
- ✓ Cellular Automata (256 rules)
- ✓ Mandelbrot fractals
- ✓ Logistic map (chaos)
- ✓ Random walks (biased, constrained)
- ✓ Markov chains (1st & 2nd order)
- ✓ Phasor systems
- ✓ Genetic algorithms (Darwin)
- ✓ Gaussian processes (3 kernels)
- ✓ Minimalism processes
- ✓ Tintinnabuli
- ✓ Loops and polyloops

### Analysis
- ✓ Gini coefficient
- ✓ Balance index
- ✓ Fibonacci index
- ✓ Syncopation
- ✓ Contour entropy
- ✓ Interval variance
- ✓ Note density
- ✓ Gap variance
- ✓ Motif detection
- ✓ Dissonance
- ✓ Rhythmic fit
- ✓ Autocorrelation

### Format Conversion
- ✓ MIDI import/export
- ✓ VexFlow notation
- ✓ Tone.js playback
- ✓ WAV generation
- ✓ SuperCollider code
- ✓ ABC notation
- ✓ JSON/JMON

### Visualization
- ✓ Plotly.js charts
- ✓ CA evolution plots
- ✓ Fractal visualizations
- ✓ Score rendering
- ✓ Analysis plots

---

## Advanced Topics

### Combining Techniques

```javascript
// Example: Evolve a cellular automaton pattern
const ca = new CellularAutomata({ rule: 30 });
const pattern = ca.generate(50);

// Convert to melody
const melody = pattern[25].map((cell, i) => ({
  pitch: cell ? 60 + i % 12 : null,
  duration: 0.5,
  time: i * 0.5
})).filter(n => n.pitch !== null);

// Evolve melody with genetic algorithm
const darwin = new Darwin({
  populationSize: 20,
  geneLength: melody.length
});

// Use analysis as fitness
function fitness(individual) {
  return MusicalAnalysis.contourEntropy(individual);
}

// Evolve for 20 generations
for (let i = 0; i < 20; i++) {
  darwin.evolve(fitness);
}

const evolvedMelody = darwin.getBest(fitness);
```

### Real-Time Generation

```javascript
// Use Gaussian Process for real-time variation
const gp = new GaussianProcessRegressor({
  kernel: 'periodic',
  periodLength: 8
});

// Fit to user input
gp.fit(userInputPoints, userInputValues);

// Generate variations in real-time
setInterval(() => {
  const t = performance.now() / 1000;
  const sample = gp.sample([[t]], 1)[0];
  playNote(sample[0]);
}, 100);
```

---

## Next Steps

1. **Explore the tutorials** in order (01 through 09)
2. **Experiment** with different parameters
3. **Combine techniques** from multiple tutorials
4. **Build your own** algorithmic compositions
5. **Contribute** examples and improvements

---

## Resources

- **algo GitHub:** [github.com/jmonlabs/algo](https://github.com/jmonlabs/algo)
- **Djalgo (Python):** [gitlab.com/essicolo/djalgo](https://gitlab.com/essicolo/djalgo)
- **Test Suite:** `/tests` directory
- **Examples:** `/examples` directory
- **API Documentation:** Coming soon

---

## Credits

**algo** is a JavaScript translation and extension of **Djalgo** by Essi Parent.

- **Original Djalgo:** Python library for algorithmic music composition
- **algo:** JavaScript/TypeScript port with web integration
- **JMON Format:** JSON-based music notation for web applications

All tutorials in this guide are complete JavaScript translations of the Djalgo Python user guide, adapted for the JMON format and JavaScript ecosystem.

---

**Happy composing! 🎵**

*Last updated: October 26, 2025*
