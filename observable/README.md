# Observable Notebooks for jmon-algo

This directory contains **Observable-ready markdown** for creating interactive music composition notebooks. These are JavaScript translations of the original Djalgo (Python) marimo notebooks, adapted for jmon-algo.

## What's included

Seven comprehensive tutorials covering all major features:

1. **[01-getting-started.md](./01-getting-started.md)** - Installation, JMON format basics, first melody
2. **[02-harmony.md](./02-harmony.md)** - Scales, chords, ornaments, progressions, rhythms
3. **[03-loops.md](./03-loops.md)** - Loops, polyrhythms, Euclidean rhythms, phase shifting
4. **[04-minimalism.md](./04-minimalism.md)** - Additive/subtractive processes, tintinnabuli, isorhythm
5. **[05-walks.md](./05-walks.md)** - Random walks, Markov chains, phasor systems, Fibonacci walks
6. **[06-fractals.md](./06-fractals.md)** - Cellular automata, Mandelbrot sets, logistic maps
7. **[07-genetic.md](./07-genetic.md)** - Genetic algorithms, evolution, fitness functions

## How to use in Observable

### Option 1: Copy-paste (easiest)

1. Go to [observablehq.com](https://observablehq.com/)
2. Create a new notebook
3. Open one of the markdown files above
4. Copy the entire content
5. In Observable, click the "+" button to add a cell
6. Paste the markdown
7. Observable will automatically split it into cells!

### Option 2: Import from GitHub

Once these files are published:

```js
// Import a specific tutorial
import {content} from "@jmonlabs/jmon-algo-tutorials/01-getting-started"
```

### Option 3: Create a collection

1. Create separate notebooks for each tutorial
2. Organize into an Observable collection
3. Share the collection URL

## Structure

Each markdown file contains:

- **Narrative text** - Explanations and concepts (preserved from original tone)
- **Code blocks** - Working JavaScript examples using jmon-algo
- **Inline code** - Quick examples and syntax references
- **Links** - Navigate between tutorials

Observable automatically:
- Runs code blocks as reactive cells
- Renders markdown as formatted text
- Creates live, interactive visualizations
- Enables real-time audio playback

## Key features

### Interactive examples

All code examples are runnable. Try:
- Modifying parameters
- Changing scales and rhythms
- Experimenting with different algorithms

### Live playback

Use `jm.render(composition)` to create an interactive player with:
- Play/pause controls
- Timeline scrubbing
- Tempo adjustment
- Instrument selection (100+ General MIDI)
- MIDI/WAV export

### Visualizations

Interactive visualizations include:
- **Cellular automata strip selection** - Click and drag to select patterns
- **Mandelbrot zone selection** - Extract musical sequences from fractals
- **Plot integration** - All examples use Observable Plot
- **Evolution tracking** - Watch genetic algorithms improve over time

## JMON format

All tutorials use **JMON** (JSON Music Object Notation):

```js
note = {
  pitch: 60,      // MIDI pitch (0-127)
  duration: 1,    // Beats
  time: 0         // Start time in beats
}

track = {
  label: "Piano",
  notes: [/* array of notes */]
}

piece = {
  metadata: {
    title: "My Composition",
    tempo: 120
  },
  tracks: [/* array of tracks */]
}
```

It's just JavaScript objects - no special syntax!

## Differences from Djalgo

These tutorials are **JavaScript translations** of the original Python Djalgo tutorials, with:

### Same structure
- Chapter organization preserved
- Concepts explained identically
- Original writing style maintained

### Adapted for JavaScript
- Python → JavaScript syntax
- Djalgo API → jmon-algo API
- Tuple syntax → Object syntax
- List comprehensions → Array methods

### Added features
- JMON format section (Chapter 1)
- Observable-specific integration
- Interactive visualization tools
- Browser-based playback

### Excluded
- AI/ML chapter (Chapter 8) - not in jmon-algo
- Gaussian Processes use external package (noted in text)

## Tips for Observable

### Cell organization

Observable notebooks are **reactive** - cells automatically re-run when dependencies change:

```js
// Cell 1: Define data
scale = new jm.theory.harmony.Scale("C", "major")

// Cell 2: Use data (auto-updates when scale changes)
notes = scale.generate({ octave: 4 })
```

### Naming conventions

Use descriptive names to help Observable track dependencies:

```js
// Good
melody = createMelody()
harmony = createHarmony(melody)

// Avoid
x = createMelody()
y = createHarmony(x)
```

### viewof for interactions

Create interactive controls:

```js
viewof tempo = Inputs.range([60, 240], {
  label: "Tempo",
  value: 120,
  step: 1
})

// Now 'tempo' is reactive!
```

## Contributing

Found an issue or have improvements?

1. Open an issue on [GitHub](https://github.com/jmonlabs/jmon-algo/issues)
2. Submit a pull request
3. Share your Observable notebooks!

## Credits

- **Original Djalgo tutorials**: Essi Parent (Python/marimo)
- **jmon-algo translation**: JMON Labs (JavaScript/Observable)
- **Library**: jmon-algo - algorithmic music composition for JavaScript

## Links

- **jmon-algo GitHub**: https://github.com/jmonlabs/jmon-algo
- **jmon-algo npm**: https://www.npmjs.com/package/jmon-algo
- **jmon-algo JSR**: https://jsr.io/@jmon/jmon-algo
- **Djalgo (original)**: https://gitlab.com/essicolo/djalgo
- **Observable**: https://observablehq.com

---

**Happy composing! 🎵**
