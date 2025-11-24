import { jm } from './dist/jmon.esm.js';

console.log('=== jm Top-level API ===');
console.log('jm.render:', typeof jm.render);
console.log('jm.play:', typeof jm.play);
console.log('jm.score:', typeof jm.score);
console.log('jm.validate:', typeof jm.validate);

console.log('\n=== jm.theory ===');
console.log('jm.theory:', Object.keys(jm.theory));
console.log('jm.theory.harmony:', Object.keys(jm.theory.harmony));
console.log('jm.theory.rhythm:', Object.keys(jm.theory.rhythm));

console.log('\n=== jm.generative ===');
console.log('jm.generative:', Object.keys(jm.generative));

console.log('\n=== jm.constants ===');
console.log('jm.constants:', Object.keys(jm.constants));

console.log('\n=== jm.converters ===');
console.log('jm.converters:', Object.keys(jm.converters));

console.log('\n=== jm.utils ===');
console.log('jm.utils:', Object.keys(jm.utils));

console.log('\n=== jm.visualization ===');
console.log('jm.visualization:', Object.keys(jm.visualization));

console.log('\n=== jm.analysis ===');
console.log('jm.analysis:', Object.keys(jm.analysis));
