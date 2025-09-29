/**
 * @typedef {Object} MandelbrotOptions
 * @property {number} [width=100] - Width of the fractal grid
 * @property {number} [height=100] - Height of the fractal grid
 * @property {number} [maxIterations=100] - Maximum iterations for convergence
 * @property {number} [xMin=-2.5] - Minimum x coordinate
 * @property {number} [xMax=1.5] - Maximum x coordinate
 * @property {number} [yMin=-2.0] - Minimum y coordinate
 * @property {number} [yMax=2.0] - Maximum y coordinate
 */

/**
 * @typedef {Object} ComplexPoint
 * @property {number} real - Real component
 * @property {number} imaginary - Imaginary component
 */

/**
 * Mandelbrot set fractal generator for musical composition
 * Based on the Python djalgo fractal module
 */
export class Mandelbrot {
  /**
   * @param {MandelbrotOptions} [options={}] - Configuration options
   */
  constructor(options = {}) {
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.maxIterations = options.maxIterations || 100;
    this.xMin = options.xMin || -2.5;
    this.xMax = options.xMax || 1.5;
    this.yMin = options.yMin || -2.0;
    this.yMax = options.yMax || 2.0;
  }

  /**
   * Generate Mandelbrot set data
   * @returns {number[][]} 2D array of iteration counts
   */
  generate() {
    const data = [];
    
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const real = this.xMin + (x / this.width) * (this.xMax - this.xMin);
        const imaginary = this.yMin + (y / this.height) * (this.yMax - this.yMin);
        
        const iterations = this.mandelbrotIterations({ real, imaginary });
        row.push(iterations);
      }
      data.push(row);
    }
    
    return data;
  }

  /**
   * Extract sequence from Mandelbrot data using various methods
   * @param {'diagonal'|'border'|'spiral'|'column'|'row'} [method='diagonal'] - Extraction method
   * @param {number} [index=0] - Index for column/row extraction
   * @returns {number[]} Extracted sequence
   */
  extractSequence(method = 'diagonal', index = 0) {
    const data = this.generate();
    
    switch (method) {
      case 'diagonal':
        return this.extractDiagonal(data);
      
      case 'border':
        return this.extractBorder(data);
      
      case 'spiral':
        return this.extractSpiral(data);
      
      case 'column':
        return this.extractColumn(data, index);
      
      case 'row':
        return this.extractRow(data, index);
      
      default:
        return this.extractDiagonal(data);
    }
  }

  /**
   * Calculate Mandelbrot iterations for a complex point
   * @param {ComplexPoint} c - Complex point to test
   * @returns {number} Number of iterations before escape
   */
  mandelbrotIterations(c) {
    let z = { real: 0, imaginary: 0 };
    
    for (let i = 0; i < this.maxIterations; i++) {
      // z = z^2 + c
      const zReal = z.real * z.real - z.imaginary * z.imaginary + c.real;
      const zImaginary = 2 * z.real * z.imaginary + c.imaginary;
      
      z.real = zReal;
      z.imaginary = zImaginary;
      
      // Check if point escapes
      if (z.real * z.real + z.imaginary * z.imaginary > 4) {
        return i;
      }
    }
    
    return this.maxIterations;
  }

  /**
   * Extract diagonal sequence
   * @param {number[][]} data - 2D fractal data
   * @returns {number[]} Diagonal sequence
   */
  extractDiagonal(data) {
    const sequence = [];
    const minDimension = Math.min(data.length, data[0]?.length || 0);
    
    for (let i = 0; i < minDimension; i++) {
      sequence.push(data[i][i]);
    }
    
    return sequence;
  }

  /**
   * Extract border sequence (clockwise)
   * @param {number[][]} data - 2D fractal data
   * @returns {number[]} Border sequence
   */
  extractBorder(data) {
    const sequence = [];
    const height = data.length;
    const width = data[0]?.length || 0;
    
    if (height === 0 || width === 0) return sequence;
    
    // Top row
    for (let x = 0; x < width; x++) {
      sequence.push(data[0][x]);
    }
    
    // Right column (excluding top corner)
    for (let y = 1; y < height; y++) {
      sequence.push(data[y][width - 1]);
    }
    
    // Bottom row (excluding right corner, reverse order)
    if (height > 1) {
      for (let x = width - 2; x >= 0; x--) {
        sequence.push(data[height - 1][x]);
      }
    }
    
    // Left column (excluding corners, reverse order)
    if (width > 1) {
      for (let y = height - 2; y > 0; y--) {
        sequence.push(data[y][0]);
      }
    }
    
    return sequence;
  }

  /**
   * Extract spiral sequence (from outside to inside)
   * @param {number[][]} data - 2D fractal data
   * @returns {number[]} Spiral sequence
   */
  extractSpiral(data) {
    const sequence = [];
    const height = data.length;
    const width = data[0]?.length || 0;
    
    if (height === 0 || width === 0) return sequence;
    
    let top = 0, bottom = height - 1;
    let left = 0, right = width - 1;
    
    while (top <= bottom && left <= right) {
      // Top row
      for (let x = left; x <= right; x++) {
        sequence.push(data[top][x]);
      }
      top++;
      
      // Right column
      for (let y = top; y <= bottom; y++) {
        sequence.push(data[y][right]);
      }
      right--;
      
      // Bottom row
      if (top <= bottom) {
        for (let x = right; x >= left; x--) {
          sequence.push(data[bottom][x]);
        }
        bottom--;
      }
      
      // Left column
      if (left <= right) {
        for (let y = bottom; y >= top; y--) {
          sequence.push(data[y][left]);
        }
        left++;
      }
    }
    
    return sequence;
  }

  /**
   * Extract specific column
   * @param {number[][]} data - 2D fractal data
   * @param {number} columnIndex - Column index to extract
   * @returns {number[]} Column sequence
   */
  extractColumn(data, columnIndex) {
    const sequence = [];
    const width = data[0]?.length || 0;
    const clampedIndex = Math.max(0, Math.min(columnIndex, width - 1));
    
    for (const row of data) {
      if (row[clampedIndex] !== undefined) {
        sequence.push(row[clampedIndex]);
      }
    }
    
    return sequence;
  }

  /**
   * Extract specific row
   * @param {number[][]} data - 2D fractal data
   * @param {number} rowIndex - Row index to extract
   * @returns {number[]} Row sequence
   */
  extractRow(data, rowIndex) {
    const clampedIndex = Math.max(0, Math.min(rowIndex, data.length - 1));
    return data[clampedIndex] ? [...data[clampedIndex]] : [];
  }

  /**
   * Map fractal values to musical scale
   * @param {number[]} sequence - Fractal sequence
   * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Musical scale intervals
   * @param {number} [octaveRange=3] - Number of octaves to span
   * @returns {number[]} MIDI note sequence
   */
  mapToScale(sequence, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
    if (sequence.length === 0) return [];
    
    const minVal = Math.min(...sequence);
    const maxVal = Math.max(...sequence);
    const range = maxVal - minVal || 1;
    
    return sequence.map(value => {
      // Normalize to 0-1
      const normalized = (value - minVal) / range;
      
      // Map to scale indices
      const scaleIndex = Math.floor(normalized * scale.length * octaveRange);
      const octave = Math.floor(scaleIndex / scale.length);
      const noteIndex = scaleIndex % scale.length;
      
      // Convert to MIDI note (C4 = 60)
      return 60 + octave * 12 + scale[noteIndex];
    });
  }

  /**
   * Generate rhythmic pattern from fractal data
   * @param {number[]} sequence - Fractal sequence
   * @param {number[]} [subdivisions=[1, 2, 4, 8, 16]] - Rhythmic subdivisions
   * @returns {number[]} Rhythmic durations
   */
  mapToRhythm(sequence, subdivisions = [1, 2, 4, 8, 16]) {
    if (sequence.length === 0) return [];
    
    const minVal = Math.min(...sequence);
    const maxVal = Math.max(...sequence);
    const range = maxVal - minVal || 1;
    
    return sequence.map(value => {
      const normalized = (value - minVal) / range;
      const subdivisionIndex = Math.floor(normalized * subdivisions.length);
      const clampedIndex = Math.max(0, Math.min(subdivisionIndex, subdivisions.length - 1));
      return 1 / subdivisions[clampedIndex];
    });
  }
}