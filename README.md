# jmon-algo

jmon-algo (jam on studio) is the JavaScript version of the JMON (JSON Music Object Notation) studio for algorithmic music composition (djalgojs), format conversion (jmon-format) and music visualization (viz). This version has been converted from TypeScript to pure JavaScript for easier management and broader compatibility.

## Getting started

Start jamming in 3 steps.

### 1. Get the tools ready

First, install [Deno](https://deno.com/), which runs the JavaScript code. Then download jmon-algo:

```bash
git clone https://github.com/jmonlabs/jmon-algo.git
cd jmon-algo
deno task build
```

### 2. Launch the studio

```bash
cd examples
deno run --allow-net --allow-read server.js
```

### 3. Start composing!

Open your browser and go to `http://localhost:3000/ide.html`

You'll see:
- **Left side**: Your code editor - write your music here
- **Right side**: See the musical score and player with controls

Press **Ctrl+Enter** to hear what you created!

### Your first melody

Try this - type it in the left pane and press Ctrl+Enter:

```javascript
const notes = [
  { pitch: 60, duration: 1, time: 0 },  // C
  { pitch: 64, duration: 1, time: 1 },  // E
  { pitch: 67, duration: 1, time: 2 },  // G
  { pitch: 72, duration: 2, time: 3 }   // High C (longer note)
];

const piece = {
  metadata: { title: "My First Melody" },
  tracks: [{ notes }]
};

piece;  // This shows your music!
```

**What's happening?**
- `pitch`: The note (60 = middle C, higher numbers = higher notes)
- `duration`: How long the note plays (1 = quarter note, 2 = half note)
- `time`: When the note starts playing

Now change the numbers and see what happens! 🎵

---

**For cloud-based coding:** You can also use [Observable](https://observablehq.com/) or [Tangent Notebooks](https://tangent.to) - see usage examples below. Check out the [interactive guide](https://observablehq.com/collection/@essi/jmon-algo).

## Installation

jmon-algo is published on both **JSR** (Deno registry) and **npm**. Choose based on your environment:

### JSR Package (Recommended for Deno, Observable, Browsers)

```typescript
// Deno
import jm from "jsr:@jmon/jmon-algo";

// Observable / Tangent Notebooks
jm = await import("https://esm.sh/jsr/@jmon/jmon-algo")

// Browser (via CDN)
import jm from "https://esm.sh/jsr/@jmon/jmon-algo";
```

**Features:** Theory, generative algorithms, analysis, converters, sheet music notation (via `score()`)
**Note:** Audio playback (`play()`, `render()`) not available - use npm package for that

### npm Package (For Full Browser Support with Audio)

```bash
npm install @jmon/jmon-algo
```

```javascript
// Node.js / Browser bundlers
import jm from '@jmon/jmon-algo';
```

**Features:** Everything from JSR + audio playback with built-in Tone.js player

## Features

###  **Algorithmic Composition**
- **Music theory**: Scales, progressions, harmony, rhythm
- **Minimalism**: Process-based composition techniques
- **Generative algorithms**: no deep learning, just you, your imagination and math: random walks, Fractals, cellular automata, genetic algorithms, Gaussian processes

### **JMON Format Conversion**
- **Tone**: Core format validation and Tone.js integration
- **ABC notation**: Convert JMON to ABC notation
- **MIDI**: MIDI file conversion utilities
- **Display**: Score visualization and playback functions
- **SuperCollider**: JMON format to SuperCollider code

### **Analysis & Utilities**
- Musical analysis tools (usefull for genetic algorithms)
- Format conversion utilities
- Mathematical utilities for music


## Development

### Building

```bash
deno task build    # Build ESM and UMD bundles
```

### Jupyter Notebooks

1. Install Deno: https://deno.com/manual/getting_started/installation
2. Install JupyterLab: `pipx install jupyterlab`
3. Install Deno kernel: `deno jupyter --install`
4. Launch: `jupyter-lab`
5. Create a notebook with the Deno kernel

## Usage Examples by Environment

### Observable Notebooks

**Basic Theory & Generative:**
```javascript
// Import
jm = await import("https://esm.sh/jsr/@jmon/jmon-algo")

// Generate a scale
jm.default.theory.scale.generate('C', 'major')
// => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

// Create a melody
jm.default.generative.melody.simple({
  length: 8,
  scale: 'C major',
  octave: 4
})
```

**Sheet Music Notation:**
```javascript
// Import VexFlow separately
VF = await import("https://esm.sh/vexflow@4.2.2")
jm = await import("https://esm.sh/jsr/@jmon/jmon-algo")

// Create composition
composition = {
  notes: [
    {pitch: 60, duration: 1},  // C
    {pitch: 64, duration: 1},  // E
    {pitch: 67, duration: 2}   // G
  ]
}

// Render score (pass VexFlow as parameter)
jm.default.score(composition, VF, {width: 600, height: 150})
```

**Audio Playback** (requires npm package):
```javascript
// Use npm instead of JSR for audio playback
jm = require("@jmon/jmon-algo@1.0.0")
jm.play(composition)  // Built-in player with Tone.js
```

### Tangent Notebooks

[Tangent Notebooks](https://tangent.to) work similarly to Observable. Import from JSR via esm.sh:

```javascript
// Cell 1: Import library
import jm from "https://esm.sh/jsr/@jmon/jmon-algo";

// Cell 2: Generate music theory data
const scale = jm.theory.scale.generate('E', 'minor');
const chords = jm.theory.chord.progression('E', ['i', 'VI', 'III', 'VII']);

console.log('Scale:', scale);
console.log('Progression:', chords);
```

**Generative Algorithms:**
```javascript
import jm from "https://esm.sh/jsr/@jmon/jmon-algo";

// Random walk melody
const walk = jm.generative.walk.random({
  start: 60,
  steps: 16,
  stepSize: 3,
  bounds: [48, 84]
});

// Mandelbrot fractal melody
const fractal = jm.generative.fractal.mandelbrotMelody({
  length: 32,
  minPitch: 48,
  maxPitch: 84
});

// Return for visualization
{walk, fractal}
```

**Sheet Music with VexFlow:**
```javascript
import jm from "https://esm.sh/jsr/@jmon/jmon-algo";
import * as VF from "https://esm.sh/vexflow@4.2.2";

// Generate a melodic pattern
const melody = jm.generative.melody.simple({
  length: 8,
  scale: 'C major',
  octave: 4
});

// Convert to JMON format
const composition = {
  notes: melody.map((note, i) => ({
    pitch: note.pitch,
    duration: 1,
    time: i
  }))
};

// Render notation
const notation = jm.score(composition, VF, {width: 700, height: 180});
notation; // Tangent will display the SVG
```

**Tip for Tangent:** Use `console.log()` to debug and return DOM elements or data objects at the end of cells for visualization.

### Browser (HTML + Script Tags)

```html
<!DOCTYPE html>
<html>
<head>
  <title>JMON Music</title>
</head>
<body>
  <div id="notation"></div>

  <script type="module">
    // Import packages
    import jm from "https://esm.sh/jsr/@jmon/jmon-algo";
    import * as VF from "https://esm.sh/vexflow@4.2.2";

    // Generate a chord progression
    const progression = jm.theory.chord.progression('C', ['I', 'IV', 'V', 'I']);
    console.log(progression);

    // Create composition from progression
    const composition = {
      notes: progression.flatMap((chord, i) =>
        chord.notes.map(note => ({
          pitch: note,
          duration: 1,
          time: i
        }))
      )
    };

    // Render notation
    const notation = jm.score(composition, VF, {width: 800});
    document.getElementById('notation').appendChild(notation);
  </script>
</body>
</html>
```

### Deno

**Basic Usage:**
```typescript
import jm from "jsr:@jmon/jmon-algo";

// Generate a scale
const scale = jm.theory.scale.generate('D', 'minor');
console.log(scale);

// Create a random walk melody
const melody = jm.generative.walk.random({
  start: 60,
  steps: 16,
  stepSize: 2
});

// Convert to MIDI
const midiData = jm.converters.midi.fromJmon({
  tracks: [{ notes: melody.map((pitch, i) => ({
    pitch,
    duration: 0.5,
    time: i * 0.5
  }))}]
});

// Save to file
await Deno.writeFile("melody.mid", midiData);
```

**Jupyter Notebook with Deno Kernel:**
```typescript
import jm from "jsr:@jmon/jmon-algo";

// Generate data for visualization
const fractal = jm.generative.fractal.mandelbrot({
  width: 100,
  height: 100,
  maxIterations: 50
});

// Extract melody from fractal
const melody = jm.generative.fractal.mandelbrotMelody(fractal, {
  length: 32
});

melody
```

### Node.js

**With npm Package:**
```javascript
import jm from '@jmon/jmon-algo';

// Generate harmonic progression
const progression = jm.theory.chord.progression('G', ['I', 'vi', 'IV', 'V']);

// Create composition
const composition = {
  bpm: 120,
  tracks: progression.map(chord => ({
    notes: chord.notes.map((pitch, i) => ({
      pitch,
      duration: 1,
      time: i * 0.25
    }))
  }))
};

// Convert to SuperCollider
const scCode = jm.converters.supercollider(composition);
console.log(scCode);
```

**With JSR via npm: specifier (experimental):**
```javascript
// Requires Node.js with --experimental-network-imports flag
import jm from 'npm:@jmon/jmon-algo';

const scale = jm.theory.scale.generate('A', 'minor');
console.log(scale);
```

## API Overview

### Core Functions

| Function | JSR | npm | Description |
|----------|-----|-----|-------------|
| `jm.theory.*` | ✅ | ✅ | Scales, chords, progressions, intervals |
| `jm.generative.*` | ✅ | ✅ | Melodies, walks, fractals, cellular automata |
| `jm.analysis.*` | ✅ | ✅ | Pitch, rhythm, harmony analysis |
| `jm.converters.*` | ✅ | ✅ | MIDI, ToneJS, WAV, SuperCollider, VexFlow |
| `jm.audio.*` | ✅ | ✅ | DSP, synthesis, audio processing |
| `jm.score(comp, VF, opts)` | ✅ | ✅ | Sheet music (requires VexFlow param) |
| `jm.play(comp, opts)` | ❌ | ✅ | Audio playback (npm only) |
| `jm.render(comp, opts)` | ❌ | ✅ | Full UI player (npm only) |

### Parameter-Based Dependencies

jmon-algo has **zero dependencies** in the JSR package. Libraries are passed as parameters:

```javascript
// VexFlow for notation (both JSR and npm)
const notation = jm.score(composition, vexflowInstance, options);

// Tone.js for audio (npm package only)
const player = jm.play(composition, {Tone: toneInstance});
```

This design allows you to:
- ✅ Use any version of VexFlow or Tone.js
- ✅ Load libraries from CDN in browsers
- ✅ Avoid dependency bloat in Deno/Node
- ✅ Pass mocked libraries for testing

## License

GPL-3

## Links

- [GitHub Repository](https://github.com/jmonlabs/jmon-algo)
- [Issues](https://github.com/jmonlabs/jmon-algo/issues)
