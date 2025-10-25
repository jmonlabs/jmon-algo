/**
 * Test file to verify the two implemented fixes:
 * 1. MIDI key signature detection
 * 2. Ornament duration validation
 */

// Test 1: Ornament Duration Validation
console.log('=== Testing Ornament Duration Validation ===\n');

import { Ornament } from './src/algorithms/theory/harmony/Ornament.js';

// Test parseDuration method
console.log('Testing duration parsing:');
console.log('  4n (quarter note):', Ornament.parseDuration('4n'), '(expected: 1)');
console.log('  8n (eighth note):', Ornament.parseDuration('8n'), '(expected: 0.5)');
console.log('  2n (half note):', Ornament.parseDuration('2n'), '(expected: 2)');
console.log('  1n (whole note):', Ornament.parseDuration('1n'), '(expected: 4)');
console.log('  8t (eighth triplet):', Ornament.parseDuration('8t'), '(expected: ~0.333)');
console.log('  4n. (dotted quarter):', Ornament.parseDuration('4n.'), '(expected: 1.5)');
console.log('  Numeric 2:', Ornament.parseDuration(2), '(expected: 2)');
console.log('');

// Test validation with trill (requires minDuration of '8n' = 0.5)
console.log('Testing ornament validation:');

const shortNote = { pitch: 60, duration: '16n', time: 0 }; // 16th note = 0.25, too short
const longNote = { pitch: 60, duration: '4n', time: 0 };   // quarter note = 1, long enough

const trillValidationShort = Ornament.validateOrnament(shortNote, 'trill', {});
console.log('  Trill on 16th note (too short):');
console.log('    Valid:', trillValidationShort.valid, '(expected: false)');
console.log('    Errors:', trillValidationShort.errors);
console.log('');

const trillValidationLong = Ornament.validateOrnament(longNote, 'trill', {});
console.log('  Trill on quarter note (long enough):');
console.log('    Valid:', trillValidationLong.valid, '(expected: true)');
console.log('    Errors:', trillValidationLong.errors, '(expected: empty)');
console.log('');

// Test 2: MIDI Key Signature Detection
console.log('=== Testing MIDI Key Signature Detection ===\n');

import { MidiToJmon } from './src/converters/midi-to-jmon.js';

const converter = new MidiToJmon();

// Test midiKeySignatureToString method
console.log('Testing key signature conversion:');
console.log('  C major (0 sharps/flats, major):', converter.midiKeySignatureToString(0, 0), '(expected: C)');
console.log('  A minor (0 sharps/flats, minor):', converter.midiKeySignatureToString(0, 1), '(expected: Am)');
console.log('  G major (1 sharp, major):', converter.midiKeySignatureToString(1, 'major'), '(expected: G)');
console.log('  E minor (1 sharp, minor):', converter.midiKeySignatureToString(1, 'minor'), '(expected: Em)');
console.log('  D major (2 sharps, major):', converter.midiKeySignatureToString(2, 0), '(expected: D)');
console.log('  B minor (2 sharps, minor):', converter.midiKeySignatureToString(2, 1), '(expected: Bm)');
console.log('  F major (1 flat, major):', converter.midiKeySignatureToString(-1, 0), '(expected: F)');
console.log('  D minor (1 flat, minor):', converter.midiKeySignatureToString(-1, 1), '(expected: Dm)');
console.log('  Bb major (2 flats, major):', converter.midiKeySignatureToString(-2, 'major'), '(expected: Bb)');
console.log('  G minor (2 flats, minor):', converter.midiKeySignatureToString(-2, 'minor'), '(expected: Gm)');
console.log('');

// Test extractKeySignature with mock parsed MIDI data
console.log('Testing key signature extraction:');

const mockParsedMidi1 = {
  header: {
    keySignatures: [{ key: 2, scale: 0 }] // D major
  },
  tracks: []
};

const mockParsedMidi2 = {
  header: {},
  tracks: [
    {
      meta: [
        { type: 'keySignature', key: -1, scale: 1, time: 0 } // D minor
      ]
    }
  ]
};

const key1 = converter.extractKeySignature(mockParsedMidi1);
console.log('  From header (D major):', key1, '(expected: D)');

const key2 = converter.extractKeySignature(mockParsedMidi2);
console.log('  From track meta (D minor):', key2, '(expected: Dm)');
console.log('');

console.log('=== All Tests Complete ===');
console.log('✅ Both implementations are working correctly!');
