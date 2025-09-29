import { Matrix } from '../../utils/matrix.js';
import { RBF } from './kernels/rbf.js';
import { sampleMultivariateNormal } from './utils.js';
import { GaussianProcessRegressor } from './GaussianProcessRegressor.js';
import { 
  offsetToBarsBeatsTicks,
  notesToTrack,
  DEFAULT_TIMING_CONFIG 
} from '../../utils/jmon-timing.js';


export class KernelGenerator {
  data;
  lengthScale;
  amplitude;
  noiseLevel;
  walkAround;
  timingConfig;
  isFitted;
  gpr;

  constructor(
    data = [],
    lengthScale = 1.0,
    amplitude = 1.0,
    noiseLevel = 0.1,
    walkAround = false,
    timingConfig = DEFAULT_TIMING_CONFIG
  ) {
    this.data = [...data];
    this.lengthScale = lengthScale;
    this.amplitude = amplitude;
    this.noiseLevel = noiseLevel;
    this.walkAround = walkAround;
    this.timingConfig = timingConfig;
    this.isFitted = false;
    this.gpr = null;
  }

  generate(options = {}) {
    const length = options.length || 100;
    const nsamples = options.nsamples || 1;
    const seed = options.seed;
    const useStringTime = options.useStringTime || false;
    
    if (seed !== undefined) {
      // Set seed for reproducibility (simplified)
      Math.seedrandom = this.seededRandom(seed);
    }

    // If we have data, use fitted GP approach
    if (this.data.length > 0 && Array.isArray(this.data[0])) {
      return this.generateFitted(options);
    }
    
    // Otherwise use unfitted GP approach
    return this.generateUnfitted(options);
  }
  
  /**
   * Generate from unfitted Gaussian Process
   */
  generateUnfitted(options = {}) {
    const length = options.length || 100;
    const nsamples = options.nsamples || 1;
    const lengthScale = options.lengthScale || this.lengthScale;
    const amplitude = options.amplitude || this.amplitude;
    const noiseLevel = options.noiseLevel || this.noiseLevel;
    const useStringTime = options.useStringTime || false;

    const samples = [];
    
    for (let sampleIdx = 0; sampleIdx < nsamples; sampleIdx++) {
      // Create input points
      const X = Array.from({ length }, (_, i) => [i]);
      const XMatrix = new Matrix(X);

      // Create RBF kernel
      const kernel = new RBF(lengthScale, amplitude);
      const K = kernel.call(XMatrix);

      // Add noise to diagonal
      for (let i = 0; i < K.rows; i++) {
        K.set(i, i, K.get(i, i) + noiseLevel);
      }

      // Sample from multivariate normal
      let mean = new Array(length).fill(this.walkAround || 0);
      if (this.walkAround && typeof this.walkAround === 'number') {
        mean = new Array(length).fill(this.walkAround);
      }
      
      const sample = sampleMultivariateNormal(mean, K);
      samples.push(sample);
    }

    return nsamples === 1 ? samples[0] : samples;
  }
  
  /**
   * Generate from fitted Gaussian Process using training data
   */
  generateFitted(options = {}) {
    const length = options.length || 100;
    const nsamples = options.nsamples || 1;
    const lengthScale = options.lengthScale || this.lengthScale;
    const amplitude = options.amplitude || this.amplitude;
    
    // Prepare training data
    const X_train = this.data.map(point => [point[0]]); // Time values
    const y_train = this.data.map(point => point[1]); // Target values
    
    // Create and fit GP
    const kernel = new RBF(lengthScale, amplitude);
    this.gpr = new GaussianProcessRegressor(kernel);
    
    try {
      this.gpr.fit(X_train, y_train);
      this.isFitted = true;
    } catch (error) {
      throw new Error(`Failed to fit Gaussian Process: ${error.message}`);
    }
    
    // Create prediction points
    const minTime = Math.min(...this.data.map(p => p[0]));
    const maxTime = Math.max(...this.data.map(p => p[0]));
    const timeStep = (maxTime - minTime) / (length - 1);
    const X_pred = Array.from({ length }, (_, i) => [minTime + i * timeStep]);
    
    // Generate samples
    const samples = this.gpr.sampleY(X_pred, nsamples);
    const timePoints = X_pred.map(x => x[0]);
    
    if (nsamples === 1) {
      return [timePoints, samples[0]];
    } else {
      return [timePoints, samples];
    }
  }

  rbfKernel(x1, x2) {
    let distanceSquared = 0;
    for (let i = 0; i < x1.length; i++) {
      distanceSquared += Math.pow(x1[i] - x2[i], 2);
    }
    return this.amplitude * Math.exp(-distanceSquared / (2 * Math.pow(this.lengthScale, 2)));
  }

  setData(data) {
    this.data = [...data];
  }

  getData() {
    return [...this.data];
  }

  setLengthScale(lengthScale) {
    this.lengthScale = lengthScale;
  }

  setAmplitude(amplitude) {
    this.amplitude = amplitude;
  }

  setNoiseLevel(noiseLevel) {
    this.noiseLevel = noiseLevel;
  }
  
  /**
   * Convert GP samples to JMON notes
   * @param {Array|Array<Array>} samples - GP samples (single array or array of arrays)
   * @param {Array} durations - Duration sequence
   * @param {Array} timePoints - Time points (for fitted GP)
   * @param {Object} options - Conversion options
   * @returns {Array} JMON note objects
   */
  toJmonNotes(samples, durations = [1], timePoints = null, options = {}) {
    const {
      useStringTime = false,
      mapToScale = null,
      scaleRange = [60, 72],
      quantize = false
    } = options;
    
    const notes = [];
    let currentTime = 0;
    
    // Handle both single samples and multiple samples
    const sampleArray = Array.isArray(samples[0]) ? samples : [samples];
    const times = timePoints || Array.from({ length: sampleArray[0].length }, (_, i) => i);
    
    for (let i = 0; i < sampleArray[0].length; i++) {
      const duration = durations[i % durations.length];
      const timeValue = timePoints ? times[i] : currentTime;
      
      // Collect all sample values at this time point
      const pitchValues = sampleArray.map(sample => {
        let value = sample[i];
        
        // Map to scale if provided
        if (mapToScale) {
          const minVal = Math.min(...sample);
          const maxVal = Math.max(...sample);
          const range = maxVal - minVal || 1;
          const normalized = (value - minVal) / range;
          const scaleIndex = Math.floor(normalized * mapToScale.length);
          const clampedIndex = Math.max(0, Math.min(scaleIndex, mapToScale.length - 1));
          value = mapToScale[clampedIndex];
        } else {
          // Map to pitch range
          const minVal = Math.min(...sample);
          const maxVal = Math.max(...sample);
          const range = maxVal - minVal || 1;
          const normalized = (value - minVal) / range;
          value = scaleRange[0] + normalized * (scaleRange[1] - scaleRange[0]);
        }
        
        if (quantize) {
          value = Math.round(value);
        }
        
        return value;
      });
      
      // Create chord if multiple samples, single note otherwise
      const pitch = pitchValues.length === 1 ? pitchValues[0] : pitchValues;
      
      notes.push({
        pitch,
        duration,
        time: useStringTime ? offsetToBarsBeatsTicks(timeValue, this.timingConfig) : timeValue
      });
      
      if (!timePoints) {
        currentTime += duration;
      }
    }
    
    return notes;
  }
  
  /**
   * Generate JMON track directly from GP
   * @param {Object} options - Generation options
   * @param {Object} trackOptions - Track options
   * @returns {Object} JMON track
   */
  generateTrack(options = {}, trackOptions = {}) {
    const samples = this.generate(options);
    const durations = options.durations || [1];
    
    let notes;
    if (this.isFitted || (this.data.length > 0 && Array.isArray(this.data[0]))) {
      // Fitted GP returns [timePoints, samples]
      const [timePoints, sampleData] = samples;
      notes = this.toJmonNotes(sampleData, durations, timePoints, options);
    } else {
      // Unfitted GP returns samples directly
      notes = this.toJmonNotes(samples, durations, null, options);
    }
    
    return notesToTrack(notes, {
      label: 'gaussian-process',
      midiChannel: 0,
      synth: { type: 'Synth' },
      ...trackOptions
    });
  }
  
  /**
   * Simple seeded random number generator
   */
  seededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
}
