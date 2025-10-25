/**
 * Comprehensive tests for music theory modules
 * Tests: Scales, Progressions, Voice, Harmony, Rhythm, Ornaments, Articulations
 */

import { Scale } from '../src/algorithms/theory/harmony/Scale.js';
import { Progression } from '../src/algorithms/theory/harmony/Progression.js';
import { Voice } from '../src/algorithms/theory/harmony/Voice.js';
import { Ornament } from '../src/algorithms/theory/harmony/Ornament.js';
import { Articulation } from '../src/algorithms/theory/harmony/Articulation.js';
import { Rhythm } from '../src/algorithms/theory/rhythm/Rhythm.js';
import { isorhythm } from '../src/algorithms/theory/rhythm/isorhythm.js';
import { beatcycle } from '../src/algorithms/theory/rhythm/beatcycle.js';

console.log('=== Testing Music Theory Modules ===\n');

// Test 1: Scale Generation
console.log('1. Testing Scale Generation');
try {
  const cMajor = new Scale('C', 'major');
  const scale = cMajor.generate({ octave: 4 });

  console.log('  ✓ Generated C major scale');
  console.log('  ✓ Notes:', scale);
  console.log('  ✓ Contains C4 (60):', scale.includes(60));
  console.log('  ✓ Contains G4 (67):', scale.includes(67));

  // Test different modes
  const dorian = new Scale('D', 'dorian');
  const dorianScale = dorian.generate({ octave: 4 });
  console.log('  ✓ Generated D dorian scale:', dorianScale.slice(0, 7));

  const pentatonic = new Scale('C', 'pentatonic_major');
  const pentScale = pentatonic.generate({ octave: 4 });
  console.log('  ✓ Generated C pentatonic (5 notes):', pentScale.length >= 5);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 2: Chord Progressions
console.log('2. Testing Chord Progressions');
try {
  const progression = new Progression('C', 'major');

  // Test common progressions
  const chords = progression.generate(['I', 'IV', 'V', 'I']);
  console.log('  ✓ Generated I-IV-V-I progression');
  console.log('  ✓ Chord count:', chords.length);
  console.log('  ✓ First chord (C major):', chords[0]);

  // Test circle of fifths
  const circle = progression.circleOfFifths(4);
  console.log('  ✓ Generated circle of fifths:', circle.length, 'chords');

  // Test secondary dominants
  const secondary = progression.generate(['I', 'V/V', 'V', 'I']);
  console.log('  ✓ Generated progression with V/V');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 3: Voice Leading
console.log('3. Testing Voice Leading');
try {
  const voice = new Voice({
    key: 'C',
    mode: 'major',
    voices: 4
  });

  const chord1 = [60, 64, 67, 72]; // C major
  const chord2 = [65, 69, 72, 77]; // F major

  const voiceLed = voice.lead(chord1, chord2);
  console.log('  ✓ Generated voice leading');
  console.log('  ✓ From:', chord1);
  console.log('  ✓ To:', voiceLed);

  // Test multi-voice composition
  const melody = [60, 62, 64, 65, 67];
  const harmonized = voice.harmonize(melody, { voices: 3 });
  console.log('  ✓ Harmonized melody with', harmonized.length, 'voices');
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 4: Ornaments - Grace Notes
console.log('4. Testing Ornaments - Grace Notes');
try {
  const graceNote = new Ornament({
    type: 'grace_note',
    parameters: {
      graceNoteType: 'acciaccatura',
      gracePitches: [61, 63]
    }
  });

  const notes = [
    { pitch: 64, duration: 1, time: 0 },
    { pitch: 67, duration: 1, time: 1 }
  ];

  const ornamented = graceNote.apply(notes, 0);
  console.log('  ✓ Applied grace note');
  console.log('  ✓ Original notes:', notes.length);
  console.log('  ✓ Ornamented notes:', ornamented.length);
  console.log('  ✓ Added grace note:', ornamented.length > notes.length);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 5: Ornaments - Trill
console.log('5. Testing Ornaments - Trill');
try {
  const trill = new Ornament({
    type: 'trill',
    parameters: {
      by: 2,
      trillRate: 0.25
    },
    tonic: 'C',
    mode: 'major'
  });

  const notes = [
    { pitch: 60, duration: 2, time: 0 }
  ];

  const trilled = trill.apply(notes, 0);
  console.log('  ✓ Applied trill');
  console.log('  ✓ Original note: 1');
  console.log('  ✓ Trilled notes:', trilled.length);
  console.log('  ✓ Trill expanded note:', trilled.length > 1);
  console.log('  ✓ Sample pitches:', trilled.slice(0, 4).map(n => n.pitch));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 6: Ornaments - Mordent
console.log('6. Testing Ornaments - Mordent');
try {
  const mordent = new Ornament({
    type: 'mordent',
    parameters: {
      by: 1
    },
    tonic: 'C',
    mode: 'major'
  });

  const notes = [
    { pitch: 64, duration: 1, time: 0 }
  ];

  const mordented = mordent.apply(notes, 0);
  console.log('  ✓ Applied mordent');
  console.log('  ✓ Mordent notes:', mordented.length);
  console.log('  ✓ Pattern (main-auxiliary-main):', mordented.length === 3);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 7: Ornaments - Turn
console.log('7. Testing Ornaments - Turn');
try {
  const turn = new Ornament({
    type: 'turn',
    tonic: 'C',
    mode: 'major'
  });

  const notes = [
    { pitch: 64, duration: 1, time: 0 }
  ];

  const turned = turn.apply(notes, 0);
  console.log('  ✓ Applied turn');
  console.log('  ✓ Turn notes:', turned.length);
  console.log('  ✓ Four-note pattern:', turned.length === 4);
  console.log('  ✓ Pattern pitches:', turned.map(n => n.pitch));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 8: Ornaments - Arpeggio
console.log('8. Testing Ornaments - Arpeggio');
try {
  const arpeggio = new Ornament({
    type: 'arpeggio',
    parameters: {
      arpeggioDegrees: [0, 2, 4, 7],
      direction: 'up'
    },
    tonic: 'C',
    mode: 'major'
  });

  const notes = [
    { pitch: 60, duration: 2, time: 0 }
  ];

  const arpeggiated = arpeggio.apply(notes, 0);
  console.log('  ✓ Applied arpeggio');
  console.log('  ✓ Arpeggio notes:', arpeggiated.length);
  console.log('  ✓ Pattern pitches:', arpeggiated.map(n => n.pitch));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 9: Articulations
console.log('9. Testing Articulations');
try {
  // Test staccato
  let note = { pitch: 60, duration: 1, time: 0 };
  let result = Articulation.apply(note, 'staccato');
  console.log('  ✓ Applied staccato:', result.success);
  console.log('  ✓ Duration shortened:', note.duration < 1);

  // Test legato
  note = { pitch: 62, duration: 0.5, time: 0 };
  result = Articulation.apply(note, 'legato');
  console.log('  ✓ Applied legato:', result.success);

  // Test accent
  note = { pitch: 64, duration: 1, time: 0, velocity: 0.8 };
  result = Articulation.apply(note, 'accent');
  console.log('  ✓ Applied accent:', result.success);
  console.log('  ✓ Velocity increased:', note.velocity > 0.8);

  // Test glissando
  note = { pitch: 60, duration: 1, time: 0 };
  result = Articulation.apply(note, 'glissando', { targetPitch: 72 });
  console.log('  ✓ Applied glissando:', result.success);
  console.log('  ✓ Has articulation data:', note.articulations?.length > 0);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 10: Rhythm - Isorhythm
console.log('10. Testing Rhythm - Isorhythm');
try {
  const pitches = [60, 62, 64, 65, 67];
  const durations = [1, 0.5, 0.5, 1];

  const isoNotes = isorhythm(pitches, durations);
  console.log('  ✓ Generated isorhythm');
  console.log('  ✓ Note count:', isoNotes.length);
  console.log('  ✓ LCM of lengths (5*4=20):', isoNotes.length === 20);
  console.log('  ✓ Sample notes:', isoNotes.slice(0, 3).map(n => [n.pitch, n.duration]));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 11: Rhythm - Beatcycle
console.log('11. Testing Rhythm - Beatcycle');
try {
  const pitches = [60, 62, 64, 65, 67, 69, 71, 72];
  const durations = [1, 0.5, 0.5, 1];

  const cycleNotes = beatcycle(pitches, durations);
  console.log('  ✓ Generated beatcycle');
  console.log('  ✓ Note count:', cycleNotes.length);
  console.log('  ✓ Matches pitch count:', cycleNotes.length === pitches.length);
  console.log('  ✓ Sample durations:', cycleNotes.slice(0, 5).map(n => n.duration));
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

// Test 12: Rhythm - Random Generation
console.log('12. Testing Rhythm - Random Generation');
try {
  const rhythm = new Rhythm({
    measureLength: 4,
    durations: [0.25, 0.5, 1, 2]
  });

  const randomRhythm = rhythm.random({ restProbability: 0.2 });
  console.log('  ✓ Generated random rhythm');
  console.log('  ✓ Pattern count:', randomRhythm.length);
  console.log('  ✓ Sample durations:', randomRhythm.slice(0, 5).map(r => r.duration));
  console.log('  ✓ Total duration ≤ 4:', randomRhythm.reduce((sum, r) => sum + r.duration, 0) <= 4);
} catch (error) {
  console.error('  ✗ Error:', error.message);
}
console.log('');

console.log('=== Music Theory Tests Complete ===\n');
