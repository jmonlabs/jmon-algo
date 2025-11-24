import { jm } from './dist/jmon.esm.js';

console.log('=== Testing Constants API ===\n');

// Test list()
console.log('1. jm.constants.list():');
console.log('  ', jm.constants.list());
console.log('');

// Test get()
console.log('2. jm.constants.get("articulations"):');
const arts = jm.constants.get('articulations');
console.log('   Keys:', Object.keys(arts).slice(0, 5).join(', '), '...');
console.log('');

// Test describe()
console.log('3. jm.constants.describe("articulations", "staccato"):');
console.log('  ', JSON.stringify(jm.constants.describe('articulations', 'staccato'), null, 2));
console.log('');

// Test search()
console.log('4. jm.constants.search("slide"):');
const results = jm.constants.search('slide');
console.log('   Found:', results.length, 'results');
results.forEach(r => console.log(`   - ${r.name}: ${r.description}`));
console.log('');

// Test list methods
console.log('5. jm.constants.listArticulations():');
console.log('  ', jm.constants.listArticulations().join(', '));
console.log('');

console.log('6. jm.constants.listOrnaments():');
console.log('  ', jm.constants.listOrnaments().join(', '));
console.log('');

console.log('7. jm.constants.listScales():');
console.log('  ', jm.constants.listScales().slice(0, 8).join(', '), '...');
console.log('');

console.log('✅ Constants API is working!');
