/**
 * MIDI to JMON Converter
 * Converts MIDI files to JMON format using Tone.js Midi parser
 * Follows existing patterns from music-player.js and other converters
 */

import { JmonValidator } from "../utils/jmon-validator.browser.js";

/**
 * MIDI to JMON Converter Class
 * Supports injectable Tone instance following existing patterns
 */
export class MidiToJmon {
  constructor(options = {}) {
    this.options = {
      Tone: null,
      trackNaming: "auto", // 'auto', 'numbered', 'channel', 'instrument'
      mergeDrums: true,
      quantize: null, // e.g., 0.25 for 16th note quantization
      includeModulations: true,
      includeTempo: true,
      includeKeySignature: true,
      ...options,
    };
  }

  /**
   * Static conversion method
   * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} JMON composition
   */
  static async convert(midiData, options = {}) {
    const converter = new MidiToJmon(options);
    return await converter.convertToJmon(midiData);
  }

  /**
   * Main conversion method
   * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
   * @returns {Promise<Object>} JMON composition
   */
  async convertToJmon(midiData) {
    // Initialize Tone.js instance following music-player pattern
    const Tone = await this.initializeTone();

    // Parse MIDI using Tone.js Midi
    let parsed;
    try {
      parsed = new Tone.Midi(midiData);
    } catch (error) {
      throw new Error(`Failed to parse MIDI file: ${error.message}`);
    }

    // Convert to JMON format
    const composition = this.buildJmonComposition(parsed, Tone);

    // Validate output using existing validator
    const validator = new JmonValidator();
    const { valid, normalized, errors } = validator.validateAndNormalize(
      composition,
    );

    if (!valid) {
      console.warn("Generated JMON failed validation:", errors);
      // Return the composition anyway, but log the issues
    }

    return valid ? normalized : composition;
  }

  /**
   * Initialize Tone.js instance following music-player.js pattern
   * @returns {Promise<Object>} Tone.js instance
   */
  async initializeTone() {
    const externalTone = this.options.Tone;

    if (typeof window !== "undefined") {
      // Browser environment - check multiple sources
      const existingTone = externalTone || window.Tone ||
        (typeof Tone !== "undefined" ? Tone : null);

      if (existingTone) {
        return existingTone;
      }

      // Dynamic import fallback (like music-player does)
      try {
        const toneModule = await import("tone");
        return toneModule.default || toneModule;
      } catch (error) {
        throw new Error(
          "Tone.js not found. Please provide Tone instance or load Tone.js",
        );
      }
    } else {
      // Node.js environment - require explicit Tone instance
      if (externalTone) {
        return externalTone;
      }
      throw new Error("Tone instance required in Node.js environment");
    }
  }

  /**
   * Build JMON composition from parsed MIDI
   * @param {Object} parsed - Parsed MIDI from Tone.js
   * @param {Object} Tone - Tone.js instance
   * @returns {Object} JMON composition
   */
  buildJmonComposition(parsed, Tone) {
    const composition = {
      format: "jmon",
      version: "1.0",
      tempo: this.extractTempo(parsed),
      tracks: this.convertTracks(parsed.tracks, Tone, parsed),
    };

    // Add optional properties if present
    const timeSignature = this.extractTimeSignature(parsed);
    if (timeSignature) {
      composition.timeSignature = timeSignature;
    }

    const keySignature = this.extractKeySignature(parsed);
    if (keySignature) {
      composition.keySignature = keySignature;
    }

    const metadata = this.extractMetadata(parsed);
    if (Object.keys(metadata).length > 0) {
      composition.metadata = metadata;
    }

    // Add tempo changes if present
    if (this.options.includeTempo && this.hasTempoChanges(parsed)) {
      composition.tempoMap = this.extractTempoMap(parsed);
    }

    // Add time signature changes if present
    if (this.hasTimeSignatureChanges(parsed)) {
      composition.timeSignatureMap = this.extractTimeSignatureMap(parsed);
    }

    return composition;
  }

  /**
   * Convert MIDI tracks to JMON tracks
   * @param {Array} tracks - MIDI tracks from Tone.js
   * @param {Object} Tone - Tone.js instance
   * @param {Object} parsed - Full parsed MIDI data
   * @returns {Array} JMON tracks
   */
  convertTracks(tracks, Tone, parsed) {
    const jmonTracks = [];
    let trackIndex = 0;

    for (const track of tracks) {
      // Skip empty tracks
      if (!track.notes || track.notes.length === 0) {
        continue;
      }

      const trackName = this.generateTrackName(track, trackIndex, parsed);
      const isDrumTrack = this.isDrumTrack(track);

      // Convert notes
      const notes = track.notes.map((note) =>
        this.convertNote(note, Tone, track)
      );

      // Apply quantization if requested
      const processedNotes = this.options.quantize
        ? this.quantizeNotes(notes, this.options.quantize)
        : notes;

      const jmonTrack = {
        label: trackName,
        notes: processedNotes,
      };

      // Add MIDI channel if available
      if (track.channel !== undefined) {
        jmonTrack.midiChannel = track.channel;
      }

      // Add instrument information if available
      if (track.instrument) {
        jmonTrack.synth = {
          type: isDrumTrack ? "Sampler" : "PolySynth",
          options: this.getInstrumentOptions(track.instrument, isDrumTrack),
        };
      }

      // Add control changes as modulations if requested
      if (this.options.includeModulations && track.controlChanges) {
        const modulations = this.extractModulations(track.controlChanges);
        if (modulations.length > 0) {
          // Add modulations to individual notes or as track-level automation
          this.applyModulationsToTrack(jmonTrack, modulations);
        }
      }

      jmonTracks.push(jmonTrack);
      trackIndex++;
    }

    return jmonTracks;
  }

  /**
   * Convert MIDI note to JMON note
   * @param {Object} note - MIDI note from Tone.js
   * @param {Object} Tone - Tone.js instance
   * @param {Object} track - Parent track for context
   * @returns {Object} JMON note
   */
  convertNote(note, Tone, track) {
    const jmonNote = {
      pitch: note.midi, // Use MIDI number as primary format
      time: note.time, // Tone.js already converts to seconds, we'll convert to quarters
      duration: this.convertDurationToNoteValue(note.duration),
      velocity: note.velocity,
    };

    // Convert time from seconds to quarter notes
    // Tone.js gives us time in seconds, but JMON prefers quarter note units
    const bpm = note.tempo || 120; // Use note tempo or default
    jmonNote.time = this.convertSecondsToQuarterNotes(note.time, bpm);

    // Add modulations if present on this note
    if (this.options.includeModulations && note.controlChanges) {
      const noteModulations = this.convertNoteModulations(note.controlChanges);
      if (noteModulations.length > 0) {
        jmonNote.modulations = noteModulations;
      }
    }

    return jmonNote;
  }

  /**
   * Generate track name based on naming strategy
   * @param {Object} track - MIDI track
   * @param {number} index - Track index
   * @param {Object} parsed - Full parsed MIDI
   * @returns {string} Track name
   */
  generateTrackName(track, index, parsed) {
    switch (this.options.trackNaming) {
      case "numbered":
        return `Track ${index + 1}`;

      case "channel":
        return `Channel ${(track.channel || 0) + 1}`;

      case "instrument":
        if (track.instrument) {
          return track.instrument.name ||
            `Instrument ${track.instrument.number}`;
        }
        return `Track ${index + 1}`;

      case "auto":
      default:
        // Try to detect meaningful names
        if (track.name && track.name.trim()) {
          return track.name.trim();
        }

        if (this.isDrumTrack(track)) {
          return "Drums";
        }

        if (track.instrument && track.instrument.name) {
          return track.instrument.name;
        }

        if (track.channel !== undefined) {
          return track.channel === 9 ? "Drums" : `Channel ${track.channel + 1}`;
        }

        return `Track ${index + 1}`;
    }
  }

  /**
   * Check if track is a drum track (channel 10/9 in MIDI)
   * @param {Object} track - MIDI track
   * @returns {boolean} True if drum track
   */
  isDrumTrack(track) {
    return track.channel === 9; // MIDI channel 10 (0-indexed as 9)
  }

  /**
   * Get instrument options for synth configuration
   * @param {Object} instrument - MIDI instrument info
   * @param {boolean} isDrum - Whether this is a drum track
   * @returns {Object} Synth options
   */
  getInstrumentOptions(instrument, isDrum) {
    if (isDrum) {
      // For drum tracks, we could map to specific drum samples
      return {
        envelope: {
          enabled: true,
          attack: 0.02,
          decay: 0.1,
          sustain: 0.8,
          release: 0.3,
        },
      };
    }

    // For melodic instruments, return basic synth options
    return {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 1,
      },
    };
  }

  /**
   * Extract tempo from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {number} BPM
   */
  extractTempo(parsed) {
    // Tone.js Midi provides tempoEvents or we can use header info
    if (
      parsed.header && parsed.header.tempos && parsed.header.tempos.length > 0
    ) {
      return Math.round(parsed.header.tempos[0].bpm);
    }

    // Look for tempo events in tracks
    for (const track of parsed.tracks) {
      if (track.tempoEvents && track.tempoEvents.length > 0) {
        return Math.round(track.tempoEvents[0].bpm);
      }
    }

    return 120; // Default tempo
  }

  /**
   * Extract time signature from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {string|null} Time signature like "4/4"
   */
  extractTimeSignature(parsed) {
    // Look for time signature in header or tracks
    if (
      parsed.header && parsed.header.timeSignatures &&
      parsed.header.timeSignatures.length > 0
    ) {
      const ts = parsed.header.timeSignatures[0];
      return `${ts.numerator}/${ts.denominator}`;
    }

    // Look in tracks for time signature events
    for (const track of parsed.tracks) {
      if (track.timeSignatureEvents && track.timeSignatureEvents.length > 0) {
        const ts = track.timeSignatureEvents[0];
        return `${ts.numerator}/${ts.denominator}`;
      }
    }

    return null; // Let JMON use default
  }

  /**
   * Extract key signature from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {string|null} Key signature like "C", "G", "Dm"
   */
  extractKeySignature(parsed) {
    // This is tricky as MIDI key signatures are not always reliable
    // For now, return null and let JMON use default
    // TODO: Implement key signature detection from MIDI meta events
    return null;
  }

  /**
   * Extract metadata from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {Object} Metadata object
   */
  extractMetadata(parsed) {
    const metadata = {};

    // Look for text events in tracks that might contain metadata
    for (const track of parsed.tracks) {
      if (track.meta) {
        for (const meta of track.meta) {
          switch (meta.type) {
            case "trackName":
            case "text":
              if (!metadata.title && meta.text && meta.text.trim()) {
                metadata.title = meta.text.trim();
              }
              break;
            case "copyright":
              if (meta.text && meta.text.trim()) {
                metadata.copyright = meta.text.trim();
              }
              break;
            case "composer":
              if (meta.text && meta.text.trim()) {
                metadata.composer = meta.text.trim();
              }
              break;
          }
        }
      }
    }

    return metadata;
  }

  /**
   * Check if MIDI has tempo changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {boolean} True if has tempo changes
   */
  hasTempoChanges(parsed) {
    if (
      parsed.header && parsed.header.tempos && parsed.header.tempos.length > 1
    ) {
      return true;
    }

    for (const track of parsed.tracks) {
      if (track.tempoEvents && track.tempoEvents.length > 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract tempo map for tempo changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {Array} Tempo map events
   */
  extractTempoMap(parsed) {
    const tempoMap = [];

    // Collect all tempo events
    const allTempoEvents = [];

    if (parsed.header && parsed.header.tempos) {
      allTempoEvents.push(...parsed.header.tempos.map((t) => ({
        time: t.time,
        tempo: Math.round(t.bpm),
      })));
    }

    for (const track of parsed.tracks) {
      if (track.tempoEvents) {
        allTempoEvents.push(...track.tempoEvents.map((t) => ({
          time: t.time,
          tempo: Math.round(t.bpm),
        })));
      }
    }

    // Sort by time and convert to quarter notes
    allTempoEvents.sort((a, b) => a.time - b.time);

    for (const event of allTempoEvents) {
      tempoMap.push({
        time: this.convertSecondsToQuarterNotes(event.time, event.tempo),
        tempo: event.tempo,
      });
    }

    return tempoMap;
  }

  /**
   * Check if MIDI has time signature changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {boolean} True if has time signature changes
   */
  hasTimeSignatureChanges(parsed) {
    if (
      parsed.header && parsed.header.timeSignatures &&
      parsed.header.timeSignatures.length > 1
    ) {
      return true;
    }

    for (const track of parsed.tracks) {
      if (track.timeSignatureEvents && track.timeSignatureEvents.length > 1) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract time signature map for time signature changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {Array} Time signature map events
   */
  extractTimeSignatureMap(parsed) {
    const timeSignatureMap = [];

    // Similar to tempo map extraction
    const allTSEvents = [];

    if (parsed.header && parsed.header.timeSignatures) {
      allTSEvents.push(...parsed.header.timeSignatures);
    }

    for (const track of parsed.tracks) {
      if (track.timeSignatureEvents) {
        allTSEvents.push(...track.timeSignatureEvents);
      }
    }

    allTSEvents.sort((a, b) => a.time - b.time);

    for (const event of allTSEvents) {
      timeSignatureMap.push({
        time: this.convertSecondsToQuarterNotes(event.time, 120), // Use default tempo for conversion
        timeSignature: `${event.numerator}/${event.denominator}`,
      });
    }

    return timeSignatureMap;
  }

  /**
   * Convert seconds to quarter notes
   * @param {number} seconds - Time in seconds
   * @param {number} bpm - Beats per minute
   * @returns {number} Time in quarter notes
   */
  convertSecondsToQuarterNotes(seconds, bpm) {
    const quarterNoteLength = 60 / bpm; // Length of one quarter note in seconds
    return seconds / quarterNoteLength;
  }

  /**
   * Convert duration to note value string
   * @param {number} duration - Duration in seconds
   * @returns {string} Note value like "4n", "8n"
   */
  convertDurationToNoteValue(duration) {
    // Common durations in seconds at 120 BPM
    const quarterNote = 0.5; // 60/120 = 0.5 seconds per quarter note at 120 BPM
    const ratio = duration / quarterNote;

    // Map to common note values
    if (ratio >= 3.5) return "1n"; // Whole note
    if (ratio >= 1.75) return "2n"; // Half note
    if (ratio >= 0.875) return "4n"; // Quarter note
    if (ratio >= 0.4375) return "8n"; // Eighth note
    if (ratio >= 0.21875) return "16n"; // Sixteenth note
    if (ratio >= 0.109375) return "32n"; // Thirty-second note

    return "16n"; // Default to sixteenth note
  }

  /**
   * Extract modulations from MIDI control changes
   * @param {Object} controlChanges - MIDI CC events
   * @returns {Array} Modulation events
   */
  extractModulations(controlChanges) {
    const modulations = [];

    // Convert common MIDI CCs to JMON modulations
    for (const [cc, events] of Object.entries(controlChanges)) {
      const ccNumber = parseInt(cc);

      for (const event of events) {
        const modulation = {
          type: "cc",
          controller: ccNumber,
          value: event.value,
          time: this.convertSecondsToQuarterNotes(event.time, 120),
        };

        modulations.push(modulation);
      }
    }

    return modulations;
  }

  /**
   * Convert note-level modulations
   * @param {Object} controlChanges - Note-level CC events
   * @returns {Array} Note modulation events
   */
  convertNoteModulations(controlChanges) {
    // Similar to extractModulations but for note-level events
    return this.extractModulations(controlChanges);
  }

  /**
   * Apply modulations to track
   * @param {Object} track - JMON track
   * @param {Array} modulations - Modulation events
   */
  applyModulationsToTrack(track, modulations) {
    // For now, add as track-level automation
    // In the future, this could be more sophisticated
    if (modulations.length > 0) {
      track.automation = [{
        id: "midi_cc",
        target: "midi.cc1", // Default to modulation wheel
        anchorPoints: modulations.map((mod) => ({
          time: mod.time,
          value: mod.value,
        })),
      }];
    }
  }

  /**
   * Quantize notes to grid
   * @param {Array} notes - Notes to quantize
   * @param {number} grid - Grid size in quarter notes
   * @returns {Array} Quantized notes
   */
  quantizeNotes(notes, grid) {
    return notes.map((note) => ({
      ...note,
      time: Math.round(note.time / grid) * grid,
    }));
  }
}

/**
 * Export function following existing converter pattern
 * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} JMON composition
 */
export async function midiToJmon(midiData, options = {}) {
  const isArrayBuffer =
    typeof ArrayBuffer !== 'undefined' && midiData instanceof ArrayBuffer;
  const isUint8Array =
    typeof Uint8Array !== 'undefined' && midiData instanceof Uint8Array;

  if (!isArrayBuffer && !isUint8Array) {
    throw new TypeError("midiToJmon: 'midiData' must be an ArrayBuffer or Uint8Array");
  }

  return await MidiToJmon.convert(midiData, options);
}
