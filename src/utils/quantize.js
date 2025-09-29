// src/utils/quantize.js
// Generic quantization helpers for beats/notes/time values
// All grids are expressed in quarter-note units by convention (L: 1/4)

const EPS = 1e-9;

/**
 * Quantize a numeric value to a grid in quarter-note units.
 * @param {number} value - value in quarter-note units
 * @param {number} grid - grid size in quarter-note units (e.g., 0.25 = sixteenth)
 * @param {'nearest'|'floor'|'ceil'} mode - rounding mode
 * @returns {number}
 */
export function quantize(value, grid = 0.25, mode = 'nearest') {
  if (typeof value !== 'number' || !isFinite(value)) return value;
  const q = value / grid;
  let r;
  switch (mode) {
    case 'floor':
      r = Math.floor(q);
      break;
    case 'ceil':
      r = Math.ceil(q);
      break;
    case 'nearest':
    default:
      r = Math.round(q);
  }
  return r * grid;
}

/**
 * Quantize fields in an array of event-like objects.
 * @param {Array<Object>} events - array of objects with numeric fields
 * @param {Object} opts
 * @param {number} [opts.grid=0.25]
 * @param {string[]} [opts.fields=['time','duration']]
 * @param {'nearest'|'floor'|'ceil'} [opts.mode='nearest']
 * @returns {Array<Object>} new array with quantized fields
 */
export function quantizeEvents(events, { grid = 0.25, fields = ['time', 'duration'], mode = 'nearest' } = {}) {
  if (!Array.isArray(events)) return events;
  return events.map(ev => {
    const copy = { ...ev };
    fields.forEach(f => {
      if (typeof copy[f] === 'number') copy[f] = quantize(copy[f], grid, mode);
    });
    return copy;
  });
}

/**
 * Quantize notes of a single JMON track (returns a new track object).
 * @param {Object} track - { label, notes, ... }
 * @param {Object} opts - { grid, mode }
 */
export function quantizeTrack(track, { grid = 0.25, mode = 'nearest' } = {}) {
  if (!track || !Array.isArray(track.notes)) return track;
  return {
    ...track,
    notes: quantizeEvents(track.notes, { grid, fields: ['time', 'duration'], mode })
  };
}

/**
 * Quantize an entire JMON composition (deep copy semantics for notes only).
 * @param {Object} composition
 * @param {Object} opts - { grid, mode }
 */
export function quantizeComposition(composition, { grid = 0.25, mode = 'nearest' } = {}) {
  if (!composition || !Array.isArray(composition.tracks)) return composition;
  return {
    ...composition,
    tracks: composition.tracks.map(t => quantizeTrack(t, { grid, mode }))
  };
}

/**
 * Generate an ABC duration suffix for a duration measured in quarter-notes
 * using an arbitrary grid (e.g., 1/8, 1/16).
 * @param {number} durationQuarters - duration in quarter-note units
 * @param {number} grid - grid size in quarter-note units
 */
export function encodeAbcDuration(durationQuarters, grid = 0.25) {
  // With L:1/4, a plain note has value 1. We express duration as n/denom where denom=1/grid
  const denom = Math.round(1 / grid);
  const n = Math.round(durationQuarters / grid);

  if (n <= 0) return ''; // avoid weird tokens

  // Common simplifications
  if (n === denom) return '';
  if (n % denom === 0) return String(n / denom); // 2,3,4,...

  return `${n}/${denom}`;
}

