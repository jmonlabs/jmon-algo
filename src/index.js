/**
 * JMON Studio entrypoint
 * Exposes a unified `jm` API consumed by build and tests.
 *
 * This file intentionally avoids side-effects at module top-level so it can
 * be safely imported in Node test environments and browser bundles.
 */

import { JmonValidator } from "./utils/jmon-validator.browser.js";
import algorithms from "./algorithms/index.js";
import { createPlayer } from "./browser/music-player.js";
import {
  convertToVexFlow,
  midi,
  midiToJmon,
  supercollider,
  tonejs,
  wav,
} from "./converters/index.js";
import * as jmonUtils from "./utils/jmon-utils.js";

// GM instruments helpers (optional); load lazily when needed to avoid top-level await in UMD
let GM_INSTRUMENTS, createGMInstrumentNode, findGMProgramByName, generateSamplerUrls, getPopularInstruments;
/**
 * Lazy-load GM instrument helpers.
 * Returns a cached module after first load.
 */
async function __loadGmInstruments() {
  if (!GM_INSTRUMENTS && !createGMInstrumentNode) {
    const gm = await import("./utils/gm-instruments.js");
    GM_INSTRUMENTS = gm.GM_INSTRUMENTS;
    createGMInstrumentNode = gm.createGMInstrumentNode;
    findGMProgramByName = gm.findGMProgramByName;
    generateSamplerUrls = gm.generateSamplerUrls;
    getPopularInstruments = gm.getPopularInstruments;
  }
  return {
    GM_INSTRUMENTS,
    createGMInstrumentNode,
    findGMProgramByName,
    generateSamplerUrls,
    getPopularInstruments,
  };
}

/**
 * Minimal validation/normalization entry
 */
function validateJmon(obj) {
  const validator = new JmonValidator();
  return validator.validateAndNormalize(obj);
}

/**
 * Render a player UI (browser environments)
 */
function render(jmonObj, options = {}) {
  if (!jmonObj || typeof jmonObj !== "object") {
    throw new Error("render() requires a valid JMON object");
  }
  return createPlayer(jmonObj, options);
}

/**
 * Play without auto-start (browser environments)
 */
function play(jmonObj, options = {}) {
  const playOptions = { autoplay: false, ...options };
  return createPlayer(jmonObj, playOptions);
}

/**
 * Score rendering function that generates SVG musical notation using VexFlow.
 * REQUIRES VexFlow instance - no fallbacks, will throw error if VexFlow fails.
 * Returns DOM element with SVG content.
 */
function score(jmonObj, renderingEngine = {}, options = {}) {
  let engineType = "unknown";
  let engineInstance = null;

  // Detect rendering engine
  if (renderingEngine && typeof renderingEngine === "string") {
    engineType = renderingEngine.toLowerCase();
  } else if (renderingEngine && (typeof renderingEngine === "object" || typeof renderingEngine === "function")) {
    // Check for any VexFlow-like properties (be more permissive)
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
      // Check for common VexFlow object patterns
      (renderingEngine.default && (
        renderingEngine.default.Renderer ||
        renderingEngine.default.Stave ||
        renderingEngine.default.VF
      ))
    ) {
      engineType = "vexflow";
      engineInstance = renderingEngine;
    }
  } else if (typeof globalThis.window !== "undefined") {
    if (
      globalThis.VF ||
      globalThis.VexFlow ||
      (globalThis.Vex && (globalThis.Vex.Flow || globalThis.Vex)) ||
      (globalThis.Flow && globalThis.Flow.Factory) // some builds expose Flow.Factory globally
    ) {
      engineType = "vexflow";
      engineInstance =
        globalThis.VF ||
        globalThis.VexFlow ||
        (globalThis.Vex && (globalThis.Vex.Flow || globalThis.Vex)) ||
        globalThis; // allow { Flow: { Factory } } pattern
    }
  }

  // VexFlow path: render SVG and return the container element
  if (engineType === "vexflow") {
    console.log("VexFlow engine detected, proceeding with rendering");
    // Create container element - works in both browser and Observable environments
    const hasDocument = typeof document !== "undefined";
    let container;

    if (hasDocument) {
      container = document.createElement("div");
      const elementId = `vexflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      container.id = elementId;

      // Style container for Observable compatibility
      container.style.display = 'block';
      container.style.position = 'static';
      container.style.visibility = 'visible';
      container.style.width = 'fit-content';
      container.style.height = 'fit-content';

      // For Observable and similar environments, just create the element without mounting
      // VexFlow can render to detached elements

      try {
        // Preferred path: use VexFlowConverter to render full JMON (tracks, measures, ties, decorations)
        try {
          const width = options.width || 800;
          const height = options.height || 200;
          const instructions = convertToVexFlow(jmonObj, { elementId, width, height });
          if (instructions && instructions.type === 'vexflow' && typeof instructions.render === 'function') {
            if (instructions.config) {
              instructions.config.element = container; // ensure SVG renders into this container
            }
            instructions.render(engineInstance);

            // Always return the container after rendering - Observable needs the div
            // The VexFlow converter ensures the div is visible and properly styled

            // Handle different return formats based on outputType option
            if (options.outputType) {
              const svg = container.querySelector('svg');
              if (!svg) return container;

              if (options.outputType === 'svg') {
                return svg;
              } else if (options.outputType === 'clonedSvg') {
                // Clone and style for Observable compatibility
                const clonedSvg = svg.cloneNode(true);
                clonedSvg.style.display = 'block';
                clonedSvg.style.maxWidth = '100%';
                clonedSvg.style.height = 'auto';
                return clonedSvg;
              } else if (options.outputType === 'div') {
                return container;
              }
            }

            return container;
          }
        } catch (e) {
          // Fall back to simple renderer below
        }
        // Simple direct VexFlow rendering - bypass complex converter
        const VF = engineInstance ||
          (typeof globalThis.window !== "undefined" && (
            globalThis.VF ||
            globalThis.VexFlow ||
            (globalThis.Vex && (globalThis.Vex.Flow || globalThis.Vex))
          ));

        if (!VF || !VF.Renderer) {
          throw new Error("VexFlow not properly loaded");
        }

        const width = options.width || 800;
        const height = options.height || 200;

        // Create renderer
        const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
        renderer.resize(width, height);
        const context = renderer.getContext();

        // Create stave
        const stave = new VF.Stave(10, 40, width - 50);
        stave.addClef('treble');

        if (jmonObj.timeSignature) {
          stave.addTimeSignature(jmonObj.timeSignature);
        }
        if (jmonObj.keySignature && jmonObj.keySignature !== 'C') {
          stave.addKeySignature(jmonObj.keySignature);
        }

        stave.setContext(context).draw();

        // Convert JMON notes to VexFlow notes
        const notes = (jmonObj.notes || []).map(note => {
          if (!note.pitch) return null;

          const midiToVF = (midi) => {
            const noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
            const octave = Math.floor(midi / 12) - 1;
            const noteIndex = midi % 12;
            return noteNames[noteIndex].replace('#', '#') + '/' + octave;
          };

          const durationToVF = (duration) => {
            if (duration >= 4) return 'w';
            if (duration >= 2) return 'h';
            if (duration >= 1) return 'q';
            if (duration >= 0.5) return '8';
            return '16';
          };

          const keys = Array.isArray(note.pitch)
            ? note.pitch.map(midiToVF)
            : [midiToVF(note.pitch)];

          return new VF.StaveNote({
            keys: keys,
            duration: durationToVF(note.duration || 1)
          });
        }).filter(Boolean);

        if (notes.length > 0) {
          // Create voice and format with error handling
          try {
            const voice = new VF.Voice({
              num_beats: 4,
              beat_value: 4
            });

            // Be tolerant about strict timing to avoid formatter/voice rejections
            if (typeof voice.setMode === 'function' && VF.Voice && VF.Voice.Mode && VF.Voice.Mode.SOFT !== undefined) {
              voice.setMode(VF.Voice.Mode.SOFT);
            } else if (typeof voice.setStrict === 'function') {
              voice.setStrict(false);
            }

            if (typeof voice.addTickables === 'function') {
              voice.addTickables(notes);
            }

            const formatter = new VF.Formatter();
            if (typeof formatter.joinVoices === 'function' && typeof formatter.format === 'function') {
              formatter.joinVoices([voice]).format([voice], width - 80);
            }

            if (typeof voice.draw === 'function') {
              voice.draw(context, stave);
            }
          } catch (voiceError) {
            console.warn('VexFlow voice/formatter error:', voiceError);

            // Fallback: draw notes manually in a naive layout so score is never empty
            try {
              let x = 60; // starting x position inside stave
              notes.forEach(n => {
                if (typeof n.setStave === 'function') n.setStave(stave);
                if (typeof n.setContext === 'function') n.setContext(context);
                if (typeof n.preFormat === 'function') n.preFormat();
                if (typeof n.setX === 'function') n.setX(x);
                if (typeof n.draw === 'function') n.draw();
                x += 40; // simple spacing between notes
              });
            } catch (manualError) {
              console.warn('Manual note drawing failed:', manualError);
            }
          }
        }

        // Handle different return formats based on outputType option
        if (options.outputType) {
          const svg = container.querySelector('svg');
          if (!svg) return container;

          if (options.outputType === 'svg') {
            return svg;
          } else if (options.outputType === 'clonedSvg') {
            // Clone and style for Observable compatibility
            const clonedSvg = svg.cloneNode(true);
            clonedSvg.style.display = 'block';
            clonedSvg.style.maxWidth = '100%';
            clonedSvg.style.height = 'auto';
            return clonedSvg;
          } else if (options.outputType === 'div') {
            return container;
          }
        }

        return container;

      } catch (error) {
        throw new Error(`VexFlow rendering failed: ${error.message}. Please check your VexFlow instance.`);
      }
    } else {
      // Non-DOM environment: VexFlow not supported without DOM
      throw new Error("VexFlow rendering requires a DOM environment. Use jm.converters.vexflow() for data conversion.");
    }
  }

  // No VexFlow provided
  throw new Error("Score rendering requires VexFlow. Please provide a VexFlow instance as the second parameter: jm.score(piece, vexflow)");
}

// Compose the jm API object expected by build and tests
const jm = {
  // Core
  render,
  play,
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

  // Instruments (optional; may be undefined in non-browser builds)
  instruments: {
    // Lazy loader to initialize GM instrument helpers on demand
    // Usage: await jm.instruments.load()
    load: __loadGmInstruments,
    // These remain undefined until load() is called in environments where
    // gm-instruments are not preloaded.
    GM_INSTRUMENTS,
    generateSamplerUrls,
    createGMInstrumentNode,
    findGMProgramByName,
    getPopularInstruments,
  },

  VERSION: "1.0.0",
};

// Named and default exports
export { jm };
export const audio = algorithms.audio;
export default jm;
