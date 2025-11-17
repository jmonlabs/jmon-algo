# 1. Getting started

## Three ways to try algo

### Browser (Observable)

The easiest way to start is right here in Observable. Just import the library:

```js
jm = require("algo@latest")
```

That's it! You can now compose music directly in your browser.

### Local with Deno (recommended)

If you prefer working locally, install [Deno](https://deno.com/) and import algo:

```bash
# In your Deno project
deno add jsr:@jmon/algo
```

```js
import * as jm from "jsr:@jmon/algo";
```

You can also use Jupyter notebooks with the Deno kernel.

### Node.js / npm

```bash
npm install algo
```

```js
import * as jm from "algo";
```

---

## The JMON format

algo uses **JMON** (JSON Music Object Notation) - a simple, human-readable format for representing music as JavaScript objects.

### Notes

Notes are objects with three essential properties:

```js
note = {
  pitch: 60,      // MIDI pitch (60 = middle C, 0-127 range)
  duration: 1,    // Duration in beats
  time: 0         // Start time in beats
}
```

**MIDI pitch reference:**
- C2 = 0
- Middle C (C4) = 60
- A4 = 69 (concert pitch, 440 Hz)
- G9 = 127

You can also use note names:

```js
note = {
  pitch: "C4",    // Note name instead of MIDI number
  duration: 1,
  time: 0
}
```

### Chords

Chords are notes with multiple pitches:

```js
chord = {
  pitch: [60, 64, 67],  // C major chord (C-E-G)
  duration: 2,
  time: 0
}
```

### Tracks

Tracks are collections of notes:

```js
track = {
  label: "Piano",           // Track name
  notes: [
    { pitch: 60, duration: 1, time: 0 },
    { pitch: 62, duration: 1, time: 1 },
    { pitch: 64, duration: 1, time: 2 }
  ]
}
```

### Pieces (compositions)

A piece brings everything together:

```js
piece = {
  metadata: {
    title: "My Composition",
    composer: "Your Name",
    tempo: 120
  },
  tracks: [
    {
      label: "Melody",
      notes: [ /* ... */ ]
    },
    {
      label: "Bass",
      notes: [ /* ... */ ]
    }
  ]
}
```

**That's all you need to know!** JMON is just JavaScript objects - no special syntax to learn.

---

## Your first melody

Let's create a simple melody. We'll compose a short phrase from a children's song.

```js
melody = [
  { pitch: 60, duration: 0.5, time: 0.0 },    // C
  { pitch: 60, duration: 0.5, time: 0.5 },    // C
  { pitch: 67, duration: 0.5, time: 1.0 },    // G
  { pitch: 67, duration: 0.5, time: 1.5 },    // G
  { pitch: 69, duration: 0.5, time: 2.0 },    // A
  { pitch: 69, duration: 0.5, time: 2.5 },    // A
  { pitch: 67, duration: 1.0, time: 3.0 }     // G (longer)
]
```

Now let's add a simple bass line:

```js
bass = [
  { pitch: 48, duration: 1, time: 0 },  // C2
  { pitch: 55, duration: 1, time: 1 },  // G2
  { pitch: 57, duration: 1, time: 2 },  // A2
  { pitch: 55, duration: 1, time: 3 }   // G2
]
```

Combine them into a piece:

```js
piece = {
  metadata: {
    title: "Twinkle Twinkle"
  },
  tracks: [
    { label: "Melody", notes: melody },
    { label: "Bass", notes: bass }
  ]
}
```

---

## Play it!

In Observable, render the player:

```js
jm.render(piece)
```

You'll see a player with:
- Play/pause controls
- Timeline scrubber
- Tempo control
- Instrument selection (100+ General MIDI instruments!)
- Download buttons (MIDI and WAV)

Try changing the tempo, switching instruments, or modifying the notes!

---

## What algo can do

algo provides everything you need for algorithmic composition:

**Music Theory**
- Scales (14+ modes: major, minor, dorian, phrygian, etc.)
- Chord progressions (circle of fifths, random progressions)
- Voice leading and harmony
- Ornaments (trills, grace notes, mordents, turns, arpeggios, slides)
- Articulations (staccato, legato, accent)
- Rhythm generation (isorhythm, beatcycle, advanced patterns)

**Generative Algorithms**
- Cellular automata (all 256 Wolfram rules)
- Fractals (Mandelbrot, logistic map)
- Random walks and Markov chains
- Genetic algorithms (Darwin evolution)
- Gaussian processes (for smooth variations)
- Minimalist techniques (additive/subtractive processes, tintinnabuli)
- Loop composition with polyrhythms

**Analysis & Utilities**
- 11+ musical metrics (Gini coefficient, balance, syncopation, entropy, etc.)
- Format conversion (MIDI import/export, ABC notation)
- Score rendering (VexFlow notation)
- Visualization (interactive plots for algorithms)

**Browser Integration**
- Music player with General MIDI support
- Score renderer
- Interactive visualizations
- Observable-native components

---

## Next chapters

1. Getting started ← You are here
2. **[Harmonies](./02-harmonies)** - Scales, chords, progressions, ornaments
3. **[Loops](./03-loops)** - Polyloops, rhythmic patterns, phase shifting
4. **[Minimalism](./04-minimalism)** - Additive/subtractive processes, tintinnabuli
5. **[Walks](./05-walks)** - Random walks, Markov chains, Gaussian processes
6. **[Fractals](./06-fractals)** - Cellular automata, Mandelbrot, logistic map
7. **[Genetic](./07-genetic)** - Evolution, fitness functions, natural selection

Let's dive into harmonies next!
