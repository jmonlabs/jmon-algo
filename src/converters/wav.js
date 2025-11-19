/* JMON WAV - WAV audio generation from JMON format */
import { compileEvents } from "../algorithms/audio/index.js";

// ...existing code...
export function wav(composition, options = {}) {
	return {
		sampleRate: options.sampleRate || 44100,
		duration: options.duration || 10,
		channels: options.channels || 1,
		tempo: composition.tempo || composition.bpm || 120,
		notes: composition.tracks?.flatMap(t => t.notes) || []
	};
}

/**
 * Download a WAV file from a JMON composition
 *
 * @param {Object} composition - The JMON composition
 * @param {Object} Tone - The Tone.js library (import from npm:tone)
 * @param {string} filename - Output filename (default: "composition.wav")
 * @param {number} duration - Duration in seconds (default: auto-calculated from composition)
 * @returns {Promise<void>}
 *
 * @example
 * import * as Tone from "npm:tone@14.7.77";
 * await jm.converters.downloadWav(composition, Tone, "my-song.wav");
 */
export async function downloadWav(composition, Tone, filename = "composition.wav", duration) {
	// Normalize audioGraph format before processing
	const { normalizeAudioGraph } = await import("../utils/normalize.js");
	normalizeAudioGraph(composition);

	// Calculate duration from composition if not provided
	const maxTime = composition.tracks?.reduce((max, track) => {
		const trackMax = track.notes?.reduce((tMax, note) => {
			const endTime = (note.time || 0) + (note.duration || 0);
			return Math.max(tMax, endTime);
		}, 0) || 0;
		return Math.max(max, trackMax);
	}, 0) || 4;

	// Convert quarter notes to seconds
	const tempo = composition.tempo || 120;
	const secondsPerQuarterNote = 60 / tempo;
	const calculatedDuration = maxTime * secondsPerQuarterNote + 1; // +1 second buffer

	const finalDuration = duration || calculatedDuration;

	// Render audio offline using Tone.js
	const buffer = await Tone.Offline(async ({ transport }) => {
		transport.bpm.value = tempo;

		// Build audioGraph instruments if present
		const graphInstruments = await buildAudioGraphInstruments(composition, Tone);

		// Compile modulations for all tracks
		const tracks = composition.tracks || [];
		const compiledTracks = tracks.map((track) => {
			try {
				return compileEvents(track);
			} catch (e) {
				console.warn(`[WAV] Failed to compile track:`, e);
				return { notes: track.notes || [], modulations: [] };
			}
		});

		// Create synths and schedule notes for each track
		tracks.forEach((track, trackIndex) => {
			const notes = track.notes || [];
			const { modulations = [] } = compiledTracks[trackIndex] || {};
			const synthRef = track.synthRef;

			// Determine synth type - prioritize track.synth, then fall back to track.instrument
			let requestedSynthType = track.synth || "PolySynth";

			// If instrument specified, use MonoSynth to support articulations
			// Note: This won't sound like the actual GM instrument (would need Sampler)
			// but Samplers can't be modulated for vibrato/tremolo/glissando
			if (!track.synth && track.instrument !== undefined) {
				requestedSynthType = "MonoSynth";
			}

			// Create polyphonic synth for normal notes
			let polySynth = null;
			if (synthRef && graphInstruments && graphInstruments[synthRef]) {
				polySynth = graphInstruments[synthRef];
			} else {
				try {
					polySynth = new Tone[requestedSynthType]().toDestination();
				} catch (e) {
					polySynth = new Tone.PolySynth().toDestination();
				}
			}

			// Determine mono synth type for articulated notes
			let monoSynthType = "MonoSynth"; // default
			if (requestedSynthType === "PolySynth") {
				monoSynthType = "Synth";
			} else if (requestedSynthType.includes("Poly")) {
				monoSynthType = requestedSynthType.replace("Poly", "");
				if (!Tone[monoSynthType]) {
					monoSynthType = "MonoSynth";
				}
			} else {
				monoSynthType = requestedSynthType;
			}

			// Create modulation lookup by note index
			const modsByNote = {};
			modulations.forEach((mod) => {
				if (!modsByNote[mod.index]) modsByNote[mod.index] = [];
				modsByNote[mod.index].push(mod);
			});

			// Schedule notes with articulations
			notes.forEach((note, noteIndex) => {
				const time = (note.time || 0) * secondsPerQuarterNote;
				const duration = (note.duration || 1) * secondsPerQuarterNote;
				const velocity = note.velocity || 0.8;
				const noteMods = modsByNote[noteIndex] || [];

				// Handle chords
				if (Array.isArray(note.pitch)) {
					const noteNames = note.pitch.map((p) =>
						typeof p === "number" ? Tone.Frequency(p, "midi").toNote() : p
					);

					// Check if chord has articulations
					const vibrato = noteMods.find((m) => m.type === "pitch" && m.subtype === "vibrato");
					const tremolo = noteMods.find((m) => m.type === "amplitude" && m.subtype === "tremolo");
					const glissando = noteMods.find(
						(m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
					);

					if (vibrato || tremolo || glissando) {
						// Apply articulations to each note in chord with dedicated mono synths
						noteNames.forEach((noteName) => {
							const monoSynth = new Tone[monoSynthType]().toDestination();

							monoSynth.triggerAttack(noteName, time, velocity);

							// Apply glissando
							if (glissando && glissando.to !== undefined && monoSynth.detune) {
								const toNote = typeof glissando.to === "number"
									? Tone.Frequency(glissando.to, "midi").toNote()
									: glissando.to;
								const startFreq = Tone.Frequency(noteName).toFrequency();
								const endFreq = Tone.Frequency(toNote).toFrequency();
								const cents = 1200 * Math.log2(endFreq / startFreq);
								monoSynth.detune.setValueAtTime(0, time);
								monoSynth.detune.linearRampToValueAtTime(cents, time + duration);
							}

							// Apply vibrato
							if (vibrato && monoSynth.frequency) {
								const rate = vibrato.rate || 5;
								const depth = vibrato.depth || 50;
								const depthRatio = Math.pow(2, depth / 1200);
								const baseFreq = Tone.Frequency(noteName).toFrequency();
								const numSteps = Math.ceil(duration * rate * 10);
								const values = [];
								for (let i = 0; i < numSteps; i++) {
									const phase = (i / numSteps) * duration * rate * Math.PI * 2;
									const offset = Math.sin(phase) * (depthRatio - 1);
									values.push(baseFreq * (1 + offset));
								}
								monoSynth.frequency.setValueCurveAtTime(values, time, duration);
							}

							// Apply tremolo
							if (tremolo && monoSynth.volume) {
								const rate = tremolo.rate || 8;
								const depth = tremolo.depth || 0.3;
								const numSteps = Math.ceil(duration * rate * 10);
								const values = [];
								for (let i = 0; i < numSteps; i++) {
									const phase = (i / numSteps) * duration * rate * Math.PI * 2;
									const offset = Math.sin(phase) * depth;
									values.push(offset * -20);
								}
								monoSynth.volume.setValueCurveAtTime(values, time, duration);
							}

							monoSynth.triggerRelease(time + duration);
						});
					} else {
						// Normal chord without articulations
						polySynth.triggerAttackRelease(noteNames, duration, time, velocity);
					}
					return;
				}

				// Convert pitch to note name
				const noteName = typeof note.pitch === "number"
					? Tone.Frequency(note.pitch, "midi").toNote()
					: note.pitch;

				// Check for articulations
				const vibrato = noteMods.find((m) => m.type === "pitch" && m.subtype === "vibrato");
				const tremolo = noteMods.find((m) => m.type === "amplitude" && m.subtype === "tremolo");
				const glissando = noteMods.find(
					(m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
				);

				if (vibrato || tremolo || glissando) {
					// Create dedicated mono synth for articulated note
					const monoSynth = new Tone[monoSynthType]().toDestination();

					monoSynth.triggerAttack(noteName, time, velocity);

					// Apply glissando
					if (glissando && glissando.to !== undefined && monoSynth.detune) {
						const toNote = typeof glissando.to === "number"
							? Tone.Frequency(glissando.to, "midi").toNote()
							: glissando.to;
						const startFreq = Tone.Frequency(noteName).toFrequency();
						const endFreq = Tone.Frequency(toNote).toFrequency();
						const cents = 1200 * Math.log2(endFreq / startFreq);
						monoSynth.detune.setValueAtTime(0, time);
						monoSynth.detune.linearRampToValueAtTime(cents, time + duration);
					}

					// Apply vibrato
					if (vibrato && monoSynth.frequency) {
						const rate = vibrato.rate || 5;
						const depth = vibrato.depth || 50;
						const depthRatio = Math.pow(2, depth / 1200);
						const baseFreq = Tone.Frequency(noteName).toFrequency();

						const numSteps = Math.ceil(duration * rate * 10);
						const values = [];
						for (let i = 0; i < numSteps; i++) {
							const phase = (i / numSteps) * duration * rate * Math.PI * 2;
							const offset = Math.sin(phase) * (depthRatio - 1);
							values.push(baseFreq * (1 + offset));
						}
						monoSynth.frequency.setValueCurveAtTime(values, time, duration);
					}

					// Apply tremolo
					if (tremolo && monoSynth.volume) {
						const rate = tremolo.rate || 8;
						const depth = tremolo.depth || 0.3;

						const numSteps = Math.ceil(duration * rate * 10);
						const values = [];
						for (let i = 0; i < numSteps; i++) {
							const phase = (i / numSteps) * duration * rate * Math.PI * 2;
							const offset = Math.sin(phase) * depth;
							values.push(offset * -20); // Convert to dB
						}
						monoSynth.volume.setValueCurveAtTime(values, time, duration);
					}

					monoSynth.triggerRelease(time + duration);
				} else {
					// Normal note without articulations
					polySynth.triggerAttackRelease(noteName, duration, time, velocity);
				}
			});
		});

		transport.start(0);
	}, finalDuration);

	// Convert AudioBuffer to WAV blob
	const wavBlob = await audioBufferToWav(buffer);

	// Download
	const url = URL.createObjectURL(wavBlob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/**
 * Build audioGraph instruments from composition
 * @private
 */
async function buildAudioGraphInstruments(composition, Tone) {
	if (!composition.audioGraph || !Array.isArray(composition.audioGraph)) {
		return null;
	}

	const map = {};
	const { SYNTHESIZER_TYPES, ALL_EFFECTS } = await import("../constants/audio-effects.js");

	try {
		// First pass: Create all nodes
		composition.audioGraph.forEach((node) => {
			const { id, type, options = {} } = node;
			if (!id || !type) return;

			let instrument = null;

			if (SYNTHESIZER_TYPES.includes(type)) {
				// Create synth
				try {
					instrument = new Tone[type](options);
				} catch (e) {
					console.warn(`Failed to create ${type}, using PolySynth:`, e);
					instrument = new Tone.PolySynth();
				}
			} else if (ALL_EFFECTS.includes(type)) {
				// Create effect
				try {
					instrument = new Tone[type](options);
				} catch (e) {
					console.warn(`Failed to create ${type} effect:`, e);
					instrument = null;
				}
			} else if (type === "Destination") {
				map[id] = Tone.Destination;
			}

			if (instrument) {
				map[id] = instrument;
			}
		});

		// Second pass: Connect the routing
		composition.audioGraph.forEach((node) => {
			const { id, target } = node;
			if (!id || !map[id] || map[id] === Tone.Destination) return;

			const currentNode = map[id];

			if (target && map[target]) {
				// Connect to target
				if (map[target] === Tone.Destination) {
					currentNode.toDestination();
				} else {
					currentNode.connect(map[target]);
				}
			} else {
				// No target, connect to destination
				currentNode.toDestination();
			}
		});

		return map;
	} catch (e) {
		console.error("Failed building audioGraph instruments:", e);
		return null;
	}
}

/**
 * Convert an AudioBuffer to a WAV blob
 * @private
 */
async function audioBufferToWav(buffer) {
	const numberOfChannels = buffer.numberOfChannels;
	const sampleRate = buffer.sampleRate;
	const length = buffer.length * numberOfChannels * 2;

	const arrayBuffer = new ArrayBuffer(44 + length);
	const view = new DataView(arrayBuffer);

	// WAV header
	const writeString = (offset, string) => {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	};

	writeString(0, "RIFF");
	view.setUint32(4, 36 + length, true);
	writeString(8, "WAVE");
	writeString(12, "fmt ");
	view.setUint32(16, 16, true); // fmt chunk size
	view.setUint16(20, 1, true); // PCM format
	view.setUint16(22, numberOfChannels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * numberOfChannels * 2, true); // byte rate
	view.setUint16(32, numberOfChannels * 2, true); // block align
	view.setUint16(34, 16, true); // bits per sample
	writeString(36, "data");
	view.setUint32(40, length, true);

	// Write audio data
	const channels = [];
	for (let i = 0; i < numberOfChannels; i++) {
		channels.push(buffer.getChannelData(i));
	}

	let offset = 44;
	for (let i = 0; i < buffer.length; i++) {
		for (let channel = 0; channel < numberOfChannels; channel++) {
			const sample = Math.max(-1, Math.min(1, channels[channel][i]));
			view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
			offset += 2;
		}
	}

	return new Blob([arrayBuffer], { type: "audio/wav" });
}
