# 2. Harmonies

```js
jm = require("jmon-algo@latest")
```

In this chapter, we'll explore how to create harmonies using jmon-algo's music theory tools. We'll start with basic scales and work our way up to complete compositions with chords, ornaments, and progressions.

---

## 2.1 Quick JavaScript refresher

Before we dive in, a quick note on data structures. In jmon-algo:

- **Arrays** hold lists of items: `[60, 62, 64]`
- **Objects** group related data: `{ pitch: 60, duration: 1, time: 0 }`

Notes are objects with pitch, duration, and time. Remember:
- **pitch**: MIDI value (0-127, where 60 = middle C)
- **duration**: length in beats
- **time**: when the note starts

Let's compose that children's song from chapter 1 with two tracks:

```js
melody = [
  { pitch: 60, duration: 0.5, time: 0.0 },  // C
  { pitch: 60, duration: 0.5, time: 0.5 },  // C
  { pitch: 67, duration: 0.5, time: 1.0 },  // G
  { pitch: 67, duration: 0.5, time: 1.5 },  // G
  { pitch: 69, duration: 0.5, time: 2.0 },  // A
  { pitch: 69, duration: 0.5, time: 2.5 },  // A
  { pitch: 67, duration: 1.0, time: 3.0 }   // G
]

bass = [
  { pitch: 48, duration: 1, time: 0 },  // C2
  { pitch: 55, duration: 1, time: 1 },  // G2
  { pitch: 57, duration: 1, time: 2 },  // A2
  { pitch: 55, duration: 1, time: 3 }   // G2
]

piece = {
  metadata: { title: "Twinkle Twinkle" },
  tracks: [
    { label: "Melody", notes: melody },
    { label: "Bass", notes: bass }
  ]
}
```

But typing MIDI numbers gets tedious. Let's use jmon-algo's tools instead.

---

## 2.2 Leverage jmon-algo for harmony

### Scales

Need a scale? jmon-algo has you covered.

```js
scale = new jm.theory.harmony.Scale("C", "major")
notes = scale.generate({ octave: 4 })
// → [60, 62, 64, 65, 67, 69, 71, 72]  // C major scale
```

Available modes include: major, minor, dorian, phrygian, lydian, mixolydian, locrian, harmonic minor, melodic minor, major pentatonic, minor pentatonic, whole tone, diminished, and chromatic.

```js
// D Dorian scale
scale = new jm.theory.harmony.Scale("D", "dorian")
notes = scale.generate({ octave: 4 })
```

### Chords

Chords are notes played simultaneously. In JMON, represent them as arrays:

```js
chord = {
  pitch: [60, 64, 67],  // C major chord (C-E-G)
  duration: 2,
  time: 0
}
```

### Ornaments

Ornaments add expressiveness to your melodies. jmon-algo provides six types:

**Grace note** - adds a quick note before:

```js
note = { pitch: 60, duration: 1, time: 0 }
graceNote = jm.theory.harmony.Ornament.apply(note, "grace", {
  auxiliaryPitch: 59
})
// Adds a quick B before C
```

**Trill** - rapid alternation between two pitches:

```js
trill = jm.theory.harmony.Ornament.apply(note, "trill", {
  auxiliaryPitch: 62,  // D
  oscillations: 4
})
// Creates C-D-C-D-C-D-C-D pattern
```

**Mordent** - quick alternation, returns to main note:

```js
mordent = jm.theory.harmony.Ornament.apply(note, "mordent", {
  auxiliaryPitch: 58,  // Bb
  oscillations: 2
})
```

**Turn** - four-note ornamental figure:

```js
turn = jm.theory.harmony.Ornament.apply(note, "turn", {
  upperPitch: 62,  // D
  lowerPitch: 58   // Bb
})
// Creates D-C-Bb-C pattern
```

**Arpeggio** - broken chord:

```js
arpeggio = jm.theory.harmony.Ornament.apply(note, "arpeggio", {
  auxiliaryPitches: [64, 67]  // E, G
})
// Creates C-E-G sequence
```

**Slide** - chromatic approach:

```js
slide = jm.theory.harmony.Ornament.apply(note, "slide", {
  targetPitch: 65,  // F
  chromatic: true
})
// Creates C-C#-D-D#-E-F chromatic run
```

### Voice

Create chords from pitch lists:

```js
pitches = [60, 64, 67]  // C-E-G
voice = new jm.theory.harmony.Voice(pitches)
chord = voice.toChord({ duration: 2, time: 0 })
// → { pitch: [60, 64, 67], duration: 2, time: 0 }
```

### Progression

Generate chord progressions using circle of fifths:

```js
progression = new jm.theory.harmony.Progression("C", "major", "fifths")
chords = progression.generate({
  length: 4,        // 4 chords
  degrees: [0, 3, 4, 0]  // I-IV-V-I progression
})
```

Or create random progressions:

```js
progression = new jm.theory.harmony.Progression("C", "major", "fifths")
randomChords = progression.generate({
  length: 8,
  random: true
})
```

### Rhythms

Generate rhythmic patterns:

```js
rhythm = new jm.theory.rhythm.Rhythm()
durations = rhythm.generate(8, {
  distribution: "euclidean",
  pulses: 5
})
// Distributes 5 beats evenly across 8 positions
```

---

## 2.3 Putting it all together

Let's compose a short piece using everything we've learned:

```js
// Create the scale
scale = new jm.theory.harmony.Scale("C", "major")
pitches = scale.generate({ octave: 4 })

// Generate a melody
melody = pitches.slice(0, 5).map((pitch, i) => ({
  pitch,
  duration: 0.5,
  time: i * 0.5
}))

// Add an ornament to the last note
lastNote = melody[melody.length - 1]
ornamented = jm.theory.harmony.Ornament.apply(lastNote, "trill", {
  auxiliaryPitch: lastNote.pitch + 2,
  oscillations: 3
})
melody[melody.length - 1] = ornamented

// Create a chord progression for harmony
progression = new jm.theory.harmony.Progression("C", "major", "fifths")
chords = progression.generate({
  length: 3,
  degrees: [0, 3, 0]  // I-IV-I
})

// Convert chords to JMON format
harmonyTrack = chords.map((chord, i) => ({
  pitch: chord.pitches,
  duration: 1,
  time: i
}))

// Compose the piece
composition = {
  metadata: {
    title: "Harmonic Exploration",
    tempo: 100
  },
  tracks: [
    { label: "Melody", notes: melody },
    { label: "Harmony", notes: harmonyTrack }
  ]
}

// Play it!
jm.render(composition)
```

Try modifying the scale, ornament types, or progression degrees to explore different sounds!

---

## What's next?

Now that you understand harmonies, let's explore rhythmic patterns with **[loops and polyrhythms](./03-loops)**.
