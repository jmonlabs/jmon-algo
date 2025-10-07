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

**For cloud-based coding:** You can also use [Observable](https://observablehq.com/) - paste `jm = require("jmon-algo@latest")` in a notebook. Check out the [interactive guide](https://observablehq.com/collection/@essi/jmon-algo).

## Installation

### For Deno (recommended)

```bash
# Import directly in your code
import * as jm from "jsr:@jmonlabs/jmon-algo";
```

Or use in Jupyter notebooks with Deno kernel.

### For npm/Node.js

```bash
npm install jmon-algo
```

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

## Examples

To be developped...

## License

GPL-3

## Links

- [GitHub Repository](https://github.com/jmonlabs/jmon-algo)
- [Issues](https://github.com/jmonlabs/jmon-algo/issues)
