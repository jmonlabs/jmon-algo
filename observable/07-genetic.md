# 7. Genetic algorithms

```js
jm = require("algo@latest")
```

Genetic algorithms use natural selection to evolve musical ideas. Think of it like breeding plants - you start with seeds, let them grow, keep the best ones, cross-pollinate, add some mutations, and repeat.

In music, we evolve **phrases** toward a desired aesthetic using **fitness functions** that measure musical qualities.

---

## The evolutionary process

1. **Initialize**: Start with a population of musical phrases
2. **Evaluate**: Score each phrase using fitness functions
3. **Select**: Keep the best-performing phrases
4. **Crossover**: Combine genetic material from parents
5. **Mutate**: Introduce random variations
6. **Repeat**: Iterate until convergence or max generations

Think of it as survival of the fittest, but for melodies.

---

## The Darwin class

algo's `Darwin` class handles the evolution:

```js
darwin = new jm.generative.genetic.Darwin({
  populationSize: 200,        // Number of phrases
  generations: 100,           // Evolution iterations
  mutationRate: 0.1,          // Probability of mutation
  crossoverRate: 0.7,         // Probability of crossover
  elitism: 0.1                // Preserve top 10%
})
```

---

## Fitness functions

Fitness functions measure how "good" a phrase is. algo provides 11+ metrics via `MusicalAnalysis`:

**Diversity metrics:**
- `gini` - inequality in note attributes (0 = equal, 1 = very unequal)
- `balance` - symmetry of note distribution (0.5 = centered)

**Melodic metrics:**
- `motif` - repetition and development
- `intervalVariance` - melodic contour variation
- `contourEntropy` - unpredictability of direction changes

**Harmonic metrics:**
- `dissonance` - consonance vs. dissonance balance

**Rhythmic metrics:**
- `rhythmic` - rhythm complexity and regularity
- `syncopation` - off-beat emphasis
- `density` - note density over time
- `gapVariance` - variation in silence between notes

**Mathematical:**
- `fibonacci` - proximity to golden ratio patterns
- `autocorrelation` - self-similarity over time

---

## Setting up evolution

Let's evolve "Twinkle, Twinkle Little Star" toward specific musical goals.

### 1. Define the seed phrase

```js
// Original melody in C major
seed = [
  { pitch: 60, duration: 0.5, time: 0.0 },    // C
  { pitch: 60, duration: 0.5, time: 0.5 },    // C
  { pitch: 67, duration: 0.5, time: 1.0 },    // G
  { pitch: 67, duration: 0.5, time: 1.5 },    // G
  { pitch: 69, duration: 0.5, time: 2.0 },    // A
  { pitch: 69, duration: 0.5, time: 2.5 },    // A
  { pitch: 67, duration: 1.0, time: 3.0 }     // G
]
```

### 2. Define target fitness values

What qualities do we want?

```js
targets = {
  gini: 0.3,              // Moderate inequality
  balance: 0.5,           // Centered
  motif: 0.6,             // Some repetition
  dissonance: 0.2,        // Mostly consonant
  rhythmic: 0.4,          // Moderate rhythm complexity
  fibonacci: 0.7,         // Fibonacci-like proportions
  syncopation: 0.1,       // Minimal syncopation
  intervalVariance: 0.5,  // Moderate melodic variation
  density: 0.6,           // Moderate note density
  gapVariance: 0.3,       // Some rhythmic variety
  contourEntropy: 0.5     // Moderate unpredictability
}
```

### 3. Set metric weights

How important is each metric?

```js
weights = {
  gini: 1.0,
  balance: 1.5,           // More important
  motif: 2.0,             // Very important
  dissonance: 1.0,
  rhythmic: 1.0,
  fibonacci: 0.5,         // Less important
  syncopation: 0.5,
  intervalVariance: 1.5,
  density: 1.0,
  gapVariance: 1.0,
  contourEntropy: 1.0,
  rest: 1.0               // Important: handle rests properly
}
```

### 4. Configure mutation parameters

How should phrases mutate?

```js
mutationConfig = {
  pitchMutation: {
    enabled: true,
    distribution: "normal",
    stdDev: 2              // Standard deviation in semitones
  },
  durationMutation: {
    enabled: true,
    distribution: "exponential",
    lambda: 2
  },
  noteDeletion: {
    enabled: true,
    probability: 0.05      // 5% chance to delete note
  },
  noteInsertion: {
    enabled: true,
    probability: 0.05,     // 5% chance to insert note
    distribution: "poisson",
    lambda: 3
  }
}
```

---

## Running evolution

```js
// Initialize Darwin with our configuration
darwin = new jm.generative.genetic.Darwin({
  seedPhrase: seed,
  targets,
  weights,
  mutationConfig,
  populationSize: 200,
  generations: 100,
  mutationRate: 0.15,
  crossoverRate: 0.7,
  elitism: 0.1,
  scale: new jm.theory.harmony.Scale("C", "major")
})

// Evolve!
result = darwin.evolve()

// result contains:
// - bestPhrase: the winning melody
// - history: fitness scores over generations
// - population: final population
```

---

## Analyzing results

```js
// Get the evolved melody
evolvedMelody = result.bestPhrase

// Calculate fitness metrics
analysis = jm.analysis.MusicalAnalysis.analyze(evolvedMelody)

// Compare with targets
comparison = Object.keys(targets).map(metric => ({
  metric,
  target: targets[metric],
  original: jm.analysis.MusicalAnalysis[metric](seed),
  evolved: analysis[metric]
}))

// Visualize improvement
Plot.plot({
  marks: [
    Plot.barY(comparison, {
      x: "metric",
      y: "evolved",
      fill: "steelblue"
    }),
    Plot.ruleY(comparison, {
      y: "target",
      stroke: "red",
      strokeDasharray: "4,4"
    }),
    Plot.dot(comparison, {
      x: "metric",
      y: "original",
      fill: "gray"
    })
  ],
  y: { label: "Fitness score" },
  x: { label: "Metric" }
})
```

### Fitness over generations

```js
// Plot how fitness improved
Plot.plot({
  marks: [
    Plot.lineY(result.history, {
      x: (d, i) => i,
      y: "bestFitness",
      stroke: "steelblue"
    }),
    Plot.lineY(result.history, {
      x: (d, i) => i,
      y: "avgFitness",
      stroke: "gray",
      strokeDasharray: "2,2"
    })
  ],
  y: { label: "Fitness score" },
  x: { label: "Generation" }
})
```

You'll see fitness improve over generations as the algorithm finds better variations.

---

## Playing the results

```js
composition = {
  metadata: {
    title: "Evolved Melody",
    tempo: 120
  },
  tracks: [
    { label: "Original", notes: seed },
    { label: "Evolved", notes: evolvedMelody }
  ]
}

jm.render(composition)
```

Listen to how the melody evolved! It should maintain recognizable elements while moving toward your target aesthetic.

---

## Multi-objective evolution

You can evolve toward multiple competing goals:

```js
// Maximize both motif repetition AND contour entropy
// (repetitive but unpredictable - interesting tension!)
targets = {
  motif: 0.8,             // High repetition
  contourEntropy: 0.7,    // High unpredictability
  balance: 0.5
}

weights = {
  motif: 2.0,             // Prioritize both
  contourEntropy: 2.0,
  balance: 1.0
}

// Evolution will find a compromise
```

---

## Creative applications

**Genre transformation**: Evolve a classical melody toward jazz characteristics (high syncopation, dissonance)

**Variation generation**: Start with a theme, evolve multiple variations with different target aesthetics

**Style transfer**: Analyze metrics from your favorite composer's works, use as evolution targets

**Interactive breeding**: Let users select favorite variations, use as parents for next generation

---

## The philosophical angle

Genetic algorithms raise interesting questions:

- Can we quantify "good" music?
- Do fitness functions capture aesthetic experience?
- Is evolved music still creative?

The answer: fitness functions are **tools**, not rules. They help explore musical space, but your ears are the final judge. Use evolution to discover ideas you wouldn't find otherwise, then refine by hand.

---

## Complete example

```js
// Load library
jm = require("algo@latest")

// Define seed
seed = [
  { pitch: 60, duration: 0.5, time: 0.0 },
  { pitch: 62, duration: 0.5, time: 0.5 },
  { pitch: 64, duration: 0.5, time: 1.0 },
  { pitch: 65, duration: 0.5, time: 1.5 }
]

// Configure evolution
darwin = new jm.generative.genetic.Darwin({
  seedPhrase: seed,
  targets: {
    gini: 0.3,
    balance: 0.5,
    motif: 0.7,
    dissonance: 0.2
  },
  weights: {
    gini: 1.0,
    balance: 1.5,
    motif: 2.0,
    dissonance: 1.0,
    rest: 1.0
  },
  populationSize: 100,
  generations: 50,
  mutationRate: 0.1,
  scale: new jm.theory.harmony.Scale("C", "major")
})

// Evolve
result = darwin.evolve()

// Play
composition = {
  metadata: { title: "Evolved" },
  tracks: [{ label: "Result", notes: result.bestPhrase }]
}

jm.render(composition)
```

---

## What you've learned

You've now explored all major algorithmic composition techniques in algo:

1. **[Getting started](./01-getting-started)** - JMON format basics
2. **[Harmonies](./02-harmony)** - Scales, chords, ornaments
3. **[Loops](./03-loops)** - Rhythmic patterns, polyrhythms
4. **[Minimalism](./04-minimalism)** - Process music, tintinnabuli
5. **[Walks](./05-walks)** - Random walks, Markov chains
6. **[Fractals](./06-fractals)** - CA, Mandelbrot, logistic map
7. **Genetic algorithms** ← You are here

You now have the tools to create:
- Structured harmonic progressions
- Complex rhythmic textures
- Evolving minimalist processes
- Probabilistic variations
- Fractal patterns
- Evolutionary composition

**The only limit is your imagination.** Start composing!
