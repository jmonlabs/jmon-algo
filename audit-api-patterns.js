import { jm } from './dist/jmon.esm.js';

console.log('=== API Pattern Audit ===\n');

const checkClass = (path, name) => {
  const parts = path.split('.');
  let obj = jm;
  for (const part of parts) {
    obj = obj[part];
    if (!obj) {
      console.log(`❌ ${name}: not found at ${path}`);
      return;
    }
  }

  const isClass = typeof obj === 'function';
  const hasStaticMethods = isClass && Object.getOwnPropertyNames(obj).filter(k =>
    k !== 'length' && k !== 'name' && k !== 'prototype' && typeof obj[k] === 'function'
  );

  const proto = isClass ? Object.getOwnPropertyNames(obj.prototype).filter(k => k !== 'constructor') : [];

  console.log(`${name}:`);
  console.log(`  Type: ${isClass ? 'Class' : 'Object'}`);
  if (isClass) {
    console.log(`  Static methods: ${hasStaticMethods.length > 0 ? hasStaticMethods.join(', ') : 'none'}`);
    console.log(`  Instance methods: ${proto.length > 0 ? proto.slice(0, 5).join(', ') + (proto.length > 5 ? '...' : '') : 'none'}`);
    console.log(`  Pattern: ${hasStaticMethods.length > 0 && proto.length === 0 ? 'STATIC' : proto.length > 0 && hasStaticMethods.length === 0 ? 'INSTANCE' : 'MIXED'}`);
  }
  console.log('');
};

console.log('=== Theory Classes ===\n');
checkClass('theory.harmony.Scale', 'Scale');
checkClass('theory.harmony.Progression', 'Progression');
checkClass('theory.harmony.Voice', 'Voice');
checkClass('theory.harmony.Ornament', 'Ornament');
checkClass('theory.harmony.Articulation', 'Articulation');

console.log('=== Generative Classes ===\n');
checkClass('generative.automata.Cellular', 'CellularAutomata');
checkClass('generative.genetic.Darwin', 'Darwin');
checkClass('generative.gaussian.Regressor', 'GaussianProcessRegressor');
checkClass('generative.loops', 'Loop');
checkClass('generative.walks.Random', 'RandomWalk');
checkClass('generative.walks.Chain', 'Chain');
checkClass('generative.fractals.Mandelbrot', 'Mandelbrot');
checkClass('generative.minimalism.Process', 'MinimalismProcess');
