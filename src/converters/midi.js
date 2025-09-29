/* jmon-to-midi.js - Convert jmon format to MIDI using Tone.js Midi */
import { compileEvents } from "../algorithms/audio/index.js";
export class Midi {
    static midiToNoteName(midi) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const noteIndex = midi % 12;
        return noteNames[noteIndex] + octave;
    }
    static convert(composition) {
        // Conversion JMON -> MIDI (structure JSON), wired to audio.compileEvents for performance modulations
        const bpm = composition.tempo || composition.bpm || 120;
        const timeSignature = composition.timeSignature || '4/4';
        const rawTracks = composition.tracks || [];
        const tracksArray = Array.isArray(rawTracks)
            ? rawTracks
            : (rawTracks && typeof rawTracks === 'object' ? Object.values(rawTracks) : []);

        return {
            header: {
                bpm,
                timeSignature,
            },
            tracks: tracksArray.map(track => {
                const label = track.label || track.name;
                const notesSrc = Array.isArray(track.notes) ? track.notes
                                : (Array.isArray(track) ? track : []);
                const safeNotes = Array.isArray(notesSrc) ? notesSrc : [];

                // Compile performance modulations from declarative articulations
                const perf = compileEvents({ notes: safeNotes }, { tempo: bpm, timeSignature });

                // Flatten to MIDI-friendly note objects (no legacy note.articulation)
                const notes = safeNotes.map(note => ({
                    pitch: note.pitch,
                    noteName: (typeof note.pitch === 'number') ? Midi.midiToNoteName(note.pitch) : note.pitch,
                    time: note.time,
                    duration: note.duration,
                    velocity: note.velocity || 0.8
                }));

                return {
                    label,
                    notes,
                    modulations: (perf && Array.isArray(perf.modulations)) ? perf.modulations : []
                };
            })
        };
    }
}
export function midi(composition) {
    return Midi.convert(composition);
}
