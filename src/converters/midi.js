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
                const notesSrc = Array.isArray(track.events) ? track.events
                                : (Array.isArray(track.notes) ? track.notes
                                : (Array.isArray(track) ? track : []));
                const safeNotes = Array.isArray(notesSrc) ? notesSrc : [];

                // Compile performance modulations from declarative articulations
                const perf = compileEvents({ events: safeNotes }, { tempo: bpm, timeSignature });

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

/**
 * Download a MIDI file from a JMON composition
 *
 * @param {Object} composition - The JMON composition
 * @param {Object} ToneMidi - The @tonejs/midi library (import from npm:@tonejs/midi)
 * @param {string} filename - Output filename (default: "composition.mid")
 * @returns {Promise<void>}
 *
 * @example
 * import ToneMidi from "npm:@tonejs/midi@2.0.28";
 * await jm.converters.downloadMidi(composition, ToneMidi, "my-song.mid");
 */
export function downloadMidi(composition, ToneMidi, filename = "composition.mid") {
    // Convert JMON to MIDI data structure
    const midiData = Midi.convert(composition);

    // Create MIDI file using @tonejs/midi
    const midiFile = new ToneMidi.Midi();
    midiFile.header.setTempo(midiData.header.bpm);

    midiData.tracks.forEach((trackData) => {
        const track = midiFile.addTrack();
        track.name = trackData.label || "Track";

        // Add notes
        trackData.notes.forEach((note) => {
            track.addNote({
                midi: typeof note.pitch === "number" ? note.pitch : 60,
                time: note.time || 0,
                duration: note.duration || 0.5,
                velocity: note.velocity || 0.8,
            });
        });

        // Add articulation modulations as CC messages
        if (Array.isArray(trackData.modulations)) {
            trackData.modulations.forEach((mod) => {
                // Vibrato: Use CC1 (Modulation Wheel)
                if (mod.subtype === 'vibrato') {
                    const rate = mod.rate || 5;  // Hz
                    const depth = mod.depth || 50;  // cents
                    const start = mod.start || 0;
                    const end = mod.end || start + 1;

                    // Map depth (0-100 cents) to CC value (0-127)
                    const ccValue = Math.min(127, Math.round((depth / 100) * 127));

                    // Add CC message at note start
                    track.addCC({ number: 1, value: ccValue, time: start });
                    // Reset at note end
                    track.addCC({ number: 1, value: 0, time: end });
                }

                // Tremolo: Use CC11 (Expression)
                if (mod.subtype === 'tremolo') {
                    const rate = mod.rate || 8;  // Hz
                    const depth = mod.depth || 0.3;  // 0-1
                    const start = mod.start || 0;
                    const end = mod.end || start + 1;

                    // Map depth (0-1) to CC value (0-127)
                    const ccValue = Math.min(127, Math.round(depth * 127));

                    // Add CC11 automation
                    track.addCC({ number: 11, value: 127 - ccValue, time: start });
                    track.addCC({ number: 11, value: 127, time: end });
                }

                // Crescendo/Diminuendo: Use CC7 (Volume)
                if (mod.subtype === 'crescendo' || mod.subtype === 'diminuendo') {
                    const startV = mod.startVelocity || 0.8;
                    const endV = mod.endVelocity || 0.8;
                    const start = mod.start || 0;
                    const end = mod.end || start + 1;

                    // Convert velocity (0-1) to CC value (0-127)
                    const startCC = Math.round(startV * 127);
                    const endCC = Math.round(endV * 127);

                    track.addCC({ number: 7, value: startCC, time: start });
                    track.addCC({ number: 7, value: endCC, time: end });
                }
            });
        }
    });

    // Create blob and download
    const blob = new Blob([midiFile.toArray()], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
