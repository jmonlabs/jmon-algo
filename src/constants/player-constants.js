/**
 * Music Player Logic Constants
 */

// Audio settings
export const AUDIO_CONFIG = {
  DEFAULT_TEMPO: 120,
  MIN_TEMPO: 60,
  MAX_TEMPO: 240,
  DEFAULT_VELOCITY: 0.8,
  GLISSANDO_MIN_STEPS: 3
};

// Articulation modifiers
export const ARTICULATION_MODIFIERS = {
  STACCATO_DURATION_FACTOR: 0.5,
  TENUTO_DURATION_FACTOR: 1.5,
  TENUTO_VELOCITY_FACTOR: 1.3,
  ACCENT_VELOCITY_FACTOR: 2.0,
  MAX_VELOCITY: 1.0
};

// Default synthesizer selections
export const DEFAULT_SYNTHS = {
  POLYPHONIC: "PolySynth",
  MONOPHONIC: "Synth",
  GLISSANDO_COMPATIBLE: "Synth"
};

// GM Instrument ranges
export const GM_INSTRUMENT_CONFIG = {
  DEFAULT_NOTE_RANGE: [36, 84], // C2 to C6
  STRATEGY: "balanced"
};

// Player state constants
export const PLAYER_STATES = {
  STOPPED: "stopped",
  PLAYING: "playing", 
  PAUSED: "paused"
};

// Transport loop settings
export const TRANSPORT_CONFIG = {
  LOOP_ENABLED: true,
  DEFAULT_POSITION: 0
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_COMPOSITION: "Composition must be a valid JMON object",
  NO_SEQUENCES_OR_TRACKS: "Composition must have sequences or tracks",
  TRACKS_MUST_BE_ARRAY: "Tracks/sequences must be an array",
  TONE_NOT_AVAILABLE: "Tone.js not available",
  AUDIO_CONTEXT_FAILED: "Failed to start audio context",
  iOS_AUDIO_HELP: "On iOS, please ensure your device isn't in silent mode and try again.",
  GENERAL_AUDIO_HELP: "Please check your audio settings and try again."
};

// Debug logging prefixes
export const LOG_PREFIXES = {
  PLAYER: "[PLAYER]",
  MULTIVOICE: "[MULTIVOICE]",
  AUDIO_GRAPH: "[AUDIO_GRAPH]"
};

export default {
  AUDIO_CONFIG,
  ARTICULATION_MODIFIERS,
  DEFAULT_SYNTHS,
  GM_INSTRUMENT_CONFIG,
  PLAYER_STATES,
  TRANSPORT_CONFIG,
  ERROR_MESSAGES,
  LOG_PREFIXES
};