import { jm } from './dist/jmon.esm.js';

console.log('=== Full API Structure ===\n');

const checkNamespace = (name, obj) => {
  console.log(`${name}:`);
  if (!obj) {
    console.log('  ❌ MISSING!');
    return;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    console.log('  ⚠️  Empty');
  } else {
    console.log(`  ✓ ${keys.length} items:`, keys.join(', '));
  }
  console.log('');
};

// Top level
console.log('Top-level functions:');
['render', 'play', 'score', 'validate'].forEach(fn => {
  console.log(`  ${typeof jm[fn] === 'function' ? '✓' : '❌'} jm.${fn}()`);
});
console.log('');

// Namespaces
checkNamespace('jm.theory', jm.theory);
checkNamespace('jm.generative', jm.generative);
checkNamespace('jm.analysis', jm.analysis);
checkNamespace('jm.constants', jm.constants);
checkNamespace('jm.audio', jm.audio);
checkNamespace('jm.visualization', jm.visualization);
checkNamespace('jm.converters', jm.converters);
checkNamespace('jm.utils', jm.utils);
checkNamespace('jm.instruments', jm.instruments);

console.log('=== API Consistency Check ===\n');

// Check that all parts are accessible
const issues = [];

if (!jm.visualization) issues.push('visualization is missing');
if (!jm.constants.articulations) issues.push('constants.articulations is missing');
if (!jm.constants.ornaments) issues.push('constants.ornaments is missing');
if (!jm.theory.harmony.Articulation) issues.push('theory.harmony.Articulation is missing');
if (!jm.theory.harmony.Ornament) issues.push('theory.harmony.Ornament is missing');

if (issues.length === 0) {
  console.log('✅ All namespaces are properly exported and accessible!');
} else {
  console.log('❌ Issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}
