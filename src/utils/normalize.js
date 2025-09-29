// src/utils/normalize.js
// Utilities to normalize JMON structures for downstream consumers

/**
 * Convert MIDI number to scientific pitch notation (e.g., 36 -> "C2").
 * @param {number|string} midiLike
 * @returns {string}
 */
export function midiToNoteName(midiLike) {
  const n = typeof midiLike === 'string' ? parseInt(midiLike, 10) : midiLike;
  if (!Number.isFinite(n)) return String(midiLike);
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = names[(n % 12 + 12) % 12];
  const octave = Math.floor(n / 12) - 1;
  return `${note}${octave}`;
}

/**
 * Normalize Sampler urls keys to scientific pitch notation.
 * Mutates the given composition object in-place for performance.
 *
 * @param {object} composition
 * @returns {object} the same composition object (for chaining)
 */
export function normalizeSamplerUrlsToNoteNames(composition) {
  if (!composition || !Array.isArray(composition.audioGraph)) return composition;

  composition.audioGraph.forEach(node => {
    try {
      if (!node || node.type !== 'Sampler') return;
      const opts = node.options || {};
      const urls = opts.urls;
      if (!urls || typeof urls !== 'object') return;

      // Build normalized map
      const normalized = {};
      Object.keys(urls).forEach(k => {
        const keyStr = String(k);
        let noteKey = keyStr;
        if (/^\d+$/.test(keyStr)) {
          noteKey = midiToNoteName(parseInt(keyStr, 10));
        }
        normalized[noteKey] = urls[k];
      });

      node.options = { ...opts, urls: normalized };
    } catch (_) {
      // best-effort normalization; ignore errors
    }
  });
  return composition;
}
