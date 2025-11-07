/**
 * @module jmon-algo
 *
 * JMON (JSON Music Object Notation) - A comprehensive music composition and analysis library.
 *
 * This is the JSR/Deno entry point that excludes browser-specific functionality.
 * For full browser support with audio playback, use the npm package.
 *
 * @example
 * ```ts
 * import jm from "jsr:@jmon/jmon-algo";
 *
 * // Generate a C major scale
 * const scale = jm.theory.scale.generate('C', 'major');
 *
 * // Create a chord progression
 * const progression = jm.theory.chord.progression('C', ['I', 'IV', 'V', 'I']);
 *
 * // Generate a melody
 * const melody = jm.generative.melody.simple({
 *   length: 8,
 *   scale: 'C major',
 *   octave: 4
 * });
 * ```
 */

import { JmonValidator } from "./utils/jmon-validator.browser.js";
import algorithms from "./algorithms/index.js";
import {
  convertToVexFlow,
  midi,
  midiToJmon,
  supercollider,
  tonejs,
  wav,
} from "./converters/index.js";
import * as jmonUtils from "./utils/jmon-utils.js";

/**
 * Validates and normalizes a JMON object.
 *
 * @param {Object} obj - The JMON object to validate
 * @returns {Object} Validated and normalized JMON object
 *
 * @example
 * ```ts
 * const validated = validateJmon({
 *   format: 'jmon',
 *   version: '1.0',
 *   sequences: []
 * });
 * ```
 */
function validateJmon(obj) {
  const validator = new JmonValidator();
  return validator.validateAndNormalize(obj);
}

/**
 * Converts a JMON object to VexFlow notation data for score rendering.
 *
 * Note: In JSR/Deno environments without DOM, this returns conversion data only.
 * For actual rendering, use the npm package in a browser environment.
 *
 * @param {Object} jmonObj - The JMON composition object
 * @param {Object} [renderingEngine={}] - VexFlow rendering engine (unused in JSR)
 * @param {Object} [options={}] - Conversion options
 * @returns {Object} VexFlow notation data
 *
 * @example
 * ```ts
 * const notation = score(composition, {}, {
 *   clef: 'treble',
 *   timeSignature: '4/4'
 * });
 * ```
 */
function score(jmonObj, renderingEngine = {}, options = {}) {
  // Server-side: just return conversion instructions
  // Actual rendering requires DOM which isn't available in Deno by default
  if (typeof document === "undefined") {
    return convertToVexFlow(jmonObj, options);
  }

  // If DOM is available (e.g., deno with --location), use full score rendering
  // This code path is for advanced users who set up DOM in Deno
  throw new Error(
    "Score rendering with DOM not available in JSR export. Use jm.converters.vexflow() for conversion data, " +
    "or use the npm package for full browser support."
  );
}

/**
 * Main JMON API object providing access to all music composition and analysis tools.
 *
 * @property {Function} score - Convert JMON to VexFlow notation data
 * @property {Function} validate - Validate and normalize JMON objects
 * @property {Object} converters - Format conversion utilities (MIDI, ToneJS, WAV, etc.)
 * @property {Object} theory - Music theory utilities (scales, chords, progressions)
 * @property {Object} generative - Generative composition algorithms
 * @property {Object} analysis - Music analysis tools
 * @property {Object} constants - Musical constants and reference data
 * @property {Object} audio - Audio processing utilities
 * @property {Object} utils - Utility functions and helpers
 * @property {string} VERSION - Library version number
 */
const jm = {
  // Core (without browser-specific render/play)
  score,
  validate: validateJmon,

  // Converters
  converters: {
    midi,
    midiToJmon,
    tonejs,
    wav,
    supercollider,
    vexflow: convertToVexFlow,
  },

  // Namespaces from algorithms
  theory: algorithms.theory,
  generative: algorithms.generative,
  analysis: algorithms.analysis,
  constants: algorithms.constants,
  audio: algorithms.audio,

  // Utils
  utils: {
    ...algorithms.utils,
    JmonValidator,
    jmon: jmonUtils,
  },

  VERSION: "1.0.1",
};

/**
 * Main JMON API object (default export).
 *
 * @default
 * @example
 * ```ts
 * import jm from "jsr:@jmon/jmon-algo";
 * const scale = jm.theory.scale.generate('C', 'major');
 * ```
 */
export default jm;

/**
 * Main JMON API object (named export).
 *
 * @example
 * ```ts
 * import { jm } from "jsr:@jmon/jmon-algo";
 * const progression = jm.theory.chord.progression('C', ['I', 'IV', 'V']);
 * ```
 */
export { jm };

/**
 * Audio processing utilities including DSP, synthesis, and analysis tools.
 *
 * @example
 * ```ts
 * import { audio } from "jsr:@jmon/jmon-algo";
 * const fft = audio.fft.transform(samples);
 * ```
 */
export const audio = algorithms.audio;
