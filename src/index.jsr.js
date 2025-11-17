/**
 * JSR (Deno) entry point for algo
 * Excludes browser-specific functionality (render/play) that requires CDN imports
 *
 * JSR users can access:
 * - algorithms (theory, generative, analysis, audio)
 * - converters (midi, tonejs, wav, supercollider, vexflow)
 * - utils and constants
 * - validation
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
 * Minimal validation/normalization entry
 */
function validateJmon(obj) {
  const validator = new JmonValidator();
  return validator.validateAndNormalize(obj);
}

/**
 * Score rendering function for server-side use
 * Note: Requires VexFlow to be passed as parameter
 * For Deno/JSR users, import VexFlow via npm: specifier
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

// Compose the jm API object for JSR/Deno
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

  VERSION: "1.0.0",
};

// Named and default exports
export { jm };
export const audio = algorithms.audio;
export default jm;
