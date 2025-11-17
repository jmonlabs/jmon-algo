# 5. Walks

```js
jm = require("algo@latest")
```

In this chapter, we explore **stochastic processes** - musical paths guided by probability. Think of it like taking a random walk through a garden: at each step, you choose a direction based on certain rules, but there's still an element of chance.

Composers like Iannis Xenakis (*Mikka*) and Karlheinz Stockhausen (*Klavierstück XI*) used controlled randomness to create music that's both structured and unpredictable.

---

## Probability distributions

When we say "random," we don't mean chaotic. Randomness follows rules - **probability distributions** that shape outcomes:

- **Uniform**: all values equally likely
- **Normal** (Gaussian): cluster around a mean, with fewer extreme values
- **Poisson**: models discrete events (good for note densities)
- **Exponential**: models waiting times between events

These distributions let us create controlled randomness - music that's unpredictable but still coherent.

---

## Random walks

A **random walk** is a path where each step depends on the previous position plus some random change:

```js
walk = new jm.generative.walks.RandomWalk({
  start: 60,           // Start at middle C
  min: 48,             // Lowest note (C2)
  max: 84,             // Highest note (C6)
  stepSize: 2,         // Move by whole steps
  distribution: "normal"
})

pitches = walk.generate(16)  // Generate 16 notes
// → [60, 62, 61, 63, 62, 64, ...]
```

Map to a scale for more musical results:

```js
scale = new jm.theory.harmony.Scale("C", "major")
scalePitches = scale.generate({ octave: 4 })

// Map walk values to scale degrees
melodyPitches = pitches.map(p => {
  let degree = Math.abs(p - 60) % scalePitches.length
  return scalePitches[degree]
})
```

---

## Markov chains

A **Markov chain** makes decisions based on the current state. The `Chain` class creates bounded random walks with:

- **Branching**: paths can split (polyphony)
- **Merging**: paths can converge back together
- **Transition probabilities**: control step sizes

```js
chain = new jm.generative.walks.Chain({
  min: 0,
  max: 12,              // One octave range
  start: 4,             // Start at scale degree 4
  steps: 20,
  stepProbability: [0.3, 0.4, 0.3],  // [down, stay, up]
  branchProbability: 0.1,  // 10% chance to branch
  mergeProbability: 0.05   // 5% chance to merge
})

paths = chain.generate()

// Convert to pitches
scale = new jm.theory.harmony.Scale("D", "minor")
scalePitches = scale.generate({ octave: 4 })

tracks = paths.map((path, i) => ({
  label: `Voice ${i + 1}`,
  notes: path.map((degree, j) => ({
    pitch: scalePitches[degree % scalePitches.length],
    duration: 0.5,
    time: j * 0.5
  }))
}))
```

This creates evolving polyphonic textures where voices split and merge organically.

---

## Phasor systems

A **phasor** represents circular motion - like a point rotating around a circle. Musical phasors create evolving patterns:

```js
phasor = new jm.generative.walks.PhasorWalk({
  radius: 5,           // Distance from center
  frequency: 1,        // Rotation speed
  phase: 0             // Starting angle
})

// Simulate 32 steps
values = phasor.simulate(32)

// Map to scale degrees
scale = new jm.theory.harmony.Scale("C", "major")
scalePitches = scale.generate({ octave: 4 })

notes = values.map((val, i) => {
  // Normalize phasor output to scale range
  let normalized = (val + phasor.radius) / (2 * phasor.radius)
  let degree = Math.floor(normalized * scalePitches.length)

  return {
    pitch: scalePitches[degree % scalePitches.length],
    duration: 0.25,
    time: i * 0.25
  }
})
```

Multiple phasors with different frequencies create complex, periodic patterns.

---

## Fibonacci walks

Map the Fibonacci sequence to musical degrees:

```js
// Generate Fibonacci numbers
fibonacci = [1, 1]
for (let i = 2; i < 16; i++) {
  fibonacci.push(fibonacci[i-1] + fibonacci[i-2])
}

// Map to scale degrees
scale = new jm.theory.harmony.Scale("E", "minor")
scalePitches = scale.generate({ octave: 4 })

notes = fibonacci.map((fib, i) => ({
  pitch: scalePitches[(fib - 1) % scalePitches.length],
  duration: 0.5,
  time: i * 0.5
}))
```

The Fibonacci sequence creates natural-sounding melodic contours.

---

## Gaussian processes

**Note**: Gaussian processes in algo integrate with an external GP package. The basic idea: create smooth variations based on existing patterns.

For now, we can use simple interpolation to create Gaussian-like smooth walks:

```js
// Start with key points
keyPoints = [60, 67, 64, 69, 65]

// Interpolate smoothly between them
smoothWalk = []
for (let i = 0; i < keyPoints.length - 1; i++) {
  let start = keyPoints[i]
  let end = keyPoints[i + 1]
  let steps = 4

  for (let j = 0; j < steps; j++) {
    let t = j / steps
    let pitch = Math.round(start + (end - start) * t)
    smoothWalk.push({
      pitch,
      duration: 0.25,
      time: (i * steps + j) * 0.25
    })
  }
}
```

This creates smooth transitions between key points - useful for melodic development.

---

## Putting it together

Let's create a piece combining different walk types:

```js
// Random walk for melody
randomWalk = new jm.generative.walks.RandomWalk({
  start: 60,
  min: 55,
  max: 72,
  stepSize: 2,
  distribution: "normal"
})

melodyPitches = randomWalk.generate(32)
melody = melodyPitches.map((pitch, i) => ({
  pitch,
  duration: 0.25,
  time: i * 0.25
}))

// Markov chain for harmony (slower moving)
chain = new jm.generative.walks.Chain({
  min: 0,
  max: 7,
  start: 0,
  steps: 8,
  stepProbability: [0.2, 0.6, 0.2]
})

paths = chain.generate()
scale = new jm.theory.harmony.Scale("C", "major")
scalePitches = scale.generate({ octave: 3 })

harmony = paths[0].map((degree, i) => ({
  pitch: scalePitches[degree],
  duration: 1,
  time: i
}))

// Phasor for bass line
phasor = new jm.generative.walks.PhasorWalk({
  radius: 3,
  frequency: 0.5,
  phase: 0
})

phasorValues = phasor.simulate(16)
bassScale = scale.generate({ octave: 2 })

bass = phasorValues.map((val, i) => {
  let normalized = (val + phasor.radius) / (2 * phasor.radius)
  let degree = Math.floor(normalized * bassScale.length)

  return {
    pitch: bassScale[degree % bassScale.length],
    duration: 0.5,
    time: i * 0.5
  }
})

composition = {
  metadata: {
    title: "Stochastic Walks",
    tempo: 100
  },
  tracks: [
    { label: "Random Walk", notes: melody },
    { label: "Markov Chain", notes: harmony },
    { label: "Phasor Bass", notes: bass }
  ]
}

jm.render(composition)
```

---

## Historical note

Composers have used randomness for centuries:
- Mozart's *Musikalisches Würfelspiel* (dice music)
- John Cage's chance operations
- Xenakis's stochastic composition
- Stockhausen's moment form

Controlled randomness lets you explore musical spaces you might never find through deliberate composition alone.

---

## What's next?

We've explored stochastic processes. Next, let's dive into **[fractals and chaos](./06-fractals)** - deterministic systems that create complex, self-similar patterns.
