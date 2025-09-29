/* JMON WAV - WAV audio generation from JMON format */
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
