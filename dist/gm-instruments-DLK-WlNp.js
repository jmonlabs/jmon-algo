const p = {
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
  74: { name: "Recorder", folder: "recorder-mp3" }
}, u = [
  "https://raw.githubusercontent.com/jmonlabs/midi-js-soundfonts/gh-pages/FluidR3_GM",
  "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM"
];
function d(t, a = u[0], r = [21, 108], m = "complete") {
  const o = p[t];
  if (!o)
    return console.warn(
      `GM program ${t} not found, using Acoustic Grand Piano`
    ), d(0, a, r);
  const l = {}, [s, i] = r;
  let n = [];
  switch (m) {
    case "minimal":
      for (let e = s; e <= i; e += 12)
        n.push(e);
      n.push(60);
      break;
    case "balanced":
      for (let e = s; e <= i; e += 4)
        n.push(e);
      [60, 64, 67].forEach((e) => {
        e >= s && e <= i && !n.includes(e) && n.push(e);
      });
      break;
    case "quality":
      for (let e = s; e <= i; e += 3)
        n.push(e);
      break;
    case "complete":
      for (let e = s; e <= i; e++)
        n.push(e);
      break;
    default:
      return console.warn(`Unknown sampling strategy '${m}', using 'balanced'`), d(t, a, r, "balanced");
  }
  n = [...new Set(n)].sort((e, c) => e - c);
  for (const e of n) {
    const c = f(e);
    l[c] = _(o.folder, c, a);
  }
  return console.log(
    `[GM INSTRUMENT] Generated ${Object.keys(l).length} sample URLs for ${o.name} (${m} strategy)`
  ), l;
}
function _(t, a, r) {
  return `${r}/${t}/${a}.mp3`;
}
function b(t, a = u[0], r = [21, 108]) {
  const m = p[t];
  if (!m)
    return console.warn(
      `GM program ${t} not found, using Acoustic Grand Piano`
    ), b(0, a, r);
  const o = {}, [l, s] = r;
  for (let i = l; i <= s; i++) {
    const n = f(i);
    o[n] = `${a}/${m.folder}/${n}.mp3`;
  }
  return o;
}
function f(t) {
  const a = [
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
    "B"
  ], r = Math.floor(t / 12) - 1, m = t % 12;
  return `${a[m]}${r}`;
}
function h(t) {
  const a = t.toLowerCase().trim();
  for (const [r, m] of Object.entries(p))
    if (m.name.toLowerCase() === a)
      return parseInt(r, 10);
  for (const [r, m] of Object.entries(p)) {
    const o = m.name.toLowerCase();
    if (o.includes(a) || a.includes(o.split(" ")[0]))
      return parseInt(r, 10);
  }
  return null;
}
function y(t, a, r = {}, m = "destination") {
  let o;
  if (typeof a == "string") {
    if (o = h(a), o === null) {
      console.warn(`GM instrument "${a}" not found. Available instruments:`);
      const c = Object.values(p).map((g) => g.name).slice(0, 10);
      console.warn(`Examples: ${c.join(", ")}...`), console.warn("Using Acoustic Grand Piano as fallback"), o = 0;
    }
  } else
    o = a;
  if (!p[o]) return null;
  const {
    baseUrl: s = u[0],
    noteRange: i = [21, 108],
    // Complete MIDI range for maximum quality
    envelope: n = { attack: 0.1, release: 1 },
    strategy: e = "complete"
    // Use complete sampling by default
  } = r;
  return {
    id: t,
    type: "Sampler",
    options: {
      urls: d(o, s, i, e),
      baseUrl: "",
      // URLs are already complete
      envelope: {
        enabled: !0,
        attack: n.attack,
        release: n.release
      }
    },
    target: m
  };
}
function G() {
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
    { program: 21, name: "Accordion", category: "Organ" }
  ];
}
export {
  u as CDN_SOURCES,
  p as GM_INSTRUMENTS,
  y as createGMInstrumentNode,
  h as findGMProgramByName,
  b as generateCompleteSamplerUrls,
  d as generateSamplerUrls,
  G as getPopularInstruments
};
