
/**
 * PerformanceCompiler
 * Immutable utilities to derive playback modulations from declarative articulations.
 *
 * Design goals:
 * - Do NOT mutate input notes or tracks.
 * - Consume both the new declarative `note.articulations` array and legacy fields
 *   (`note.articulation`, `note.glissTarget`) for backward compatibility.
 * - Produce a compact "performance layer" that downstream players can apply at runtime.
 *
 * Exports:
 * - compilePerformanceTrack(track, options)
 * - compilePerformance(composition, options)
 *
 * Example usage:
 *   import { compilePerformanceTrack } from './PerformanceCompiler.js';
 *   const perf = compilePerformanceTrack({ notes });
 *   // perf.modulations contains derived pitch/velocity/duration changes for playback
 *
 * Notes:
 * - This compiler is immutable and purely functional. It never modifies input objects.
 * - Visual renderers (e.g., VexFlow) should continue to read from articulations for glyphs,
 *   while the audio player should read from the returned `modulations` array.
 */

/**
 * @typedef {Object} Note
 * @property {number|Array<number>|null} pitch - MIDI pitch or chord array; null for rest
 * @property {number} duration - Duration in beats
 * @property {number} time - Onset time in beats (absolute within the track)
 * @property {Array<string|{type:string,[key:string]:any}>=} articulations - Declarative list
 * @property {string=} articulation - Legacy single articulation
 * @property {number=} glissTarget - Legacy target pitch for glissando/portamento
 * @property {number=} velocity - Optional velocity (0..1)
 */

/**
 * @typedef {Object} Track
 * @property {Array<Note>} notes
 * @property {string=} name
 * @property {string=} clef
 */

/**
 * @typedef {Object} PerformanceModulation
 * @property {"pitch"|"amplitude"|"durationScale"|"velocityBoost"} type
 * @property {number} index - note index in the track
 * @property {string=} subtype - e.g., "glissando", "portamento", "bend", "crescendo", "diminuendo", "vibrato", "tremolo"
 * @property {number=} from - source pitch (MIDI) for pitch-type curves
 * @property {number=} to - target pitch (MIDI) for pitch-type curves
 * @property {number=} amount - cents for pitch bend, or other scalar
 * @property {number=} start - start time in beats (defaults to note's start)
 * @property {number=} end - end time in beats (defaults to note's end)
 * @property {string=} curve - e.g., "linear", "exp", "easeInOut"
 * @property {number=} factor - for durationScale
 * @property {number=} rate - for vibrato/tremolo (Hz)
 * @property {number=} depth - for vibrato/tremolo (cents or 0..1)
 * @property {number=} amountBoost - for velocityBoost (0..1)
 * @property {number=} startVelocity - for cresc/dim
 * @property {number=} endVelocity - for cresc/dim
 */

/**
 * @typedef {Object} CompiledTrack
 * @property {Array<Note>} notes - original reference (not mutated)
 * @property {Array<PerformanceModulation>} modulations
 */

/**
 * @typedef {Object} CompiledPerformance
 * @property {Array<CompiledTrack>} tracks
 * @property {Object<string, any>=} metadata - passthrough metadata if composition provided
 */

/**
 * Compile a single track (immutable).
 * Derives playback-oriented modulations from declarative articulations.
 *
 * @param {Track} track
 * @param {Object} [options]
 * @param {string} [options.timeSignature="4/4"] - reserved for future tempo mapping
 * @param {number} [options.tempo=120] - reserved for future time-unit conversions
 * @returns {CompiledTrack}
 */
export function compilePerformanceTrack(track, options = {}) {
  const { timeSignature = "4/4", tempo = 120 } = options; // reserved for future use
  const notes = Array.isArray(track?.notes) ? track.notes : [];

  /** @type {Array<PerformanceModulation>} */
  const modulations = [];

  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    if (!n || typeof n !== "object") continue;

    // Skip explicit rests
    const isRest = n.pitch === null || n.pitch === undefined;
    const onset = toNumber(n.time, 0);
    const dur = toNumber(n.duration, 0);
    const end = onset + Math.max(0, dur);

    // Gather articulations in a normalized array of { type, ...params }
    const arts = normalizeArticulations(n);
    if (arts.length === 0) continue;

    for (const art of arts) {
      const type = typeof art === "string" ? art : art.type;
      if (!type) continue;

      switch (type) {
        // Simple articulations: duration / velocity shaping
        case "staccato": {
          // Trim note to ~50% (compiler emits a modulation event; player applies it)
          modulations.push({
            type: "durationScale",
            index: i,
            factor: 0.5,
            start: onset,
            end,
          });
          break;
        }
        case "tenuto": {
          // Slightly longer (clamped by next onset in playback engine)
          modulations.push({
            type: "durationScale",
            index: i,
            factor: 1.1,
            start: onset,
            end,
          });
          break;
        }
        case "accent": {
          modulations.push({
            type: "velocityBoost",
            index: i,
            amountBoost: 0.2,
            start: onset,
            end: onset + Math.min(0.1, dur), // short emphasis
          });
          break;
        }
        case "marcato": {
          modulations.push({
            type: "velocityBoost",
            index: i,
            amountBoost: 0.3,
            start: onset,
            end: onset + Math.min(0.15, dur),
          });
          modulations.push({
            type: "durationScale",
            index: i,
            factor: 0.9,
            start: onset,
            end,
          });
          break;
        }

        // Complex articulations: curves / continuous modulations
        case "glissando":
        case "portamento": {
          if (isRest) break;
          const fromPitch = toMainPitch(n.pitch);
          const toPitch = typeof art.target === "number" ? art.target : undefined;
          if (typeof fromPitch !== "number" || typeof toPitch !== "number") break;

          modulations.push({
            type: "pitch",
            subtype: type,
            index: i,
            from: fromPitch,
            to: toPitch,
            start: onset,
            end,
            curve: art.curve || "linear",
          });
          break;
        }

        case "bend": {
          const amount = toNumber(art.amount, undefined);
          if (amount === undefined) break;
          modulations.push({
            type: "pitch",
            subtype: "bend",
            index: i,
            amount,
            start: onset,
            end,
            curve: art.curve || "linear",
          });
          break;
        }

        case "vibrato": {
          modulations.push({
            type: "pitch",
            subtype: "vibrato",
            index: i,
            rate: toNumber(art.rate, 5),
            depth: toNumber(art.depth, 50),
            start: onset,
            end,
          });
          break;
        }

        case "tremolo": {
          modulations.push({
            type: "amplitude",
            subtype: "tremolo",
            index: i,
            rate: toNumber(art.rate, 8),
            depth: clamp01(art.depth ?? 0.3),
            start: onset,
            end,
          });
          break;
        }

        case "crescendo":
        case "diminuendo": {
          const startV = clamp01(n.velocity ?? 0.8);
          const endV = clamp01(toNumber(art.endVelocity, type === "crescendo" ? Math.min(1, startV + 0.2) : Math.max(0, startV - 0.2)));
          modulations.push({
            type: "amplitude",
            subtype: type,
            index: i,
            startVelocity: startV,
            endVelocity: endV,
            start: onset,
            end,
            curve: art.curve || "linear",
          });
          break;
        }

        default:
          // Unknown or not yet implemented articulation, ignore safely.
          break;
      }
    }
  }

  return { notes, modulations };
}

/**
 * Compile an entire composition (immutable).
 * Produces a parallel array of compiled tracks.
 *
 * @param {Object} composition - { tracks: Array<Track>, ... }
 * @param {Object} [options]
 * @returns {CompiledPerformance}
 */
export function compilePerformance(composition, options = {}) {
  const tracks = normalizeTracks(composition?.tracks);
  const compiled = tracks.map((t) => compilePerformanceTrack(t, options));
  const metadata = composition?.metadata ? { ...composition.metadata } : undefined;
  return { tracks: compiled, ...(metadata ? { metadata } : {}) };
}

/* ===================================================================================== */
/* Helpers                                                                               */
/* ===================================================================================== */

/**
 * Normalize articulations on a note to an array of objects { type, ...params }.
 * Supports:
 * - note.articulations: (string | {type, ...})[]
 * @param {Note} note
 * @returns {Array<{type:string,[key:string]:any}>}
 */
function normalizeArticulations(note) {
  /** @type {Array<{type:string,[key:string]:any}>} */
  const out = [];

  // New declarative array
  if (Array.isArray(note?.articulations)) {
    for (const a of note.articulations) {
      if (typeof a === "string") out.push({ type: a });
      else if (a && typeof a === "object" && typeof a.type === "string") out.push({ ...a });
    }
  }



  return out;
}

/**
 * Normalize tracks input (array or object map) to an array of { notes }.
 * @param {any} tracks
 * @returns {Array<Track>}
 */
function normalizeTracks(tracks) {
  if (Array.isArray(tracks)) {
    return tracks.map((t, i) => (Array.isArray(t?.notes) ? t : { name: `Track ${i + 1}`, notes: Array.isArray(t) ? t : (t?.notes || []) }));
  }
  if (tracks && typeof tracks === "object") {
    return Object.entries(tracks).map(([name, notes], i) => ({
      name: name || `Track ${i + 1}`,
      notes: Array.isArray(notes?.notes) ? notes.notes : (Array.isArray(notes) ? notes : []),
    }));
  }
  return [];
}

/**
 * Convert a pitch field to a single representative MIDI pitch for modulation curves.
 * - If it's an array (chord), use the lowest pitch.
 * - If null/undefined, return undefined.
 * @param {number|Array<number>|null} pitch
 * @returns {number|undefined}
 */
function toMainPitch(pitch) {
  if (pitch == null) return undefined;
  if (Array.isArray(pitch)) {
    const arr = pitch.filter((x) => typeof x === "number");
    if (arr.length === 0) return undefined;
    return Math.min(...arr);
  }
  if (typeof pitch === "number") return pitch;
  return undefined;
}

function toNumber(v, fallback) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(v) {
  const n = toNumber(v, 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/* ===================================================================================== */
/* Optional convenience for future integration (not used here but useful references)     */
/* ===================================================================================== */

/**
 * Example of how a player might apply modulations at runtime:
 * - This is NOT used directly by the compiler; provided as documentation guidance.
 *
 * Pseudocode:
 *   for (const m of compiled.modulations) {
 *     const note = notes[m.index];
 *     switch (m.type) {
 *       case 'durationScale':
 *         scheduleDurationAdjustment(note, m.factor);
 *         break;
 *       case 'velocityBoost':
 *         scheduleVelocityEnvelope(note, m.amountBoost, m.start, m.end);
 *         break;
 *       case 'pitch':
 *         if (m.subtype === 'glissando' || m.subtype === 'portamento') {
 *           schedulePitchRamp(note, m.from, m.to, m.start, m.end, m.curve);
 *         } else if (m.subtype === 'bend') {
 *           schedulePitchBend(note, m.amount, m.start, m.end, m.curve);
 *         } else if (m.subtype === 'vibrato') {
 *           scheduleVibrato(note, m.rate, m.depth, m.start, m.end);
 *         }
 *         break;
 *       case 'amplitude':
 *         if (m.subtype === 'tremolo') {
 *           scheduleTremolo(note, m.rate, m.depth, m.start, m.end);
 *         } else if (m.subtype === 'crescendo' || m.subtype === 'diminuendo') {
 *           scheduleAmplitudeRamp(note, m.startVelocity, m.endVelocity, m.start, m.end, m.curve);
 *         }
 *         break;
 *     }
 *   }
 */
