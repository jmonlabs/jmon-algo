import { Matrix, choleskyDecomposition, ensure2D } from '../../utils/matrix.js';
import { Kernel } from './kernels/base.js';
import { RBF } from './kernels/rbf.js';
import { Periodic } from './kernels/periodic.js';
import { RationalQuadratic } from './kernels/rational-quadratic.js';
// (Type import removed: GaussianProcessOptions, PredictionResult)

export class GaussianProcessRegressor {
  kernel;
  alpha;
  XTrain;
  yTrain;
  L;
  alphaVector;
  isFitted;

  constructor(kernelOrOptions, options = {}) {
    // Support both patterns:
    // 1. new GaussianProcessRegressor(kernelInstance, options)
    // 2. new GaussianProcessRegressor({ kernel: 'rbf', lengthScale: 1.0, ... })

    this.isFitted = false;

    if (kernelOrOptions instanceof Kernel) {
      // Pattern 1: Direct kernel instance
      this.kernel = kernelOrOptions;
      this.alpha = options.alpha || 1e-10;
    } else if (typeof kernelOrOptions === 'object' && kernelOrOptions.kernel) {
      // Pattern 2: Options object with kernel type
      const opts = kernelOrOptions;
      this.alpha = opts.alpha || 1e-10;

      // Create kernel based on type
      const kernelType = opts.kernel.toLowerCase();

      switch (kernelType) {
        case 'rbf':
          this.kernel = new RBF(
            opts.lengthScale || 1.0,
            opts.variance || 1.0
          );
          break;

        case 'periodic':
          this.kernel = new Periodic(
            opts.lengthScale || 1.0,
            opts.periodLength || 1.0,
            opts.variance || 1.0
          );
          break;

        case 'rational_quadratic':
        case 'rationalquadratic':
          this.kernel = new RationalQuadratic(
            opts.lengthScale || 1.0,
            opts.alpha || 1.0,
            opts.variance || 1.0
          );
          break;

        default:
          throw new Error(`Unknown kernel type: ${opts.kernel}. Supported: 'rbf', 'periodic', 'rational_quadratic'`);
      }
    } else if (kernelOrOptions instanceof Kernel) {
      // Just in case - already handled above
      this.kernel = kernelOrOptions;
      this.alpha = options.alpha || 1e-10;
    } else {
      throw new Error('First argument must be a Kernel instance or options object with kernel type');
    }
  }

  fit(X, y) {
    this.XTrain = ensure2D(X);
    this.yTrain = [...y];

    const K = this.kernel.call(this.XTrain);
    
    // Add noise to diagonal
    for (let i = 0; i < K.rows; i++) {
      K.set(i, i, K.get(i, i) + this.alpha);
    }

    try {
      this.L = choleskyDecomposition(K);
    } catch (error) {
      throw new Error(`Failed to compute Cholesky decomposition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Solve L * L^T * alpha = y using forward and back substitution
    this.alphaVector = this.solveCholesky(this.L, this.yTrain);

    // Mark as fitted
    this.isFitted = true;
  }

  predict(X, returnStd = false) {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before prediction');
    }

    const XTest = ensure2D(X);
    const KStar = this.kernel.call(this.XTrain, XTest);

    // Compute mean prediction
    const mean = new Array(XTest.rows);
    for (let i = 0; i < XTest.rows; i++) {
      mean[i] = 0;
      for (let j = 0; j < this.XTrain.rows; j++) {
        mean[i] += KStar.get(j, i) * this.alphaVector[j];
      }
    }

    // For backward compatibility: if returnStd is false, just return mean array
    if (returnStd) {
      const std = this.computeStd(XTest, KStar);
      return { mean, std };
    }

    return mean;
  }

  /**
   * Predict with uncertainty quantification
   * @param {Array} X - Test points
   * @returns {Object} Object with mean and std arrays
   */
  predictWithUncertainty(X) {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before prediction');
    }

    const XTest = ensure2D(X);
    const KStar = this.kernel.call(this.XTrain, XTest);

    // Compute mean prediction
    const mean = new Array(XTest.rows);
    for (let i = 0; i < XTest.rows; i++) {
      mean[i] = 0;
      for (let j = 0; j < this.XTrain.rows; j++) {
        mean[i] += KStar.get(j, i) * this.alphaVector[j];
      }
    }

    const std = this.computeStd(XTest, KStar);
    return { mean, std };
  }

  /**
   * Generate random samples from the posterior distribution
   * @param {Array} X - Test points
   * @param {number} nSamples - Number of samples to generate
   * @returns {Array} Array of sample arrays
   */
  sample(X, nSamples = 1) {
    return this.sampleY(X, nSamples);
  }

  sampleY(X, nSamples = 1) {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before sampling');
    }

    const XTest = ensure2D(X);
    const prediction = this.predict(X, true);
    
    if (!prediction.std) {
      throw new Error('Standard deviation computation failed');
    }

    const samples = [];
    for (let i = 0; i < nSamples; i++) {
      const sample = new Array(XTest.rows);
      for (let j = 0; j < XTest.rows; j++) {
        const mean = prediction.mean[j];
        const std = prediction.std[j];
        sample[j] = mean + std * this.sampleStandardNormal();
      }
      samples.push(sample);
    }

    return samples;
  }

  logMarginalLikelihood() {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before computing log marginal likelihood');
    }

    let logLikelihood = 0;
    
    // -0.5 * y^T * K^{-1} * y
    for (let i = 0; i < this.yTrain.length; i++) {
      logLikelihood -= 0.5 * this.yTrain[i] * this.alphaVector[i];
    }
    
    // -0.5 * log|K|
    for (let i = 0; i < this.L.rows; i++) {
      logLikelihood -= Math.log(this.L.get(i, i));
    }
    
    // -n/2 * log(2π)
    logLikelihood -= 0.5 * this.yTrain.length * Math.log(2 * Math.PI);
    
    return logLikelihood;
  }

  computeStd(XTest, KStar) {
    if (!this.L) {
      throw new Error('Cholesky decomposition not available');
    }

    const std = new Array(XTest.rows);
    
    for (let i = 0; i < XTest.rows; i++) {
      // K_** diagonal element
      const kStarStar = this.kernel.compute(XTest.getRow(i), XTest.getRow(i));
      
      // Solve L * v = k_*
      const kStarColumn = KStar.getColumn(i);
      const v = this.forwardSubstitution(this.L, kStarColumn);
      
      // Compute v^T * v
      let vTv = 0;
      for (let j = 0; j < v.length; j++) {
        vTv += v[j] * v[j];
      }
      
      const variance = kStarStar - vTv;
      std[i] = Math.sqrt(Math.max(0, variance));
    }
    
    return std;
  }

  solveCholesky(L, y) {
    // Forward substitution: L * z = y
    const z = this.forwardSubstitution(L, y);
    
    // Back substitution: L^T * alpha = z
    return this.backSubstitution(L, z);
  }

  forwardSubstitution(L, b) {
    const n = L.rows;
    const x = new Array(n);
    
    for (let i = 0; i < n; i++) {
      x[i] = b[i];
      for (let j = 0; j < i; j++) {
        x[i] -= L.get(i, j) * x[j];
      }
      x[i] /= L.get(i, i);
    }
    
    return x;
  }

  backSubstitution(L, b) {
    const n = L.rows;
    const x = new Array(n);
    
    for (let i = n - 1; i >= 0; i--) {
      x[i] = b[i];
      for (let j = i + 1; j < n; j++) {
        x[i] -= L.get(j, i) * x[j];
      }
      x[i] /= L.get(i, i);
    }
    
    return x;
  }

  sampleStandardNormal() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}