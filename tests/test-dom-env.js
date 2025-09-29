// Test with DOM environment like Observable
import jm from './dist/jmon.esm.js';
import { JSDOM } from 'jsdom';

// Set up DOM like Observable
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

console.log('=== Testing with DOM Environment ===');
console.log('Has document:', typeof document !== 'undefined');
console.log('Has window:', typeof window !== 'undefined');

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

// Enhanced VexFlow mock that should trigger DOM rendering
const vexflowMock = {
    Factory: function(options) {
        console.log('Factory called with:', options);
        this.options = options;
        this.getContext = () => ({
            setFont: () => {},
            save: () => {},
            restore: () => {}
        });
        this.Stave = (options) => ({
            addClef: () => this,
            addTimeSignature: () => this,
            addKeySignature: () => this,
            setContext: () => this,
            draw: () => this
        });
        this.StaveNote = (options) => ({
            keys: options.keys,
            duration: options.duration,
            getTicks: () => ({ value: () => 8 })
        });
        this.Voice = (options) => ({
            setMode: () => {},
            setStrict: () => {},
            addTickables: () => {}
        });
        this.Formatter = () => ({
            joinVoices: () => this,
            format: () => {}
        });
        return this;
    },
    Renderer: {
        Backends: { SVG: 1 },
        constructor: function(element, backend) {
            this.getContext = () => ({
                setFont: () => {},
                save: () => {},
                restore: () => {}
            });
        }
    },
    // Add the properties that score function checks for
    VF: true,
    Flow: {}
};

console.log('\n=== Calling score function ===');
try {
    const result = jm.score(c_major_piece, vexflowMock, { width: 800, height: 200 });

    console.log('Result type:', typeof result);
    console.log('Is DOM element:', result && result.nodeType === 1);
    console.log('Is structured data:', result && result.type);

    if (result && result.nodeType === 1) {
        console.log('✅ SUCCESS: DOM element returned');
        console.log('Element tag:', result.tagName);
        console.log('Element ID:', result.id);
        console.log('Element innerHTML length:', result.innerHTML.length);
    } else if (result && result.type) {
        console.log('⚠️ Structured data returned instead of DOM element');
        console.log('Data type:', result.type);
    } else {
        console.log('❌ Unexpected result');
        console.log('Result:', result);
    }
} catch (error) {
    console.log('❌ Error:', error.message);
    if (error.message.includes('stave is not defined')) {
        console.log('🔍 This is the old "stave is not defined" bug');
    }
}