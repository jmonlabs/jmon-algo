/**
 * Score Renderer
 * Uses Verovio for rendering musical notation.
 */

/**
 * Convert JMON composition to MusicXML
 *
 * @param {Object} composition - The JMON composition
 * @returns {string} MusicXML string
 */
function jmonToMusicXML(composition) {
  const title = composition.title || composition.metadata?.title || 'Untitled';
  const tempo = composition.tempo || 120;
  const timeSignature = composition.timeSignature || '4/4';
  const keySignature = composition.keySignature || 'C';
  const tracks = composition.tracks || [];

  // Parse time signature
  const [beatsPerMeasure, beatValue] = timeSignature.split('/').map(Number);
  const measureDuration = beatsPerMeasure * (4 / beatValue); // in quarter notes

  // Parse key signature
  const { fifths, mode } = parseKeySignature(keySignature);

  // Filter valid tracks
  const validTracks = tracks.filter(t => t?.notes?.length);
  if (validTracks.length === 0) {
    return createEmptyMusicXML(title, tempo, beatsPerMeasure, beatValue, fifths, mode);
  }

  // Add time to notes if missing (JMON notes are sequential)
  const tracksWithTime = validTracks.map(track => {
    let currentTime = 0;
    const notesWithTime = track.notes.map(note => {
      const noteWithTime = { ...note, time: note.time !== undefined ? note.time : currentTime };
      currentTime += (note.duration || 1);
      return noteWithTime;
    });
    return { ...track, notes: notesWithTime };
  });

  // Calculate total duration
  const totalDuration = tracksWithTime.reduce((maxDur, track) => {
    const trackEnd = track.notes.reduce((max, note) => {
      return Math.max(max, (note.time || 0) + (note.duration || 1));
    }, 0);
    return Math.max(maxDur, trackEnd);
  }, 0);

  // Split tracks into measures
  const trackMeasures = tracksWithTime.map(track => {
    return splitIntoMeasures(track.notes, measureDuration, totalDuration);
  });

  // Generate MusicXML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  xml += '<score-partwise version="3.1">\n';

  // Work title
  xml += '  <work>\n';
  xml += `    <work-title>${escapeXML(title)}</work-title>\n`;
  xml += '  </work>\n';

  // Part list
  xml += '  <part-list>\n';
  validTracks.forEach((track, index) => {
    const partId = `P${index + 1}`;
    const partName = track.label || `Track ${index + 1}`;
    xml += `    <score-part id="${partId}">\n`;
    xml += `      <part-name>${escapeXML(partName)}</part-name>\n`;
    xml += '    </score-part>\n';
  });
  xml += '  </part-list>\n';

  // Parts
  validTracks.forEach((track, trackIndex) => {
    const partId = `P${trackIndex + 1}`;
    const clef = track.clef || 'treble';
    const measures = trackMeasures[trackIndex];

    xml += `  <part id="${partId}">\n`;

    measures.forEach((measure, measureIndex) => {
      const measureNumber = measureIndex + 1;
      xml += `    <measure number="${measureNumber}">\n`;

      // First measure: add attributes
      if (measureIndex === 0) {
        xml += '      <attributes>\n';
        xml += '        <divisions>4</divisions>\n'; // 4 divisions per quarter note
        xml += `        <key>\n`;
        xml += `          <fifths>${fifths}</fifths>\n`;
        xml += `          <mode>${mode}</mode>\n`;
        xml += `        </key>\n`;
        xml += `        <time>\n`;
        xml += `          <beats>${beatsPerMeasure}</beats>\n`;
        xml += `          <beat-type>${beatValue}</beat-type>\n`;
        xml += `        </time>\n`;
        xml += `        <clef>\n`;
        xml += `          <sign>${getClefSign(clef)}</sign>\n`;
        xml += `          <line>${getClefLine(clef)}</line>\n`;
        xml += `        </clef>\n`;
        xml += '      </attributes>\n';

        // Tempo in first measure
        xml += '      <direction placement="above">\n';
        xml += '        <direction-type>\n';
        xml += '          <metronome>\n';
        xml += '            <beat-unit>quarter</beat-unit>\n';
        xml += `            <per-minute>${tempo}</per-minute>\n`;
        xml += '          </metronome>\n';
        xml += '        </direction-type>\n';
        xml += '        <sound tempo="${tempo}"/>\n';
        xml += '      </direction>\n';
      }

      // Notes in measure
      measure.forEach(note => {
        if (note.isRest) {
          xml += '      <note>\n';
          xml += '        <rest/>\n';
          xml += `        <duration>${Math.round(note.duration * 4)}</duration>\n`;
          xml += `        <type>${getDurationType(note.duration)}</type>\n`;
          xml += '      </note>\n';
        } else if (Array.isArray(note.pitch)) {
          // Chord
          note.pitch.forEach((p, i) => {
            xml += '      <note>\n';
            if (i > 0) {
              xml += '        <chord/>\n';
            }
            const { step, alter, octave } = midiToPitch(p);
            xml += '        <pitch>\n';
            xml += `          <step>${step}</step>\n`;
            if (alter !== 0) {
              xml += `          <alter>${alter}</alter>\n`;
            }
            xml += `          <octave>${octave}</octave>\n`;
            xml += '        </pitch>\n';
            xml += `        <duration>${Math.round(note.duration * 4)}</duration>\n`;
            xml += `        <type>${getDurationType(note.duration)}</type>\n`;
            xml += '      </note>\n';
          });
        } else {
          // Single note
          xml += '      <note>\n';
          const { step, alter, octave } = midiToPitch(note.pitch);
          xml += '        <pitch>\n';
          xml += `          <step>${step}</step>\n`;
          if (alter !== 0) {
            xml += `          <alter>${alter}</alter>\n`;
          }
          xml += `          <octave>${octave}</octave>\n`;
          xml += '        </pitch>\n';
          xml += `        <duration>${Math.round(note.duration * 4)}</duration>\n`;
          xml += `        <type>${getDurationType(note.duration)}</type>\n`;
          xml += '      </note>\n';
        }
      });

      xml += '    </measure>\n';
    });

    xml += '  </part>\n';
  });

  xml += '</score-partwise>\n';

  return xml;
}

/**
 * Split notes into measures
 */
function splitIntoMeasures(notes, measureDuration, totalDuration) {
  const measures = [];
  let currentMeasure = [];
  let measureStartTime = 0;
  let currentTime = 0;

  // Sort notes by time
  const sortedNotes = [...notes].sort((a, b) => (a.time || 0) - (b.time || 0));

  for (const note of sortedNotes) {
    const noteTime = note.time || 0;
    const noteDuration = note.duration || 1;

    // Fill gap with rest if needed
    if (noteTime > currentTime + 0.001) {
      const restDuration = noteTime - currentTime;

      // Check if rest crosses measure boundary
      if (currentTime + restDuration > measureStartTime + measureDuration) {
        // Split rest at measure boundary
        const restInThisMeasure = measureStartTime + measureDuration - currentTime;
        if (restInThisMeasure > 0.001) {
          currentMeasure.push({ isRest: true, duration: restInThisMeasure });
        }
        measures.push(currentMeasure);
        currentMeasure = [];
        measureStartTime += measureDuration;
        currentTime += restInThisMeasure;

        // Continue with remaining rest
        while (currentTime + 0.001 < noteTime) {
          const remaining = noteTime - currentTime;
          const restDur = Math.min(remaining, measureDuration);
          currentMeasure.push({ isRest: true, duration: restDur });
          currentTime += restDur;

          if (restDur >= measureDuration - 0.001) {
            measures.push(currentMeasure);
            currentMeasure = [];
            measureStartTime += measureDuration;
          }
        }
      } else {
        currentMeasure.push({ isRest: true, duration: restDuration });
        currentTime += restDuration;
      }
    }

    // Add note (check if it crosses measure boundary)
    if (currentTime + noteDuration > measureStartTime + measureDuration + 0.001) {
      // Note crosses measure boundary - split it
      const durationInThisMeasure = measureStartTime + measureDuration - currentTime;
      if (durationInThisMeasure > 0.001) {
        currentMeasure.push({ ...note, duration: durationInThisMeasure });
      }
      measures.push(currentMeasure);
      currentMeasure = [];
      measureStartTime += measureDuration;
      currentTime += durationInThisMeasure;

      // Add tied note in next measure
      const remainingDuration = noteDuration - durationInThisMeasure;
      if (remainingDuration > 0.001) {
        currentMeasure.push({ ...note, duration: remainingDuration });
        currentTime += remainingDuration;
      }
    } else {
      currentMeasure.push(note);
      currentTime += noteDuration;
    }

    // Check if measure is complete
    if (currentTime >= measureStartTime + measureDuration - 0.001) {
      measures.push(currentMeasure);
      currentMeasure = [];
      measureStartTime += measureDuration;
    }
  }

  // Fill remaining time with rests
  while (currentTime < totalDuration - 0.001) {
    const remaining = totalDuration - currentTime;
    const restDur = Math.min(remaining, measureStartTime + measureDuration - currentTime);

    if (restDur > 0.001) {
      currentMeasure.push({ isRest: true, duration: restDur });
      currentTime += restDur;
    }

    if (currentTime >= measureStartTime + measureDuration - 0.001) {
      measures.push(currentMeasure);
      currentMeasure = [];
      measureStartTime += measureDuration;
    }
  }

  if (currentMeasure.length > 0) {
    measures.push(currentMeasure);
  }

  return measures;
}

/**
 * Convert MIDI pitch to MusicXML pitch
 */
function midiToPitch(midi) {
  if (typeof midi !== 'number') return { step: 'C', alter: 0, octave: 4 };

  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  const pitchMap = {
    0: { step: 'C', alter: 0 },
    1: { step: 'C', alter: 1 },
    2: { step: 'D', alter: 0 },
    3: { step: 'E', alter: -1 },
    4: { step: 'E', alter: 0 },
    5: { step: 'F', alter: 0 },
    6: { step: 'F', alter: 1 },
    7: { step: 'G', alter: 0 },
    8: { step: 'G', alter: 1 },
    9: { step: 'A', alter: 0 },
    10: { step: 'B', alter: -1 },
    11: { step: 'B', alter: 0 }
  };

  return { ...pitchMap[pitchClass], octave };
}

/**
 * Get MusicXML duration type from quarter note duration
 */
function getDurationType(duration) {
  if (duration >= 4) return 'whole';
  if (duration >= 2) return 'half';
  if (duration >= 1) return 'quarter';
  if (duration >= 0.5) return 'eighth';
  if (duration >= 0.25) return '16th';
  return '32nd';
}

/**
 * Parse key signature to get fifths and mode
 */
function parseKeySignature(keySignature) {
  const key = keySignature.replace(/[-_]?(major|minor|m)$/i, '').trim().toUpperCase();
  const isMinor = /[-_]?(minor|m)$/i.test(keySignature);

  const fifthsMap = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7,
    'F': -1, 'BB': -2, 'EB': -3, 'AB': -4, 'DB': -5, 'GB': -6, 'CB': -7
  };

  return {
    fifths: fifthsMap[key] || 0,
    mode: isMinor ? 'minor' : 'major'
  };
}

/**
 * Get clef sign from clef name
 */
function getClefSign(clef) {
  const clefMap = {
    'treble': 'G',
    'bass': 'F',
    'alto': 'C',
    'tenor': 'C',
    'percussion': 'percussion'
  };
  return clefMap[clef] || 'G';
}

/**
 * Get clef line from clef name
 */
function getClefLine(clef) {
  const lineMap = {
    'treble': 2,
    'bass': 4,
    'alto': 3,
    'tenor': 4,
    'percussion': 3
  };
  return lineMap[clef] || 2;
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Create empty MusicXML document
 */
function createEmptyMusicXML(title, tempo, beatsPerMeasure, beatValue, fifths, mode) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  xml += '<score-partwise version="3.1">\n';
  xml += '  <work>\n';
  xml += `    <work-title>${escapeXML(title)}</work-title>\n`;
  xml += '  </work>\n';
  xml += '  <part-list>\n';
  xml += '    <score-part id="P1">\n';
  xml += '      <part-name>Music</part-name>\n';
  xml += '    </score-part>\n';
  xml += '  </part-list>\n';
  xml += '  <part id="P1">\n';
  xml += '    <measure number="1">\n';
  xml += '      <attributes>\n';
  xml += '        <divisions>4</divisions>\n';
  xml += '        <key>\n';
  xml += `          <fifths>${fifths}</fifths>\n`;
  xml += `          <mode>${mode}</mode>\n`;
  xml += '        </key>\n';
  xml += '        <time>\n';
  xml += `          <beats>${beatsPerMeasure}</beats>\n`;
  xml += `          <beat-type>${beatValue}</beat-type>\n`;
  xml += '        </time>\n';
  xml += '        <clef>\n';
  xml += '          <sign>G</sign>\n';
  xml += '          <line>2</line>\n';
  xml += '        </clef>\n';
  xml += '      </attributes>\n';
  xml += '      <note>\n';
  xml += '        <rest/>\n';
  xml += '        <duration>16</duration>\n';
  xml += '        <type>whole</type>\n';
  xml += '      </note>\n';
  xml += '    </measure>\n';
  xml += '  </part>\n';
  xml += '</score-partwise>\n';
  return xml;
}

/**
 * Render sheet music notation using Verovio
 *
 * @param {Object} composition - The JMON composition to render
 * @param {Object} options - Rendering options
 * @param {Object} [options.verovio] - Verovio module (from import verovio from "npm:verovio@4.3.1/wasm")
 * @param {number} [options.width] - Staff width in pixels (default: auto)
 * @param {number} [options.scale] - Scale factor for rendering (default: 100)
 * @returns {HTMLElement} DOM element containing the rendered score
 */
export async function score(composition, options = {}) {
  const {
    verovio: createVerovioModule,
    width,
    scale = 40,
  } = options;

  // Create container
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.overflow = 'visible';

  // Create rendering target
  const notationDiv = document.createElement('div');
  notationDiv.id = `rendered-score-${Date.now()}`;
  container.appendChild(notationDiv);

  try {
    if (!createVerovioModule) {
      notationDiv.innerHTML = '<p style="color:#ff6b6b">Verovio library not loaded. Import with: import verovio from "npm:verovio@4.3.1/wasm"</p>';
      return container;
    }

    notationDiv.innerHTML = '<p style="color:#888">Initializing Verovio...</p>';

    // Initialize Verovio WASM module
    const VerovioModule = await createVerovioModule();

    // Import VerovioToolkit class
    const { VerovioToolkit } = await import('verovio/esm');

    // Create toolkit instance
    const vrvToolkit = new VerovioToolkit(VerovioModule);

    // Convert JMON to MusicXML
    const musicXML = jmonToMusicXML(composition);

    // Set options
    const renderOptions = {
      scale: scale,
      adjustPageHeight: true,
      breaks: 'auto',
      pageWidth: width || 2100,
      pageHeight: 2970,
      spacingStaff: 12,
      spacingSystem: 12
    };

    vrvToolkit.setOptions(renderOptions);

    // Load and render MusicXML
    vrvToolkit.loadData(musicXML);
    const svg = vrvToolkit.renderToSVG(1);

    notationDiv.innerHTML = svg;

  } catch (error) {
    console.error('[SCORE] Render error:', error);
    notationDiv.innerHTML = `<p style="color:#ff6b6b">Error: ${error.message}</p>`;
  }

  return container;
}
