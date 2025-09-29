/**
 * Audio namespace: pure compilers from score → audio event plans.
 * This module re-exports the existing PerformanceCompiler functions with audio-friendly names.
 *
 * Track-level compilers (return { notes, modulations }):
 * - compileEvents(track, options?)
 * - compileTimeline(track, options?)
 * - deriveTimeline(track, options?)
 *
 * Composition-level compiler (returns { tracks: Array<{ notes, modulations }>, metadata? }):
 * - compileComposition(composition, options?)
 *
 * The underlying implementation is imported from the theory/harmony PerformanceCompiler,
 * but these names live under the audio namespace to reduce ambiguity for non-native speakers.
 */

import {
  compilePerformance as _compilePerformanceComposition,
  compilePerformanceTrack as _compilePerformanceTrack,
} from "../theory/harmony/PerformanceCompiler.js";

/**
 * Compile a single track into an audio event plan.
 * Alias for the existing compilePerformanceTrack.
 */
export function compileEvents(track, options = {}) {
  return _compilePerformanceTrack(track, options);
}

/**
 * Compile a single track into a timeline of modulations/events.
 * Alias for the existing compilePerformanceTrack.
 */
export function compileTimeline(track, options = {}) {
  return _compilePerformanceTrack(track, options);
}

/**
 * Derive a single track timeline (semantic alias).
 * Alias for the existing compilePerformanceTrack.
 */
export function deriveTimeline(track, options = {}) {
  return _compilePerformanceTrack(track, options);
}

/**
 * Compile an entire composition into audio event plans (one per track).
 * Alias for the existing compilePerformance.
 */
export function compileComposition(composition, options = {}) {
  return _compilePerformanceComposition(composition, options);
}

// Also export the original names for consumers that want direct access.
// (legacy exports removed)

// Default namespace export for ergonomic imports: jm.algorithms.audio
export default {
  compileEvents,
  compileTimeline,
  deriveTimeline,
  compileComposition,
};
