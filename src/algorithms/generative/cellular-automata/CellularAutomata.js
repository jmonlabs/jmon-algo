/**
 * @typedef {Object} CellularAutomataOptions
 * @property {number} [width=51] - Width of the cellular automaton
 * @property {number} [ruleNumber=30] - Rule number (0-255)
 * @property {number[]} [initialState] - Initial state array
 */

/**
 * @typedef {Object<string, number>} CellularAutomataRule
 */

/**
 * @typedef {number[][]} Matrix2D
 */

export class CellularAutomata {
  /**
   * @param {CellularAutomataOptions} [options={}] - Configuration options
   */
  constructor(options = {}) {
    this.width = options.width || 51;
    this.ruleNumber = options.ruleNumber || 30;
    this.initialState = options.initialState || this.generateRandomInitialState();
    this.state = [...this.initialState];
    this.rules = this.loadRules(this.ruleNumber);
    this.history = [];
  }

  /**
   * Generate cellular automaton evolution
   * @param {number} steps - Number of evolution steps
   * @returns {Matrix2D} Evolution history
   */
  generate(steps) {
    this.history = [];
    this.state = [...this.initialState];
    
    this.history.push([...this.state]);
    
    for (let step = 0; step < steps; step++) {
      this.updateState();
      this.history.push([...this.state]);
    }
    
    return this.history;
  }

  /**
   * Generate cellular automaton evolution with binary output
   * @param {number} steps - Number of evolution steps
   * @returns {Matrix2D} Binary evolution history
   */
  generate01(steps) {
    const result = this.generate(steps);
    return result.map(row => row.map(cell => cell > 0 ? 1 : 0));
  }

  /**
   * Load rules based on rule number
   * @param {number} ruleNumber - Rule number (0-255)
   * @returns {CellularAutomataRule} Rule mapping
   */
  loadRules(ruleNumber) {
    const binary = ruleNumber.toString(2).padStart(8, '0');
    const rules = {};
    
    // Map binary neighborhoods to rule outputs
    const neighborhoods = ['111', '110', '101', '100', '011', '010', '001', '000'];
    
    for (let i = 0; i < 8; i++) {
      rules[neighborhoods[i]] = parseInt(binary[i], 10);
    }
    
    return rules;
  }

  /**
   * Update the current state based on rules
   */
  updateState() {
    const newState = new Array(this.width);
    
    for (let i = 0; i < this.width; i++) {
      const left = this.state[(i - 1 + this.width) % this.width];
      const center = this.state[i];
      const right = this.state[(i + 1) % this.width];
      
      const neighborhood = `${left}${center}${right}`;
      newState[i] = this.rules[neighborhood] || 0;
    }
    
    this.state = newState;
  }

  /**
   * Validate strips matrix format
   * @param {Matrix2D} strips - Matrix to validate
   * @returns {boolean} Whether the matrix is valid
   */
  validateStrips(strips) {
    if (!Array.isArray(strips) || strips.length === 0) {
      return false;
    }
    
    const width = strips[0]?.length;
    if (!width) return false;
    
    return strips.every(strip => 
      Array.isArray(strip) && 
      strip.length === width &&
      strip.every(cell => typeof cell === 'number' && (cell === 0 || cell === 1))
    );
  }

  /**
   * Validate values array
   * @param {number[]} values - Values to validate
   * @returns {boolean} Whether the values are valid
   */
  validateValues(values) {
    return Array.isArray(values) && 
           values.length === this.width &&
           values.every(val => typeof val === 'number' && (val === 0 || val === 1));
  }

  /**
   * Set initial state
   * @param {number[]} state - New initial state
   */
  setInitialState(state) {
    if (this.validateValues(state)) {
      this.initialState = [...state];
      this.state = [...state];
    } else {
      throw new Error('Invalid initial state');
    }
  }

  /**
   * Set rule number
   * @param {number} ruleNumber - New rule number (0-255)
   */
  setRuleNumber(ruleNumber) {
    if (ruleNumber >= 0 && ruleNumber <= 255) {
      this.ruleNumber = ruleNumber;
      this.rules = this.loadRules(ruleNumber);
    } else {
      throw new Error('Rule number must be between 0 and 255');
    }
  }

  /**
   * Get evolution history
   * @returns {Matrix2D} Copy of evolution history
   */
  getHistory() {
    return this.history.map(row => [...row]);
  }

  /**
   * Get current state
   * @returns {number[]} Copy of current state
   */
  getCurrentState() {
    return [...this.state];
  }

  /**
   * Generate random initial state with single center cell
   * @returns {number[]} Initial state array
   */
  generateRandomInitialState() {
    const state = new Array(this.width).fill(0);
    // Single cell in center
    state[Math.floor(this.width / 2)] = 1;
    return state;
  }

  /**
   * Generate completely random state
   * @returns {number[]} Random state array
   */
  generateRandomState() {
    return Array.from({ length: this.width }, () => Math.random() > 0.5 ? 1 : 0);
  }

  /**
   * Get plot data
   * @returns {Object} Plot data with dimensions
   */
  plot() {
    return {
      data: this.getHistory(),
      width: this.width,
      height: this.history.length,
    };
  }

  /**
   * Create Observable Plot visualization of CA evolution
   * @param {Object} [options] - Plot options
   * @returns {Object} Observable Plot spec
   */
  async plotEvolution(options) {
    // Dynamic import for visualization
    const CAVisualizerModule = await import('../../visualization/cellular-automata/CAVisualizer.js');
    return CAVisualizerModule.CAVisualizer.plotEvolution(this.getHistory(), options);
  }

  /**
   * Create Observable Plot visualization of current generation
   * @param {Object} [options] - Plot options
   * @returns {Object} Observable Plot spec
   */
  async plotGeneration(options) {
    // Dynamic import for visualization
    const CAVisualizerModule = await import('../../visualization/cellular-automata/CAVisualizer.js');
    return CAVisualizerModule.CAVisualizer.plotGeneration(this.getCurrentState(), options);
  }

  /**
   * Create Observable Plot density visualization
   * @param {Object} [options] - Plot options
   * @returns {Object} Observable Plot spec
   */
  async plotDensity(options) {
    // Dynamic import for visualization
    const CAVisualizerModule = await import('../../visualization/cellular-automata/CAVisualizer.js');
    return CAVisualizerModule.CAVisualizer.plotDensity(this.getHistory(), options);
  }
}