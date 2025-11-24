# Contributing to jmon/algo

Thank you for your interest in contributing to jmon/algo! This document outlines our API design principles, coding standards, and contribution workflow.

## API Design Guidelines

### Core Principles

1. **Simplicity First** - Prefer simple, obvious APIs over clever abstractions
2. **No Code Duplication** - Extract common patterns but don't over-abstract
3. **Observable-Ready** - All features should work seamlessly in Observable notebooks
4. **Consistent Patterns** - Follow established patterns throughout the codebase

### Class Design Patterns

We use three patterns consistently across the codebase:

#### 1. **STATIC Pattern** (Pure Functions)

Use static methods for **stateless operations** and **pure functions**.

```javascript
// ✓ Good: Articulation uses static methods (no state needed)
export class Articulation {
  static apply(notes, index, type, params = {}) {
    // Pure function - takes input, returns new output
    return transformedNotes;
  }

  static getAvailableTypes() {
    return Object.entries(ARTICULATION_TYPES);
  }
}

// Usage
const notes = Articulation.apply(melody, 2, 'staccato');
```

**When to use:**
- Pure transformation functions
- Validation methods
- Utility functions that don't need state
- Constants or data queries

#### 2. **INSTANCE Pattern** (Stateful Classes)

Use instance methods for **stateful objects** that maintain configuration.

```javascript
// ✓ Good: Darwin uses instances (maintains population, config)
export class Darwin {
  constructor(config = {}) {
    this.populationSize = config.populationSize || 50;
    this.mutationRate = config.mutationRate || 0.05;
    // ... state
  }

  generate(generations) {
    // Uses instance state
    return this.evolvePopulation(generations);
  }
}

// Usage
const ga = new Darwin({ populationSize: 100 });
const result = ga.generate(50);
```

**When to use:**
- Algorithms with configuration
- Objects that maintain state across calls
- Generators that track history
- Complex workflows requiring multiple steps

#### 3. **MIXED Pattern** (Instances + Static Helpers)

Use both instance AND static methods when you have **stateful operations** plus **useful utilities**.

```javascript
// ✓ Good: Loop has instances + static factory methods
export class Loop {
  constructor(loops, measureLength = 4) {
    this.loops = loops;
    this.measureLength = measureLength;
  }

  toJMonSequences() {
    // Instance method using state
    return this.generateSequences();
  }

  // Static factory/utility methods
  static fromTrack(track) {
    return new Loop([track]);
  }

  static euclidean(steps, pulses) {
    const rhythm = generateEuclidean(steps, pulses);
    return new Loop([rhythm]);
  }
}

// Usage
const loop1 = new Loop([track1, track2]);
const loop2 = Loop.fromTrack(track);  // Factory method
const loop3 = Loop.euclidean(16, 5);  // Utility
```

**When to use:**
- Classes need instances for state
- Static factory methods improve ergonomics
- Utility helpers relate to the class

### Naming Conventions

```javascript
// Classes: PascalCase
export class CellularAutomata { }
export class RandomWalk { }

// Functions and methods: camelCase
function generateScale() { }
static apply(notes, index) { }

// Constants: SCREAMING_SNAKE_CASE
export const ARTICULATION_TYPES = { };
export const DEFAULT_TEMPO = 120;

// Private methods: _prefixedCamelCase
static _applyStaccato(notes, index) { }
_calculateFitness(individual) { }
```

### Error Handling

Use **clear, actionable error messages** with context:

```javascript
// ❌ Bad
throw new Error('Invalid input');

// ✓ Good
throw new Error(
  `Invalid note index: ${index}. Must be between 0 and ${notes.length - 1}`
);

// ✓ Better (with suggestions)
throw new Error(
  `Unknown constant category: ${category}. ` +
  `Available: ${this.list().join(', ')}`
);
```

**Error message format:**
1. What went wrong
2. What was provided (if relevant)
3. What's expected or available options

### Observable Compatibility

All public APIs must work in Observable notebooks:

```javascript
// ✓ Works in Observable
import jm from "https://esm.sh/jsr/@jmon/algo"

// Direct instantiation
const ca = new jm.generative.automata.Cellular(110, 64, 40)

// No hidden global state
const walk1 = new jm.generative.walks.Random()
const walk2 = new jm.generative.walks.Random()  // Independent

// Clean, exported constants
jm.constants.listArticulations()
// => ['staccato', 'accent', ...]
```

**Requirements:**
- No hidden singletons or global state
- Pure functions or explicit instances
- All dependencies passed as parameters
- Export everything users might need

### JSDoc Standards

Every public class and method needs JSDoc with Observable examples:

```javascript
/**
 * Apply articulation to notes in a musical sequence
 *
 * @param {Array} notes - Array of JMON note objects
 * @param {number|Array} noteIndex - Note index or array of indices
 * @param {string} articulationType - Type of articulation to apply
 * @param {Object} params - Parameters for complex articulations
 * @returns {Array} New array with articulation applied
 *
 * @example Browser/Observable
 * ```js
 * import jm from "https://esm.sh/jsr/@jmon/algo"
 *
 * const melody = [
 *   {pitch: 60, duration: 1, time: 0},
 *   {pitch: 62, duration: 1, time: 1}
 * ]
 *
 * const staccato = jm.theory.harmony.Articulation.apply(
 *   melody, 0, 'staccato'
 * )
 * ```
 *
 * @example Node.js
 * ```js
 * import { jm } from '@jmon/algo'
 * const result = jm.theory.harmony.Articulation.apply(notes, 0, 'accent')
 * ```
 */
```

**JSDoc checklist:**
- [ ] Clear description of what it does
- [ ] All parameters documented with types
- [ ] Return value documented
- [ ] Observable example (if applicable)
- [ ] Node.js example (if different)
- [ ] Common use cases shown

### Constants and Configuration

Keep constants discoverable and well-documented:

```javascript
// ✓ Good: Exported and documented
export const ARTICULATION_TYPES = {
  'staccato': {
    complex: false,
    description: 'Shortens note duration to ~50%'
  },
  // ...
};

// ✓ Good: Convenience methods
jm.constants.list()          // List all categories
jm.constants.get('scales')   // Get scales
jm.constants.search('slide') // Search by keyword
```

## Testing

Every new feature needs tests:

```javascript
// test-feature.html for browser tests
// test-feature.js for Node/Deno tests
// src/**/__tests__/*.test.js for unit tests
```

## Commit Guidelines

```bash
# Format: <type>: <description>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation only
style:    # Formatting, no code change
refactor: # Code change that neither fixes a bug nor adds a feature
perf:     # Performance improvement
test:     # Adding tests
chore:    # Maintenance

# Examples
feat: Add convenience methods to constants API
fix: Correct glissando articulation in MIDI export
docs: Add Observable examples to Articulation JSDoc
refactor: Simplify error messages across converters
```

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines above
3. **Add tests** for new functionality
4. **Update documentation** (JSDoc, README if needed)
5. **Rebuild** with `node build.mjs`
6. **Test** in browser and Node
7. **Commit** with clear messages
8. **Push** and create a Pull Request

## Questions?

Feel free to open an issue for:
- API design questions
- Clarification on guidelines
- Suggesting improvements to this document

Thank you for contributing! 🎵
