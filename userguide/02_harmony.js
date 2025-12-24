/**
 * JMON-ALGO TUTORIAL 02: HARMONY
 * JavaScript translation of Djalgo's harmony tutorial
 *
 * This tutorial covers:
 * - Scales and modes
 * - Chords and voicing
 * - Ornaments (grace notes, trills, mordents, turns, arpeggios)
 * - Progressions
 * - Rhythm generation
 */

import jm from '../../../GitHub/algo/src/index.js';

console.log('=== JMON-ALGO TUTORIAL 02: HARMONY ===\n');

// =====================================================
// 1. SCALES
// =====================================================
console.log('1. Scales\n');

// Generate C major scale
const cMajor = new jm.theory.harmony.Scale('C', 'major');
const cMajorNotes = cMajor.generate({ octave: 4 });

console.log('C Major scale (octave 4):');
console.log('  MIDI notes:', cMajorNotes.slice(0, 8)); // C4 to C5
console.log('  Contains C4 (60):', cMajorNotes.includes(60));
console.log('  Contains G4 (67):', cMajorNotes.includes(67));
console.log('');

// Different modes
const dDorian = new jm.theory.harmony.Scale('D', 'dorian');
const dDorianNotes = dDorian.generate({ octave: 4 });
console.log('D Dorian scale:', dDorianNotes.slice(0, 7));
console.log('');

// Pentatonic
const cPentatonic = new jm.theory.harmony.Scale('C', 'major pentatonic');
const cPentatonicNotes = cPentatonic.generate({ octave: 4 });
console.log('C Pentatonic (5 notes):', cPentatonicNotes.slice(0, 5));
console.log('');

// Convert scale to JMON track
const cMajorTrack = cMajorNotes.slice(0, 8).map((pitch, i) => ({
  pitch,
  duration: 1,
  time: i,
  velocity: 0.8
}));

console.log('C Major as JMON track:', cMajorTrack.length, 'notes');
console.log('  First note:', cMajorTrack[0]);
console.log('  Last note:', cMajorTrack[7]);
console.log('');

// =====================================================
// 2. CHORDS
// =====================================================
console.log('2. Chords\n');

// In JMON, a chord is represented as an array in the pitch field
const cMajorChord = {
  pitch: [60, 64, 67],  // C, E, G
  duration: 1,
  time: 0,
  velocity: 0.8
};

console.log('C Major chord:', cMajorChord.pitch);
console.log('');

// =====================================================
// 3. ORNAMENTS
// =====================================================
console.log('3. Ornaments\n');

// Test notes for ornaments
const testNotes = [
  { pitch: 60, duration: 2, time: 0, velocity: 0.8 },
  { pitch: 64, duration: 2, time: 2, velocity: 0.8 },
  { pitch: 67, duration: 2, time: 4, velocity: 0.8 }
];

// 3.1 Grace Note (Acciaccatura)
console.log('3.1 Grace Note (Acciaccatura)');
const graceNoteOrnament = new jm.theory.harmony.Ornament({
  type: 'grace_note',
  parameters: {
    graceNoteType: 'acciaccatura',
    gracePitches: [72]  // C5
  }
});
const withGraceNote = graceNoteOrnament.apply([...testNotes], 0);
console.log('  Original: 1 note');
console.log('  With grace note:', withGraceNote.length, 'notes (added ornament)');
console.log('');

// 3.2 Trill
console.log('3.2 Trill');
const trillOrnament = new jm.theory.harmony.Ornament({
  type: 'trill',
  parameters: {
    by: 2,           // Trill to note 2 steps up
    trillRate: 0.25  // 16th notes
  },
  tonic: 'C',
  mode: 'major'
});
const withTrill = trillOrnament.apply([...testNotes], 0);
console.log('  Original: 1 note (duration 2)');
console.log('  With trill:', withTrill.length, 'notes (alternating)');
console.log('  Trill pitches:', withTrill.slice(0, 4).map(n => n.pitch));
console.log('');

// 3.3 Mordent
console.log('3.3 Mordent');
const mordentOrnament = new jm.theory.harmony.Ornament({
  type: 'mordent',
  parameters: {
    by: -1  // Mordent down one step
  },
  tonic: 'C',
  mode: 'major'
});
const withMordent = mordentOrnament.apply([...testNotes], 0);
console.log('  Original: 1 note');
console.log('  With mordent:', withMordent.length, 'notes (quick alternation)');
console.log('  Pattern:', withMordent.slice(0, 3).map(n => n.pitch));
console.log('');

// 3.4 Turn
console.log('3.4 Turn');
const turnOrnament = new jm.theory.harmony.Ornament({
  type: 'turn',
  tonic: 'C',
  mode: 'major'
});
const withTurn = turnOrnament.apply([...testNotes], 0);
console.log('  Original: 1 note');
console.log('  With turn:', withTurn.length, 'notes (4-note pattern)');
console.log('  Turn pattern:', withTurn.slice(0, 4).map(n => n.pitch));
console.log('');

// 3.5 Arpeggio
console.log('3.5 Arpeggio');
const arpeggioOrnament = new jm.theory.harmony.Ornament({
  type: 'arpeggio',
  parameters: {
    arpeggioDegrees: [0, 2, 4, 2],  // Triad up and down
    direction: 'up'
  },
  tonic: 'C',
  mode: 'major'
});
const withArpeggio = arpeggioOrnament.apply([...testNotes], 0);
console.log('  Original: 1 note');
console.log('  With arpeggio:', withArpeggio.length, 'notes');
console.log('  Arpeggio pattern:', withArpeggio.map(n => n.pitch));
console.log('');

// =====================================================
// 4. VOICE LEADING
// =====================================================
console.log('4. Voice Leading\n');

// Voice creates chords from a melody
const voice = new jm.theory.harmony.Voice('major', 'C', [0, 2, 4]); // Triads

// Convert melody to chords
const melody = [
  { pitch: 60, duration: 1, time: 0, velocity: 0.8 },
  { pitch: 62, duration: 1, time: 1, velocity: 0.8 },
  { pitch: 64, duration: 1, time: 2, velocity: 0.8 },
  { pitch: 65, duration: 1, time: 3, velocity: 0.8 }
];

const harmonized = melody.map(note => {
  const chord = voice.pitchToChord(note.pitch);
  return {
    ...note,
    pitch: chord
  };
});

console.log('Original melody:', melody.map(n => n.pitch));
console.log('Harmonized (first chord):', harmonized[0].pitch);
console.log('Harmonized (second chord):', harmonized[1].pitch);
console.log('');

// =====================================================
// 5. CHORD PROGRESSIONS
// =====================================================
console.log('5. Chord Progressions\n');

// Generate random progression using circle of fifths
const progression = new jm.theory.harmony.Progression('C4', 'P5', 'chords', [3, 3, 1]);
const chords = progression.generate(8, 5); // 8 chords, seed 5

console.log('Random progression (circle of fifths):');
console.log('  Generated', chords.length, 'chords');
console.log('  First chord:', chords[0]);
console.log('  Second chord:', chords[1]);
console.log('');

// Convert to JMON track
const progressionTrack = chords.map((chord, i) => ({
  pitch: chord,
  duration: 1,
  time: i,
  velocity: 0.7
}));
console.log('Progression as track:', progressionTrack.length, 'chords');
console.log('');

// =====================================================
// 6. RHYTHM
// =====================================================
console.log('6. Rhythm\n');

// 6.1 Isorhythm
console.log('6.1 Isorhythm');
const pitches = [60, 62, 64, 65, 67];
const durations = [1, 0.5, 0.5, 1];
const isoNotes = jm.theory.rhythm.isorhythm(pitches, durations);
console.log('  Pitches:', pitches.length);
console.log('  Durations:', durations.length);
console.log('  Result:', isoNotes.length, 'notes (LCM of 5*4=20)');
console.log('  First notes:', isoNotes.slice(0, 3).map(n => [n.pitch, n.duration]));
console.log('');

// 6.2 Beatcycle
console.log('6.2 Beatcycle');
const beatPitches = [60, 62, 64, 65, 67, 69, 71, 72];
const beatDurations = [1, 0.5, 0.5, 1];
const beatNotes = jm.theory.rhythm.beatcycle(beatPitches, beatDurations);
console.log('  Result:', beatNotes.length, 'notes (matches pitch count)');
console.log('  Durations assigned:', beatNotes.slice(0, 4).map(n => n.duration));
console.log('');

// 6.3 Random Rhythm
console.log('6.3 Random Rhythm');
const rhythm = new jm.theory.rhythm.Rhythm({
  measureLength: 4,
  durations: [0.25, 0.5, 1, 2]
});
const randomRhythm = rhythm.random({ restProbability: 0.2 });
console.log('  Generated', randomRhythm.length, 'rhythmic events');
console.log('  Total duration:', randomRhythm.reduce((sum, r) => sum + r.duration, 0));
console.log('  Sample:', randomRhythm.slice(0, 4).map(r => r.duration));
console.log('');

// =====================================================
// 7. COMPLETE EXAMPLE: TWINKLE WITH HARMONY
// =====================================================
console.log('7. Complete Example: Twinkle with Harmony\n');

// Original melody
const twinkle = [
  { pitch: 60, duration: 1, time: 0, velocity: 0.8 },   // C
  { pitch: 60, duration: 1, time: 1, velocity: 0.8 },   // C
  { pitch: 67, duration: 1, time: 2, velocity: 0.8 },   // G
  { pitch: 67, duration: 1, time: 3, velocity: 0.8 },   // G
  { pitch: 69, duration: 1, time: 4, velocity: 0.8 },   // A
  { pitch: 69, duration: 1, time: 5, velocity: 0.8 },   // A
  { pitch: 67, duration: 2, time: 6, velocity: 0.8 },   // G
  { pitch: 65, duration: 1, time: 8, velocity: 0.8 },   // F
  { pitch: 65, duration: 1, time: 9, velocity: 0.8 },   // F
  { pitch: 64, duration: 1, time: 10, velocity: 0.8 },  // E
  { pitch: 64, duration: 1, time: 11, velocity: 0.8 },  // E
  { pitch: 62, duration: 1, time: 12, velocity: 0.8 },  // D
  { pitch: 62, duration: 1, time: 13, velocity: 0.8 },  // D
  { pitch: 60, duration: 2, time: 14, velocity: 0.8 }   // C
];

// Add harmonization to specific notes
const twinkleVoice = new jm.theory.harmony.Voice('major', 'C', [0, 2, 4]);
const twinkleChords = [
  twinkleVoice.pitchToChord(twinkle[0].pitch),  // First chord
  twinkleVoice.pitchToChord(twinkle[7].pitch)   // Chord at "How"
];

const chordTrack = [
  { pitch: twinkleChords[0], duration: 1, time: 0, velocity: 0.6 },
  { pitch: twinkleChords[1], duration: 1, time: 7, velocity: 0.6 }
];

console.log('Twinkle melody:', twinkle.length, 'notes');
console.log('Added chords:', chordTrack.length, 'chords');
console.log('  First chord:', chordTrack[0].pitch);
console.log('');

// Add ornaments to make it more interesting
const ornamentedTwinkle = new jm.theory.harmony.Ornament({
  type: 'trill',
  parameters: { by: 1, trillRate: 0.25 },
  tonic: 'C',
  mode: 'major'
}).apply(twinkle, 6);  // Add trill to note index 6 (the long G)

console.log('With trill on long note:', ornamentedTwinkle.length, 'notes total');
console.log('');

// Create complete composition
const twinkleComposition = {
  format: 'jmon',
  version: '1.0',
  tempo: 120,
  keySignature: 'C',
  tracks: [
    {
      label: 'Melody',
      notes: ornamentedTwinkle
    },
    {
      label: 'Chords',
      notes: chordTrack
    }
  ]
};

console.log('Final composition:');
console.log('  Tempo:', twinkleComposition.tempo, 'BPM');
console.log('  Key:', twinkleComposition.keySignature);
console.log('  Tracks:', twinkleComposition.tracks.length);
console.log('  Total notes:', twinkleComposition.tracks.reduce(
    (sum, t) => sum + t.notes.length, 0
  ));
console.log('');

console.log('=== TUTORIAL COMPLETE ===');
console.log('Next: 03_loops.js - Learn about polyloops and rhythmic patterns');

// Export for use in other examples
export { cMajorTrack, twinkleComposition, voice };
