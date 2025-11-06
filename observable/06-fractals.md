# 6. Fractals

```js
jm = require("jmon-algo@latest")
```

Fractals are patterns that repeat at different scales - zoom in and you see the same structure. In music, fractals create sequences that feel both ordered and unpredictable.

This chapter explores three fractal systems: **cellular automata**, **Mandelbrot sets**, and **logistic maps**.

---

## Cellular automata

Cellular automata (CA) are grids of cells that evolve according to simple rules. The most famous is **Conway's Game of Life**, but mathematician Stephen Wolfram catalogued 256 **elementary rules** for one-dimensional CA.

Each rule determines how a cell evolves based on its current state and its two neighbors.

### Creating a cellular automaton

```js
ca = new jm.generative.fractals.CellularAutomata({
  rule: 30,          // Wolfram rule number (0-255)
  width: 50,         // Number of cells
  iterations: 40     // How many generations to evolve
})

grid = ca.generate()
// Returns 2D array: grid[generation][cell] = 0 or 1
```

### Visualizing the evolution

```js
// Use jmon-algo's built-in visualizer
visualizer = new jm.visualization.fractals.CAVisualizer(grid)
canvas = visualizer.render({ width: 600, height: 400 })
canvas
```

You'll see a pattern emerge - Rule 30 creates chaotic, aperiodic structures. Rule 110 is even Turing-complete (can compute anything)!

### Extracting musical sequences

Now the fun part - turn these patterns into music:

```js
// Extract a vertical strip
stripStart = 10
stripEnd = 15
strip = grid.map(generation => generation.slice(stripStart, stripEnd))

// Map to pitches and rhythms
scale = new jm.theory.harmony.Scale("G", "minor")
scalePitches = scale.generate({ octave: 4 })

notes = []
let time = 0

strip.forEach((generation, i) => {
  generation.forEach((cell, j) => {
    if (cell === 1) {
      notes.push({
        pitch: scalePitches[j % scalePitches.length],
        duration: 0.25,
        time
      })
    }
  })
  time += 0.25
})
```

### Interactive strip selection

jmon-algo provides tools to select strips interactively:

```js
import { ObservableCATools } from "@jmonlabs/jmon-algo/visualization/cellular-automata"

// Create interactive selector
viewof selectedStrips = ObservableCATools.createStripSelector(grid, {
  width: 600,
  height: 400,
  maxStrips: 3
})

// Show selected strips
selectedStrips
```

Click and drag to select vertical strips. Each strip becomes a musical voice.

### Creating a rock composition

Let's make a minimal rock piece with drums and bass:

```js
// Rule 150 for guitar (melodic)
caGuitar = new jm.generative.fractals.CellularAutomata({
  rule: 150,
  width: 200,
  iterations: 64
})
gridGuitar = caGuitar.generate()

// Rule 18 for bass (sparse)
caBass = new jm.generative.fractals.CellularAutomata({
  rule: 18,
  width: 200,
  iterations: 64
})
gridBass = caBass.generate()

// Extract strips and map to notes
guitarNotes = extractStripToNotes(gridGuitar, 50, 60, "E", "minor", 5)
bassNotes = extractStripToNotes(gridBass, 80, 90, "E", "minor", 2)

// Add drums using Rule 30 (chaotic)
caDrums = new jm.generative.fractals.CellularAutomata({
  rule: 30,
  width: 200,
  iterations: 64
})
gridDrums = caDrums.generate()

// Map drum patterns: kick, snare, hi-hat
kickPattern = gridDrums[0]  // Use first row for kick
snarePattern = gridDrums[1]  // Second row for snare
hatPattern = gridDrums[2]    // Third row for hi-hat

drumNotes = []
let time = 0
for (let i = 0; i < 64; i++) {
  if (kickPattern[i % kickPattern.length] === 1) {
    drumNotes.push({ pitch: 36, duration: 0.25, time })  // Kick
  }
  if (snarePattern[i % snarePattern.length] === 1) {
    drumNotes.push({ pitch: 38, duration: 0.25, time })  // Snare
  }
  if (hatPattern[i % hatPattern.length] === 1) {
    drumNotes.push({ pitch: 42, duration: 0.125, time })  // Hi-hat
  }
  time += 0.25
}

composition = {
  metadata: {
    title: "CA Rock",
    tempo: 140
  },
  tracks: [
    { label: "Guitar", notes: guitarNotes },
    { label: "Bass", notes: bassNotes },
    { label: "Drums", notes: drumNotes }
  ]
}

jm.render(composition)
```

---

## Mandelbrot set

The Mandelbrot set is the most famous fractal - infinitely complex patterns at every zoom level.

### Generating the Mandelbrot set

```js
mandelbrot = new jm.generative.fractals.Mandelbrot({
  width: 80,           // Grid width
  height: 60,          // Grid height
  maxIterations: 100,  // Iteration limit
  xMin: -2.5,
  xMax: 1.0,
  yMin: -1.25,
  yMax: 1.25
})

grid = mandelbrot.generate()
// Returns 2D array of iteration counts
```

### Interactive zone selection

```js
import { ObservableMandelbrotTools } from "@jmonlabs/jmon-algo/visualization/fractals"

// Create interactive selector
viewof mandelbrotPaths = ObservableMandelbrotTools.createSequenceSelector(grid, {
  width: 600,
  height: 600
})

// Show selected paths
mandelbrotPaths
```

Click buttons to extract sequences using different methods:
- **Diagonal**: scan diagonally across the set
- **Spiral**: spiral inward from edges
- **Border**: trace the outer edge
- **Column**: vertical slices
- **Row**: horizontal slices

### Extracting sequences

```js
// Extract diagonal sequence
diagonal = []
for (let i = 0; i < Math.min(grid.length, grid[0].length); i++) {
  diagonal.push(grid[i][i])
}

// Map to pitches
scale = new jm.theory.harmony.Scale("G", "major")
scalePitches = scale.generate({ octave: 4 })

// Normalize to scale range
min = Math.min(...diagonal)
max = Math.max(...diagonal)
range = max - min

notes = diagonal.map((value, i) => {
  let normalized = (value - min) / range
  let degree = Math.floor(normalized * scalePitches.length)

  return {
    pitch: scalePitches[degree % scalePitches.length],
    duration: 0.5,
    time: i * 0.5
  }
})
```

The Mandelbrot set's structure creates melodies with natural contours and variety.

---

## Logistic map

The logistic map is deceptively simple but exhibits chaos:

```
x[n+1] = r × x[n] × (1 - x[n])
```

Where:
- `x` is the population (0 to 1)
- `r` is the growth rate

As `r` increases, behavior changes from stability to chaos.

### Generating sequences

```js
logistic = new jm.generative.fractals.LogisticMap({
  r: 3.9,              // Growth rate (3.57 to 4.0 for chaos)
  x0: 0.5,             // Initial population
  iterations: 100,     // Number of steps
  transient: 50        // Skip first N iterations (stabilization)
})

sequence = logistic.generate()
// Returns array of values between 0 and 1
```

### Exploring bifurcation

The logistic map "bifurcates" - as `r` increases, behavior splits:

```js
// Stable (r = 2.8)
stable = new jm.generative.fractals.LogisticMap({ r: 2.8, x0: 0.5, iterations: 50 })
stableSeq = stable.generate()
// Converges to single value

// Periodic (r = 3.2)
periodic = new jm.generative.fractals.LogisticMap({ r: 3.2, x0: 0.5, iterations: 50 })
periodicSeq = periodic.generate()
// Oscillates between values

// Chaotic (r = 3.9)
chaotic = new jm.generative.fractals.LogisticMap({ r: 3.9, x0: 0.5, iterations: 50 })
chaoticSeq = chaotic.generate()
// Unpredictable but deterministic
```

### Musical application

```js
// Generate chaotic sequence
logistic = new jm.generative.fractals.LogisticMap({
  r: 3.9,
  x0: 0.5,
  iterations: 64,
  transient: 20
})
sequence = logistic.generate()

// Map to pitches
scale = new jm.theory.harmony.Scale("D", "minor")
scalePitches = scale.generate({ octave: 4 })

notes = sequence.map((value, i) => {
  let degree = Math.floor(value * scalePitches.length)

  return {
    pitch: scalePitches[degree % scalePitches.length],
    duration: 0.25,
    time: i * 0.25
  }
})

// Add rhythm using beatcycle
pitches = notes.map(n => n.pitch)
durations = [0.25, 0.5, 0.25, 0.75, 0.5]
rhythmicNotes = jm.theory.rhythm.beatcycle(pitches, durations)
```

---

## Fractal composition

Let's combine all three fractal types:

```js
// CA for drums
caDrums = new jm.generative.fractals.CellularAutomata({ rule: 30, width: 100, iterations: 32 })
drumGrid = caDrums.generate()
drums = extractDrumPattern(drumGrid[0])

// Mandelbrot for melody
mandelbrot = new jm.generative.fractals.Mandelbrot({ width: 60, height: 40, maxIterations: 50 })
mandelbrotGrid = mandelbrot.generate()
melodySequence = extractDiagonal(mandelbrotGrid)
melody = mapToScale(melodySequence, "E", "minor", 5)

// Logistic map for bass
logistic = new jm.generative.fractals.LogisticMap({ r: 3.8, x0: 0.5, iterations: 32, transient: 10 })
bassSequence = logistic.generate()
bass = mapToScale(bassSequence, "E", "minor", 2)

composition = {
  metadata: {
    title: "Fractal Soundscape",
    tempo: 120
  },
  tracks: [
    { label: "CA Drums", notes: drums },
    { label: "Mandelbrot Melody", notes: melody },
    { label: "Logistic Bass", notes: bass }
  ]
}

jm.render(composition)
```

---

## Why fractals work musically

Fractals create patterns that are:
- **Self-similar**: recognizable structure at different scales
- **Complex but ordered**: not random, but not predictable
- **Visually and aurally interesting**: natural-sounding variation

They're like nature's composition algorithm - trees, coastlines, clouds all show fractal properties. Why not music?

---

## What's next?

We've explored fractals - deterministic chaos. Next, let's look at **[genetic algorithms](./07-genetic)** - evolution and natural selection applied to music.
