// Debug what's actually in the built score function
import jm from './dist/jmon.esm.js';

console.log('=== DEBUG: Score Function Analysis ===');
console.log('JMON version:', jm.VERSION);
console.log('Score function source preview:');
console.log(jm.score.toString().substring(0, 500) + '...');

// Test the exact scenario
const c_major_piece = {
    metadata: { title: 'C Major Scale' },
    timeSignature: '4/4',
    keySignature: 'C',
    tempo: 120,
    notes: [
        { pitch: 60, duration: 1, time: 0 },
        { pitch: 62, duration: 1, time: 1 },
        { pitch: 64, duration: 1, time: 2 },
        { pitch: 65, duration: 1, time: 3 }
    ]
};

// Mock VexFlow with the minimal required properties
const mockVF = {
    Factory: function(options) {
        console.log('VexFlow Factory called with:', options);
        this.options = options;
        return this;
    },
    Renderer: { Backends: { SVG: 1 } },
    Stave: function() { return { addClef: () => this, addTimeSignature: () => this, addKeySignature: () => this, setContext: () => this, draw: () => this }; }
};

console.log('\n=== Testing with mock VexFlow ===');
console.log('Mock VF properties:', Object.keys(mockVF));

try {
    const result = jm.score(c_major_piece, mockVF);
    console.log('Result type:', typeof result);
    console.log('Result structure:', result);

    if (result && result.type) {
        console.log('✅ Structured result type:', result.type);
    } else if (result && result.nodeType === 1) {
        console.log('✅ DOM element returned');
        console.log('Element tag:', result.tagName);
        console.log('Element id:', result.id);
    } else {
        console.log('❌ Unexpected result format');
    }
} catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Stack:', error.stack);
}