// For use in Zed REPL / Deno kernel
import { jm } from '../../dist/jmon.esm.js';

const notes = [
  { pitch: 60, duration: 1, time: 0 },
  { pitch: 62, duration: 1, time: 1 },
  { pitch: 64, duration: 1, time: 2 },
  { pitch: 65, duration: 1, time: 3 },
  { pitch: 67, duration: 1, time: 4 },
  { pitch: 69, duration: 1, time: 5 },
  { pitch: 71, duration: 1, time: 6 },
  { pitch: 72, duration: 1, time: 7 }
];

const piece = {
  metadata: { title: "C Major" },
  tracks: [{ notes }]
};

// In REPL, you can only inspect data, not play/render
console.log("Piece:", piece);

// Convert to MIDI or other formats
const midiData = jm.converters.midi(piece);
console.log("MIDI bytes:", midiData.length);

// Or just export the piece for inspection
piece;
