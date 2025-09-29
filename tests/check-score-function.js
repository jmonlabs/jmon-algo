// Check what the score function actually does
import jm from './dist/jmon.esm.js';

console.log('=== Current Score Function Behavior ===');

const piece = {
    metadata: { title: 'Test' },
    notes: [
        { pitch: 60, duration: 1, time: 0 },
        { pitch: 62, duration: 1, time: 1 }
    ]
};

// Test 1: No rendering engine (should return what?)
console.log('\n1. No rendering engine:');
const result1 = jm.score(piece);
console.log('Type:', typeof result1);
console.log('Is ABC object:', result1?.type === 'abc');
console.log('Result:', result1);

// Test 2: Mock VexFlow
console.log('\n2. Mock VexFlow:');
const mockVF = { Factory: function() {} };
const result2 = jm.score(piece, mockVF);
console.log('Type:', typeof result2);
console.log('Is VexFlow object:', result2?.type === 'vexflow');
console.log('Result:', result2);

// Test 3: What converters are available?
console.log('\n3. Available converters:');
console.log('Converters:', Object.keys(jm.converters));

// Test 4: Direct ABC converter
console.log('\n4. Direct ABC converter:');
try {
    const abcResult = jm.converters.abc(piece);
    console.log('ABC converter returns:', typeof abcResult);
    console.log('ABC result length:', abcResult?.length);
    console.log('ABC preview:', abcResult?.substring(0, 100));
} catch (error) {
    console.log('ABC converter error:', error.message);
}

// Test 5: Check if score function source contains 'abc'
console.log('\n5. Score function analysis:');
const scoreSrc = jm.score.toString();
console.log('Score function contains "abc":', scoreSrc.includes('abc'));
console.log('Score function contains "ABC":', scoreSrc.includes('ABC'));
console.log('Score function contains fallback logic:', scoreSrc.includes('fallback') || scoreSrc.includes('notation'));

console.log('\n=== CONCLUSION ===');
if (result1?.type === 'abc') {
    console.log('❌ PROBLEM: Score function still returns ABC fallback!');
    console.log('This explains why Observable gets ABC text instead of VexFlow');
} else {
    console.log('✅ Score function behavior looks correct');
}