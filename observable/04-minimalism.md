# 4. Minimalism

```js
jm = require("jmon-algo@latest")
```

Minimalist music uses simple materials and processes to create complex, evolving textures. Think Philip Glass, Steve Reich, or Arvo Pärt - repetitive patterns that gradually transform.

In this chapter, we'll explore minimalist techniques: **isorhythm**, **additive/subtractive processes**, **shuffling**, and **tintinnabuli**.

---

## Isorhythm

Isorhythm maps pitches and rhythms independently. When the lists have different lengths, interesting patterns emerge:

```js
pitches = [60, 62, 64, 65, 67, 69, 71]  // C major scale (7 notes)
durations = [0.5, 0.25, 0.75]           // 3 durations

notes = jm.theory.rhythm.isorhythm(pitches, durations)

// The pattern repeats every 21 notes (7 × 3)
// Pitches cycle: C D E F G A B | C D E F...
// Durations cycle: 0.5 0.25 0.75 | 0.5 0.25...
```

This medieval technique creates evolving patterns where melody and rhythm realign at different intervals.

---

## Additive and subtractive processes

These deterministic techniques gradually build up or break down musical material.

### Additive forward

Starts with one note, gradually adds more from the beginning:

```js
melody = [
  { pitch: 60, duration: 0.5, time: 0 },
  { pitch: 62, duration: 0.5, time: 0.5 },
  { pitch: 64, duration: 0.5, time: 1 },
  { pitch: 65, duration: 0.5, time: 1.5 }
]

process = new jm.generative.minimalism.MinimalismProcess({
  operation: "additive",
  direction: "forward",
  repetition: 1  // Repeat each iteration once
})

result = process.generate(melody)

// Generates:
// [C]
// [C D]
// [C D E]
// [C D E F]
```

### Additive backward

Builds from the end:

```js
process = new jm.generative.minimalism.MinimalismProcess({
  operation: "additive",
  direction: "backward",
  repetition: 1
})

result = process.generate(melody)

// Generates:
// [F]
// [E F]
// [D E F]
// [C D E F]
```

### Subtractive forward

Removes notes from the beginning:

```js
process = new jm.generative.minimalism.MinimalismProcess({
  operation: "subtractive",
  direction: "forward",
  repetition: 1
})

result = process.generate(melody)

// Generates:
// [C D E F]
// [D E F]
// [E F]
// [F]
```

### Subtractive backward

Removes notes from the end:

```js
process = new jm.generative.minimalism.MinimalismProcess({
  operation: "subtractive",
  direction: "backward",
  repetition: 1
})

result = process.generate(melody)

// Generates:
// [C D E F]
// [C D E]
// [C D]
// [C]
```

These processes create a sense of gradual transformation - the hallmark of minimalist music.

---

## Shuffling

Shuffling is a stochastic (random) operation that rearranges pitches while preserving rhythm:

```js
melody = [
  { pitch: 60, duration: 0.5, time: 0 },
  { pitch: 62, duration: 0.5, time: 0.5 },
  { pitch: 64, duration: 0.5, time: 1 },
  { pitch: 65, duration: 0.5, time: 1.5 }
]

// Shuffle pitches randomly
shuffled = melody.map((note, i, arr) => {
  let pitches = arr.map(n => n.pitch)
  // Fisher-Yates shuffle
  for (let j = pitches.length - 1; j > 0; j--) {
    let k = Math.floor(Math.random() * (j + 1));
    [pitches[j], pitches[k]] = [pitches[k], pitches[j]]
  }
  return { ...note, pitch: pitches[i] }
})
```

For reproducibility, use a seeded random number generator.

---

## Tintinnabuli

Tintinnabuli (Latin for "bells") is Arvo Pärt's signature technique. It uses two voices:

- **M-voice** (melody): the main melodic line
- **T-voice** (tintinnabuli): follows strict rules to harmonize

The T-voice selects pitches from a **T-chord** (usually a triad) based on the M-voice position:

```js
// M-voice: simple melody
mVoice = [
  { pitch: 60, duration: 1, time: 0 },  // C
  { pitch: 62, duration: 1, time: 1 },  // D
  { pitch: 64, duration: 1, time: 2 },  // E
  { pitch: 65, duration: 1, time: 3 }   // F
]

// T-chord: C major triad
tChord = [60, 64, 67]  // C E G

// Create T-voice that follows rules
tintinnabuli = new jm.generative.minimalism.Tintinnabuli(
  tChord,
  "down",  // Direction: look down for closest T-chord note
  0        // Position: 0 = closest, 1 = second closest, etc.
)

tVoice = tintinnabuli.generate(mVoice)

// Result:
// M: C   D   E   F
// T: C   C   E   E  (closest T-chord note below each M-voice note)
```

Direction options:
- `"up"` - find closest T-chord note above M-voice
- `"down"` - find closest T-chord note below M-voice
- `"alternate"` - alternate between up and down
- `"any"` - find absolute closest (up or down)

Position parameter:
- `0` - closest note
- `1` - second closest
- `2` - third closest

This creates bell-like harmonies characteristic of Pärt's music.

---

## Voicing: adding harmony

Take your melody and add harmonic structure:

```js
melody = [
  { pitch: 60, duration: 1, time: 0 },
  { pitch: 62, duration: 1, time: 1 },
  { pitch: 64, duration: 1, time: 2 },
  { pitch: 65, duration: 1, time: 3 }
]

// Extract first note of each measure
downbeats = [melody[0], melody[2]]  // C and E

// Generate chords for these notes
scale = new jm.theory.harmony.Scale("C", "major")
harmony = downbeats.map(note => {
  // Build chord on this degree
  degree = scale.pitches.indexOf(note.pitch % 12)
  voice = scale.buildChord(degree, "triad")

  return {
    pitch: voice,
    duration: 2,  // 2 beats per chord
    time: note.time
  }
})
```

---

## Complete minimalist composition

Let's combine everything into a short piece:

```js
// Base melody
baseMelody = [
  { pitch: 60, duration: 0.5, time: 0 },
  { pitch: 62, duration: 0.5, time: 0.5 },
  { pitch: 64, duration: 0.5, time: 1 },
  { pitch: 65, duration: 0.5, time: 1.5 },
  { pitch: 67, duration: 0.5, time: 2 },
  { pitch: 65, duration: 0.5, time: 2.5 },
  { pitch: 64, duration: 0.5, time: 3 },
  { pitch: 62, duration: 0.5, time: 3.5 }
]

// Apply additive forward process
additiveProcess = new jm.generative.minimalism.MinimalismProcess({
  operation: "additive",
  direction: "forward",
  repetition: 2  // Repeat each iteration twice
})
track1 = additiveProcess.generate(baseMelody)

// Create T-voice using tintinnabuli
tChord = [60, 64, 67]  // C major
tintinnabuli = new jm.generative.minimalism.Tintinnabuli(
  tChord,
  "down",
  0
)
track2 = tintinnabuli.generate(baseMelody).map(note => ({
  ...note,
  pitch: note.pitch + 12  // Transpose up one octave
}))

// Bass line using isorhythm
bassPitches = [48, 48, 55, 55]  // C2, C2, G2, G2
bassDurations = [2, 2]
track3 = jm.theory.rhythm.isorhythm(bassPitches, bassDurations)

composition = {
  metadata: {
    title: "Minimalist Study",
    tempo: 90
  },
  tracks: [
    { label: "Additive Melody", notes: track1 },
    { label: "T-Voice", notes: track2 },
    { label: "Bass", notes: track3 }
  ]
}

jm.render(composition)
```

Export to MIDI to refine in your DAW:

```js
// In Observable, use the player's download button
// Or programmatically:
midiData = jm.converters.midi(composition)
```

---

## What's next?

We've explored deterministic minimalist techniques. Next, let's add some randomness with **[random walks and Markov chains](./05-walks)**.
