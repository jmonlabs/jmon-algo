/**
 * @module jmon-algo
 *
 * JMON (JSON Music Object Notation) - A comprehensive music composition and analysis library.
 *
 * This is the JSR/Deno entry point optimized for use in Observable notebooks, Tangent notebooks,
 * Deno, and browser environments via esm.sh.
 *
 * ## Features
 * - Music theory (scales, chords, progressions)
 * - Generative algorithms (melodies, walks, fractals)
 * - Music analysis and audio processing
 * - Format converters (MIDI, ToneJS, WAV, SuperCollider, VexFlow)
 * - Sheet music notation with score() (requires VexFlow parameter)
 *
 * ## Note on Dependencies
 * This package has NO dependencies - VexFlow and Tone.js must be passed as parameters if needed:
 * - score() requires VexFlow as 2nd parameter
 * - Audio playback requires npm package (not available in JSR)
 *
 * @example Basic Usage
 * ```ts
 * import jm from "jsr:@jmon/jmon-algo";
 *
 * // Generate a C major scale
 * const scale = jm.theory.scale.generate('C', 'major');
 * // => ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
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
 *
 * @example Sheet Music Notation (Observable/Browser)
 * ```ts
 * // Import both packages
 * jm = await import("https://esm.sh/jsr/@jmon/jmon-algo")
 * VF = await import("https://esm.sh/vexflow@4.2.2")
 *
 * // Create composition
 * composition = {
 *   notes: [
 *     {pitch: 60, duration: 1},
 *     {pitch: 64, duration: 1},
 *     {pitch: 67, duration: 2}
 *   ]
 * }
 *
 * // Render to DOM
 * jm.default.score(composition, VF, {width: 600, height: 150})
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
 * Renders sheet music notation using VexFlow.
 * VexFlow MUST be provided - no fallbacks.
 *
 * @param {Object} jmonObj - The JMON composition object
 * @param {Object} renderingEngine - VexFlow instance (required)
 * @param {Object} [options={}] - Rendering options (width, height, clef, etc.)
 * @returns {HTMLElement} DOM element containing SVG notation
 *
 * @example Observable/Browser:
 * ```ts
 * vexflow = await import("https://esm.sh/vexflow@4.2.2")
 * jm = await import("https://esm.sh/jsr/@jmon/jmon-algo")
 *
 * composition = {notes: [{pitch: 60, duration: 1}]}
 * jm.default.score(composition, vexflow, {width: 600})
 * ```
 */
function score(jmonObj, renderingEngine = {}, options = {}) {
  // Check for DOM availability
  if (typeof document === "undefined") {
    throw new Error(
      "Score rendering requires a DOM environment. In Deno/Node, use jm.converters.vexflow() for data conversion."
    );
  }

  let engineType = "unknown";
  let engineInstance = null;

  // Detect VexFlow from parameter
  if (renderingEngine && (typeof renderingEngine === "object" || typeof renderingEngine === "function")) {
    if (
      renderingEngine.Renderer ||
      renderingEngine.Flow ||
      renderingEngine.VF ||
      renderingEngine.Factory ||
      renderingEngine.Stave ||
      renderingEngine.StaveNote ||
      renderingEngine.Voice ||
      renderingEngine.Formatter ||
      (renderingEngine.Vex && (renderingEngine.Vex.Flow || renderingEngine.Vex)) ||
      (renderingEngine.default && (
        renderingEngine.default.Renderer ||
        renderingEngine.default.Stave ||
        renderingEngine.default.VF
      ))
    ) {
      engineType = "vexflow";
      engineInstance = renderingEngine;
    }
  }

  if (engineType !== "vexflow") {
    throw new Error(
      "Score rendering requires VexFlow. Please provide a VexFlow instance as the second parameter:\n" +
      "  jm.score(composition, vexflow, options)\n\n" +
      "In Observable: vexflow = await import('https://esm.sh/vexflow@4.2.2')"
    );
  }

  // Create container
  const container = document.createElement("div");
  const elementId = `vexflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  container.id = elementId;
  container.style.cssText = "display: block; position: static; visibility: visible; width: fit-content; height: fit-content;";

  try {
    // Use full VexFlow converter
    const width = options.width || 800;
    const height = options.height || 200;
    const instructions = convertToVexFlow(jmonObj, { elementId, width, height });

    if (instructions && instructions.type === 'vexflow' && typeof instructions.render === 'function') {
      if (instructions.config) {
        instructions.config.element = container;
      }
      instructions.render(engineInstance);
      return container;
    }

    // Fallback: simple rendering
    const VF = engineInstance.default || engineInstance;
    if (!VF || !VF.Renderer) {
      throw new Error("VexFlow not properly loaded");
    }

    const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();

    const stave = new VF.Stave(10, 40, width - 50);
    stave.addClef(options.clef || 'treble');
    stave.setContext(context).draw();

    return container;
  } catch (error) {
    throw new Error(`VexFlow rendering failed: ${error.message}`);
  }
}

/**
 * Main JMON API object providing access to all music composition and analysis tools.
 *
 * @property {Function} score - Render sheet music notation (requires VexFlow parameter)
 * @property {Function} validate - Validate and normalize JMON objects
 * @property {Object} converters - Format conversion utilities (MIDI, ToneJS, WAV, etc.)
 * @property {Object} theory - Music theory utilities (scales, chords, progressions)
 * @property {Object} generative - Generative composition algorithms
 * @property {Object} analysis - Music analysis tools
 * @property {Object} constants - Musical constants and reference data
 * @property {Object} audio - Audio processing utilities
 * @property {Object} utils - Utility functions and helpers
 * @property {string} VERSION - Library version number
 *
 * @remarks
 * Note: render() and play() functions are not available in the JSR package.
 * These require the npm package for full browser playback support.
 * Use score() for sheet music notation (pass VexFlow as parameter).
 */
const jm = {
  // Core
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
