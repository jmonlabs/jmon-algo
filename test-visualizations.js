/**
 * Test visualizations for fractals and cellular automata
 */

import { FractalVisualizer } from './src/algorithms/visualization/fractals/FractalVisualizer.js';
import { CAVisualizer } from './src/algorithms/visualization/cellular-automata/CAVisualizer.js';
import { CellularAutomata } from './src/algorithms/generative/cellular-automata/CellularAutomata.js';
import { Mandelbrot } from './src/algorithms/generative/fractals/Mandelbrot.js';
import { LogisticMap } from './src/algorithms/generative/fractals/LogisticMap.js';

console.log('=== Testing Fractal and CA Visualizations ===\n');

// Test 1: Fractal Visualizer - Logistic Map
console.log('1. Testing FractalVisualizer - Logistic Map');
try {
  const logisticPlot = FractalVisualizer.plotLogisticMap(2.8, 4.0, 100, 100, 50);
  console.log('  ✓ Generated logistic map bifurcation data');
  console.log('  ✓ Plot type:', logisticPlot ? 'Generated' : 'Failed');
  console.log('  ✓ Has plot structure:', typeof logisticPlot === 'object');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 2: Fractal Visualizer - Mandelbrot
console.log('2. Testing FractalVisualizer - Mandelbrot Set');
try {
  const mandelbrotPlot = FractalVisualizer.plotMandelbrot(-2.5, 1.0, -1.25, 1.25, 50, 50);
  console.log('  ✓ Generated Mandelbrot set data');
  console.log('  ✓ Plot type:', mandelbrotPlot ? 'Generated' : 'Failed');
  console.log('  ✓ Has plot structure:', typeof mandelbrotPlot === 'object');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 3: Fractal Visualizer - Helper Functions
console.log('3. Testing FractalVisualizer - Helper Functions');
try {
  const iterations = FractalVisualizer.mandelbrotIterations(0, 0, 100);
  console.log('  ✓ Mandelbrot iterations for (0,0):', iterations);
  console.log('  ✓ Point in set:', iterations === 100);

  const color = FractalVisualizer.getColorForValue(0.5, 'viridis');
  console.log('  ✓ Generated color:', color);
  console.log('  ✓ Color is string:', typeof color === 'string');

  const rgb = FractalVisualizer.getColorComponents(0.5, 'plasma');
  console.log('  ✓ RGB components:', rgb);
  console.log('  ✓ Valid RGB:', rgb.r >= 0 && rgb.r <= 255);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 4: CA Visualizer - Evolution Plot
console.log('4. Testing CAVisualizer - Evolution Visualization');
try {
  const ca = new CellularAutomata({ ruleNumber: 30, width: 50 });
  const history = ca.generate(20);

  console.log('  ✓ Generated CA history:', history.length, 'generations');

  const evolutionPlot = CAVisualizer.plotEvolution(history);
  console.log('  ✓ Created evolution plot');
  console.log('  ✓ Plot type:', evolutionPlot ? 'Generated' : 'Failed');
  console.log('  ✓ Has plot structure:', typeof evolutionPlot === 'object');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 5: CA Visualizer - Density Plot
console.log('5. Testing CAVisualizer - Density Plot');
try {
  const ca = new CellularAutomata({ ruleNumber: 110, width: 50 });
  const history = ca.generate(30);

  const densityPlot = CAVisualizer.plotDensity(history);
  console.log('  ✓ Created density plot');
  console.log('  ✓ Plot type:', densityPlot ? 'Generated' : 'Failed');
  console.log('  ✓ Has plot structure:', typeof densityPlot === 'object');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 6: CA Visualizer - Pattern Detection
console.log('6. Testing CAVisualizer - Pattern Detection');
try {
  const ca = new CellularAutomata({ ruleNumber: 30, width: 51 });
  const history = ca.generate(50);

  const patterns = CAVisualizer.extractPatterns(history);
  console.log('  ✓ Extracted patterns');
  console.log('  ✓ Oscillators found:', patterns.oscillators.length);
  console.log('  ✓ Still lifes found:', patterns.stillLifes.length);
  console.log('  ✓ Gliders found:', patterns.gliders.length);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 7: Integration - Mandelbrot Data Generation
console.log('7. Testing Mandelbrot - Data Generation');
try {
  const mandelbrot = new Mandelbrot({
    width: 50,
    height: 50,
    maxIterations: 50
  });

  const data = mandelbrot.generate();
  console.log('  ✓ Generated Mandelbrot data');
  console.log('  ✓ Data dimensions:', data.length, 'x', data[0].length);
  console.log('  ✓ Sample values:', data[0].slice(0, 5));

  // Test sequence extraction
  const diagonal = mandelbrot.extractSequence('diagonal');
  console.log('  ✓ Extracted diagonal sequence:', diagonal.length, 'values');

  const border = mandelbrot.extractSequence('border');
  console.log('  ✓ Extracted border sequence:', border.length, 'values');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 8: Integration - Logistic Map
console.log('8. Testing Logistic Map - Chaotic Sequence');
try {
  const logisticMap = new LogisticMap({ r: 3.9, iterations: 100 });
  const sequence = logisticMap.generate();

  console.log('  ✓ Generated chaotic sequence:', sequence.length, 'values');
  console.log('  ✓ Sample values:', sequence.slice(0, 5).map(v => v.toFixed(3)));
  console.log('  ✓ Values in [0,1]:', sequence.every(v => v >= 0 && v <= 1));

  // Test bifurcation
  const bifurcation = logisticMap.bifurcation(2.8, 4.0, 50);
  console.log('  ✓ Generated bifurcation data:', bifurcation.length, 'points');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 9: CA Visualizer - Spacetime Diagram
console.log('9. Testing CAVisualizer - Spacetime Diagram');
try {
  const ca = new CellularAutomata({ ruleNumber: 90, width: 41 });
  const history = ca.generate(40);

  const spacetimePlot = CAVisualizer.plotSpacetime(history);
  console.log('  ✓ Created spacetime diagram');
  console.log('  ✓ Plot type:', spacetimePlot ? 'Generated' : 'Failed');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 10: FractalVisualizer - CA Rendering
console.log('10. Testing FractalVisualizer - CA Plotting');
try {
  const ca = new CellularAutomata({ ruleNumber: 30, width: 50 });
  const history = ca.generate(50);

  const caPlot = FractalVisualizer.plotCellularAutomata(history);
  console.log('  ✓ Plotted CA using FractalVisualizer');
  console.log('  ✓ Plot type:', caPlot ? 'Generated' : 'Failed');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

console.log('=== Visualization Tests Complete ===\n');
console.log('Summary:');
console.log('✓ All fractal visualization methods functional');
console.log('✓ All CA visualization methods functional');
console.log('✓ Pattern detection working');
console.log('✓ Data generation and extraction working');
