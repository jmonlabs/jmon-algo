// Debug exactly what happens in Observable environment
import jm from './dist/jmon.esm.js';

// Simulate Observable's VexFlow import
const VF = {
    Renderer: function(container, backend) {
        console.log('Renderer constructor called');
        this.resize = (w, h) => console.log(`resize: ${w}x${h}`);
        this.getContext = () => ({
            setFont: () => {},
            save: () => {},
            restore: () => {},
            fillText: () => {},
            stroke: () => {},
            fill: () => {}
        });
    },
    Stave: function(x, y, width) {
        console.log(`Stave constructor: ${x}, ${y}, ${width}`);
        this.addClef = (clef) => { console.log(`addClef: ${clef}`); return this; };
        this.addTimeSignature = (sig) => { console.log(`addTimeSignature: ${sig}`); return this; };
        this.addKeySignature = (key) => { console.log(`addKeySignature: ${key}`); return this; };
        this.setContext = (ctx) => { console.log('setContext called'); return this; };
        this.draw = () => { console.log('stave draw called'); return this; };
    },
    StaveNote: function(options) {
        console.log('StaveNote constructor:', options);
        this.keys = options.keys;
        this.duration = options.duration;
    },
    Voice: function(options) {
        console.log('Voice constructor:', options);
        this.addTickables = (notes) => { console.log(`addTickables: ${notes.length} notes`); return this; };
        this.draw = (context, stave) => { console.log('voice draw called'); };
    },
    Formatter: function() {
        console.log('Formatter constructor');
        this.joinVoices = (voices) => { console.log(`joinVoices: ${voices.length} voices`); return this; };
        this.format = (voices, width) => { console.log(`format: ${voices.length} voices, width ${width}`); };
    }
};

// Add the Backends property that my code checks for
VF.Renderer.Backends = { SVG: 1 };

console.log('=== Testing with Complete VexFlow Mock ===');

const piece = {
    metadata: { title: 'Test' },
    timeSignature: '4/4',
    keySignature: 'C',
    notes: [
        { pitch: 60, duration: 1, time: 0 },
        { pitch: 64, duration: 1, time: 1 },
        { pitch: 67, duration: 1, time: 2 }
    ]
};

// Set up DOM
import { JSDOM } from 'jsdom';
global.document = new JSDOM().window.document;
global.window = global.document.defaultView;

console.log('\n=== Calling jm.score() ===');
console.log('VF object keys:', Object.keys(VF));
console.log('VF.Renderer exists:', !!VF.Renderer);
console.log('VF.Renderer.Backends exists:', !!VF.Renderer.Backends);

try {
    const result = jm.score(piece, VF, { width: 800, height: 200 });

    console.log('\n=== RESULT ===');
    console.log('Type:', typeof result);
    console.log('Is DOM element:', result && result.nodeType === 1);
    console.log('Tag name:', result && result.tagName);

    if (result && result.nodeType === 1) {
        console.log('✅ SUCCESS: Got DOM element!');
        console.log('Content:', result.innerHTML);
        console.log('Contains SVG:', result.innerHTML.includes('<svg'));
    } else {
        console.log('❌ FAILED: Still getting non-DOM result');
        console.log('Result:', result);
    }

} catch (error) {
    console.log('❌ ERROR during score():', error.message);
    console.log('Stack:', error.stack);
}