// JMON timing utilities
import {
  offsetToBarsBeatsTicks,
  barsBeatsTicksToOffset,
  notesToTrack,
  DEFAULT_TIMING_CONFIG
} from '../../utils/jmon-timing.js';

/**
 * @typedef {'additive'|'subtractive'} MinimalismOperation
 */

/**
 * @typedef {'forward'|'backward'|'inward'|'outward'} MinimalismDirection
 */

/**
 * @typedef {Object} MinimalismOptions
 * @property {MinimalismOperation} operation - Operation type
 * @property {MinimalismDirection} direction - Direction
 * @property {number} repetition - Repetition count
 * @property {Object} [timingConfig] - Timing configuration (mainly for display conversion)
 */

/**
 * Implementation of musical minimalism processes based on the Python djalgo library
 * Supports additive and subtractive operations in four directions
 */
export class MinimalismProcess {
  operation;
  direction;
  repetition;
  timingConfig;
  sequence = [];

  constructor(options) {
    const { operation, direction, repetition, timingConfig = DEFAULT_TIMING_CONFIG } = options;
    
    if (!['additive', 'subtractive'].includes(operation)) {
      throw new Error("Invalid operation. Choose 'additive' or 'subtractive'.");
    }
    
    if (!['forward', 'backward', 'inward', 'outward'].includes(direction)) {
      throw new Error("Invalid direction. Choose 'forward', 'backward', 'inward' or 'outward'.");
    }
    
    if (repetition < 0 || !Number.isInteger(repetition)) {
      throw new Error("Invalid repetition value. Must be an integer greater than or equal to 0.");
    }
    
    this.operation = operation;
    this.direction = direction;
    this.repetition = repetition;
    this.timingConfig = timingConfig;
  }

  /**
   * Generate processed sequence based on operation and direction
   * Accepts either:
   * - JMON note objects: { pitch, duration, time }
   * - Legacy objects: { pitch, duration, offset }
   * - Legacy tuples: [pitch, duration, offset]
   * Returns: JMON note objects with numeric time (quarter notes)
   */
  generate(sequence) {
    // Normalize input to objects with numeric 'offset' in beats for internal processing
    this.sequence = this.normalizeInput(sequence);

    let processed;
    
    if (this.operation === 'additive' && this.direction === 'forward') {
      processed = this.additiveForward();
    } else if (this.operation === 'additive' && this.direction === 'backward') {
      processed = this.additiveBackward();
    } else if (this.operation === 'additive' && this.direction === 'inward') {
      processed = this.additiveInward();
    } else if (this.operation === 'additive' && this.direction === 'outward') {
      processed = this.additiveOutward();
    } else if (this.operation === 'subtractive' && this.direction === 'forward') {
      processed = this.subtractiveForward();
    } else if (this.operation === 'subtractive' && this.direction === 'backward') {
      processed = this.subtractiveBackward();
    } else if (this.operation === 'subtractive' && this.direction === 'inward') {
      processed = this.subtractiveInward();
    } else if (this.operation === 'subtractive' && this.direction === 'outward') {
      processed = this.subtractiveOutward();
    } else {
      throw new Error('Invalid operation/direction combination');
    }

    // Adjust offsets based on durations and return JMON-compliant notes
    // Always use numeric time in quarter notes
    const withOffsets = this.adjustOffsets(processed);
    return this.toJmonNotes(withOffsets, false);
  }

  additiveForward() {
    const processed = [];
    
    for (let i = 0; i < this.sequence.length; i++) {
      const segment = this.sequence.slice(0, i + 1);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  additiveBackward() {
    const processed = [];
    
    for (let i = this.sequence.length; i > 0; i--) {
      const segment = this.sequence.slice(i - 1);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  additiveInward() {
    const processed = [];
    const n = this.sequence.length;
    
    for (let i = 0; i < Math.ceil(n / 2); i++) {
      let segment;
      
      if (i < n - i - 1) {
        // Combine from start and end
        const leftPart = this.sequence.slice(0, i + 1);
        const rightPart = this.sequence.slice(n - i - 1);
        segment = [...leftPart, ...rightPart];
      } else {
        // Middle element(s)
        segment = [...this.sequence];
      }
      
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  additiveOutward() {
    const processed = [];
    const n = this.sequence.length;
    
    if (n % 2 === 0) {
      // Even length
      const midLeft = Math.floor(n / 2) - 1;
      const midRight = Math.floor(n / 2);
      
      for (let i = 0; i < n / 2; i++) {
        const segment = this.sequence.slice(midLeft - i, midRight + i + 1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
    } else {
      // Odd length
      const mid = Math.floor(n / 2);
      
      for (let i = 0; i <= mid; i++) {
        const segment = this.sequence.slice(mid - i, mid + i + 1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
    }
    
    return processed;
  }

  subtractiveForward() {
    const processed = [];
    
    for (let i = 0; i < this.sequence.length; i++) {
      const segment = this.sequence.slice(i);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  subtractiveBackward() {
    const processed = [];
    
    for (let i = this.sequence.length; i > 0; i--) {
      const segment = this.sequence.slice(0, i);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  subtractiveInward() {
    const processed = [];
    const n = this.sequence.length;
    const steps = Math.floor(n / 2);
    
    // Start with full sequence
    for (let rep = 0; rep <= this.repetition; rep++) {
      processed.push(...this.sequence);
    }
    
    // Remove elements from both ends
    for (let i = 1; i <= steps; i++) {
      const segment = this.sequence.slice(i, n - i);
      if (segment.length > 0) {
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
    }
    
    return processed;
  }

  subtractiveOutward() {
    const processed = [];
    let segment = [...this.sequence];
    
    // Start with full sequence
    for (let rep = 0; rep <= this.repetition; rep++) {
      processed.push(...segment);
    }
    
    // Remove first and last elements iteratively
    while (segment.length > 2) {
      segment = segment.slice(1, -1);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  // Normalize heterogenous inputs into objects with pitch, duration, offset (beats)
  normalizeInput(sequence) {
    if (!Array.isArray(sequence)) return [];

    // If tuples [pitch, duration, offset]
    if (Array.isArray(sequence[0])) {
      return sequence.map(([pitch, duration, offset = 0]) => ({ pitch, duration, offset }));
    }

    // If objects
    return sequence.map((n) => {
      const pitch = n.pitch;
      const duration = n.duration;
      // Prefer numeric beats for internal work
      let offset = 0;
      if (typeof n.offset === 'number') offset = n.offset;
      else if (typeof n.time === 'number') offset = n.time;
      else if (typeof n.time === 'string') offset = this.timeToBeats(n.time);
      return { ...n, pitch, duration, offset };
    });
  }

  // Convert beats to bars:beats:ticks using centralized utility
  beatsToTime(beats) {
    return offsetToBarsBeatsTicks(beats, this.timingConfig);
  }

  // Convert bars:beats:ticks to beats using centralized utility
  timeToBeats(timeStr) {
    if (typeof timeStr !== 'string') return Number(timeStr) || 0;
    return barsBeatsTicksToOffset(timeStr, this.timingConfig);
  }

  // After process, recalc offsets sequentially in beats
  adjustOffsets(processed) {
    let currentOffset = 0;
    return processed.map((note) => {
      const newNote = {
        ...note,
        offset: currentOffset,
      };
      currentOffset += note.duration;
      return newNote;
    });
  }

  // Produce JMON notes: { pitch, duration, time }
  // Always use numeric time in quarter notes (like pitch: 60, time: 4.5)
  toJmonNotes(notesWithOffsets, useStringTime = false) {
    return notesWithOffsets.map(({ pitch, duration, offset, ...rest }) => {
      // Remove the old time property to avoid conflicts
      const { time: oldTime, ...cleanRest } = rest;
      return {
        pitch,
        duration,
        time: useStringTime ? this.beatsToTime(offset) : offset,
        ...cleanRest,
      };
    });
  }
  
  /**
   * Generate and convert to JMON track format
   * @param {Array} sequence - Input sequence
   * @param {Object} trackOptions - Track configuration options
   * @param {boolean} trackOptions.useStringTime - Use bars:beats:ticks strings for display (default: numeric)
   * @returns {Object} JMON track object
   */
  generateTrack(sequence, trackOptions = {}) {
    const processedNotes = this.generate(sequence);
    return notesToTrack(processedNotes, {
      timingConfig: this.timingConfig,
      useStringTime: false,
      ...trackOptions
    });
  }
}

/**
 * Tintinnabuli style implementation for modal composition
 * JMON-compliant: accepts mixed inputs, returns JMON notes
 */
export class Tintinnabuli {
  tChord;
  direction;
  rank;
  isAlternate;
  currentDirection;
  timingConfig;

  constructor(
    tChord,
    direction = 'down',
    rank = 0,
    timingConfig = DEFAULT_TIMING_CONFIG
  ) {
    if (!['up', 'down', 'any', 'alternate'].includes(direction)) {
      throw new Error("Invalid direction. Choose 'up', 'down', 'any' or 'alternate'.");
    }
    
    this.tChord = tChord;
    this.isAlternate = direction === 'alternate';
    this.currentDirection = this.isAlternate ? 'up' : direction;
    this.direction = direction;
    this.timingConfig = timingConfig;
    
    if (!Number.isInteger(rank) || rank < 0) {
      throw new Error("Rank must be a non-negative integer.");
    }
    
    this.rank = Math.min(rank, tChord.length - 1);
    
    if (this.rank >= tChord.length) {
      console.warn("Rank exceeds the length of the t-chord. Using last note of the t-chord.");
    }
  }

  /**
   * Generate t-voice from m-voice sequence
   * Accepts: JMON notes, legacy objects, or tuples
   * Returns: JMON notes with numeric time (quarter notes)
   * @param {Array} sequence - Input sequence
   * @param {boolean} useStringTime - Whether to use bars:beats:ticks strings for display (default: false)
   */
  generate(sequence, useStringTime = false) {
    const normalizedSequence = this.normalizeInput(sequence);
    const tVoice = [];
    
    for (const note of normalizedSequence) {
      if (note.pitch === undefined) {
        // Rest note - preserve timing
        const { offset, time: oldTime, ...rest } = note;
        tVoice.push({
          ...rest,
          pitch: undefined,
          time: useStringTime ? this.beatsToTime(offset) : offset
        });
        continue;
      }
      
      const mPitch = note.pitch;
      const differences = this.tChord.map(t => t - mPitch);
      const sortedDifferences = differences
        .map((diff, index) => ({ index, value: diff }))
        .sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
      
      let effectiveRank = this.rank;
      let tVoicePitch;
      
      if (this.currentDirection === 'up' || this.currentDirection === 'down') {
        const filteredDifferences = sortedDifferences.filter(({ value }) =>
          this.currentDirection === 'up' ? value >= 0 : value <= 0
        );
        
        if (filteredDifferences.length === 0) {
          // No notes in desired direction, use extreme note
          tVoicePitch = this.currentDirection === 'up' 
            ? Math.max(...this.tChord) 
            : Math.min(...this.tChord);
        } else {
          if (effectiveRank >= filteredDifferences.length) {
            effectiveRank = filteredDifferences.length - 1;
          }
          const chosenIndex = filteredDifferences[effectiveRank].index;
          tVoicePitch = this.tChord[chosenIndex];
        }
      } else { // 'any'
        if (effectiveRank >= sortedDifferences.length) {
          effectiveRank = sortedDifferences.length - 1;
        }
        const chosenIndex = sortedDifferences[effectiveRank].index;
        tVoicePitch = this.tChord[chosenIndex];
      }
      
      // Change direction if alternate
      if (this.isAlternate) {
        this.currentDirection = this.currentDirection === 'up' ? 'down' : 'up';
      }
      
      // Output JMON note - use numeric time by default for MIDI consistency
      const { offset, time: oldTime, ...rest } = note;
      tVoice.push({
        ...rest,
        pitch: tVoicePitch,
        time: useStringTime ? this.beatsToTime(offset) : offset
      });
    }
    
    return tVoice;
  }

  // Normalize input like MinimalismProcess
  normalizeInput(sequence) {
    if (!Array.isArray(sequence)) return [];

    // If tuples [pitch, duration, offset]
    if (Array.isArray(sequence[0])) {
      return sequence.map(([pitch, duration, offset = 0]) => ({ pitch, duration, offset }));
    }

    // If objects
    return sequence.map((n) => {
      const pitch = n.pitch;
      const duration = n.duration;
      let offset = 0;
      if (typeof n.offset === 'number') offset = n.offset;
      else if (typeof n.time === 'number') offset = n.time;
      else if (typeof n.time === 'string') offset = this.timeToBeats(n.time);
      return { ...n, pitch, duration, offset };
    });
  }

  // Convert beats to bars:beats:ticks using centralized utility
  beatsToTime(beats) {
    return offsetToBarsBeatsTicks(beats, this.timingConfig);
  }

  // Convert bars:beats:ticks to beats using centralized utility
  timeToBeats(timeStr) {
    if (typeof timeStr !== 'string') return Number(timeStr) || 0;
    return barsBeatsTicksToOffset(timeStr, this.timingConfig);
  }
}
