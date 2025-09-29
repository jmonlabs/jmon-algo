/**
 * Genetic Algorithm Visualization Tools
 * 
 * Provides visualization capabilities for genetic algorithm evolution,
 * fitness tracking, population diversity, and musical evolution analysis
 */

export class GeneticVisualizer {
  
  /**
   * Create fitness evolution plot using Plotly
   * @param {Array} fitnessHistory - Array of fitness scores over generations
   * @param {Object} options - Plot options
   * @returns {Object} Plotly plot configuration
   */
  static plotFitnessEvolution(fitnessHistory, options = {}) {
    const {
      title = 'Fitness Evolution Over Generations',
      width = 800,
      height = 400,
      showTrendLine = true,
      color = '#1f77b4'
    } = options;

    const generations = Array.from({length: fitnessHistory.length}, (_, i) => i);
    
    const traces = [{
      x: generations,
      y: fitnessHistory,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Best Fitness',
      line: { color: color, width: 2 },
      marker: { size: 4 }
    }];

    // Add trend line if requested
    if (showTrendLine && fitnessHistory.length > 1) {
      const trendLine = this.calculateTrendLine(generations, fitnessHistory);
      traces.push({
        x: generations,
        y: trendLine,
        type: 'scatter',
        mode: 'lines',
        name: 'Trend',
        line: { color: 'red', width: 1, dash: 'dash' },
        opacity: 0.7
      });
    }

    return {
      data: traces,
      layout: {
        title: {
          text: title,
          font: { size: 16 }
        },
        xaxis: {
          title: 'Generation',
          showgrid: true
        },
        yaxis: {
          title: 'Fitness Score',
          showgrid: true
        },
        width: width,
        height: height,
        margin: { l: 60, r: 30, t: 60, b: 60 },
        showlegend: showTrendLine
      }
    };
  }

  /**
   * Create population diversity plot
   * @param {Array} populationStats - Array of population statistics over generations
   * @param {Object} options - Plot options
   * @returns {Object} Plotly plot configuration
   */
  static plotPopulationDiversity(populationStats, options = {}) {
    const {
      title = 'Population Diversity Over Generations',
      width = 800,
      height = 400
    } = options;

    const generations = populationStats.map((_, i) => i);
    const meanFitness = populationStats.map(stats => stats.meanFitness);
    const maxFitness = populationStats.map(stats => stats.maxFitness);
    const minFitness = populationStats.map(stats => stats.minFitness);
    const stdDev = populationStats.map(stats => stats.standardDeviation);

    return {
      data: [
        {
          x: generations,
          y: maxFitness,
          type: 'scatter',
          mode: 'lines',
          name: 'Max Fitness',
          line: { color: '#2ca02c', width: 2 }
        },
        {
          x: generations,
          y: meanFitness,
          type: 'scatter',
          mode: 'lines',
          name: 'Mean Fitness',
          line: { color: '#1f77b4', width: 2 }
        },
        {
          x: generations,
          y: minFitness,
          type: 'scatter',
          mode: 'lines',
          name: 'Min Fitness',
          line: { color: '#ff7f0e', width: 2 }
        },
        {
          x: generations,
          y: stdDev,
          type: 'scatter',
          mode: 'lines',
          name: 'Std Deviation',
          yaxis: 'y2',
          line: { color: '#d62728', width: 2, dash: 'dot' }
        }
      ],
      layout: {
        title: {
          text: title,
          font: { size: 16 }
        },
        xaxis: {
          title: 'Generation',
          showgrid: true
        },
        yaxis: {
          title: 'Fitness Score',
          showgrid: true
        },
        yaxis2: {
          title: 'Standard Deviation',
          overlaying: 'y',
          side: 'right',
          showgrid: false
        },
        width: width,
        height: height,
        margin: { l: 60, r: 60, t: 60, b: 60 },
        showlegend: true
      }
    };
  }

  /**
   * Create musical metrics comparison chart
   * @param {Object} initialMetrics - Initial musical metrics
   * @param {Object} finalMetrics - Final evolved metrics
   * @param {Object} targets - Target values for metrics
   * @param {Object} options - Plot options
   * @returns {Object} Plotly plot configuration
   */
  static plotMusicalMetricsComparison(initialMetrics, finalMetrics, targets, options = {}) {
    const {
      title = 'Musical Metrics: Initial vs Final vs Target',
      width = 900,
      height = 500
    } = options;

    const metricsKeys = Object.keys(initialMetrics);
    const initial = metricsKeys.map(key => initialMetrics[key] || 0);
    const final = metricsKeys.map(key => finalMetrics[key] || 0);
    const targetValues = metricsKeys.map(key => {
      // Extract target value from targets object structure
      if (key.includes('Pitch')) {
        const baseKey = key.replace('Pitch', '').toLowerCase();
        return targets[baseKey] ? targets[baseKey][0] : 0;
      } else if (key.includes('Duration')) {
        const baseKey = key.replace('Duration', '').toLowerCase();
        return targets[baseKey] ? targets[baseKey][1] : 0;
      } else {
        return targets[key] ? (Array.isArray(targets[key]) ? targets[key][0] : targets[key]) : 0;
      }
    });

    return {
      data: [
        {
          x: metricsKeys,
          y: initial,
          type: 'bar',
          name: 'Initial',
          marker: { color: '#ff7f0e' }
        },
        {
          x: metricsKeys,
          y: final,
          type: 'bar',
          name: 'Final',
          marker: { color: '#1f77b4' }
        },
        {
          x: metricsKeys,
          y: targetValues,
          type: 'bar',
          name: 'Target',
          marker: { color: '#2ca02c', opacity: 0.6 }
        }
      ],
      layout: {
        title: {
          text: title,
          font: { size: 16 }
        },
        xaxis: {
          title: 'Musical Metrics',
          tickangle: -45
        },
        yaxis: {
          title: 'Metric Value',
          showgrid: true
        },
        width: width,
        height: height,
        margin: { l: 60, r: 30, t: 60, b: 120 },
        showlegend: true,
        barmode: 'group'
      }
    };
  }

  /**
   * Create pitch evolution visualization
   * @param {Array} evolutionHistory - History of best individuals
   * @param {Object} options - Plot options
   * @returns {Object} Plotly plot configuration
   */
  static plotPitchEvolution(evolutionHistory, options = {}) {
    const {
      title = 'Pitch Evolution Over Generations',
      width = 1000,
      height = 600,
      sampleRate = 5,
      opacity = 0.1
    } = options;

    const traces = [];
    const generations = evolutionHistory.individuals;
    
    // Sample generations to avoid overcrowding
    const sampledGenerations = generations.filter((_, i) => i % sampleRate === 0 || i === generations.length - 1);
    
    sampledGenerations.forEach((individual, index) => {
      const pitches = individual.map(note => note[0]);
      const notePositions = pitches.map((_, i) => i);
      const generation = index * sampleRate;
      
      traces.push({
        x: notePositions,
        y: pitches,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Gen ${generation}`,
        opacity: index === sampledGenerations.length - 1 ? 1.0 : opacity,
        line: { 
          width: index === sampledGenerations.length - 1 ? 3 : 1,
          color: index === sampledGenerations.length - 1 ? '#ff0000' : '#1f77b4'
        },
        marker: { size: index === sampledGenerations.length - 1 ? 6 : 3 },
        showlegend: index === 0 || index === sampledGenerations.length - 1
      });
    });

    return {
      data: traces,
      layout: {
        title: {
          text: title,
          font: { size: 16 }
        },
        xaxis: {
          title: 'Note Position',
          showgrid: true
        },
        yaxis: {
          title: 'MIDI Pitch',
          showgrid: true
        },
        width: width,
        height: height,
        margin: { l: 60, r: 30, t: 60, b: 60 },
        showlegend: true
      }
    };
  }

  /**
   * Create fitness landscape heatmap
   * @param {Array} populationHistory - History of population fitness values
   * @param {Object} options - Plot options  
   * @returns {Object} Plotly plot configuration
   */
  static plotFitnessLandscape(populationHistory, options = {}) {
    const {
      title = 'Population Fitness Landscape',
      width = 800,
      height = 400,
      colorscale = 'Viridis'
    } = options;

    // Convert population history to matrix format
    const maxPop = Math.max(...populationHistory.map(gen => gen.length));
    const fitnessMatrix = populationHistory.map(generation => {
      const padded = [...generation];
      while (padded.length < maxPop) {
        padded.push(0); // Pad with zeros
      }
      return padded;
    });

    return {
      data: [{
        z: fitnessMatrix,
        type: 'heatmap',
        colorscale: colorscale,
        showscale: true,
        colorbar: {
          title: 'Fitness Score'
        }
      }],
      layout: {
        title: {
          text: title,
          font: { size: 16 }
        },
        xaxis: {
          title: 'Individual Index',
          showgrid: false
        },
        yaxis: {
          title: 'Generation',
          showgrid: false
        },
        width: width,
        height: height,
        margin: { l: 60, r: 80, t: 60, b: 60 }
      }
    };
  }

  /**
   * Create Canvas-based fitness evolution plot for performance
   * @param {HTMLCanvasElement} canvas - Canvas element to draw on
   * @param {Array} fitnessHistory - Fitness scores over generations
   * @param {Object} options - Drawing options
   */
  static renderFitnessEvolutionCanvas(canvas, fitnessHistory, options = {}) {
    const {
      color = '#1f77b4',
      backgroundColor = '#ffffff',
      gridColor = '#e0e0e0',
      textColor = '#333333',
      title = 'Fitness Evolution',
      showGrid = true
    } = options;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    if (fitnessHistory.length === 0) return;
    
    // Set up margins
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    // Calculate scales
    const maxFitness = Math.max(...fitnessHistory);
    const minFitness = Math.min(...fitnessHistory);
    const fitnessRange = maxFitness - minFitness || 1;
    
    const xScale = plotWidth / (fitnessHistory.length - 1);
    const yScale = plotHeight / fitnessRange;
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = margin.left + (i * plotWidth / 10);
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, height - margin.bottom);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let i = 0; i <= 10; i++) {
        const y = margin.top + (i * plotHeight / 10);
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
      }
    }
    
    // Draw fitness line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    fitnessHistory.forEach((fitness, index) => {
      const x = margin.left + index * xScale;
      const y = height - margin.bottom - ((fitness - minFitness) * yScale);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = color;
    fitnessHistory.forEach((fitness, index) => {
      const x = margin.left + index * xScale;
      const y = height - margin.bottom - ((fitness - minFitness) * yScale);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw axes
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = textColor;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 16px Arial';
    ctx.fillText(title, width / 2, 25);
    
    // X-axis label
    ctx.font = '12px Arial';
    ctx.fillText('Generation', width / 2, height - 10);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Fitness Score', 0, 0);
    ctx.restore();
    
    // Axis tick labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const generation = Math.floor(i * (fitnessHistory.length - 1) / 5);
      const x = margin.left + i * plotWidth / 5;
      ctx.fillText(generation.toString(), x, height - margin.bottom + 20);
    }
    
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const fitness = minFitness + (i * fitnessRange / 5);
      const y = height - margin.bottom - (i * plotHeight / 5);
      ctx.fillText(fitness.toFixed(1), margin.left - 10, y + 4);
    }
  }

  /**
   * Calculate linear trend line for fitness data
   * @param {Array} x - X values (generations)
   * @param {Array} y - Y values (fitness scores)
   * @returns {Array} Trend line Y values
   */
  static calculateTrendLine(x, y) {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return x.map(val => slope * val + intercept);
  }

  /**
   * Generate summary statistics for evolution
   * @param {Object} evolutionHistory - Complete evolution history
   * @returns {Object} Summary statistics
   */
  static generateEvolutionSummary(evolutionHistory) {
    const { scores, individuals, generations } = evolutionHistory;
    
    if (scores.length === 0) return {};
    
    const initialFitness = scores[0];
    const finalFitness = scores[scores.length - 1];
    const bestFitness = Math.max(...scores);
    const worstFitness = Math.min(...scores);
    
    // Calculate convergence generation (when fitness stops improving significantly)
    let convergenceGeneration = generations;
    const threshold = 0.001;
    for (let i = scores.length - 1; i > 0; i--) {
      if (Math.abs(scores[i] - scores[i - 1]) > threshold) {
        convergenceGeneration = i + 1;
        break;
      }
    }
    
    // Calculate average improvement per generation
    const totalImprovement = finalFitness - initialFitness;
    const avgImprovement = totalImprovement / generations;
    
    return {
      totalGenerations: generations,
      initialFitness: initialFitness,
      finalFitness: finalFitness,
      bestFitness: bestFitness,
      worstFitness: worstFitness,
      totalImprovement: totalImprovement,
      improvementPercentage: (totalImprovement / initialFitness) * 100,
      avgImprovementPerGeneration: avgImprovement,
      convergenceGeneration: convergenceGeneration,
      convergedInGenerations: convergenceGeneration < generations
    };
  }

  /**
   * Create a comprehensive evolution dashboard
   * @param {Object} evolutionHistory - Evolution history data
   * @param {Object} initialMetrics - Initial musical metrics
   * @param {Object} finalMetrics - Final musical metrics
   * @param {Object} targets - Target metrics
   * @param {Object} options - Dashboard options
   * @returns {Object} Dashboard configuration
   */
  static createEvolutionDashboard(evolutionHistory, initialMetrics, finalMetrics, targets, options = {}) {
    const {
      width = 1200,
      height = 800
    } = options;
    
    const summary = this.generateEvolutionSummary(evolutionHistory);
    
    return {
      fitnessEvolution: this.plotFitnessEvolution(evolutionHistory.scores, {
        width: width * 0.6,
        height: height * 0.4
      }),
      metricsComparison: this.plotMusicalMetricsComparison(initialMetrics, finalMetrics, targets, {
        width: width * 0.6,
        height: height * 0.4
      }),
      pitchEvolution: this.plotPitchEvolution(evolutionHistory, {
        width: width,
        height: height * 0.4
      }),
      summary: summary
    };
  }
}
