/**
 * General MIDI Instrument Mapping to FluidR3 Soundfonts
 * Maps GM program numbers to FluidR3 soundfont directory names
 */

export const GM_INSTRUMENTS = {
  // Piano Family
  0: { name: "Acoustic Grand Piano", folder: "acoustic_grand_piano-mp3" },
  1: { name: "Bright Acoustic Piano", folder: "bright_acoustic_piano-mp3" },
  2: { name: "Electric Grand Piano", folder: "electric_grand_piano-mp3" },
  3: { name: "Honky-tonk Piano", folder: "honkytonk_piano-mp3" },
  4: { name: "Electric Piano 1", folder: "electric_piano_1-mp3" },
  5: { name: "Electric Piano 2", folder: "electric_piano_2-mp3" },
  6: { name: "Harpsichord", folder: "harpsichord-mp3" },
  7: { name: "Clavinet", folder: "clavinet-mp3" },

  // Chromatic Percussion
  8: { name: "Celesta", folder: "celesta-mp3" },
  9: { name: "Glockenspiel", folder: "glockenspiel-mp3" },
  10: { name: "Music Box", folder: "music_box-mp3" },
  11: { name: "Vibraphone", folder: "vibraphone-mp3" },
  12: { name: "Marimba", folder: "marimba-mp3" },
  13: { name: "Xylophone", folder: "xylophone-mp3" },
  14: { name: "Tubular Bells", folder: "tubular_bells-mp3" },
  15: { name: "Dulcimer", folder: "dulcimer-mp3" },

  // Organ
  16: { name: "Drawbar Organ", folder: "drawbar_organ-mp3" },
  17: { name: "Percussive Organ", folder: "percussive_organ-mp3" },
  18: { name: "Rock Organ", folder: "rock_organ-mp3" },
  19: { name: "Church Organ", folder: "church_organ-mp3" },
  20: { name: "Reed Organ", folder: "reed_organ-mp3" },
  21: { name: "Accordion", folder: "accordion-mp3" },
  22: { name: "Harmonica", folder: "harmonica-mp3" },
  23: { name: "Tango Accordion", folder: "tango_accordion-mp3" },

  // Guitar
  24: { name: "Acoustic Guitar (nylon)", folder: "acoustic_guitar_nylon-mp3" },
  25: { name: "Acoustic Guitar (steel)", folder: "acoustic_guitar_steel-mp3" },
  26: { name: "Electric Guitar (jazz)", folder: "electric_guitar_jazz-mp3" },
  27: { name: "Electric Guitar (clean)", folder: "electric_guitar_clean-mp3" },
  28: { name: "Electric Guitar (muted)", folder: "electric_guitar_muted-mp3" },
  29: { name: "Overdriven Guitar", folder: "overdriven_guitar-mp3" },
  30: { name: "Distortion Guitar", folder: "distortion_guitar-mp3" },
  31: { name: "Guitar Harmonics", folder: "guitar_harmonics-mp3" },

  // Bass
  32: { name: "Acoustic Bass", folder: "acoustic_bass-mp3" },
  33: { name: "Electric Bass (finger)", folder: "electric_bass_finger-mp3" },
  34: { name: "Electric Bass (pick)", folder: "electric_bass_pick-mp3" },
  35: { name: "Fretless Bass", folder: "fretless_bass-mp3" },
  36: { name: "Slap Bass 1", folder: "slap_bass_1-mp3" },
  37: { name: "Slap Bass 2", folder: "slap_bass_2-mp3" },
  38: { name: "Synth Bass 1", folder: "synth_bass_1-mp3" },
  39: { name: "Synth Bass 2", folder: "synth_bass_2-mp3" },

  // Strings
  40: { name: "Violin", folder: "violin-mp3" },
  41: { name: "Viola", folder: "viola-mp3" },
  42: { name: "Cello", folder: "cello-mp3" },
  43: { name: "Contrabass", folder: "contrabass-mp3" },
  44: { name: "Tremolo Strings", folder: "tremolo_strings-mp3" },
  45: { name: "Pizzicato Strings", folder: "pizzicato_strings-mp3" },
  46: { name: "Orchestral Harp", folder: "orchestral_harp-mp3" },
  47: { name: "Timpani", folder: "timpani-mp3" },

  // Popular selections for common use
  48: { name: "String Ensemble 1", folder: "string_ensemble_1-mp3" },
  49: { name: "String Ensemble 2", folder: "string_ensemble_2-mp3" },
  56: { name: "Trumpet", folder: "trumpet-mp3" },
  57: { name: "Trombone", folder: "trombone-mp3" },
  58: { name: "Tuba", folder: "tuba-mp3" },
  64: { name: "Soprano Sax", folder: "soprano_sax-mp3" },
  65: { name: "Alto Sax", folder: "alto_sax-mp3" },
  66: { name: "Tenor Sax", folder: "tenor_sax-mp3" },
  67: { name: "Baritone Sax", folder: "baritone_sax-mp3" },
  68: { name: "Oboe", folder: "oboe-mp3" },
  69: { name: "English Horn", folder: "english_horn-mp3" },
  70: { name: "Bassoon", folder: "bassoon-mp3" },
  71: { name: "Clarinet", folder: "clarinet-mp3" },
  72: { name: "Piccolo", folder: "piccolo-mp3" },
  73: { name: "Flute", folder: "flute-mp3" },
  74: { name: "Recorder", folder: "recorder-mp3" },
};

/**
 * Available CDN sources for soundfonts with fallback support
 * raw.githubusercontent.com is more reliable for parallel audio file loading
 */
export const CDN_SOURCES = [
  "https://raw.githubusercontent.com/jmonlabs/midi-js-soundfonts/gh-pages/FluidR3_GM",
  "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM",
];

/**
 * Generate optimized Tone.js Sampler URLs using smart sampling strategy
 * @param {number} gmProgram - GM program number (0-127)
 * @param {string} baseUrl - Base CDN URL (default: first CDN source)
 * @param {Array<number>} noteRange - MIDI note range to map [min, max] (default: reduced range for better performance)
 * @param {string} strategy - Sampling strategy: 'minimal', 'balanced', 'quality', 'complete'
 * @returns {Object} Sampler URLs object for Tone.js
 */
export function generateSamplerUrls(
  gmProgram,
  baseUrl = CDN_SOURCES[0], // using raw files on github, jsdelivr has issues with many parallel requests
  noteRange = [21, 108],
  strategy = "complete",
) {
  const instrument = GM_INSTRUMENTS[gmProgram];
  if (!instrument) {
    console.warn(
      `GM program ${gmProgram} not found, using Acoustic Grand Piano`,
    );
    return generateSamplerUrls(0, baseUrl, noteRange);
  }

  const urls = {};
  const [minNote, maxNote] = noteRange;
  let selectedMidis = [];

  switch (strategy) {
    case "minimal":
      // Sample every octave + one middle note (5-8 samples total)
      // Good for: Simple melodies, testing, low bandwidth
      for (let midi = minNote; midi <= maxNote; midi += 12) {
        selectedMidis.push(midi);
      }
      selectedMidis.push(60); // Always include middle C
      break;

    case "balanced":
      // Sample every major third (4 semitones) - optimal quality/size ratio
      // Good for: Most musical applications, ~12-16 samples
      for (let midi = minNote; midi <= maxNote; midi += 4) {
        selectedMidis.push(midi);
      }
      // Add a few key notes to ensure coverage
      [60, 64, 67].forEach((key) => {
        if (key >= minNote && key <= maxNote && !selectedMidis.includes(key)) {
          selectedMidis.push(key);
        }
      });
      break;

    case "quality":
      // Sample every minor third (3 semitones) - high quality
      // Good for: Professional applications, ~16-20 samples
      for (let midi = minNote; midi <= maxNote; midi += 3) {
        selectedMidis.push(midi);
      }
      break;

    case "complete":
      // Sample every semitone - maximum quality but heavy
      // Good for: When quality is critical, 48+ samples
      for (let midi = minNote; midi <= maxNote; midi++) {
        selectedMidis.push(midi);
      }
      break;

    default:
      console.warn(`Unknown sampling strategy '${strategy}', using 'balanced'`);
      return generateSamplerUrls(gmProgram, baseUrl, noteRange, "balanced");
  }

  // Remove duplicates and sort
  selectedMidis = [...new Set(selectedMidis)].sort((a, b) => a - b);

  // Generate URLs for selected notes
  for (const midi of selectedMidis) {
    const noteName = midiToNoteName(midi);
    urls[noteName] = generateFallbackUrl(instrument.folder, noteName, baseUrl);
  }

  console.log(
    `[GM INSTRUMENT] Generated ${
      Object.keys(urls).length
    } sample URLs for ${instrument.name} (${strategy} strategy)`,
  );
  return urls;
}

/**
 * Generate a URL with fallback CDN sources
 * @param {string} folder - Instrument folder name
 * @param {string} noteName - Note name (e.g., "C4")
 * @param {string} preferredBaseUrl - Preferred CDN base URL
 * @returns {string} URL with fallback encoded as array
 */
function generateFallbackUrl(folder, noteName, preferredBaseUrl) {
  // For now, return the primary URL. In the future, we could implement
  // a more sophisticated fallback mechanism in the Tone.js integration
  return `${preferredBaseUrl}/${folder}/${noteName}.mp3`;
}

/**
 * Generate comprehensive Sampler URLs for high-quality instruments
 * @param {number} gmProgram - GM program number
 * @param {string} baseUrl - Base CDN URL
 * @param {Array<number>} noteRange - Full note range
 * @returns {Object} Complete sampler URLs
 */
export function generateCompleteSamplerUrls(
  gmProgram,
  baseUrl = CDN_SOURCES[0],
  noteRange = [21, 108],
) {
  const instrument = GM_INSTRUMENTS[gmProgram];
  if (!instrument) {
    console.warn(
      `GM program ${gmProgram} not found, using Acoustic Grand Piano`,
    );
    return generateCompleteSamplerUrls(0, baseUrl, noteRange);
  }

  const urls = {};
  const [minNote, maxNote] = noteRange;

  // Generate all note names and map to URLs
  for (let midi = minNote; midi <= maxNote; midi++) {
    const noteName = midiToNoteName(midi);
    urls[noteName] = `${baseUrl}/${instrument.folder}/${noteName}.mp3`;
  }

  return urls;
}

/**
 * Convert MIDI note number to note name (e.g., 60 -> "C4")
 * @param {number} midi - MIDI note number
 * @returns {string} Note name (e.g., "C4", "F#3")
 */
function midiToNoteName(midi) {
  // Use flat naming to match FluidR3 file names (e.g., Bb0.mp3, Db4.mp3)
  const noteNames = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Find GM program number by instrument name (case-insensitive)
 * @param {string} instrumentName - Name of the instrument (e.g., "Violin", "acoustic grand piano")
 * @returns {number|null} GM program number or null if not found
 */
export function findGMProgramByName(instrumentName) {
  const searchName = instrumentName.toLowerCase().trim();
  
  for (const [program, instrument] of Object.entries(GM_INSTRUMENTS)) {
    if (instrument.name.toLowerCase() === searchName) {
      return parseInt(program, 10);
    }
  }
  
  // Try partial matching for common variations
  for (const [program, instrument] of Object.entries(GM_INSTRUMENTS)) {
    const instName = instrument.name.toLowerCase();
    if (instName.includes(searchName) || searchName.includes(instName.split(' ')[0])) {
      return parseInt(program, 10);
    }
  }
  
  return null;
}

/**
 * Create audioGraph configuration for GM instrument
 * @param {string} id - Node ID for the audioGraph
 * @param {number|string} instrument - GM program number (0-127) OR instrument name (e.g., "Violin")
 * @param {Object} options - Sampler options (noteRange, envelope, strategy, baseUrl, etc.)
 * @param {string} target - Target node ID (default: "destination")
 * @returns {Object} AudioGraph node configuration
 */
export function createGMInstrumentNode(
  id,
  instrument,
  options = {},
  target = "destination"
) {
  let gmProgram;
  
  // Handle both number and string inputs
  if (typeof instrument === 'string') {
    gmProgram = findGMProgramByName(instrument);
    if (gmProgram === null) {
      console.warn(`GM instrument "${instrument}" not found. Available instruments:`);
      const availableNames = Object.values(GM_INSTRUMENTS).map(inst => inst.name).slice(0, 10);
      console.warn(`Examples: ${availableNames.join(', ')}...`);
      console.warn('Using Acoustic Grand Piano as fallback');
      gmProgram = 0;
    }
  } else {
    gmProgram = instrument;
  }
  
  const instrumentData = GM_INSTRUMENTS[gmProgram];
  if (!instrumentData) return null;

  const {
    baseUrl = CDN_SOURCES[0],
    noteRange = [21, 108], // Complete MIDI range for maximum quality
    envelope = { attack: 0.1, release: 1.0 },
    strategy = "complete", // Use complete sampling by default
  } = options;

  return {
    id,
    type: "Sampler",
    options: {
      urls: generateSamplerUrls(gmProgram, baseUrl, noteRange, strategy),
      baseUrl: "", // URLs are already complete
      envelope: {
        enabled: true,
        attack: envelope.attack,
        release: envelope.release,
      },
    },
    target,
  };
}

/**
 * Get list of popular instruments for UI selection
 * @returns {Array} Array of {program, name, category} objects
 */
export function getPopularInstruments() {
  return [
    // Piano & Keys
    { program: 0, name: "Acoustic Grand Piano", category: "Piano" },
    { program: 1, name: "Bright Acoustic Piano", category: "Piano" },
    { program: 4, name: "Electric Piano 1", category: "Piano" },
    { program: 6, name: "Harpsichord", category: "Piano" },

    // Strings
    { program: 40, name: "Violin", category: "Strings" },
    { program: 42, name: "Cello", category: "Strings" },
    { program: 48, name: "String Ensemble 1", category: "Strings" },

    // Brass
    { program: 56, name: "Trumpet", category: "Brass" },
    { program: 57, name: "Trombone", category: "Brass" },

    // Woodwinds
    { program: 65, name: "Alto Sax", category: "Woodwinds" },
    { program: 71, name: "Clarinet", category: "Woodwinds" },
    { program: 73, name: "Flute", category: "Woodwinds" },

    // Guitar & Bass
    { program: 24, name: "Acoustic Guitar (nylon)", category: "Guitar" },
    { program: 25, name: "Acoustic Guitar (steel)", category: "Guitar" },
    { program: 33, name: "Electric Bass (finger)", category: "Bass" },

    // Organ & Accordion
    { program: 16, name: "Drawbar Organ", category: "Organ" },
    { program: 21, name: "Accordion", category: "Organ" },
  ];
}
