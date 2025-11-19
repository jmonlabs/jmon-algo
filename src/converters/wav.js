/* JMON WAV - WAV audio generation from JMON format */
import { compileEvents } from "../algorithms/audio/index.js";
import { generateSamplerUrls } from "../utils/gm-instruments.js";

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
		const events = track.events || track.notes || [];
		const trackMax = events.reduce((tMax, note) => {
			const endTime = (note.time || 0) + (note.duration || 0);
			return Math.max(tMax, endTime);
		}, 0);
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
		const compiledModulations = [];
		const tracks = composition.tracks || [];
		tracks.forEach((track, index) => {
			try {
				const compiled = compileEvents(track);
				compiledModulations[index] = compiled.modulations || [];
			} catch (e) {
				console.warn(`[WAV] Failed to compile modulations for track ${index}:`, e);
				compiledModulations[index] = [];
			}
		});

		// Create synths for each track
		tracks.forEach((track, trackIndex) => {
			const notes = track.events || track.notes || [];
			const synthRef = track.synthRef;
			const trackModulations = compiledModulations[trackIndex] || [];

			// Determine which synth/sampler to use
			let synth = null;
			if (synthRef && graphInstruments && graphInstruments[synthRef]) {
				// Use audioGraph synth
				synth = graphInstruments[synthRef];
			} else if (track.instrument !== undefined && !track.synth) {
				// Create Sampler for GM instrument
				const urls = generateSamplerUrls(track.instrument);
				synth = new Tone.Sampler({
					urls,
					baseUrl: "" // URLs are already complete
				}).toDestination();
				console.log(`[WAV] Creating Sampler for GM instrument ${track.instrument}`);
			} else {
				// Use specified synth type or default PolySynth
				const synthType = track.synth || "PolySynth";
				try {
					synth = new Tone[synthType]().toDestination();
				} catch (e) {
					synth = new Tone.PolySynth().toDestination();
				}
			}

			// Check for vibrato/tremolo modulations
			const vibratoMods = trackModulations.filter(
				(m) => m.type === "pitch" && m.subtype === "vibrato"
			);
			const tremoloMods = trackModulations.filter(
				(m) => m.type === "amplitude" && m.subtype === "tremolo"
			);

			// Create effect chain if needed
			let vibratoEffect = null;
			let tremoloEffect = null;

			if (vibratoMods.length > 0 || tremoloMods.length > 0) {
				console.log(
					`[WAV] Creating effect chain for track ${trackIndex} (${vibratoMods.length} vibrato, ${tremoloMods.length} tremolo)`
				);

				// Disconnect synth from destination first
				if (!synthRef || !graphInstruments?.[synthRef]) {
					synth.disconnect();
				}

				// Create effects
				if (vibratoMods.length > 0) {
					const defaultVibrato = vibratoMods[0];
					vibratoEffect = new Tone.Vibrato({
						frequency: defaultVibrato.rate || 5,
						depth: (defaultVibrato.depth || 50) / 100,
					});
					vibratoEffect.wet.value = 0; // Start disabled
				}

				if (tremoloMods.length > 0) {
					const defaultTremolo = tremoloMods[0];
					tremoloEffect = new Tone.Tremolo({
						frequency: defaultTremolo.rate || 8,
						depth: defaultTremolo.depth || 0.3,
					}).start();
					tremoloEffect.wet.value = 0; // Start disabled
				}

				// Connect effect chain
				if (vibratoEffect && tremoloEffect) {
					synth.connect(vibratoEffect);
					vibratoEffect.connect(tremoloEffect);
					tremoloEffect.toDestination();
				} else if (vibratoEffect) {
					synth.connect(vibratoEffect);
					vibratoEffect.toDestination();
				} else if (tremoloEffect) {
					synth.connect(tremoloEffect);
					tremoloEffect.toDestination();
				}

				// Schedule effect enable/disable based on modulations
				trackModulations.forEach((mod) => {
					const startTime = mod.start * secondsPerQuarterNote;
					const endTime = mod.end * secondsPerQuarterNote;

					if (mod.type === "pitch" && mod.subtype === "vibrato" && vibratoEffect) {
						const vibratoFreq = mod.rate || 5;
						const vibratoDepth = (mod.depth || 50) / 100;

						// Schedule enable
						transport.schedule((time) => {
							vibratoEffect.frequency.value = vibratoFreq;
							vibratoEffect.depth.value = vibratoDepth;
							vibratoEffect.wet.value = 1;
						}, startTime);

						// Schedule disable
						transport.schedule((time) => {
							vibratoEffect.wet.value = 0;
						}, endTime);
					}

					if (mod.type === "amplitude" && mod.subtype === "tremolo" && tremoloEffect) {
						const tremoloFreq = mod.rate || 8;
						const tremoloDepth = mod.depth || 0.3;

						// Schedule enable
						transport.schedule((time) => {
							tremoloEffect.frequency.value = tremoloFreq;
							tremoloEffect.depth.value = tremoloDepth;
							tremoloEffect.wet.value = 1;
						}, startTime);

						// Schedule disable
						transport.schedule((time) => {
							tremoloEffect.wet.value = 0;
						}, endTime);
					}
				});
			}

			// Create modulation lookup by note index for glissando
			const modsByNote = {};
			trackModulations.forEach((mod) => {
				if (!modsByNote[mod.index]) modsByNote[mod.index] = [];
				modsByNote[mod.index].push(mod);
			});

			// Schedule notes
			notes.forEach((note, noteIndex) => {
				const time = (note.time || 0) * secondsPerQuarterNote;
				const noteDuration = (note.duration || 1) * secondsPerQuarterNote;
				const noteMods = modsByNote[noteIndex] || [];

				// Check for glissando
				const glissando = noteMods.find(
					(m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
				);

				if (Array.isArray(note.pitch)) {
					const noteNames = note.pitch.map((p) =>
						typeof p === "number" ? Tone.Frequency(p, "midi").toNote() : p
					);
					synth.triggerAttackRelease(
						noteNames,
						noteDuration,
						time,
						note.velocity || 0.8
					);
				} else {
					const noteName =
						typeof note.pitch === "number"
							? Tone.Frequency(note.pitch, "midi").toNote()
							: note.pitch;

					// Handle glissando using detune parameter or playbackRate
					if (glissando && glissando.to !== undefined) {
						const toNote = typeof glissando.to === "number"
							? Tone.Frequency(glissando.to, "midi").toNote()
							: glissando.to;

						const startFreq = Tone.Frequency(noteName).toFrequency();
						const endFreq = Tone.Frequency(toNote).toFrequency();

						if (synth.detune) {
							// Synths: Use detune parameter
							const cents = 1200 * Math.log2(endFreq / startFreq);
							console.log(`[WAV] Glissando using detune: ${noteName} -> ${toNote} (${cents} cents)`);

							synth.triggerAttack(noteName, time, note.velocity || 0.8);
							synth.detune.setValueAtTime(0, time);
							synth.detune.linearRampToValueAtTime(cents, time + noteDuration);
							synth.triggerRelease(time + noteDuration);
						} else if (synth.playbackRate) {
							// Samplers: Use playbackRate parameter
							const startRate = 1.0;
							const endRate = endFreq / startFreq;
							console.log(`[WAV] Glissando using playbackRate: ${noteName} -> ${toNote} (${startRate} -> ${endRate})`);

							synth.triggerAttack(noteName, time, note.velocity || 0.8);
							synth.playbackRate = startRate;

							if (synth.playbackRate.linearRampToValueAtTime) {
								synth.playbackRate.linearRampToValueAtTime(endRate, time + noteDuration);
							}

							synth.triggerRelease(time + noteDuration);
						} else {
							console.warn(`[WAV] Glissando not supported - no detune or playbackRate`);
							synth.triggerAttackRelease(noteName, noteDuration, time, note.velocity || 0.8);
						}
					} else {
						// Normal note
						synth.triggerAttackRelease(
							noteName,
							noteDuration,
							time,
							note.velocity || 0.8
						);
					}
				}
			});
		});

		// Wait for all samplers to load before starting offline rendering
		console.log('[WAV] Waiting for all samples to load...');
		await Tone.loaded();
		console.log('[WAV] Samples loaded, starting offline rendering');

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
