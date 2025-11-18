/**
 * Score Renderer
 * Uses abcjs for rendering musical notation.
 */

/**
 * Convert JMON composition to ABC notation
 *
 * @param {Object} composition - The JMON composition
 * @returns {string} ABC notation string
 */
function jmonToABC(composition) {
  const lines = [];

  // Header: Reference number
  lines.push('X:1');

  // Title - use composition.title directly
  const title = composition.title || composition.metadata?.title || 'Untitled';
  lines.push(`T:${title}`);

  // Tempo (Q: = BPM)
  const tempo = composition.tempo || 120;
  lines.push(`Q:1/4=${tempo}`);

  // Meter (time signature)
  const timeSignature = composition.timeSignature || '4/4';
  lines.push(`M:${timeSignature}`);

  // Default note length
  lines.push('L:1/4');

  // Get notes from first track
  const track = composition.tracks?.[0];

  // Key signature with clef
  const keySignature = composition.keySignature || 'C';
  const clef = track?.clef || 'treble';

  // Map JMON clef names to ABC clef names
  const clefMap = {
    'treble': 'treble',
    'bass': 'bass',
    'alto': 'alto',
    'tenor': 'tenor',
    'percussion': 'perc'
  };
  const abcClef = clefMap[clef] || 'treble';

  // In ABC, clef is specified with the K: field
  lines.push(`K:${keySignature} clef=${abcClef}`);

  if (!track?.notes?.length) {
    // Empty composition
    lines.push('z4');
    return lines.join('\n');
  }

  // Parse time signature to get beats per measure
  const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);
  const measureDuration = beatsPerMeasure * (4 / beatValue); // in quarter notes

  // Convert JMON notes to ABC notation with measure bars
  const abcNotes = [];
  let currentMeasureDuration = 0;

  track.notes.forEach((note, index) => {
    // Convert duration to ABC duration
    const duration = note.duration || 1;
    const abcDuration = durationToABC(duration);

    // Handle chords (array of pitches) vs single notes
    let abcNote;
    if (Array.isArray(note.pitch)) {
      // Chord: convert each pitch and wrap in brackets
      const chordNotes = note.pitch
        .filter(p => typeof p === 'number') // Filter out nulls/invalid pitches
        .map(p => midiToABC(p));

      if (chordNotes.length > 1) {
        // Multiple notes = chord notation [CEG]
        abcNote = `[${chordNotes.join('')}]`;
      } else if (chordNotes.length === 1) {
        // Single note in array
        abcNote = chordNotes[0];
      } else {
        // Empty array or all nulls = rest
        abcNote = 'z';
      }
    } else if (note.pitch === null || note.pitch === undefined) {
      // Rest
      abcNote = 'z';
    } else {
      // Single note
      abcNote = midiToABC(note.pitch);
    }

    // Add the note/chord with duration
    abcNotes.push(`${abcNote}${abcDuration}`);

    // Track measure duration
    currentMeasureDuration += duration;

    // Add measure bar if we've completed a measure
    if (currentMeasureDuration >= measureDuration) {
      // Add bar line unless it's the last note
      if (index < track.notes.length - 1) {
        abcNotes.push('|');
      }
      currentMeasureDuration = 0;
    }
  });

  // Join notes with spaces
  lines.push(abcNotes.join(' '));

  return lines.join('\n');
}

/**
 * Convert MIDI pitch number to ABC note name
 *
 * @param {number} midi - MIDI pitch number (60 = middle C)
 * @returns {string} ABC note name
 */
function midiToABC(midi) {
  if (typeof midi !== 'number') return 'C';

  const noteNames = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];

  // ABC notation:
  // C, D, E, F, G, A, B = octave 4 (middle octave)
  // c, d, e, f, g, a, b = octave 5
  // c', d', e' = octave 6
  // C, D, E = octave 3
  // C, D, E = octave 2

  if (octave === 4) {
    return noteName; // C D E F G A B
  } else if (octave === 5) {
    return noteName.toLowerCase(); // c d e f g a b
  } else if (octave > 5) {
    const ticks = "'".repeat(octave - 5);
    return noteName.toLowerCase() + ticks; // c' d'' etc
  } else if (octave === 3) {
    return noteName; // Same as octave 4 in basic ABC
  } else {
    // Lower octaves use comma notation
    const commas = ','.repeat(4 - octave);
    return noteName + commas; // C, D,, etc
  }
}

/**
 * Convert JMON duration to ABC duration
 *
 * @param {number} duration - Duration in quarter notes
 * @returns {string} ABC duration suffix
 */
function durationToABC(duration) {
  // ABC durations relative to L:1/4 (quarter note)
  // 4 = whole note = 4
  // 2 = half note = 2
  // 1 = quarter note = (no suffix)
  // 0.5 = eighth note = /2
  // 0.25 = sixteenth = /4

  if (duration >= 4) return '4';
  if (duration >= 3) return '3';
  if (duration >= 2) return '2';
  if (duration >= 1.5) return '3/2';
  if (duration >= 1) return ''; // Default quarter note
  if (duration >= 0.75) return '3/4';
  if (duration >= 0.5) return '/2';
  if (duration >= 0.25) return '/4';
  return '/8';
}

/**
 * Render sheet music notation using abcjs
 *
 * @param {Object} composition - The JMON composition to render
 * @param {Object} options - Rendering options
 * @param {Object} [options.ABCJS] - abcjs library instance (optional, will use window.ABCJS if available)
 * @param {number} [options.width] - Staff width in pixels (if omitted, uses responsive mode)
 * @param {number} [options.scale] - Scale factor for rendering (if omitted with width, uses responsive mode)
 * @param {number} [options.height] - Not used (abcjs calculates height automatically)
 * @returns {HTMLElement} DOM element containing the rendered score
 *
 * @example
 * // Responsive mode (default) - fills container width
 * const svg = jm.score(composition, { ABCJS });
 *
 * @example
 * // Fixed width mode
 * const svg = jm.score(composition, { ABCJS, width: 938 });
 *
 * @example
 * // With custom dimensions and scale
 * const svg = jm.score(composition, { ABCJS, width: 938, scale: 0.6 });
 */
export function score(composition, options = {}) {
  const {
    ABCJS: abcjsLib,
    width,
    height = 300,
    scale,
  } = options;

  // Determine if we should use responsive mode
  // Use responsive if neither width nor scale are specified
  const useResponsive = (width === undefined && scale === undefined);
  const finalWidth = width ?? 938;
  const finalScale = scale ?? 1.0;

  // Create container
  const container = document.createElement('div');

  if (useResponsive) {
    // Responsive mode - full width
    container.style.width = '100%';
    container.style.overflow = 'visible';
  } else {
    // Fixed width mode
    const actualWidth = finalWidth * finalScale;
    container.style.width = `${actualWidth}px`;
    container.style.overflow = 'visible';
  }

  // Create rendering target
  const notationDiv = document.createElement('div');
  notationDiv.id = `rendered-score-${Date.now()}`;
  container.appendChild(notationDiv);

  try {
    // Get ABCJS library
    const ABCJS = abcjsLib || (typeof window !== 'undefined' && window.ABCJS);

    if (!ABCJS) {
      notationDiv.innerHTML = '<p style="color:#ff6b6b">abcjs library not loaded</p>';
      return container;
    }

    // Convert JMON to ABC notation
    const abcNotation = jmonToABC(composition);

    // Render with abcjs
    const renderOptions = {
      paddingtop: 0,
      paddingbottom: 0,
      paddingright: 10,
      paddingleft: 10,
    };

    if (useResponsive) {
      // Responsive mode
      renderOptions.responsive = 'resize';
    } else {
      // Fixed width mode
      renderOptions.staffwidth = finalWidth;
      renderOptions.scale = finalScale;
    }

    ABCJS.renderAbc(notationDiv, abcNotation, renderOptions);

  } catch (error) {
    console.error('[SCORE] Render error:', error);
    notationDiv.innerHTML = `<p style="color:#ff6b6b">Error: ${error.message}</p>`;
  }

  return container;
}
