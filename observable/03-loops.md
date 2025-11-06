# 3. Loops

```js
jm = require("jmon-algo@latest")
```

In this chapter, we'll explore **loops** - repeating rhythmic and melodic patterns that form the backbone of many musical styles. We'll use jmon-algo's Loop system to create layered patterns with different time signatures and phase relationships.

---

## The Loop concept

A loop is a repeating sequence of notes. Think of it like a circular pattern - when you reach the end, you start over at the beginning.

In jmon-algo, loops are created using the `Loop` class. The simplest way:

```js
// Create a loop from pitches and durations
loop = jm.generative.loops.Loop.fromPattern(
  [60, 64, 67],        // Pitches (C-E-G)
  [0.5, 0.5, 1],       // Durations
  { measures: 2 }      // Total length: 2 measures
)

notes = loop.generate()
```

The system automatically:
- Spaces notes according to durations
- Fills gaps with rests
- Cycles the pattern within the specified length

---

## Pulse granularity

Think of a measure divided into small time units called **pulses**. For a 4/4 measure with 16th note resolution, we have 16 pulses (each pulse = 0.25 beats).

This granular timing lets us place notes precisely and create complex polyrhythmic patterns.

---

## Visualization

Let's visualize a loop pattern:

```js
loop = jm.generative.loops.Loop.fromPattern(
  [60, 62, 64, 65],      // C-D-E-F
  [0.5, 0.25, 0.5, 0.75], // Varied durations
  { measures: 1 }
)

// Get the generated notes
notes = loop.generate()

// Visualize with Plot
Plot.plot({
  marks: [
    Plot.barX(notes, {
      x1: "time",
      x2: d => d.time + d.duration,
      y: "pitch",
      fill: "steelblue"
    })
  ],
  y: { label: "MIDI Pitch" },
  x: { label: "Time (beats)" }
})
```

You'll see bars representing each note's duration and position. The visualization helps understand how patterns overlap and interact.

---

## Euclidean rhythms

Euclidean rhythms distribute beats as evenly as possible. They appear in music worldwide:

```js
// 5 beats distributed across 8 pulses (Cuban tresillo)
loop = jm.generative.loops.Loop.fromPattern(
  [60, 60, 60, 60, 60],  // Same pitch
  [1, 1, 1, 1, 1],       // Equal durations
  {
    measures: 2,
    euclidean: { pulses: 5, steps: 8 }
  }
)

notes = loop.generate()
// Result: x..x..x.x..x.... (where x = beat, . = rest)
```

Common Euclidean patterns:
- `(5, 8)` - Cuban tresillo
- `(5, 12)` - Persian rhythm
- `(7, 12)` - West African bell pattern
- `(5, 16)` - Bossa nova

---

## Phase shifting

Phase shifting creates interesting textures by starting the same loop at different times:

```js
// Create base loop
baseLoop = jm.generative.loops.Loop.fromPattern(
  [60, 62, 64],
  [0.5, 0.5, 0.5],
  { measures: 1.5 }
)

// Generate three voices, each shifted
voice1 = baseLoop.generate({ offset: 0 })
voice2 = baseLoop.generate({ offset: 0.5 })  // Delayed by 0.5 beats
voice3 = baseLoop.generate({ offset: 1.0 })  // Delayed by 1.0 beat

composition = {
  metadata: { title: "Phase Shifting" },
  tracks: [
    { label: "Voice 1", notes: voice1 },
    { label: "Voice 2", notes: voice2 },
    { label: "Voice 3", notes: voice3 }
  ]
}

jm.render(composition)
```

As the piece plays, the voices drift in and out of sync, creating evolving textures. This technique was popularized by Steve Reich.

---

## Polyrhythms

Polyrhythms combine different rhythmic patterns simultaneously:

```js
// 3 against 4 polyrhythm
loop3 = jm.generative.loops.Loop.fromPattern(
  [60, 60, 60],          // 3 beats
  [1, 1, 1],
  { measures: 1 }
)

loop4 = jm.generative.loops.Loop.fromPattern(
  [72, 72, 72, 72],      // 4 beats (octave higher)
  [0.75, 0.75, 0.75, 0.75],
  { measures: 1 }
)

composition = {
  metadata: { title: "3 Against 4" },
  tracks: [
    { label: "Triplet", notes: loop3.generate() },
    { label: "Quarter", notes: loop4.generate() }
  ]
}
```

---

## Isorhythm

Isorhythm maps pitches and durations independently. When lists have different lengths, they cycle at different rates:

```js
pitches = [60, 62, 64, 65, 67]       // 5 pitches
durations = [0.5, 0.25, 0.75]        // 3 durations

// Map them together
notes = jm.theory.rhythm.isorhythm(pitches, durations)

// Result cycles: pitch list repeats every 5 notes,
// duration list repeats every 3 notes
// Creates 15-note pattern before repeating
```

This medieval technique creates evolving patterns where pitch and rhythm realign at different intervals.

---

## Analysis: measuring balance

The **balance index** measures how symmetrically notes are distributed in time:

```js
notes = loop.generate()
balance = jm.analysis.MusicalAnalysis.balance(
  notes.map(n => n.time)
)

// Value near 0.5 means balanced (centered)
// Value near 0 or 1 means unbalanced (weighted to start/end)
```

The **Gini coefficient** measures inequality in note attributes:

```js
gini = jm.analysis.MusicalAnalysis.gini(
  notes.map(n => n.duration)
)

// Value near 0 means equal durations
// Value near 1 means very unequal durations
```

These metrics help you understand and design your rhythmic patterns.

---

## Putting it together: minimal techno

Let's create a simple techno pattern using loops:

```js
// Bass loop (low, steady)
bassLoop = jm.generative.loops.Loop.fromPattern(
  [36, 36, 36, 36],     // C1 (kick drum pitch)
  [0.25, 0.25, 0.25, 0.25],
  { measures: 1 }
)

// Hi-hat loop (sparse, irregular)
hatLoop = jm.generative.loops.Loop.fromPattern(
  [42, 42, 42, 42, 42, 42], // F#2 (closed hi-hat)
  [0.25, 0.25, 0.125, 0.125, 0.25, 0.25],
  { measures: 1 }
)

// Melody loop (higher, evolving)
melodyLoop = jm.generative.loops.Loop.fromPattern(
  [60, 62, 67, 65],
  [0.5, 0.5, 1, 0.5],
  { measures: 2 }
)

// Repeat each loop 4 times
repeatLoop = (notes, times) => {
  let result = []
  for (let i = 0; i < times; i++) {
    let offset = i * 4  // 4 beats per measure
    result.push(...notes.map(n => ({
      ...n,
      time: n.time + offset
    })))
  }
  return result
}

composition = {
  metadata: {
    title: "Minimal Techno",
    tempo: 128
  },
  tracks: [
    { label: "Bass", notes: repeatLoop(bassLoop.generate(), 4) },
    { label: "Hi-hat", notes: repeatLoop(hatLoop.generate(), 4) },
    { label: "Melody", notes: repeatLoop(melodyLoop.generate(), 2) }
  ]
}

jm.render(composition)
```

---

## What's next?

We've explored loops and rhythmic patterns. Next, let's dive into **[minimalist composition techniques](./04-minimalism)** - additive processes, subtractive processes, and tintinnabuli.
