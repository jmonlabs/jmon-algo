/**
 * Musical analysis utilities for evaluating musical phrases
 * Provides metrics like Gini coefficient, balance, motif analysis, dissonance, etc.
 * Used primarily for genetic algorithm fitness evaluation
 */

/**
 * MusicalIndex
 * Analyzes a musical sequence for various metrics such as rest analysis, pitch/duration statistics, and more.
 *
 * @class
 * @param {Array} sequence - Array of musical values (pitches, durations, etc.)
 */
export class MusicalIndex {
  /**
   * Create a musical index analyzer for a sequence
   * @param {Array} sequence - Array of musical values (pitches, durations, etc.)
   */
  constructor(sequence) {
    this.sequence = sequence.filter((val) => val !== null && val !== undefined);
    this.originalSequence = sequence; // Keep original for rest analysis
  }

  /**
   * Calculate Gini coefficient (measure of inequality/diversity)
   * 0 = perfect equality, 1 = maximum inequality
   * @returns {number} Gini coefficient
   */
  gini() {
    if (this.sequence.length === 0) return 0;

    // Sort sequence
    const sorted = [...this.sequence].sort((a, b) => a - b);
    const n = sorted.length;

    // Calculate Gini coefficient
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (2 * (i + 1) - n - 1) * sorted[i];
    }

    const totalSum = sorted.reduce((acc, val) => acc + val, 0);
    return totalSum === 0 ? 0 : sum / (n * totalSum);
  }

  /**
   * Calculate balance (measure of how evenly distributed values are around the mean)
   * Lower values indicate better balance around the center
   * @returns {number} Balance metric
   */
  balance() {
    if (this.sequence.length === 0) return 0;

    const mean = this.sequence.reduce((sum, val) => sum + val, 0) /
      this.sequence.length;
    const variance =
      this.sequence.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      this.sequence.length;

    // Normalize by mean to make it scale-independent
    return mean === 0 ? 0 : Math.sqrt(variance) / Math.abs(mean);
  }

  /**
   * Calculate motif strength (measure of repetitive patterns)
   * Higher values indicate stronger motif presence
   * @param {number} maxMotifLength - Maximum motif length to consider
   * @returns {number} Motif strength
   */
  motif(maxMotifLength = 4) {
    if (this.sequence.length < 2) return 0;

    const motifCounts = new Map();
    let totalMotifs = 0;

    // Check all possible motif lengths
    for (
      let length = 2;
      length <= Math.min(maxMotifLength, this.sequence.length);
      length++
    ) {
      for (let i = 0; i <= this.sequence.length - length; i++) {
        const motif = this.sequence.slice(i, i + length).join(",");
        motifCounts.set(motif, (motifCounts.get(motif) || 0) + 1);
        totalMotifs++;
      }
    }

    // Calculate motif strength as sum of squared frequencies
    let motifStrength = 0;
    for (const count of motifCounts.values()) {
      if (count > 1) { // Only count repeated motifs
        motifStrength += count * count;
      }
    }

    return totalMotifs === 0 ? 0 : motifStrength / totalMotifs;
  }

  /**
   * Calculate dissonance relative to a musical scale
   * 0 = all notes in scale, higher values = more dissonance
   * @param {Array} scale - Array of pitches considered consonant
   * @returns {number} Dissonance level
   */
  dissonance(scale) {
    if (!scale || scale.length === 0 || this.sequence.length === 0) return 0;

    // Convert scale to set of pitch classes (mod 12)
    const scaleClasses = new Set(scale.map((pitch) => pitch % 12));

    let dissonantNotes = 0;
    for (const pitch of this.sequence) {
      if (pitch !== null && pitch !== undefined) {
        const pitchClass = pitch % 12;
        if (!scaleClasses.has(pitchClass)) {
          dissonantNotes++;
        }
      }
    }

    return dissonantNotes / this.sequence.length;
  }

  /**
   * Calculate rhythmic fitness (how well durations fit within measure boundaries)
   * 1 = perfect fit, lower values = poor rhythmic alignment
   * @param {number} measureLength - Length of a measure in beats
   * @returns {number} Rhythmic fitness
   */
  rhythmic(measureLength = 4) {
    if (this.sequence.length === 0) return 0;

    let currentBeat = 0;
    let rhythmicErrors = 0;
    const totalDuration = this.sequence.reduce(
      (sum, duration) => sum + duration,
      0,
    );

    // Check if durations align well with measure boundaries
    for (const duration of this.sequence) {
      // Check if note crosses measure boundary awkwardly
      const nextBeat = currentBeat + duration;
      const currentMeasure = Math.floor(currentBeat / measureLength);
      const nextMeasure = Math.floor(nextBeat / measureLength);

      if (currentMeasure !== nextMeasure) {
        // Note crosses measure boundary
        const remainingInMeasure = measureLength -
          (currentBeat % measureLength);
        if (remainingInMeasure < duration && remainingInMeasure > 0) {
          // Note doesn't fill the remaining measure completely
          rhythmicErrors += Math.min(
            remainingInMeasure,
            duration - remainingInMeasure,
          );
        }
      }

      currentBeat = nextBeat;
    }

    // Calculate rhythmic fitness (1 = perfect, 0 = worst)
    return totalDuration === 0 ? 0 : 1 - (rhythmicErrors / totalDuration);
  }

  /**
   * Calculate proportion of rests in the sequence
   * @returns {number} Proportion of rests (0-1)
   */
  restProportion() {
    if (this.originalSequence.length === 0) return 0;

    const restCount =
      this.originalSequence.filter((val) => val === null || val === undefined)
        .length;
    return restCount / this.originalSequence.length;
  }

  /**
   * Calculate all metrics at once for efficiency
   * @param {Array} scale - Musical scale for dissonance calculation
   * @param {number} measureLength - Measure length for rhythmic analysis
   * @returns {Object} All calculated metrics
   */
  calculateAll(scale = null, measureLength = 4) {
    return {
      gini: this.gini(),
      balance: this.balance(),
      motif: this.motif(),
      dissonance: scale ? this.dissonance(scale) : 0,
      rhythmic: this.rhythmic(measureLength),
      rest: this.restProportion(),
    };
  }

  /**
   * Calculate statistical properties of the sequence
   * @returns {Object} Statistical properties
   */
  getStats() {
    if (this.sequence.length === 0) {
      return { mean: 0, std: 0, min: 0, max: 0, range: 0 };
    }

    const mean = this.sequence.reduce((sum, val) => sum + val, 0) /
      this.sequence.length;
    const variance =
      this.sequence.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      this.sequence.length;
    const std = Math.sqrt(variance);
    const min = Math.min(...this.sequence);
    const max = Math.max(...this.sequence);

    return {
      mean,
      std,
      min,
      max,
      range: max - min,
    };
  }

  /**
   * Compare two sequences and return similarity score
   * @param {MusicalIndex} other - Another MusicalIndex to compare with
   * @param {Array} scale - Scale for dissonance comparison
   * @param {number} measureLength - Measure length for rhythmic comparison
   * @returns {number} Similarity score (0-1, higher is more similar)
   */
  similarity(other, scale = null, measureLength = 4) {
    const metrics1 = this.calculateAll(scale, measureLength);
    const metrics2 = other.calculateAll(scale, measureLength);

    let totalSimilarity = 0;
    let count = 0;

    for (const [key, value1] of Object.entries(metrics1)) {
      const value2 = metrics2[key];
      if (typeof value1 === "number" && typeof value2 === "number") {
        // Calculate similarity as 1 - normalized difference
        const maxVal = Math.max(Math.abs(value1), Math.abs(value2), 1);
        const similarity = 1 - Math.abs(value1 - value2) / maxVal;
        totalSimilarity += similarity;
        count++;
      }
    }

    return count === 0 ? 0 : totalSimilarity / count;
  }
}
