class se {
  constructor() {
    console.warn(
      "[JMON] Using simplified browser validator. For full validation, use Node.js environment."
    );
  }
  /**
   * Basic validation and normalization for browser use
   * @param {Object} obj - JMON object to validate
   * @returns {Object} { valid, errors, normalized }
   */
  validateAndNormalize(t) {
    const e = [];
    let n = { ...t };
    try {
      return !t || typeof t != "object" ? (e.push("Object must be a valid object"), { valid: !1, errors: e, normalized: null }) : (!n.tracks && !n.notes && (Array.isArray(t) ? n = { tracks: [{ notes: t }] } : n.tracks = n.tracks || []), n.notes && !n.tracks && (n.tracks = [{ notes: n.notes }], delete n.notes), Array.isArray(n.tracks) || (n.tracks = [n.tracks]), n.tracks.forEach((r, o) => {
        if (!r.notes) {
          e.push(`Track ${o} missing notes array`);
          return;
        }
        if (!Array.isArray(r.notes)) {
          e.push(`Track ${o} notes must be an array`);
          return;
        }
        r.notes.forEach((i, s) => {
          if (typeof i != "object") {
            e.push(
              `Track ${o}, note ${s}: must be an object`
            );
            return;
          }
          i.pitch === void 0 && (i.pitch = null), i.duration === void 0 && (i.duration = 1), i.time === void 0 && (i.time = 0);
        });
      }), n.format = n.format || "jmon", n.version = n.version || "1.0", n.timeSignature = n.timeSignature || "4/4", n.keySignature = n.keySignature || "C", {
        valid: e.length === 0,
        errors: e,
        normalized: n
      });
    } catch (r) {
      return e.push(`Validation error: ${r.message}`), {
        valid: !1,
        errors: e,
        normalized: null
      };
    }
  }
  /**
   * Simple validation without normalization
   * @param {Object} obj - JMON object to validate
   * @returns {boolean} true if valid
   */
  isValid(t) {
    return this.validateAndNormalize(t).valid;
  }
}
class et {
  static chromatic_scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  static flat_to_sharp = {
    Bb: "A#",
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    "B♭": "A#",
    "D♭": "C#",
    "E♭": "D#",
    "G♭": "F#",
    "A♭": "G#",
    "B-": "A#",
    "D-": "C#",
    "E-": "D#",
    "G-": "F#",
    "A-": "G#"
  };
  static scale_intervals = {
    major: [0, 2, 4, 5, 7, 9, 11],
    // Ionian
    minor: [0, 2, 3, 5, 7, 8, 10],
    // Aeolian
    diminished: [0, 2, 3, 5, 6, 8, 9, 11],
    "major pentatonic": [0, 2, 4, 7, 9],
    "minor pentatonic": [0, 3, 5, 7, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    "harmonic minor": [0, 2, 3, 5, 7, 8, 11],
    "melodic minor ascending": [0, 2, 3, 5, 7, 9, 11],
    "melodic minor descending": [0, 2, 3, 5, 7, 8, 10]
    // same as natural minor
  };
  static intervals = {
    P1: 0,
    m2: 1,
    M2: 2,
    m3: 3,
    M3: 4,
    P4: 5,
    P5: 7,
    m6: 8,
    M6: 9,
    m7: 10,
    M7: 11,
    P8: 12
  };
  /**
   * Convert flat notes to their equivalent sharp notes
   * @param {string} note - The note to convert
   * @returns {string} The converted note or original if no conversion needed
   */
  static convertFlatToSharp(t) {
    return this.flat_to_sharp[t] || t;
  }
  /**
   * Convert note name with octave to MIDI number
   * @param {string} noteName - Note name with octave (e.g. 'C4', 'F#5', 'Bb3')
   * @returns {number} MIDI note number
   */
  static noteNameToMidi(t) {
    const e = t.match(/^([A-G][#b♭-]?)(-?\d+)$/);
    if (!e)
      throw new Error(`Invalid note name format: ${t}`);
    const [, n, r] = e, o = this.convertFlatToSharp(n), i = this.chromatic_scale.indexOf(o);
    if (i === -1)
      throw new Error(`Invalid note name: ${n}`);
    return i + (parseInt(r) + 1) * 12;
  }
  /**
   * Convert MIDI number to note name
   * @param {number} midiNumber - MIDI note number
   * @param {boolean} [preferFlat=false] - Whether to prefer flat notation
   * @returns {string} Note name with octave (e.g. 'C4', 'F#5')
   */
  static midiToNoteName(t, e = !1) {
    const n = Math.floor(t / 12) - 1, r = t % 12;
    return `${this.chromatic_scale[r]}${n}`;
  }
  /**
   * Returns the intervals for a triad based on the given scale intervals
   * @param {Array} scale - Scale intervals
   * @returns {Array} Triad intervals [root, third, fifth]
   */
  static scaleToTriad(t) {
    return [t[0], t[2], t[4]];
  }
}
class ve {
  /**
   * Create a Scale
   * @param {string} tonic - The tonic note of the scale
   * @param {string} mode - The type of scale
   */
  constructor(t, e = "major") {
    const n = et.convertFlatToSharp(t);
    if (!et.chromatic_scale.includes(n))
      throw new Error(`'${t}' is not a valid tonic note. Select one among '${et.chromatic_scale.join(", ")}'.`);
    if (this.tonic = n, !Object.keys(et.scale_intervals).includes(e))
      throw new Error(`'${e}' is not a valid scale. Select one among '${Object.keys(et.scale_intervals).join(", ")}'.`);
    this.mode = e;
  }
  /**
  * Generate a scale with flexible start/end points
  * @param {Object} options - Configuration object
  * @param {number|string} [options.start] - Starting MIDI note number or note name (e.g. 'C4')
  * @param {number|string} [options.end] - Ending MIDI note number or note name
  * @param {number} [options.length] - Number of notes to generate
  * @returns {Array} Array of MIDI note numbers representing the scale
  */
  generate(t = {}) {
    const e = et.scale_intervals[this.mode];
    if (!e)
      return console.warn(`Unknown scale mode: ${this.mode}`), [];
    typeof t.start == "string" && (t.start = et.noteNameToMidi(t.start)), typeof t.end == "string" && (t.end = et.noteNameToMidi(t.end));
    const n = t.start ?? 60;
    if (et.chromatic_scale.indexOf(this.tonic) === -1)
      return console.warn(`Unknown tonic: ${this.tonic}`), [];
    const o = (s, l) => {
      const a = l % e.length, d = Math.floor(l / e.length) * 12, u = e[a];
      return s + u + d;
    }, i = [];
    if (t.end !== void 0)
      for (let s = 0; ; s++) {
        const l = o(n, s);
        if (l > t.end) break;
        i.push(l);
      }
    else if (t.length)
      for (let s = 0; s < t.length; s++)
        i.push(o(n, s));
    else
      return e.map((s) => n + s);
    return i;
  }
  /**
   * Get the note names of the scale
   * @returns {Array} Array of note names in the scale
   */
  getNoteNames() {
    const t = et.scale_intervals[this.mode];
    if (!t) return [];
    const e = et.chromatic_scale.indexOf(this.tonic);
    return e === -1 ? [] : t.map((n) => {
      const r = (e + n) % 12;
      return et.chromatic_scale[r];
    });
  }
  /**
   * Check if a given pitch is in the scale
   * @param {number} pitch - MIDI note number
   * @returns {boolean} True if the pitch class is in the scale
   */
  isInScale(t) {
    const e = t % 12;
    return this.generate().map((r) => r % 12).includes(e);
  }
}
function We(c) {
  if (typeof c == "object" && !Array.isArray(c))
    return c;
  if (Array.isArray(c)) {
    if (c.length === 0)
      return {};
    if (c.every((e) => Array.isArray(e) && e.length === 3))
      return { "track 1": c };
    const t = {};
    return c.forEach((e, n) => {
      t[`track ${n + 1}`] = e;
    }), t;
  }
  throw new Error("Input must be a list or dict of tracks.");
}
function Me(c, t) {
  return t.reduce(
    (e, n) => Math.abs(n - c) < Math.abs(e - c) ? n : e
  );
}
function Te(c) {
  return Math.floor(c / 12) - 1;
}
function He(c) {
  return {
    "D-": "C#",
    "E-": "D#",
    "G-": "F#",
    "A-": "G#",
    "B-": "A#",
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
  }[c] || c;
}
function ne(c, t, e) {
  typeof c == "string" && (c = Ft(c)), typeof e == "string" && (e = Ft(e));
  const n = t.indexOf(e);
  if (t.includes(c))
    return t.indexOf(c) - n;
  {
    const r = Me(c, t), o = t.indexOf(r), i = o > 0 ? o - 1 : o, s = t[i], l = r - c, a = c - s, d = l + a;
    if (d === 0) return o - n;
    const u = 1 - l / d, m = 1 - a / d, p = o - n, M = i - n;
    return p * u + M * m;
  }
}
function Ke(c, t, e) {
  const n = t.indexOf(e), r = Math.round(n + c);
  if (r >= 0 && r < t.length)
    return t[r];
  {
    const o = Math.max(0, Math.min(r, t.length - 1)), i = Math.min(t.length - 1, Math.max(r, 0)), s = t[o], l = t[i], a = i - r, d = r - o, u = a + d;
    if (u === 0)
      return (l + s) / 2;
    const m = 1 - a / u, p = 1 - d / u;
    return l * m + s * p;
  }
}
function ke(c) {
  c.length > 0 && c[0].length === 2 && (c = c.map((n) => [n[0], n[1], 0]));
  const t = [];
  let e = 0;
  for (const [n, r, o] of c)
    t.push([n, r, e]), e += r;
  return t;
}
function Se(c, t = 0) {
  const e = [...c].sort((o, i) => o[2] - i[2]);
  let n = 0;
  const r = [];
  for (const o of e) {
    const [i, s, l] = o, a = t + l;
    if (a > n) {
      const u = [null, a - n, n - t];
      r.push(u);
    }
    r.push(o), n = Math.max(n, a + s);
  }
  return r;
}
function Ae(c) {
  c.sort((t, e) => t[2] - e[2]);
  for (let t = 0; t < c.length - 1; t++) {
    const e = c[t], n = c[t + 1];
    if (e[2] + e[1] > n[2]) {
      const o = n[2] - e[2];
      c[t] = [e[0], o, e[2]];
    }
  }
  return c;
}
function Je(c) {
  return Ae(Se(c));
}
function Ft(c) {
  const t = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], e = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#",
    Cb: "B"
  };
  let n = 4, r = c;
  if (c.includes("b")) {
    const s = c.slice(0, -1);
    e[s] && (r = e[s] + c.slice(-1));
  }
  let o;
  return r.length > 2 || r.length === 2 && !isNaN(r[1]) ? (o = r.slice(0, -1), n = parseInt(r.slice(-1))) : o = r[0], 12 * (n + 1) + t.indexOf(o);
}
function Xe(c) {
  const t = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], e = Math.floor(c / 12) - 1, n = c % 12;
  return t[n] + e.toString();
}
function Qe(c, t = "offsets") {
  const e = [];
  let n = 0;
  for (const [r, o, i] of c)
    e.push([r, o, n]), n += o;
  return e;
}
function Ze(c) {
  return c.every((t) => Array.isArray(t)) ? "list of tuples" : c.every((t) => !Array.isArray(t)) ? "list" : "unknown";
}
function tn(c, t, e, n = null, r = null) {
  const o = n !== null ? n : Math.min(...c), i = r !== null ? r : Math.max(...c);
  return o === i ? new Array(c.length).fill((t + e) / 2) : c.map(
    (s) => (s - o) * (e - t) / (i - o) + t
  );
}
function Pe(c, t) {
  return c.map(([e, n, r]) => [e, n, r + t]);
}
function en(c, t, e) {
  const n = [];
  for (const [r, o, i] of c) {
    const s = Math.round(i / e) * e, l = (Math.floor(s / t) + 1) * t;
    let a = Math.round(o / e) * e;
    a = Math.min(a, l - s), a > 0 && n.push([r, a, s]);
  }
  return n;
}
function nn(c, t) {
  const n = c.filter(([s, , l]) => s !== null && l !== null).sort((s, l) => s[2] - l[2]), r = Math.max(...n.map(([, , s]) => s)), o = Math.floor(r / t) + 1, i = [];
  for (let s = 0; s < o; s++) {
    const l = s * t;
    let a = null, d = 1 / 0;
    for (const [u, , m] of n) {
      const p = l - m;
      if (p >= 0 && p < d && (d = p, a = u), m > l) break;
    }
    a !== null && i.push(a);
  }
  return i;
}
function rn(c, t) {
  return t.reduce(
    (e, n) => Math.abs(n - c) < Math.abs(e - c) ? n : e
  );
}
function on(c, t) {
  return 60 / t * c;
}
function* sn(c = 0, t = 1, e = 0, n = 1) {
  for (; ; )
    yield e + n * c, [c, t] = [t, c + t];
}
function an(c, t, e) {
  const n = {};
  for (const [r, o] of Object.entries(c)) {
    const i = [];
    for (let s = 0; s < t; s++) {
      const l = s * e, a = Pe(o, l);
      i.push(...a);
    }
    n[r] = i;
  }
  return n;
}
const cn = {
  "Acoustic Grand Piano": 0,
  "Bright Acoustic Piano": 1,
  "Electric Grand Piano": 2,
  "Honky-tonk Piano": 3,
  "Electric Piano 1": 4,
  "Electric Piano 2": 5,
  Harpsichord: 6,
  Clavinet: 7,
  // ... (full mapping truncated for brevity, but would include all 128 instruments)
  Gunshot: 127
}, ln = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adjustNoteDurationsToPreventOverlaps: Ae,
  cdeToMidi: Ft,
  checkInput: Ze,
  fibonacci: sn,
  fillGapsWithRests: Se,
  findClosestPitchAtMeasureStart: nn,
  getDegreeFromPitch: ne,
  getOctave: Te,
  getPitchFromDegree: Ke,
  getSharp: He,
  instrumentMapping: cn,
  midiToCde: Xe,
  noOverlap: Qe,
  offsetTrack: Pe,
  qlToSeconds: on,
  quantizeNotes: en,
  repairNotes: Je,
  repeatPolyloops: an,
  roundToList: Me,
  scaleList: tn,
  setOffsetsAccordingToDurations: ke,
  tracksToDict: We,
  tune: rn
}, Symbol.toStringTag, { value: "Module" }));
class un extends et {
  /**
   * Initialize a Progression object
   * @param {string} tonicPitch - The tonic pitch of the progression (default: 'C4')
   * @param {string} circleOf - The interval to form the circle (default: 'P5')
   * @param {string} type - The type of progression ('chords' or 'pitches')
   * @param {Array} radius - Range for major, minor, and diminished chords [3, 3, 1]
   * @param {Array} weights - Weights for selecting chord types
   */
  constructor(t = "C4", e = "P5", n = "chords", r = [3, 3, 1], o = null) {
    if (super(), this.tonicMidi = Ft(t), this.circleOf = e, this.type = n, this.radius = r, this.weights = o || r, !Object.keys(this.intervals).includes(this.circleOf))
      throw new Error(`Select a circleOf among ${Object.keys(this.intervals).join(", ")}.`);
    if (!["chords", "pitches"].includes(this.type))
      throw new Error("Type must either be 'pitches' or 'chords'.");
  }
  /**
   * Compute chords based on the circle of fifths, thirds, etc., within the specified radius
   * @returns {Object} Object containing major, minor, and diminished chord roots
   */
  computeCircle() {
    const t = this.intervals[this.circleOf], e = [this.tonicMidi];
    for (let n = 0; n < Math.max(...this.radius); n++) {
      const r = (e[e.length - 1] + t) % 12 + Math.floor(e[e.length - 1] / 12) * 12;
      e.push(r);
    }
    return {
      major: e.slice(0, this.radius[0]),
      minor: e.slice(0, this.radius[1]),
      diminished: e.slice(0, this.radius[2])
    };
  }
  /**
   * Generate a chord based on root MIDI note and chord type
   * @param {number} rootNoteMidi - The root MIDI note of the chord
   * @param {string} chordType - The type of chord ('major', 'minor', 'diminished')
   * @returns {Array} Array of MIDI notes representing the chord
   */
  generateChord(t, e) {
    return ({
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6]
    }[e] || [0, 4, 7]).map((i) => t + i).map((i) => i > 127 ? i - 12 : i);
  }
  /**
   * Generate a musical progression
   * @param {number} length - The length of the progression in number of chords (default: 4)
   * @param {number} seed - The seed value for the random number generator
   * @returns {Array} Array of chord arrays representing the progression
   */
  generate(t = 4, e = null) {
    e !== null && (Math.seedrandom = e);
    const { major: n, minor: r, diminished: o } = this.computeCircle(), i = [n, r, o], s = ["major", "minor", "diminished"], l = [];
    for (let a = 0; a < t; a++) {
      const d = this.weightedRandomChoice(this.weights);
      if (i[d].length > 0) {
        const u = i[d][Math.floor(Math.random() * i[d].length)], m = s[d], p = Array.isArray(u) ? u[0] : u, M = this.generateChord(p, m);
        l.push(M);
      }
    }
    return l;
  }
  /**
   * Weighted random choice helper
   * @param {Array} weights - Array of weights
   * @returns {number} Selected index
   */
  weightedRandomChoice(t) {
    const e = t.reduce((r, o) => r + o, 0);
    let n = Math.random() * e;
    for (let r = 0; r < t.length; r++)
      if (n -= t[r], n <= 0)
        return r;
    return t.length - 1;
  }
}
class hn extends et {
  /**
   * Constructs all the necessary attributes for the voice object
   * @param {string} mode - The type of the scale (default: 'major')
   * @param {string} tonic - The tonic note of the scale (default: 'C')
   * @param {Array} degrees - Relative degrees for chord formation (default: [0, 2, 4])
   */
  constructor(t = "major", e = "C", n = [0, 2, 4]) {
    super(), this.tonic = e, this.scale = new ve(e, t).generate(), this.degrees = n;
  }
  /**
   * Convert a MIDI note to a chord based on the scale using the specified degrees
   * @param {number} pitch - The MIDI note to convert
   * @returns {Array} Array of MIDI notes representing the chord
   */
  pitchToChord(t) {
    const e = Te(t), n = this.tonic + e.toString(), r = Ft(n), o = this.scale.map((l) => ne(l, this.scale, r)), i = Math.round(ne(t, this.scale, r)), s = [];
    for (const l of this.degrees) {
      const a = i + l, d = o.indexOf(a);
      d !== -1 && s.push(this.scale[d]);
    }
    return s;
  }
  /**
   * Generate chords or arpeggios based on the given notes
   * @param {Array} notes - The notes to generate chords or arpeggios from
   * @param {Array} durations - The durations of each note (optional)
   * @param {boolean} arpeggios - If true, generate arpeggios instead of chords (default: false)
   * @returns {Array} The generated chords or arpeggios
   */
  generate(t, e = null, n = !1) {
    if (!Array.isArray(t) || t.length === 0)
      return [];
    let r = t;
    if (typeof t[0] == "number") {
      e === null && (e = [1]);
      let i = 0, s = 0;
      r = t.map((l) => {
        const a = e[i % e.length], d = [l, a, s];
        return s += a, i++, d;
      });
    }
    const o = r.map(([i, s, l]) => [this.pitchToChord(i), s, l]);
    if (n) {
      const i = [];
      for (const [s, l, a] of o) {
        const d = l / s.length;
        s.forEach((u, m) => {
          i.push([u, d, a + m * d]);
        });
      }
      return i;
    } else
      return o;
  }
}
const we = {
  grace_note: {
    requiredParams: ["graceNoteType"],
    optionalParams: ["gracePitches"],
    conflicts: [],
    description: "Single note before the main note",
    defaultParams: {
      graceNoteType: "acciaccatura"
    },
    validate: (c, t) => ["acciaccatura", "appoggiatura"].includes(t.graceNoteType) ? t.gracePitches && !Array.isArray(t.gracePitches) ? { valid: !1, error: "gracePitches must be an array of pitches" } : { valid: !0 } : { valid: !1, error: "graceNoteType must be either acciaccatura or appoggiatura" }
  },
  trill: {
    requiredParams: [],
    optionalParams: ["by", "trillRate"],
    conflicts: ["mordent"],
    minDuration: "8n",
    description: "Rapid alternation between main note and auxiliary note",
    defaultParams: {
      by: 1,
      trillRate: 0.125
    },
    validate: (c, t) => t.by && typeof t.by != "number" ? { valid: !1, error: "trill step (by) must be a number" } : t.trillRate && typeof t.trillRate != "number" ? { valid: !1, error: "trillRate must be a number" } : { valid: !0 }
  },
  mordent: {
    requiredParams: [],
    optionalParams: ["by"],
    conflicts: ["trill"],
    description: "Quick alternation with note above or below",
    defaultParams: {
      by: 1
    },
    validate: (c, t) => t.by && typeof t.by != "number" ? { valid: !1, error: "mordent step (by) must be a number" } : { valid: !0 }
  },
  turn: {
    requiredParams: [],
    optionalParams: ["scale"],
    conflicts: [],
    description: "Melodic turn around the main note",
    validate: (c, t) => t.scale && typeof t.scale != "string" ? { valid: !1, error: "scale must be a string" } : { valid: !0 }
  },
  arpeggio: {
    requiredParams: ["arpeggioDegrees"],
    optionalParams: ["direction"],
    conflicts: [],
    description: "Notes played in sequence",
    defaultParams: {
      direction: "up"
    },
    validate: (c, t) => Array.isArray(t.arpeggioDegrees) ? t.direction && !["up", "down", "both"].includes(t.direction) ? { valid: !1, error: "direction must be up, down, or both" } : { valid: !0 } : { valid: !1, error: "arpeggioDegrees must be an array" }
  }
};
class ae {
  /**
   * Validate ornament parameters and compatibility
   * @param {Object} note - The note to apply the ornament to
   * @param {string} type - The type of ornament
   * @param {Object} params - Parameters for the ornament
   * @returns {Object} Validation result with success status and any messages
   */
  static validateOrnament(t, e, n = {}) {
    const r = {
      valid: !1,
      warnings: [],
      errors: []
    }, o = we[e];
    if (!o)
      return r.errors.push(`Unknown ornament type: ${e}`), r;
    if (o.requiredParams) {
      for (const i of o.requiredParams)
        if (!(i in n))
          return r.errors.push(`Missing required parameter '${i}' for ${e}`), r;
    }
    if (o.minDuration && r.warnings.push(`Duration check not implemented for ${e}`), t.ornaments && o.conflicts) {
      const i = t.ornaments.filter((s) => o.conflicts.includes(s.type)).map((s) => s.type);
      if (i.length > 0)
        return r.errors.push(`${e} conflicts with existing ornaments: ${i.join(", ")}`), r;
    }
    if (o.validate) {
      const i = o.validate(t, n);
      if (!i.valid)
        return r.errors.push(i.error), r;
    }
    return r.valid = !0, r;
  }
  /**
   * Create a new ornament instance with validation
   * @param {Object} options - Ornament configuration
   */
  constructor(t) {
    const e = we[t.type];
    if (!e)
      throw new Error(`Unknown ornament type: ${t.type}`);
    this.type = t.type, this.params = {
      ...e.defaultParams,
      ...t.parameters
    }, t.tonic && t.mode ? (this.tonicIndex = et.chromatic_scale.indexOf(t.tonic), this.scale = this.generateScale(t.tonic, t.mode)) : this.scale = null;
  }
  /**
   * Generate a scale for pitch-based ornaments
   */
  generateScale(t, e) {
    const n = et.scale_intervals[e], r = et.chromatic_scale.indexOf(t), o = n.map((s) => (r + s) % 12), i = [];
    for (let s = -1; s < 10; s++)
      for (const l of o) {
        const a = 12 * s + l;
        a >= 0 && a <= 127 && i.push(a);
      }
    return i;
  }
  /**
   * Apply the ornament to notes
   */
  apply(t, e = null) {
    if (!Array.isArray(t) || t.length === 0 || (e === null && (e = Math.floor(Math.random() * t.length)), e < 0 || e >= t.length))
      return t;
    const n = t[e], r = ae.validateOrnament(n, this.type, this.params);
    if (!r.valid)
      return console.warn(`Ornament validation failed: ${r.errors.join(", ")}`), t;
    switch (this.type) {
      case "grace_note":
        return this.addGraceNote(t, e);
      case "trill":
        return this.addTrill(t, e);
      case "mordent":
        return this.addMordent(t, e);
      case "turn":
        return this.addTurn(t, e);
      case "arpeggio":
        return this.addArpeggio(t, e);
      default:
        return t;
    }
  }
  /**
   * Add a grace note
   */
  addGraceNote(t, e) {
    const n = t[e], r = n.pitch, o = n.duration, i = n.time, s = this.params.gracePitches ? this.params.gracePitches[Math.floor(Math.random() * this.params.gracePitches.length)] : r + 1;
    if (this.params.graceNoteType === "acciaccatura") {
      const l = o * 0.125, a = { pitch: r, duration: o, time: i + l };
      return [
        ...t.slice(0, e),
        { pitch: s, duration: l, time: i },
        a,
        ...t.slice(e + 1)
      ];
    } else {
      const l = o / 2, a = { pitch: r, duration: l, time: i + l };
      return [
        ...t.slice(0, e),
        { pitch: s, duration: l, time: i },
        a,
        ...t.slice(e + 1)
      ];
    }
  }
  /**
   * Add a trill
   */
  addTrill(t, e) {
    const n = t[e], r = n.pitch, o = n.duration, i = n.time, s = [];
    let l = i;
    const a = this.params.by || 1, d = this.params.trillRate || 0.125;
    let u;
    if (this.scale && this.scale.includes(r)) {
      const p = (this.scale.indexOf(r) + Math.round(a)) % this.scale.length;
      u = this.scale[p];
    } else
      u = r + a;
    for (; l < i + o; ) {
      const m = i + o - l, p = Math.min(d, m / 2);
      if (m >= p * 2)
        s.push({ pitch: r, duration: p, time: l }), s.push({ pitch: u, duration: p, time: l + p }), l += 2 * p;
      else
        break;
    }
    return [
      ...t.slice(0, e),
      ...s,
      ...t.slice(e + 1)
    ];
  }
  /**
   * Add a mordent
   */
  addMordent(t, e) {
    const n = t[e], r = n.pitch, o = n.duration, i = n.time, s = this.params.by || 1;
    let l;
    if (this.scale && this.scale.includes(r)) {
      const m = this.scale.indexOf(r) + Math.round(s);
      l = this.scale[m] || r + s;
    } else
      l = r + s;
    const a = o / 3, d = [
      { pitch: r, duration: a, time: i },
      { pitch: l, duration: a, time: i + a },
      { pitch: r, duration: a, time: i + 2 * a }
    ];
    return [
      ...t.slice(0, e),
      ...d,
      ...t.slice(e + 1)
    ];
  }
  /**
   * Add a turn
   */
  addTurn(t, e) {
    const n = t[e], r = n.pitch, o = n.duration, i = n.time, s = o / 4;
    let l, a;
    if (this.scale && this.scale.includes(r)) {
      const u = this.scale.indexOf(r);
      l = this.scale[u + 1] || r + 2, a = this.scale[u - 1] || r - 2;
    } else
      l = r + 2, a = r - 2;
    const d = [
      { pitch: r, duration: s, time: i },
      { pitch: l, duration: s, time: i + s },
      { pitch: r, duration: s, time: i + 2 * s },
      { pitch: a, duration: s, time: i + 3 * s }
    ];
    return [
      ...t.slice(0, e),
      ...d,
      ...t.slice(e + 1)
    ];
  }
  /**
   * Add an arpeggio
   */
  addArpeggio(t, e) {
    const n = t[e], r = n.pitch, o = n.duration, i = n.time, { arpeggioDegrees: s, direction: l = "up" } = this.params;
    if (!s || !Array.isArray(s))
      return t;
    const a = [];
    if (this.scale && this.scale.includes(r)) {
      const m = this.scale.indexOf(r);
      a.push(...s.map((p) => this.scale[m + p] || r + p));
    } else
      a.push(...s.map((m) => r + m));
    l === "down" && a.reverse(), l === "both" && a.push(...a.slice(0, -1).reverse());
    const d = o / a.length, u = a.map((m, p) => ({
      pitch: m,
      duration: d,
      time: i + p * d
    }));
    return [
      ...t.slice(0, e),
      ...u,
      ...t.slice(e + 1)
    ];
  }
}
const Kt = {
  // Simple articulations
  staccato: {
    complex: !1,
    description: "Shortens note duration to ~50%"
  },
  accent: {
    complex: !1,
    description: "Increases note velocity/emphasis"
  },
  tenuto: {
    complex: !1,
    description: "Holds note for full duration with emphasis"
  },
  legato: {
    complex: !1,
    description: "Smooth connection between notes"
  },
  marcato: {
    complex: !1,
    description: "Strong accent with slight separation"
  },
  // Complex articulations
  glissando: {
    complex: !0,
    requiredParams: ["target"],
    description: "Smooth slide from note to target pitch"
  },
  portamento: {
    complex: !0,
    requiredParams: ["target"],
    optionalParams: ["curve", "speed"],
    description: "Expressive slide between pitches"
  },
  bend: {
    complex: !0,
    requiredParams: ["amount"],
    optionalParams: ["curve", "returnToOriginal"],
    description: "Pitch bend up or down in cents"
  },
  vibrato: {
    complex: !0,
    optionalParams: ["rate", "depth", "delay"],
    description: "Periodic pitch variation"
  },
  tremolo: {
    complex: !0,
    optionalParams: ["rate", "depth"],
    description: "Rapid volume variation"
  },
  crescendo: {
    complex: !0,
    requiredParams: ["endVelocity"],
    optionalParams: ["curve"],
    description: "Gradual volume increase"
  },
  diminuendo: {
    complex: !0,
    requiredParams: ["endVelocity"],
    optionalParams: ["curve"],
    description: "Gradual volume decrease"
  }
};
class Ee {
  /**
   * Add articulation to a note in a sequence
   * @param {Array} sequence - The note sequence
   * @param {string} articulationType - Type of articulation
   * @param {number} noteIndex - Index of note to articulate
   * @param {Object} params - Parameters for complex articulations
   * @returns {Object} Result with success status and any warnings
   */
  static addArticulation(t, e, n, r = {}) {
    const o = {
      success: !1,
      warnings: [],
      errors: []
    };
    if (!Array.isArray(t))
      return o.errors.push("Sequence must be an array"), o;
    if (n < 0 || n >= t.length)
      return o.errors.push(
        `Note index ${n} out of bounds (sequence length: ${t.length})`
      ), o;
    const i = Kt[e];
    if (!i)
      return o.errors.push(`Unknown articulation type: ${e}`), o;
    const s = t[n];
    if (!s || typeof s != "object")
      return o.errors.push(`Invalid note at index ${n}`), o;
    if (!i.complex) {
      const l = Array.isArray(s.articulations) ? s.articulations : [];
      return s.articulations = [...l, e], o.success = !0, o;
    }
    return this._addComplexArticulation(
      s,
      e,
      i,
      r,
      o
    );
  }
  /**
   * Add complex articulation with parameter validation and synchronization
   */
  static _addComplexArticulation(t, e, n, r, o) {
    if (n.requiredParams) {
      for (const i of n.requiredParams)
        if (!(i in r))
          return o.errors.push(
            `Missing required parameter '${i}' for ${e}`
          ), o;
    }
    switch (e) {
      case "glissando":
      case "portamento":
        return this._applyGlissando(t, e, r, o);
      case "bend":
        return this._applyBend(t, r, o);
      case "vibrato":
        return this._applyVibrato(t, r, o);
      case "tremolo":
        return this._applyTremolo(t, r, o);
      case "crescendo":
      case "diminuendo":
        return this._applyDynamicChange(t, e, r, o);
      default:
        return o.errors.push(
          `Complex articulation ${e} not implemented`
        ), o;
    }
  }
  /**
   * Apply glissando/portamento articulation
   */
  static _applyGlissando(t, e, n, r) {
    const o = Array.isArray(t.articulations) ? t.articulations : [];
    return t.articulations = [...o, { type: e, ...n }], r.success = !0, r;
  }
  /**
   * Apply pitch bend articulation
   */
  static _applyBend(t, e, n) {
    const r = Array.isArray(t.articulations) ? t.articulations : [];
    return t.articulations = [...r, { type: "bend", ...e }], n.success = !0, n;
  }
  /**
   * Apply vibrato articulation
   */
  static _applyVibrato(t, e, n) {
    const r = Array.isArray(t.articulations) ? t.articulations : [];
    return t.articulations = [...r, { type: "vibrato", ...e }], n.success = !0, n;
  }
  /**
   * Apply tremolo articulation
   */
  static _applyTremolo(t, e, n) {
    const r = Array.isArray(t.articulations) ? t.articulations : [];
    return t.articulations = [...r, { type: "tremolo", ...e }], n.success = !0, n;
  }
  /**
   * Apply dynamic change (crescendo/diminuendo)
   */
  static _applyDynamicChange(t, e, n, r) {
    const o = Array.isArray(t.articulations) ? t.articulations : [];
    return t.articulations = [...o, { type: e, ...n }], r.success = !0, r;
  }
  /**
   * Remove articulation from a note
   */
  static removeArticulation(t, e) {
    if (!Array.isArray(t) || e < 0 || e >= t.length)
      return { success: !1, error: "Invalid sequence or note index" };
    const n = t[e];
    if (!n || typeof n != "object")
      return { success: !1, error: "Invalid note" };
    const r = Array.isArray(n.articulations) ? n.articulations.slice() : [];
    return n.articulations = [], {
      success: !0,
      removed: r,
      message: "Removed articulations from note"
    };
  }
  /**
   * Validate articulation consistency in a sequence
   */
  static validateSequence(t) {
    const e = [];
    return t.forEach((n, r) => {
      const o = Array.isArray(n.articulations) ? n.articulations : [];
      for (const i of o) {
        const s = typeof i == "string" ? i : i?.type, l = Kt[s];
        if (!s || !l) {
          e.push({
            type: "unknown_articulation",
            noteIndex: r,
            articulation: s,
            message: `Unknown articulation type: ${s}`
          });
          continue;
        }
        if (Array.isArray(l.requiredParams))
          for (const a of l.requiredParams)
            (typeof i != "object" || !(a in i)) && e.push({
              type: "missing_parameter",
              noteIndex: r,
              articulation: s,
              message: `Missing required parameter '${a}' for ${s}`
            });
      }
    }), {
      valid: e.length === 0,
      issues: e
    };
  }
  /**
   * Get available articulation types with descriptions
   */
  static getAvailableTypes() {
    return Object.entries(Kt).map(([t, e]) => ({
      type: t,
      complex: e.complex,
      description: e.description,
      requiredParams: e.requiredParams || [],
      optionalParams: e.optionalParams || []
    }));
  }
}
function dn(c) {
  return Ee.validateSequence(c);
}
function Ne(c, t, e, n = {}) {
  if (!Array.isArray(c)) return c;
  const r = c.slice(), o = c[t];
  if (!o || typeof o != "object") return r;
  const i = (a) => a === "staccato" || a === "accent" || a === "tenuto" || a === "marcato", s = Array.isArray(o.articulations) ? o.articulations.slice() : [];
  i(e) ? s.push(e) : s.push({ type: e, ...n });
  const l = {
    ...o,
    articulations: s
  };
  return r[t] = l, r;
}
function Ce(c, t, e) {
  if (!Array.isArray(c)) return c;
  const n = c.slice(), r = c[t];
  if (!r || typeof r != "object") return n;
  const o = (l) => typeof e == "function" ? e(l) : !0, i = Array.isArray(r.articulations) ? r.articulations.filter((l) => {
    const a = typeof l == "string" ? l : l.type;
    return !o(a);
  }) : [], s = { ...r, articulations: i };
  return n[t] = s, n;
}
const mn = Ne, fn = Ce, pn = {
  Scale: ve,
  Progression: un,
  Voice: hn,
  Ornament: ae,
  Articulation: Ee,
  addArticulation: Ne,
  addOrnament: mn,
  // Include the alias
  removeArticulation: Ce,
  removeOrnament: fn,
  // Include the alias
  validateArticulations: dn
};
class gn {
  /**
   * Constructs all the necessary attributes for the Rhythm object
   * @param {number} measureLength - The length of the measure
   * @param {Array} durations - The durations of the notes
   */
  constructor(t, e) {
    this.measureLength = t, this.durations = e;
  }
  /**
   * Generate a random rhythm as a list of (duration, offset) tuples
   * @param {number} seed - Random seed for reproducibility
   * @param {number} restProbability - Probability of a rest (0-1)
   * @param {number} maxIter - Maximum number of iterations
   * @returns {Array} Array of [duration, offset] tuples representing the rhythm
   */
  random(t = null, e = 0, n = 100) {
    t !== null && (Math.seedrandom = t);
    const r = [];
    let o = 0, i = 0;
    for (; o < this.measureLength && i < n; ) {
      const s = this.durations[Math.floor(Math.random() * this.durations.length)];
      if (o + s > this.measureLength) {
        i++;
        continue;
      }
      if (Math.random() < e) {
        i++;
        continue;
      }
      r.push([s, o]), o += s, i++;
    }
    return i >= n && console.warn("Max iterations reached. The sum of the durations may not equal the measure length."), r;
  }
  /**
   * Executes the Darwinian evolution algorithm to generate the best rhythm
   * @param {number} seed - Random seed for reproducibility
   * @param {number} populationSize - Number of rhythms in each generation
   * @param {number} maxGenerations - Maximum number of generations
   * @param {number} mutationRate - Probability of mutation (0-1)
   * @returns {Array} The best rhythm found after evolution
   */
  darwin(t = null, e = 10, n = 50, r = 0.1) {
    return new yn(
      t,
      e,
      this.measureLength,
      n,
      r,
      this.durations
    ).generate();
  }
}
class yn {
  constructor(t, e, n, r, o, i) {
    t !== null && (Math.seedrandom = t), this.populationSize = e, this.measureLength = n, this.maxGenerations = r, this.mutationRate = o, this.durations = i, this.population = this.initializePopulation();
  }
  /**
   * Initialize a population of random rhythms
   */
  initializePopulation() {
    const t = [];
    for (let e = 0; e < this.populationSize; e++)
      t.push(this.createRandomRhythm());
    return t;
  }
  /**
   * Create a random rhythm ensuring it respects the measure length
   * @returns {Array} Array of [duration, offset] tuples
   */
  createRandomRhythm() {
    const t = [];
    let e = 0;
    for (; e < this.measureLength; ) {
      const n = this.measureLength - e, r = this.durations[Math.floor(Math.random() * this.durations.length)];
      if (r <= n)
        t.push([r, e]), e += r;
      else
        break;
    }
    return t;
  }
  /**
   * Evaluate the fitness of a rhythm
   * @param {Array} rhythm - The rhythm to evaluate
   * @returns {number} Fitness score (lower is better)
   */
  evaluateFitness(t) {
    const e = t.reduce((n, r) => n + r[0], 0);
    return Math.abs(this.measureLength - e);
  }
  /**
   * Select a parent using simple random selection with fitness bias
   * @returns {Array} Selected parent rhythm
   */
  selectParent() {
    const t = this.population[Math.floor(Math.random() * this.population.length)], e = this.population[Math.floor(Math.random() * this.population.length)];
    return this.evaluateFitness(t) < this.evaluateFitness(e) ? t : e;
  }
  /**
   * Perform crossover between two parents
   * @param {Array} parent1 - First parent rhythm
   * @param {Array} parent2 - Second parent rhythm
   * @returns {Array} Child rhythm
   */
  crossover(t, e) {
    if (t.length === 0 || e.length === 0)
      return t.length > 0 ? [...t] : [...e];
    const n = Math.floor(Math.random() * (t.length - 1)) + 1, r = [...t.slice(0, n), ...e.slice(n)];
    return this.ensureMeasureLength(r);
  }
  /**
   * Ensure rhythm respects measure length
   * @param {Array} rhythm - The rhythm to adjust
   * @returns {Array} Adjusted rhythm
   */
  ensureMeasureLength(t) {
    return t.reduce((n, r) => n + r[0], 0) > this.measureLength && t.length > 0 && t.pop(), t;
  }
  /**
   * Mutate a rhythm with certain probability
   * @param {Array} rhythm - The rhythm to mutate
   * @returns {Array} Mutated rhythm
   */
  mutate(t) {
    if (Math.random() < this.mutationRate && t.length > 1) {
      const e = Math.floor(Math.random() * (t.length - 1)), [n, r] = t[e], i = (e === t.length - 1 ? this.measureLength : t[e + 1][1]) - r, s = this.durations.filter((l) => l <= i);
      if (s.length > 0) {
        const l = s[Math.floor(Math.random() * s.length)];
        t[e] = [l, r];
      }
    }
    return t;
  }
  /**
   * Execute the genetic algorithm
   * @returns {Array} Best rhythm found, sorted by offset
   */
  generate() {
    for (let e = 0; e < this.maxGenerations; e++) {
      const n = [];
      for (let r = 0; r < this.populationSize; r++) {
        const o = this.selectParent(), i = this.selectParent();
        let s = this.crossover(o, i);
        s = this.mutate(s), s.sort((l, a) => l[1] - a[1]), n.push(s);
      }
      this.population = n;
    }
    return this.population.reduce(
      (e, n) => this.evaluateFitness(n) < this.evaluateFitness(e) ? n : e
    ).sort((e, n) => e[1] - n[1]);
  }
}
function yt(c, t = 4, e = 480) {
  const n = Math.floor(c / t), r = c - n * t, o = Math.floor(r), i = r - o, s = Math.round(i * e);
  return `${n}:${o}:${s}`;
}
function jt(c, t = 4, e = 480) {
  if (typeof c == "number") return c;
  if (typeof c != "string") return 0;
  const n = c.split(":").map((s) => parseFloat(s || "0")), [r = 0, o = 0, i = 0] = n;
  return r * t + o + i / e;
}
function Re(c, t = "Untitled Part", e = {}) {
  const n = ce(c);
  return {
    name: t,
    notes: n,
    ...e
  };
}
function wn(c, t = {}) {
  const e = c.map((r, o) => Array.isArray(r) ? Re(r, `Track ${o + 1}`) : r.name && r.notes ? {
    ...r,
    notes: ce(r.notes)
  } : r), n = {
    format: "jmon",
    version: "1.0",
    bpm: t.bpm || 120,
    keySignature: t.keySignature || "C",
    timeSignature: t.timeSignature || "4/4",
    tracks: e,
    ...t
  };
  return delete n.metadata?.bpm, delete n.metadata?.keySignature, delete n.metadata?.timeSignature, n;
}
function ce(c) {
  return Array.isArray(c) ? c.map((t, e) => {
    if (Array.isArray(t)) {
      const [n, r, o = 0] = t;
      return {
        pitch: n,
        duration: r,
        time: yt(o)
      };
    }
    if (typeof t == "object" && t !== null) {
      const { pitch: n, duration: r } = t;
      let o = "0:0:0";
      return typeof t.time == "string" ? o = t.time : typeof t.time == "number" ? o = yt(t.time) : typeof t.offset == "number" && (o = yt(t.offset)), {
        pitch: n,
        duration: r,
        time: o,
        // Preserve other properties
        ...Object.fromEntries(
          Object.entries(t).filter(
            ([i]) => !["time", "offset"].includes(i)
          )
        )
      };
    }
    return console.warn(`Unexpected note format at index ${e}:`, t), {
      pitch: 60,
      // Default to middle C
      duration: 1,
      time: "0:0:0"
    };
  }) : [];
}
function bn(c) {
  return c.map(([t, e, n = 0]) => ({
    pitch: t,
    duration: e,
    time: yt(n)
  }));
}
function xn(c) {
  return c.map((t) => [
    t.pitch,
    t.duration,
    jt(t.time)
  ]);
}
function vn(c, t = 1, e = 0) {
  let n = e;
  return c.map((r) => {
    const o = {
      pitch: r,
      duration: t,
      time: yt(n)
    };
    return n += t, o;
  });
}
function Ie(c, t) {
  return c.map((e) => ({
    ...e,
    time: yt(jt(e.time) + t)
  }));
}
function Mn(c) {
  if (c.length === 0) return [];
  const t = [];
  let e = 0;
  for (const n of c) {
    const r = Ie(n, e);
    t.push(...r);
    const o = r.map(
      (i) => jt(i.time) + i.duration
    );
    e = Math.max(...o, e);
  }
  return t;
}
function Tn(c) {
  return c.flat();
}
function kn(c) {
  if (c.length === 0) return { start: 0, end: 0, duration: 0 };
  const t = c.map((o) => jt(o.time)), e = c.map((o) => jt(o.time) + o.duration), n = Math.min(...t), r = Math.max(...e);
  return {
    start: n,
    end: r,
    duration: r - n,
    startTime: yt(n),
    endTime: yt(r)
  };
}
const Sn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  beatsToTime: yt,
  combineSequences: Tn,
  concatenateSequences: Mn,
  createComposition: wn,
  createPart: Re,
  createScale: vn,
  getTimingInfo: kn,
  jmonToTuples: xn,
  normalizeNotes: ce,
  offsetNotes: Ie,
  timeToBeats: jt,
  tuplesToJmon: bn
}, Symbol.toStringTag, { value: "Module" }));
function An(c, t, e = {}) {
  const n = c.map((a) => Array.isArray(a) || typeof a == "object" && a.length ? a[0] : a), r = Pn(n.length, t.length), o = [], i = [];
  for (let a = 0; a < r; a++)
    o.push(n[a % n.length]), i.push(t[a % t.length]);
  const s = o.map((a, d) => [a, i[d], 1]), l = ke(s);
  return e.legacy ? l : l.map(([a, d, u]) => ({
    pitch: a,
    duration: d,
    time: e.useStringTime ? yt(u) : u
  }));
}
function Pn(c, t) {
  const e = (n, r) => r === 0 ? n : e(r, n % r);
  return Math.abs(c * t) / e(c, t);
}
function En(c, t) {
  const e = [];
  let n = 0, r = 0;
  for (const o of c) {
    const i = t[r % t.length];
    e.push([o, i, n]), n += i, r++;
  }
  return e;
}
const Nn = {
  Rhythm: gn,
  isorhythm: An,
  beatcycle: En
};
class Cn {
  // Dummy implementation, replace with actual logic
  constructor() {
  }
}
class gt {
  data;
  // rows: number;
  // columns: number;
  constructor(t, e) {
    if (typeof t == "number") {
      if (e === void 0)
        throw new Error("Columns parameter required when creating matrix from dimensions");
      this.rows = t, this.columns = e, this.data = Array(this.rows).fill(0).map(() => Array(this.columns).fill(0));
    } else
      this.data = t.map((n) => [...n]), this.rows = this.data.length, this.columns = this.data[0]?.length || 0;
  }
  static zeros(t, e) {
    return new gt(t, e);
  }
  static from2DArray(t) {
    return new gt(t);
  }
  get(t, e) {
    if (t < 0 || t >= this.rows || e < 0 || e >= this.columns)
      throw new Error(`Index out of bounds: (${t}, ${e})`);
    return this.data[t][e];
  }
  set(t, e, n) {
    if (t < 0 || t >= this.rows || e < 0 || e >= this.columns)
      throw new Error(`Index out of bounds: (${t}, ${e})`);
    this.data[t][e] = n;
  }
  getRow(t) {
    if (t < 0 || t >= this.rows)
      throw new Error(`Row index out of bounds: ${t}`);
    return [...this.data[t]];
  }
  getColumn(t) {
    if (t < 0 || t >= this.columns)
      throw new Error(`Column index out of bounds: ${t}`);
    return this.data.map((e) => e[t]);
  }
  transpose() {
    const t = Array(this.columns).fill(0).map(() => Array(this.rows).fill(0));
    for (let e = 0; e < this.rows; e++)
      for (let n = 0; n < this.columns; n++)
        t[n][e] = this.data[e][n];
    return new gt(t);
  }
  clone() {
    return new gt(this.data);
  }
  toArray() {
    return this.data.map((t) => [...t]);
  }
}
function Jt(c) {
  return Array.isArray(c[0]) ? gt.from2DArray(c) : gt.from2DArray([c]);
}
function je(c) {
  if (c.rows !== c.columns)
    throw new Error("Matrix must be square for Cholesky decomposition");
  const t = c.rows, e = gt.zeros(t, t);
  for (let n = 0; n < t; n++)
    for (let r = 0; r <= n; r++)
      if (n === r) {
        let o = 0;
        for (let s = 0; s < r; s++)
          o += e.get(r, s) * e.get(r, s);
        const i = c.get(r, r) - o;
        if (i <= 0)
          throw new Error(`Matrix is not positive definite at position (${r}, ${r})`);
        e.set(r, r, Math.sqrt(i));
      } else {
        let o = 0;
        for (let i = 0; i < r; i++)
          o += e.get(n, i) * e.get(r, i);
        e.set(n, r, (c.get(n, r) - o) / e.get(r, r));
      }
  return e;
}
class Rn {
  constructor(t = {}) {
    this.params = { ...t };
  }
  call(t, e) {
    const n = e || t, r = gt.zeros(t.rows, n.rows);
    for (let o = 0; o < t.rows; o++)
      for (let i = 0; i < n.rows; i++)
        r.set(o, i, this.compute(t.getRow(o), n.getRow(i)));
    return r;
  }
  // compute(x1, x2) { throw new Error('Not implemented'); }
  getParams() {
    return { ...this.params };
  }
  setParams(t) {
    Object.assign(this.params, t);
  }
  euclideanDistance(t, e) {
    let n = 0;
    for (let r = 0; r < t.length; r++)
      n += Math.pow(t[r] - e[r], 2);
    return Math.sqrt(n);
  }
  squaredEuclideanDistance(t, e) {
    let n = 0;
    for (let r = 0; r < t.length; r++)
      n += Math.pow(t[r] - e[r], 2);
    return n;
  }
}
class $e {
  kernel;
  alpha;
  XTrain;
  yTrain;
  L;
  alphaVector;
  constructor(t, e = {}) {
    this.kernel = t, this.alpha = e.alpha || 1e-10;
  }
  fit(t, e) {
    this.XTrain = Jt(t), this.yTrain = [...e];
    const n = this.kernel.call(this.XTrain);
    for (let r = 0; r < n.rows; r++)
      n.set(r, r, n.get(r, r) + this.alpha);
    try {
      this.L = je(n);
    } catch (r) {
      throw new Error(`Failed to compute Cholesky decomposition: ${r instanceof Error ? r.message : "Unknown error"}`);
    }
    this.alphaVector = this.solveCholesky(this.L, this.yTrain);
  }
  predict(t, e = !1) {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector)
      throw new Error("Model must be fitted before prediction");
    const n = Jt(t), r = this.kernel.call(this.XTrain, n), o = new Array(n.rows);
    for (let s = 0; s < n.rows; s++) {
      o[s] = 0;
      for (let l = 0; l < this.XTrain.rows; l++)
        o[s] += r.get(l, s) * this.alphaVector[l];
    }
    const i = { mean: o };
    if (e) {
      const s = this.computeStd(n, r);
      i.std = s;
    }
    return i;
  }
  sampleY(t, e = 1) {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector)
      throw new Error("Model must be fitted before sampling");
    const n = Jt(t), r = this.predict(t, !0);
    if (!r.std)
      throw new Error("Standard deviation computation failed");
    const o = [];
    for (let i = 0; i < e; i++) {
      const s = new Array(n.rows);
      for (let l = 0; l < n.rows; l++) {
        const a = r.mean[l], d = r.std[l];
        s[l] = a + d * this.sampleStandardNormal();
      }
      o.push(s);
    }
    return o;
  }
  logMarginalLikelihood() {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector)
      throw new Error("Model must be fitted before computing log marginal likelihood");
    let t = 0;
    for (let e = 0; e < this.yTrain.length; e++)
      t -= 0.5 * this.yTrain[e] * this.alphaVector[e];
    for (let e = 0; e < this.L.rows; e++)
      t -= Math.log(this.L.get(e, e));
    return t -= 0.5 * this.yTrain.length * Math.log(2 * Math.PI), t;
  }
  computeStd(t, e) {
    if (!this.L)
      throw new Error("Cholesky decomposition not available");
    const n = new Array(t.rows);
    for (let r = 0; r < t.rows; r++) {
      const o = this.kernel.compute(t.getRow(r), t.getRow(r)), i = e.getColumn(r), s = this.forwardSubstitution(this.L, i);
      let l = 0;
      for (let d = 0; d < s.length; d++)
        l += s[d] * s[d];
      const a = o - l;
      n[r] = Math.sqrt(Math.max(0, a));
    }
    return n;
  }
  solveCholesky(t, e) {
    const n = this.forwardSubstitution(t, e);
    return this.backSubstitution(t, n);
  }
  forwardSubstitution(t, e) {
    const n = t.rows, r = new Array(n);
    for (let o = 0; o < n; o++) {
      r[o] = e[o];
      for (let i = 0; i < o; i++)
        r[o] -= t.get(o, i) * r[i];
      r[o] /= t.get(o, o);
    }
    return r;
  }
  backSubstitution(t, e) {
    const n = t.rows, r = new Array(n);
    for (let o = n - 1; o >= 0; o--) {
      r[o] = e[o];
      for (let i = o + 1; i < n; i++)
        r[o] -= t.get(i, o) * r[i];
      r[o] /= t.get(o, o);
    }
    return r;
  }
  sampleStandardNormal() {
    const t = Math.random(), e = Math.random();
    return Math.sqrt(-2 * Math.log(t)) * Math.cos(2 * Math.PI * e);
  }
}
class be extends Rn {
  constructor(t = 1, e = 1) {
    super({ length_scale: t, variance: e }), this.lengthScale = t, this.variance = e;
  }
  compute(t, e) {
    const n = this.euclideanDistance(t, e);
    return this.variance * Math.exp(-0.5 * Math.pow(n / this.lengthScale, 2));
  }
  getParams() {
    return {
      length_scale: this.lengthScale,
      variance: this.variance
    };
  }
}
function In(c = 0, t = 1) {
  const e = Math.random(), n = Math.random(), r = Math.sqrt(-2 * Math.log(e)) * Math.cos(2 * Math.PI * n);
  return c + t * r;
}
function jn(c, t) {
  const e = c.length, n = je(t), r = Array.from({ length: e }, () => In()), o = new Array(e);
  for (let i = 0; i < e; i++) {
    o[i] = c[i];
    for (let s = 0; s <= i; s++)
      o[i] += n.get(i, s) * r[s];
  }
  return o;
}
const wt = {
  timeSignature: [4, 4],
  // 4/4 time
  ticksPerQuarterNote: 480,
  // Standard MIDI resolution
  beatsPerBar: 4
  // Derived from time signature
};
function Lt(c, t = wt) {
  const { timeSignature: e, ticksPerQuarterNote: n } = t, [r, o] = e, i = r * 4 / o, s = Math.floor(c / i), l = c % i, a = Math.floor(l), d = l - a, u = Math.round(d * n);
  return `${s}:${a}:${u}`;
}
function le(c, t = wt) {
  const { timeSignature: e, ticksPerQuarterNote: n } = t, [r, o] = e, i = c.split(":");
  if (i.length !== 3)
    throw new Error(`Invalid bars:beats:ticks format: ${c}`);
  const s = parseInt(i[0], 10), l = parseFloat(i[1]), a = parseInt(i[2], 10);
  if (isNaN(s) || isNaN(l) || isNaN(a))
    throw new Error(`Invalid numeric values in bars:beats:ticks: ${c}`);
  const d = r * 4 / o;
  return s * d + l + a / n;
}
function $n(c, t = wt, e = !0) {
  return c.map((n) => {
    const r = { ...n };
    if (n.offset !== void 0 && (r.time = n.offset, delete r.offset), typeof n.time == "string" && n.time.includes(":") && (r.time = le(n.time, t)), typeof n.duration == "number" && !e) {
      const o = n.duration;
      o === 1 ? r.duration = "4n" : o === 0.5 ? r.duration = "8n" : o === 0.25 ? r.duration = "16n" : o === 2 ? r.duration = "2n" : o === 4 && (r.duration = "1n");
    }
    return r;
  });
}
function Ot(c, t = {}) {
  const {
    label: e = "track",
    midiChannel: n = 0,
    synth: r = { type: "Synth" },
    timingConfig: o = wt,
    keepNumericDuration: i = !0
    // Default to numeric for MIDI consistency
  } = t, s = $n(c, o, i);
  return {
    label: e,
    midiChannel: n,
    synth: r,
    notes: s
  };
}
class Ln {
  data;
  lengthScale;
  amplitude;
  noiseLevel;
  walkAround;
  timingConfig;
  isFitted;
  gpr;
  constructor(t = [], e = 1, n = 1, r = 0.1, o = !1, i = wt) {
    this.data = [...t], this.lengthScale = e, this.amplitude = n, this.noiseLevel = r, this.walkAround = o, this.timingConfig = i, this.isFitted = !1, this.gpr = null;
  }
  generate(t = {}) {
    t.length, t.nsamples;
    const e = t.seed;
    return t.useStringTime, e !== void 0 && (Math.seedrandom = this.seededRandom(e)), this.data.length > 0 && Array.isArray(this.data[0]) ? this.generateFitted(t) : this.generateUnfitted(t);
  }
  /**
   * Generate from unfitted Gaussian Process
   */
  generateUnfitted(t = {}) {
    const e = t.length || 100, n = t.nsamples || 1, r = t.lengthScale || this.lengthScale, o = t.amplitude || this.amplitude, i = t.noiseLevel || this.noiseLevel;
    t.useStringTime;
    const s = [];
    for (let l = 0; l < n; l++) {
      const a = Array.from({ length: e }, (f, k) => [k]), d = new gt(a), m = new be(r, o).call(d);
      for (let f = 0; f < m.rows; f++)
        m.set(f, f, m.get(f, f) + i);
      let p = new Array(e).fill(this.walkAround || 0);
      this.walkAround && typeof this.walkAround == "number" && (p = new Array(e).fill(this.walkAround));
      const M = jn(p, m);
      s.push(M);
    }
    return n === 1 ? s[0] : s;
  }
  /**
   * Generate from fitted Gaussian Process using training data
   */
  generateFitted(t = {}) {
    const e = t.length || 100, n = t.nsamples || 1, r = t.lengthScale || this.lengthScale, o = t.amplitude || this.amplitude, i = this.data.map((f) => [f[0]]), s = this.data.map((f) => f[1]), l = new be(r, o);
    this.gpr = new $e(l);
    try {
      this.gpr.fit(i, s), this.isFitted = !0;
    } catch (f) {
      throw new Error(`Failed to fit Gaussian Process: ${f.message}`);
    }
    const a = Math.min(...this.data.map((f) => f[0])), u = (Math.max(...this.data.map((f) => f[0])) - a) / (e - 1), m = Array.from({ length: e }, (f, k) => [a + k * u]), p = this.gpr.sampleY(m, n), M = m.map((f) => f[0]);
    return n === 1 ? [M, p[0]] : [M, p];
  }
  rbfKernel(t, e) {
    let n = 0;
    for (let r = 0; r < t.length; r++)
      n += Math.pow(t[r] - e[r], 2);
    return this.amplitude * Math.exp(-n / (2 * Math.pow(this.lengthScale, 2)));
  }
  setData(t) {
    this.data = [...t];
  }
  getData() {
    return [...this.data];
  }
  setLengthScale(t) {
    this.lengthScale = t;
  }
  setAmplitude(t) {
    this.amplitude = t;
  }
  setNoiseLevel(t) {
    this.noiseLevel = t;
  }
  /**
   * Convert GP samples to JMON notes
   * @param {Array|Array<Array>} samples - GP samples (single array or array of arrays)
   * @param {Array} durations - Duration sequence
   * @param {Array} timePoints - Time points (for fitted GP)
   * @param {Object} options - Conversion options
   * @returns {Array} JMON note objects
   */
  toJmonNotes(t, e = [1], n = null, r = {}) {
    const {
      useStringTime: o = !1,
      mapToScale: i = null,
      scaleRange: s = [60, 72],
      quantize: l = !1
    } = r, a = [];
    let d = 0;
    const u = Array.isArray(t[0]) ? t : [t], m = n || Array.from({ length: u[0].length }, (p, M) => M);
    for (let p = 0; p < u[0].length; p++) {
      const M = e[p % e.length], f = n ? m[p] : d, k = u.map((B) => {
        let G = B[p];
        if (i) {
          const V = Math.min(...B), Q = Math.max(...B) - V || 1, bt = (G - V) / Q, rt = Math.floor(bt * i.length), ot = Math.max(0, Math.min(rt, i.length - 1));
          G = i[ot];
        } else {
          const V = Math.min(...B), Q = Math.max(...B) - V || 1, bt = (G - V) / Q;
          G = s[0] + bt * (s[1] - s[0]);
        }
        return l && (G = Math.round(G)), G;
      }), F = k.length === 1 ? k[0] : k;
      a.push({
        pitch: F,
        duration: M,
        time: o ? Lt(f, this.timingConfig) : f
      }), n || (d += M);
    }
    return a;
  }
  /**
   * Generate JMON track directly from GP
   * @param {Object} options - Generation options
   * @param {Object} trackOptions - Track options
   * @returns {Object} JMON track
   */
  generateTrack(t = {}, e = {}) {
    const n = this.generate(t), r = t.durations || [1];
    let o;
    if (this.isFitted || this.data.length > 0 && Array.isArray(this.data[0])) {
      const [i, s] = n;
      o = this.toJmonNotes(s, r, i, t);
    } else
      o = this.toJmonNotes(n, r, null, t);
    return Ot(o, {
      label: "gaussian-process",
      midiChannel: 0,
      synth: { type: "Synth" },
      ...e
    });
  }
  /**
   * Simple seeded random number generator
   */
  seededRandom(t) {
    return function() {
      return t = (t * 9301 + 49297) % 233280, t / 233280;
    };
  }
}
class _n {
  /**
   * @param {CellularAutomataOptions} [options={}] - Configuration options
   */
  constructor(t = {}) {
    this.width = t.width || 51, this.ruleNumber = t.ruleNumber || 30, this.initialState = t.initialState || this.generateRandomInitialState(), this.state = [...this.initialState], this.rules = this.loadRules(this.ruleNumber), this.history = [];
  }
  /**
   * Generate cellular automaton evolution
   * @param {number} steps - Number of evolution steps
   * @returns {Matrix2D} Evolution history
   */
  generate(t) {
    this.history = [], this.state = [...this.initialState], this.history.push([...this.state]);
    for (let e = 0; e < t; e++)
      this.updateState(), this.history.push([...this.state]);
    return this.history;
  }
  /**
   * Generate cellular automaton evolution with binary output
   * @param {number} steps - Number of evolution steps
   * @returns {Matrix2D} Binary evolution history
   */
  generate01(t) {
    return this.generate(t).map((n) => n.map((r) => r > 0 ? 1 : 0));
  }
  /**
   * Load rules based on rule number
   * @param {number} ruleNumber - Rule number (0-255)
   * @returns {CellularAutomataRule} Rule mapping
   */
  loadRules(t) {
    const e = t.toString(2).padStart(8, "0"), n = {}, r = ["111", "110", "101", "100", "011", "010", "001", "000"];
    for (let o = 0; o < 8; o++)
      n[r[o]] = parseInt(e[o], 10);
    return n;
  }
  /**
   * Update the current state based on rules
   */
  updateState() {
    const t = new Array(this.width);
    for (let e = 0; e < this.width; e++) {
      const n = this.state[(e - 1 + this.width) % this.width], r = this.state[e], o = this.state[(e + 1) % this.width], i = `${n}${r}${o}`;
      t[e] = this.rules[i] || 0;
    }
    this.state = t;
  }
  /**
   * Validate strips matrix format
   * @param {Matrix2D} strips - Matrix to validate
   * @returns {boolean} Whether the matrix is valid
   */
  validateStrips(t) {
    if (!Array.isArray(t) || t.length === 0)
      return !1;
    const e = t[0]?.length;
    return e ? t.every(
      (n) => Array.isArray(n) && n.length === e && n.every((r) => typeof r == "number" && (r === 0 || r === 1))
    ) : !1;
  }
  /**
   * Validate values array
   * @param {number[]} values - Values to validate
   * @returns {boolean} Whether the values are valid
   */
  validateValues(t) {
    return Array.isArray(t) && t.length === this.width && t.every((e) => typeof e == "number" && (e === 0 || e === 1));
  }
  /**
   * Set initial state
   * @param {number[]} state - New initial state
   */
  setInitialState(t) {
    if (this.validateValues(t))
      this.initialState = [...t], this.state = [...t];
    else
      throw new Error("Invalid initial state");
  }
  /**
   * Set rule number
   * @param {number} ruleNumber - New rule number (0-255)
   */
  setRuleNumber(t) {
    if (t >= 0 && t <= 255)
      this.ruleNumber = t, this.rules = this.loadRules(t);
    else
      throw new Error("Rule number must be between 0 and 255");
  }
  /**
   * Get evolution history
   * @returns {Matrix2D} Copy of evolution history
   */
  getHistory() {
    return this.history.map((t) => [...t]);
  }
  /**
   * Get current state
   * @returns {number[]} Copy of current state
   */
  getCurrentState() {
    return [...this.state];
  }
  /**
   * Generate random initial state with single center cell
   * @returns {number[]} Initial state array
   */
  generateRandomInitialState() {
    const t = new Array(this.width).fill(0);
    return t[Math.floor(this.width / 2)] = 1, t;
  }
  /**
   * Generate completely random state
   * @returns {number[]} Random state array
   */
  generateRandomState() {
    return Array.from({ length: this.width }, () => Math.random() > 0.5 ? 1 : 0);
  }
  /**
   * Get plot data
   * @returns {Object} Plot data with dimensions
   */
  plot() {
    return {
      data: this.getHistory(),
      width: this.width,
      height: this.history.length
    };
  }
  /**
   * Create Observable Plot visualization of CA evolution
   * @param {Object} [options] - Plot options
   * @returns {Object} Observable Plot spec
   */
  async plotEvolution(t) {
    return (await import("./CAVisualizer-CmIzAtiX.js")).CAVisualizer.plotEvolution(this.getHistory(), t);
  }
  /**
   * Create Observable Plot visualization of current generation
   * @param {Object} [options] - Plot options
   * @returns {Object} Observable Plot spec
   */
  async plotGeneration(t) {
    return (await import("./CAVisualizer-CmIzAtiX.js")).CAVisualizer.plotGeneration(this.getCurrentState(), t);
  }
  /**
   * Create Observable Plot density visualization
   * @param {Object} [options] - Plot options
   * @returns {Object} Observable Plot spec
   */
  async plotDensity(t) {
    return (await import("./CAVisualizer-CmIzAtiX.js")).CAVisualizer.plotDensity(this.getHistory(), t);
  }
}
class Yt {
  /**
   * Initializes a Loop object.
   * 
   * @param {Object|Array} loops - Dictionary or array of JMON tracks. Each track has notes: [{pitch, duration, time, velocity}, ...]
   * @param {number} measureLength - The length of a measure in beats. Defaults to 4.
   * @param {boolean} insertRests - Whether to insert rests. Defaults to true.
   */
  constructor(t, e = 4, n = !0) {
    if (!t)
      throw new Error("Loops parameter is required");
    if (typeof e != "number" || e <= 0)
      throw new Error("measureLength must be a positive number");
    if (typeof n != "boolean")
      throw new Error("insertRests must be a boolean");
    if (this.measureLength = e, Array.isArray(t)) {
      if (t.length === 0)
        throw new Error("Loops array cannot be empty");
      const r = {};
      t.forEach((o, i) => {
        const s = o?.label || `Loop ${i + 1}`;
        r[s] = o;
      }), t = r;
    }
    if (typeof t != "object" || Object.keys(t).length === 0)
      throw new Error("Loops must be a non-empty object or array");
    this.loops = {};
    for (const [r, o] of Object.entries(t)) {
      if (!o)
        throw new Error(`Loop data for "${r}" is null or undefined`);
      const i = Array.isArray(o) ? o : o.notes || [];
      if (!Array.isArray(i))
        throw new Error(`Notes for loop "${r}" must be an array`);
      const s = i.map((l, a) => {
        if (!l || typeof l != "object")
          throw new Error(`Note ${a} in loop "${r}" must be an object`);
        if (l.pitch !== null && (typeof l.pitch != "number" || l.pitch < 0 || l.pitch > 127))
          throw new Error(`Note ${a} in loop "${r}" has invalid pitch: ${l.pitch}`);
        if (typeof l.time != "number" || l.time < 0)
          throw new Error(`Note ${a} in loop "${r}" has invalid time: ${l.time}`);
        if (typeof l.duration != "number" || l.duration <= 0)
          throw new Error(`Note ${a} in loop "${r}" has invalid duration: ${l.duration}`);
        return {
          pitch: l.pitch,
          time: l.time,
          duration: l.duration,
          velocity: typeof l.velocity == "number" ? Math.max(0, Math.min(1, l.velocity)) : 0.8
        };
      });
      this.loops[r] = {
        label: o.label || r,
        notes: n ? this.fillGapsWithRests(s) : s,
        synth: o.synth || {
          type: "Synth",
          options: {
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
          }
        }
      };
    }
  }
  /**
   * Fill gaps between notes with rests (JMON format)
   */
  fillGapsWithRests(t) {
    if (t.length === 0) return t;
    const e = [];
    let n = 0;
    const r = [...t].sort((o, i) => o.time - i.time);
    for (const o of r)
      o.time > n && e.push({
        pitch: null,
        // null indicates rest
        duration: o.time - n,
        time: n,
        velocity: 0
      }), e.push({
        pitch: o.pitch,
        duration: o.duration,
        time: o.time,
        velocity: o.velocity || 0.8
      }), n = o.time + o.duration;
    return e;
  }
  /**
   * Create a loop from a single JMON track
   */
  static fromTrack(t, e = 4) {
    if ((t.notes || []).length === 0)
      throw new Error("Track must have notes to create loop");
    return new Yt({ [t.label || "Track"]: t }, e);
  }
  /**
   * Create loop from Euclidean rhythm (JMON format)
   */
  static euclidean(t, e, n = [60], r = null) {
    if (typeof t != "number" || t <= 0 || !Number.isInteger(t))
      throw new Error("beats must be a positive integer");
    if (typeof e != "number" || e < 0 || !Number.isInteger(e))
      throw new Error("pulses must be a non-negative integer");
    if (e > t)
      throw new Error("pulses cannot be greater than beats");
    if (!Array.isArray(n) || n.length === 0)
      throw new Error("pitches must be a non-empty array");
    const o = this.generateEuclideanRhythm(t, e), i = [], s = 1;
    o.forEach((a, d) => {
      if (a) {
        const u = d * s, m = n[d % n.length];
        i.push({
          pitch: m,
          duration: s * 0.8,
          time: u,
          velocity: 0.8
        });
      }
    });
    const l = {
      label: r || `Euclidean ${e}/${t}`,
      notes: i,
      synth: {
        type: "Synth",
        options: {
          oscillator: { type: "sine" },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
        }
      }
    };
    return new Yt({ [l.label]: l }, t);
  }
  /**
   * Generate Euclidean rhythm pattern using Bjorklund algorithm
   * This creates the most even distribution of pulses across beats
   */
  static generateEuclideanRhythm(t, e) {
    if (e === 0)
      return Array(t).fill(!1);
    if (e >= t)
      return Array(t).fill(!0);
    let n = [
      { pattern: [1], count: e },
      // Groups with pulses
      { pattern: [0], count: t - e }
      // Groups without pulses
    ];
    for (; n.length > 1; ) {
      const [i, s] = n;
      if (i.count <= s.count) {
        const l = i.count, a = s.count - i.count;
        n = [
          { pattern: [...s.pattern, ...i.pattern], count: l }
        ], a > 0 && n.push({ pattern: s.pattern, count: a });
      } else {
        const l = s.count, a = i.count - s.count;
        n = [
          { pattern: [...i.pattern, ...s.pattern], count: l }
        ], a > 0 && n.push({ pattern: i.pattern, count: a });
      }
    }
    const r = n[0], o = [];
    for (let i = 0; i < r.count; i++)
      o.push(...r.pattern);
    return o.map((i) => i === 1);
  }
  /**
   * Get loops as JMON tracks (already in JMON format)
   */
  toJMonSequences() {
    return Object.values(this.loops);
  }
  /**
   * Simple plotting method matching Python implementation
   */
  async plot(t = 1 / 4, e = null, n = {}) {
    const { LoopVisualizer: r } = await import("./LoopVisualizer-DS22P85c.js");
    return r.plotLoops(
      this.loops,
      this.measureLength,
      t,
      e,
      n
    );
  }
}
class Dt {
  /**
   * Create a musical index analyzer for a sequence
   * @param {Array} sequence - Array of musical values (pitches, durations, etc.)
   */
  constructor(t) {
    this.sequence = t.filter((e) => e != null), this.originalSequence = t;
  }
  /**
   * Calculate Gini coefficient (measure of inequality/diversity)
   * 0 = perfect equality, 1 = maximum inequality
   * @returns {number} Gini coefficient
   */
  gini() {
    if (this.sequence.length === 0) return 0;
    const t = [...this.sequence].sort((o, i) => o - i), e = t.length;
    let n = 0;
    for (let o = 0; o < e; o++)
      n += (2 * (o + 1) - e - 1) * t[o];
    const r = t.reduce((o, i) => o + i, 0);
    return r === 0 ? 0 : n / (e * r);
  }
  /**
   * Calculate balance (measure of how evenly distributed values are around the mean)
   * Lower values indicate better balance around the center
   * @returns {number} Balance metric
   */
  balance() {
    if (this.sequence.length === 0) return 0;
    const t = this.sequence.reduce((n, r) => n + r, 0) / this.sequence.length, e = this.sequence.reduce((n, r) => n + Math.pow(r - t, 2), 0) / this.sequence.length;
    return t === 0 ? 0 : Math.sqrt(e) / Math.abs(t);
  }
  /**
   * Calculate motif strength (measure of repetitive patterns)
   * Higher values indicate stronger motif presence
   * @param {number} maxMotifLength - Maximum motif length to consider
   * @returns {number} Motif strength
   */
  motif(t = 4) {
    if (this.sequence.length < 2) return 0;
    const e = /* @__PURE__ */ new Map();
    let n = 0;
    for (let o = 2; o <= Math.min(t, this.sequence.length); o++)
      for (let i = 0; i <= this.sequence.length - o; i++) {
        const s = this.sequence.slice(i, i + o).join(",");
        e.set(s, (e.get(s) || 0) + 1), n++;
      }
    let r = 0;
    for (const o of e.values())
      o > 1 && (r += o * o);
    return n === 0 ? 0 : r / n;
  }
  /**
   * Calculate dissonance relative to a musical scale
   * 0 = all notes in scale, higher values = more dissonance
   * @param {Array} scale - Array of pitches considered consonant
   * @returns {number} Dissonance level
   */
  dissonance(t) {
    if (!t || t.length === 0 || this.sequence.length === 0) return 0;
    const e = new Set(t.map((r) => r % 12));
    let n = 0;
    for (const r of this.sequence)
      if (r != null) {
        const o = r % 12;
        e.has(o) || n++;
      }
    return n / this.sequence.length;
  }
  /**
   * Calculate rhythmic fitness (how well durations fit within measure boundaries)
   * 1 = perfect fit, lower values = poor rhythmic alignment
   * @param {number} measureLength - Length of a measure in beats
   * @returns {number} Rhythmic fitness
   */
  rhythmic(t = 4) {
    if (this.sequence.length === 0) return 0;
    let e = 0, n = 0;
    const r = this.sequence.reduce(
      (o, i) => o + i,
      0
    );
    for (const o of this.sequence) {
      const i = e + o, s = Math.floor(e / t), l = Math.floor(i / t);
      if (s !== l) {
        const a = t - e % t;
        a < o && a > 0 && (n += Math.min(
          a,
          o - a
        ));
      }
      e = i;
    }
    return r === 0 ? 0 : 1 - n / r;
  }
  /**
   * Calculate proportion of rests in the sequence
   * @returns {number} Proportion of rests (0-1)
   */
  restProportion() {
    return this.originalSequence.length === 0 ? 0 : this.originalSequence.filter((e) => e == null).length / this.originalSequence.length;
  }
  /**
   * Calculate all metrics at once for efficiency
   * @param {Array} scale - Musical scale for dissonance calculation
   * @param {number} measureLength - Measure length for rhythmic analysis
   * @returns {Object} All calculated metrics
   */
  calculateAll(t = null, e = 4) {
    return {
      gini: this.gini(),
      balance: this.balance(),
      motif: this.motif(),
      dissonance: t ? this.dissonance(t) : 0,
      rhythmic: this.rhythmic(e),
      rest: this.restProportion()
    };
  }
  /**
   * Calculate statistical properties of the sequence
   * @returns {Object} Statistical properties
   */
  getStats() {
    if (this.sequence.length === 0)
      return { mean: 0, std: 0, min: 0, max: 0, range: 0 };
    const t = this.sequence.reduce((i, s) => i + s, 0) / this.sequence.length, e = this.sequence.reduce((i, s) => i + Math.pow(s - t, 2), 0) / this.sequence.length, n = Math.sqrt(e), r = Math.min(...this.sequence), o = Math.max(...this.sequence);
    return {
      mean: t,
      std: n,
      min: r,
      max: o,
      range: o - r
    };
  }
  /**
   * Compare two sequences and return similarity score
   * @param {MusicalIndex} other - Another MusicalIndex to compare with
   * @param {Array} scale - Scale for dissonance comparison
   * @param {number} measureLength - Measure length for rhythmic comparison
   * @returns {number} Similarity score (0-1, higher is more similar)
   */
  similarity(t, e = null, n = 4) {
    const r = this.calculateAll(e, n), o = t.calculateAll(e, n);
    let i = 0, s = 0;
    for (const [l, a] of Object.entries(r)) {
      const d = o[l];
      if (typeof a == "number" && typeof d == "number") {
        const u = Math.max(Math.abs(a), Math.abs(d), 1), m = 1 - Math.abs(a - d) / u;
        i += m, s++;
      }
    }
    return s === 0 ? 0 : i / s;
  }
}
class Fn {
  /**
   * Initialize the Darwin genetic algorithm
   * @param {Object} config - Configuration object
   */
  constructor(t = {}) {
    const {
      initialPhrases: e = [],
      mutationRate: n = 0.05,
      populationSize: r = 50,
      mutationProbabilities: o = null,
      scale: i = null,
      measureLength: s = 4,
      timeResolution: l = [0.125, 4],
      weights: a = null,
      targets: d = null,
      seed: u = null
    } = t;
    this.initialPhrases = e, this.mutationRate = n, this.populationSize = r, this.scale = i, this.measureLength = s, this.timeResolution = l, u !== null ? (this.seed = u, this.randomState = this.createSeededRandom(u)) : this.randomState = Math;
    const m = [0.125, 0.25, 0.5, 1, 2, 3, 4, 8];
    this.possibleDurations = m.filter(
      (p) => p >= l[0] && p <= Math.min(l[1], s)
    ), this.mutationProbabilities = o || {
      pitch: () => Math.max(0, Math.min(127, Math.floor(this.gaussianRandom(60, 5)))),
      duration: () => {
        const p = this.possibleDurations.map((M, f) => Math.pow(2, -f));
        return this.weightedChoice(this.possibleDurations, p);
      },
      rest: () => this.randomState.random() < 0.02 ? null : 1
    }, this.weights = a || {
      gini: [1, 1, 0],
      // [pitch, duration, offset]
      balance: [1, 1, 0],
      motif: [10, 1, 0],
      dissonance: [1, 0, 0],
      rhythmic: [0, 10, 0],
      rest: [1, 0, 0]
    }, this.targets = d || {
      gini: [0.05, 0.5, 0],
      balance: [0.1, 0.1, 0],
      motif: [1, 1, 0],
      dissonance: [0, 0, 0],
      rhythmic: [0, 1, 0],
      rest: [0, 0, 0]
    }, this.population = this.initializePopulation(), this.bestIndividuals = [], this.bestScores = [], this.generationCount = 0;
  }
  /**
   * Create a seeded random number generator
   * @param {number} seed - Random seed
   * @returns {Object} Random number generator with seeded methods
   */
  createSeededRandom(t) {
    let e = t;
    const n = () => (e = (e * 9301 + 49297) % 233280, e / 233280);
    return {
      random: n,
      choice: (r) => r[Math.floor(n() * r.length)],
      sample: (r, o) => [...r].sort(() => n() - 0.5).slice(0, o)
    };
  }
  /**
   * Generate Gaussian random number using Box-Muller transform
   * @param {number} mean - Mean of distribution
   * @param {number} stdDev - Standard deviation
   * @returns {number} Gaussian random number
   */
  gaussianRandom(t = 0, e = 1) {
    if (this.gaussianSpare !== void 0) {
      const i = this.gaussianSpare;
      return this.gaussianSpare = void 0, t + e * i;
    }
    const n = this.randomState.random(), r = this.randomState.random(), o = e * Math.sqrt(-2 * Math.log(n));
    return this.gaussianSpare = o * Math.cos(2 * Math.PI * r), t + o * Math.sin(2 * Math.PI * r);
  }
  /**
   * Choose random element from array with weights
   * @param {Array} choices - Array of choices
   * @param {Array} weights - Array of weights
   * @returns {*} Weighted random choice
   */
  weightedChoice(t, e) {
    const n = e.reduce((o, i) => o + i, 0);
    let r = this.randomState.random() * n;
    for (let o = 0; o < t.length; o++)
      if (r -= e[o], r <= 0)
        return t[o];
    return t[t.length - 1];
  }
  /**
   * Initialize population by mutating initial phrases
   * @returns {Array} Initial population
   */
  initializePopulation() {
    const t = [], e = Math.floor(this.populationSize / this.initialPhrases.length);
    for (const n of this.initialPhrases)
      for (let r = 0; r < e; r++)
        t.push(this.mutate(n, 0));
    for (; t.length < this.populationSize; ) {
      const n = this.randomState.choice(this.initialPhrases);
      t.push(this.mutate(n, 0));
    }
    return t;
  }
  /**
   * Calculate fitness components for a musical phrase
   * @param {Array} phrase - Musical phrase as [pitch, duration, offset] tuples
   * @returns {Object} Fitness components
   */
  calculateFitnessComponents(t) {
    if (t.length === 0) return {};
    const e = t.map((s) => s[0]), n = t.map((s) => s[1]), r = t.map((s) => s[2]), o = {};
    if (e.length > 0) {
      const s = new Dt(e);
      o.gini_pitch = s.gini(), o.balance_pitch = s.balance(), o.motif_pitch = s.motif(), this.scale && (o.dissonance_pitch = s.dissonance(this.scale));
    }
    if (n.length > 0) {
      const s = new Dt(n);
      o.gini_duration = s.gini(), o.balance_duration = s.balance(), o.motif_duration = s.motif(), o.rhythmic = s.rhythmic(this.measureLength);
    }
    if (r.length > 0) {
      const s = new Dt(r);
      o.gini_offset = s.gini(), o.balance_offset = s.balance(), o.motif_offset = s.motif();
    }
    const i = e.filter((s) => s == null).length / e.length;
    return o.rest = i, o;
  }
  /**
   * Calculate fitness score for a musical phrase
   * @param {Array} phrase - Musical phrase
   * @returns {number} Fitness score
   */
  fitness(t) {
    const e = this.calculateFitnessComponents(t);
    let n = 0;
    for (const [r, o] of Object.entries(this.targets)) {
      const i = this.weights[r];
      for (let s = 0; s < 3; s++) {
        const l = s === 0 ? `${r}_pitch` : s === 1 ? `${r}_duration` : `${r}_offset`, a = e[l] || 0, d = o[s], u = i[s];
        if (u > 0 && d !== void 0) {
          const m = Math.max(Math.abs(d), 1), p = 1 - Math.abs(a - d) / m;
          n += Math.max(0, p) * u;
        }
      }
    }
    if (this.weights.rest[0] > 0) {
      const r = e.rest || 0, o = this.targets.rest[0], i = 1 - Math.abs(r - o) / Math.max(o, 1);
      n += Math.max(0, i) * this.weights.rest[0];
    }
    return n;
  }
  /**
   * Mutate a musical phrase
   * @param {Array} phrase - Original phrase
   * @param {number} rate - Mutation rate (null to use default)
   * @returns {Array} Mutated phrase
   */
  mutate(t, e = null) {
    e === null && (e = this.mutationRate);
    const n = [];
    let r = 0;
    for (const o of t) {
      let [i, s, l] = o;
      this.randomState.random() < e && (i = this.mutationProbabilities.pitch()), this.randomState.random() < e && (s = this.mutationProbabilities.duration()), this.randomState.random() < e && this.mutationProbabilities.rest() === null && (i = null);
      const a = r;
      r += s, n.push([i, s, a]);
    }
    return n;
  }
  /**
   * Select top performers from population
   * @param {number} k - Number of individuals to select
   * @returns {Array} Selected phrases
   */
  select(t = 25) {
    const e = this.population.map((n) => ({
      phrase: n,
      fitness: this.fitness(n)
    }));
    return e.sort((n, r) => r.fitness - n.fitness), e.slice(0, t).map((n) => n.phrase);
  }
  /**
   * Crossover (breed) two parent phrases
   * @param {Array} parent1 - First parent phrase
   * @param {Array} parent2 - Second parent phrase
   * @returns {Array} Child phrase
   */
  crossover(t, e) {
    if (t.length === 0 || e.length === 0)
      return t.length > 0 ? [...t] : [...e];
    const n = Math.min(t.length, e.length), r = Math.floor(this.randomState.random() * n), o = Math.floor(this.randomState.random() * n), [i, s] = [Math.min(r, o), Math.max(r, o)], l = [];
    for (let d = 0; d < i; d++)
      d < t.length && l.push([...t[d]]);
    for (let d = i; d < s; d++)
      d < e.length && l.push([...e[d]]);
    for (let d = s; d < Math.max(t.length, e.length); d++)
      d < t.length ? l.push([...t[d]]) : d < e.length && l.push([...e[d]]);
    let a = 0;
    for (let d = 0; d < l.length; d++)
      l[d][2] = a, a += l[d][1];
    return l;
  }
  /**
   * Evolve the population for one generation
   * @param {number} k - Number of parents to select
   * @param {number} restRate - Rate for introducing rests (unused, kept for compatibility)
   * @returns {Object} Evolution statistics
   */
  evolve(t = 25) {
    const e = this.select(t), n = this.fitness(e[0]);
    this.bestIndividuals.push([...e[0]]), this.bestScores.push(n);
    const r = [];
    for (; r.length < this.populationSize; ) {
      const o = this.randomState.choice(e), i = this.randomState.choice(e), s = this.crossover([...o], [...i]), l = this.mutate(s);
      r.push(l);
    }
    return this.population = r, this.generationCount++, {
      generation: this.generationCount,
      bestFitness: n,
      averageFitness: e.reduce((o, i) => o + this.fitness(i), 0) / e.length,
      populationSize: this.populationSize
    };
  }
  /**
   * Evolve for multiple generations
   * @param {number} generations - Number of generations to evolve
   * @param {number} k - Number of parents per generation
   * @param {Function} callback - Optional callback for progress updates
   * @returns {Array} Array of evolution statistics
   */
  evolveGenerations(t, e = 25, n = null) {
    const r = [];
    for (let o = 0; o < t; o++) {
      const i = this.evolve(e);
      r.push(i), n && n(i, o, t);
    }
    return r;
  }
  /**
   * Get the current best individual
   * @returns {Array} Best musical phrase
   */
  getBestIndividual() {
    return this.bestIndividuals.length > 0 ? [...this.bestIndividuals[this.bestIndividuals.length - 1]] : null;
  }
  /**
   * Get evolution history
   * @returns {Object} Evolution history with individuals and scores
   */
  getEvolutionHistory() {
    return {
      individuals: this.bestIndividuals.map((t) => [...t]),
      scores: [...this.bestScores],
      generations: this.generationCount
    };
  }
  /**
   * Reset the evolution state
   */
  reset() {
    this.population = this.initializePopulation(), this.bestIndividuals = [], this.bestScores = [], this.generationCount = 0;
  }
  /**
   * Get population statistics
   * @returns {Object} Population statistics
   */
  getPopulationStats() {
    const t = this.population.map((r) => this.fitness(r)), e = t.reduce((r, o) => r + o, 0) / t.length, n = t.reduce((r, o) => r + Math.pow(o - e, 2), 0) / t.length;
    return {
      populationSize: this.population.length,
      meanFitness: e,
      standardDeviation: Math.sqrt(n),
      minFitness: Math.min(...t),
      maxFitness: Math.max(...t),
      generation: this.generationCount
    };
  }
}
class Vn {
  options;
  walkers;
  history;
  constructor(t = {}) {
    this.options = {
      length: t.length || 100,
      dimensions: t.dimensions || 1,
      stepSize: t.stepSize || 1,
      bounds: t.bounds || [-100, 100],
      branchProbability: t.branchProbability || 0.05,
      mergeProbability: t.mergeProbability || 0.02,
      attractorStrength: t.attractorStrength || 0,
      attractorPosition: t.attractorPosition || Array(t.dimensions || 1).fill(0)
    }, this.walkers = [], this.history = [];
  }
  /**
   * Generate random walk sequence
   */
  generate(t) {
    this.initialize(t), this.history = [];
    for (let e = 0; e < this.options.length; e++)
      this.updateWalkers(), this.recordState(), this.handleBranching(), this.handleMerging();
    return this.history;
  }
  /**
   * Initialize walker(s)
   */
  initialize(t) {
    const e = t || Array(this.options.dimensions).fill(0);
    this.walkers = [{
      position: [...e],
      velocity: Array(this.options.dimensions).fill(0),
      branches: [],
      age: 0,
      active: !0
    }];
  }
  /**
   * Update all active walkers
   */
  updateWalkers() {
    for (const t of this.walkers)
      if (t.active) {
        for (let e = 0; e < this.options.dimensions; e++) {
          const n = (Math.random() - 0.5) * 2 * this.options.stepSize;
          let r = 0;
          if (this.options.attractorStrength > 0) {
            const o = t.position[e] - this.options.attractorPosition[e];
            r = -this.options.attractorStrength * o;
          }
          t.velocity[e] = t.velocity[e] * 0.9 + n + r, t.position[e] += t.velocity[e], t.position[e] < this.options.bounds[0] ? (t.position[e] = this.options.bounds[0], t.velocity[e] *= -0.5) : t.position[e] > this.options.bounds[1] && (t.position[e] = this.options.bounds[1], t.velocity[e] *= -0.5);
        }
        t.age++;
      }
  }
  /**
   * Record current state of all walkers
   */
  recordState() {
    const t = this.walkers.filter((e) => e.active);
    if (t.length > 0) {
      const e = Array(this.options.dimensions).fill(0);
      for (const n of t)
        for (let r = 0; r < this.options.dimensions; r++)
          e[r] += n.position[r];
      for (let n = 0; n < this.options.dimensions; n++)
        e[n] /= t.length;
      this.history.push([...e]);
    }
  }
  /**
   * Handle branching (walker splitting)
   */
  handleBranching() {
    const t = [];
    for (const e of this.walkers)
      if (e.active && Math.random() < this.options.branchProbability) {
        const n = {
          position: [...e.position],
          velocity: e.velocity.map((r) => r + (Math.random() - 0.5) * this.options.stepSize),
          branches: [],
          age: 0,
          active: !0
        };
        t.push(n), e.branches.push(n);
      }
    this.walkers.push(...t);
  }
  /**
   * Handle merging (walker combining)
   */
  handleMerging() {
    if (this.walkers.length <= 1) return;
    const t = this.walkers.filter((n) => n.active), e = this.options.stepSize * 2;
    for (let n = 0; n < t.length; n++)
      for (let r = n + 1; r < t.length; r++)
        if (Math.random() < this.options.mergeProbability && this.calculateDistance(t[n].position, t[r].position) < e) {
          for (let i = 0; i < this.options.dimensions; i++)
            t[n].position[i] = (t[n].position[i] + t[r].position[i]) / 2, t[n].velocity[i] = (t[n].velocity[i] + t[r].velocity[i]) / 2;
          t[r].active = !1;
        }
    this.walkers = this.walkers.filter((n) => n.active);
  }
  /**
   * Calculate Euclidean distance between two positions
   */
  calculateDistance(t, e) {
    let n = 0;
    for (let r = 0; r < t.length; r++)
      n += Math.pow(t[r] - e[r], 2);
    return Math.sqrt(n);
  }
  /**
   * Get 1D projection of multi-dimensional walk
   */
  getProjection(t = 0) {
    return this.history.map((e) => e[t] || 0);
  }
  /**
   * Map walk to musical scale
   */
  mapToScale(t = 0, e = [0, 2, 4, 5, 7, 9, 11], n = 3) {
    const r = this.getProjection(t);
    if (r.length === 0) return [];
    const o = Math.min(...r), s = Math.max(...r) - o || 1;
    return r.map((l) => {
      const a = (l - o) / s, d = Math.floor(a * e.length * n), u = Math.floor(d / e.length), m = d % e.length;
      return 60 + u * 12 + e[m];
    });
  }
  /**
   * Map walk to rhythmic durations
   */
  mapToRhythm(t = 0, e = [0.25, 0.5, 1, 2]) {
    const n = this.getProjection(t);
    if (n.length === 0) return [];
    const r = Math.min(...n), i = Math.max(...n) - r || 1;
    return n.map((s) => {
      const l = (s - r) / i, a = Math.floor(l * e.length), d = Math.max(0, Math.min(a, e.length - 1));
      return e[d];
    });
  }
  /**
   * Map walk to velocities
   */
  mapToVelocity(t = 0, e = 0.3, n = 1) {
    const r = this.getProjection(t);
    if (r.length === 0) return [];
    const o = Math.min(...r), s = Math.max(...r) - o || 1;
    return r.map((l) => {
      const a = (l - o) / s;
      return e + a * (n - e);
    });
  }
  /**
   * Generate correlated walk (walk that follows another walk with some correlation)
   */
  generateCorrelated(t, e = 0.5, n = 0) {
    if (t.length === 0) return [];
    const r = [];
    let o = 0;
    for (let i = 0; i < t.length; i++) {
      const s = (Math.random() - 0.5) * 2 * this.options.stepSize, l = e * (t[i] - o);
      o += s + l, o = Math.max(this.options.bounds[0], Math.min(this.options.bounds[1], o)), r.push(o);
    }
    return r;
  }
  /**
   * Analyze walk properties
   */
  analyze() {
    if (this.history.length < 2)
      return {
        meanDisplacement: 0,
        meanSquaredDisplacement: 0,
        totalDistance: 0,
        fractalDimension: 0
      };
    const t = this.getProjection(0), e = t[0], n = t[t.length - 1], r = Math.abs(n - e), o = t.map((a) => Math.pow(a - e, 2)), i = o.reduce((a, d) => a + d, 0) / o.length;
    let s = 0;
    for (let a = 1; a < t.length; a++)
      s += Math.abs(t[a] - t[a - 1]);
    const l = s > 0 ? Math.log(s) / Math.log(t.length) : 0;
    return {
      meanDisplacement: r,
      meanSquaredDisplacement: i,
      totalDistance: s,
      fractalDimension: l
    };
  }
  /**
   * Get current walker states
   */
  getWalkerStates() {
    return this.walkers.map((t) => ({ ...t }));
  }
  /**
   * Reset the walk generator
   */
  reset() {
    this.walkers = [], this.history = [];
  }
  /**
   * Convert walk to JMON notes
   * @param {Array} durations - Duration sequence
   * @param {Object} options - Conversion options
   * @returns {Array} JMON note objects
   */
  toJmonNotes(t = [1], e = {}) {
    const {
      useStringTime: n = !1,
      timingConfig: r = wt,
      dimension: o = 0,
      mapToScale: i = null,
      scaleRange: s = [60, 72]
    } = e, l = this.getProjection(o), a = [];
    let d = 0;
    for (let u = 0; u < l.length; u++) {
      const m = t[u % t.length];
      let p = l[u];
      if (i) {
        const M = Math.min(...l), k = Math.max(...l) - M || 1, F = (p - M) / k, B = Math.floor(F * i.length), G = Math.max(0, Math.min(B, i.length - 1));
        p = i[G];
      } else
        p = this.mapToScale([l], i || [60, 62, 64, 65, 67, 69, 71])[0][u];
      a.push({
        pitch: p,
        duration: m,
        time: n ? Lt(d, r) : d
      }), d += m;
    }
    return a;
  }
  /**
   * Generate JMON track directly from walk
   * @param {Array} startPosition - Starting position
   * @param {Array} durations - Duration sequence
   * @param {Object} options - Generation and conversion options
   * @param {Object} trackOptions - Track options
   * @returns {Object} JMON track
   */
  generateTrack(t, e = [1], n = {}, r = {}) {
    this.generate(t);
    const o = this.toJmonNotes(e, n);
    return Ot(o, {
      label: "random-walk",
      midiChannel: 0,
      synth: { type: "Synth" },
      ...r
    });
  }
}
class On {
  walkRange;
  walkStart;
  walkProbability;
  roundTo;
  branchingProbability;
  mergingProbability;
  timingConfig;
  constructor(t = {}) {
    this.walkRange = t.walkRange || null, this.walkStart = t.walkStart !== void 0 ? t.walkStart : this.walkRange ? Math.floor((this.walkRange[1] - this.walkRange[0]) / 2) + this.walkRange[0] : 0, this.walkProbability = t.walkProbability || [-1, 0, 1], this.roundTo = t.roundTo !== void 0 ? t.roundTo : null, this.branchingProbability = t.branchingProbability || 0, this.mergingProbability = t.mergingProbability || 0, this.timingConfig = t.timingConfig || wt;
  }
  /**
   * Generate random walk sequence(s) with branching and merging
   * @param {number} length - Length of the walk
   * @param {number} seed - Random seed for reproducibility
   * @returns {Array<Array>} Array of walk sequences (branches)
   */
  generate(t, e) {
    let n = Math.random;
    e !== void 0 && (n = this.createSeededRandom(e));
    const r = [this.initializeWalk(t)];
    let o = [this.walkStart];
    for (let i = 1; i < t; i++) {
      const s = [...o], l = [];
      for (let a = 0; a < o.length; a++) {
        const d = r[a], u = o[a];
        if (u === null) {
          d && (d[i] = null);
          continue;
        }
        const m = this.generateStep(n);
        let p = u + m;
        if (isNaN(p) && (p = u), this.walkRange !== null && (p < this.walkRange[0] ? p = this.walkRange[0] : p > this.walkRange[1] && (p = this.walkRange[1])), isNaN(p) && (p = this.walkStart), d && (d[i] = p), s[a] = p, n() < this.branchingProbability) {
          const M = this.createBranch(r[a], i), f = this.generateStep(n);
          let k = u + f;
          isNaN(k) && (k = u), this.walkRange !== null && (k < this.walkRange[0] ? k = this.walkRange[0] : k > this.walkRange[1] && (k = this.walkRange[1])), isNaN(k) && (k = this.walkStart), M[i] = k, l.push(M), s.push(k);
        }
      }
      r.push(...l), o = s, o = this.handleMerging(r, o, i, n);
    }
    return r;
  }
  /**
   * Generate a single step according to the probability distribution
   */
  generateStep(t = Math.random) {
    if (Array.isArray(this.walkProbability))
      return this.walkProbability[Math.floor(t() * this.walkProbability.length)];
    if (typeof this.walkProbability == "object" && this.walkProbability.mean !== void 0 && this.walkProbability.std !== void 0) {
      let e = this.generateNormal(this.walkProbability.mean, this.walkProbability.std, t);
      return this.roundTo !== null && (e = parseFloat(e.toFixed(this.roundTo))), e;
    }
    return [-1, 0, 1][Math.floor(t() * 3)];
  }
  /**
   * Generate a sample from normal distribution
   */
  generateNormal(t, e, n = Math.random) {
    let r, o;
    do
      r = n();
    while (r === 0);
    o = n();
    const i = Math.sqrt(-2 * Math.log(r)) * Math.cos(2 * Math.PI * o), s = t + e * i;
    return isNaN(s) ? t : s;
  }
  /**
   * Initialize a new walk with null values
   */
  initializeWalk(t) {
    const e = new Array(t);
    e[0] = this.walkStart;
    for (let n = 1; n < t; n++)
      e[n] = null;
    return e;
  }
  /**
   * Create a branch from an existing walk
   */
  createBranch(t, e) {
    const n = new Array(t.length);
    for (let r = 0; r < e; r++)
      n[r] = null;
    for (let r = e; r < n.length; r++)
      n[r] = null;
    return n;
  }
  /**
   * Handle merging of walks that collide
   */
  handleMerging(t, e, n, r = Math.random) {
    const o = [...e];
    for (let i = 0; i < e.length; i++)
      if (e[i] !== null)
        for (let s = i + 1; s < e.length; s++) {
          if (e[s] === null) continue;
          const l = this.roundTo !== null ? this.roundTo : 1e-3;
          if (Math.abs(e[i] - e[s]) <= l && r() < this.mergingProbability && (o[s] = null, t[s]))
            for (let a = n; a < t[s].length; a++)
              t[s][a] = null;
        }
    return o;
  }
  /**
   * Convert walk sequences to JMON notes
   * @param {Array<Array>} walks - Walk sequences
   * @param {Array} durations - Duration sequence to map to
   * @param {Object} options - Conversion options
   * @returns {Array} JMON note objects
   */
  toJmonNotes(t, e = [1], n = {}) {
    const r = n.useStringTime || !1, o = [];
    let i = 0, s = 0;
    const l = Math.max(...t.map((a) => a.length));
    for (let a = 0; a < l; a++) {
      const d = t.map((u) => u[a]).filter((u) => u !== null);
      if (d.length > 0) {
        const u = e[s % e.length], m = d.length === 1 ? d[0] : d;
        o.push({
          pitch: m,
          duration: u,
          time: r ? Lt(i, this.timingConfig) : i
        }), i += u, s++;
      }
    }
    return o;
  }
  /**
   * Generate a JMON track directly from walk
   * @param {number} length - Walk length
   * @param {Array} durations - Duration sequence
   * @param {Object} trackOptions - Track options
   * @returns {Object} JMON track
   */
  generateTrack(t, e = [1], n = {}) {
    const r = this.generate(t, n.seed), o = this.toJmonNotes(r, e, n);
    return Ot(o, {
      label: "random-walk",
      midiChannel: 0,
      synth: { type: "Synth" },
      ...n
    });
  }
  /**
   * Map walk values to a musical scale
   * @param {Array<Array>} walks - Walk sequences  
   * @param {Array} scale - Scale to map to
   * @returns {Array<Array>} Walks mapped to scale
   */
  mapToScale(t, e = [60, 62, 64, 65, 67, 69, 71]) {
    return t.map((n) => n.map((r) => {
      if (r === null) return null;
      const o = this.walkRange[0], s = this.walkRange[1] - o, l = (r - o) / s, a = Math.floor(l * e.length), d = Math.max(0, Math.min(a, e.length - 1));
      return e[d];
    }));
  }
  /**
   * Create a seeded random number generator
   */
  createSeededRandom(t) {
    let e = Math.abs(t) || 1;
    return function() {
      e = (e * 9301 + 49297) % 233280;
      const n = e / 233280;
      return Math.max(1e-7, Math.min(0.9999999, n));
    };
  }
}
class It {
  distance;
  frequency;
  phase;
  subPhasors;
  center;
  constructor(t = 1, e = 1, n = 0, r = []) {
    this.distance = t, this.frequency = e, this.phase = n, this.subPhasors = r || [], this.center = { x: 0, y: 0 };
  }
  /**
   * Add a sub-phasor to this phasor (like epicycles)
   */
  addSubPhasor(t) {
    this.subPhasors.push(t);
  }
  /**
   * Calculate position at given time
   */
  getPosition(t) {
    const e = this.frequency * t + this.phase, n = this.center.x + this.distance * Math.cos(e), r = this.center.y + this.distance * Math.sin(e);
    return { x: n, y: r, angle: e, distance: this.distance };
  }
  /**
   * Calculate distance from origin
   */
  getDistanceFromOrigin(t) {
    const e = this.getPosition(t);
    return Math.sqrt(e.x * e.x + e.y * e.y);
  }
  /**
   * Calculate angle from origin in degrees
   */
  getAngleFromOrigin(t) {
    const e = this.getPosition(t);
    let n = Math.atan2(e.y, e.x) * 180 / Math.PI;
    return n < 0 && (n += 360), n;
  }
  /**
   * Simulate this phasor and all its sub-phasors
   */
  simulate(t, e = { x: 0, y: 0 }) {
    this.center = e;
    const n = [];
    for (const r of t) {
      const o = this.getPosition(r), i = this.getDistanceFromOrigin(r), s = this.getAngleFromOrigin(r);
      n.push({
        time: r,
        position: o,
        distance: i,
        angle: s,
        phasor: this
      });
      for (const l of this.subPhasors) {
        l.center = o;
        const a = l.simulate([r], o);
        n.push(...a);
      }
    }
    return n;
  }
}
class ue {
  phasors;
  timingConfig;
  constructor(t = wt) {
    this.phasors = [], this.timingConfig = t;
  }
  /**
   * Add a phasor to the system
   */
  addPhasor(t) {
    this.phasors.push(t);
  }
  /**
   * Simulate all phasors and sub-phasors in the system
   */
  simulate(t) {
    const e = [];
    for (const n of this.phasors) {
      const r = n.simulate(t);
      e.push(r);
    }
    return e;
  }
  /**
   * Get a flattened list of all phasors (primary + sub-phasors)
   */
  getAllPhasors() {
    const t = [];
    for (const e of this.phasors)
      t.push(e), this.collectSubPhasors(e, t);
    return t;
  }
  /**
   * Recursively collect all sub-phasors
   */
  collectSubPhasors(t, e) {
    for (const n of t.subPhasors)
      e.push(n), this.collectSubPhasors(n, e);
  }
  /**
   * Map phasor motion to musical parameters
   */
  mapToMusic(t, e = {}) {
    const n = this.simulate(t), r = [];
    for (let o = 0; o < n.length; o++) {
      const i = n[o], s = this.createMusicalTrack(i, o, e);
      r.push(s);
    }
    return r;
  }
  /**
   * Create a musical track from phasor motion
   */
  createMusicalTrack(t, e, n = {}) {
    const {
      pitchRange: r = [40, 80],
      durationRange: o = [0.25, 2],
      useDistance: i = !0,
      useAngle: s = !1,
      quantizeToScale: l = null,
      timingConfig: a = this.timingConfig,
      useStringTime: d = !1
    } = n, u = [];
    for (const m of t) {
      let p, M;
      if (i) {
        const f = Math.max(0, Math.min(1, m.distance / 10));
        p = r[0] + f * (r[1] - r[0]);
      } else
        p = r[0] + m.angle / 360 * (r[1] - r[0]);
      if (s)
        M = o[0] + m.angle / 360 * (o[1] - o[0]);
      else {
        const f = Math.max(0, Math.min(1, m.distance / 10));
        M = o[1] - f * (o[1] - o[0]);
      }
      if (l) {
        const f = Math.floor((p - r[0]) / (r[1] - r[0]) * l.length), k = Math.max(0, Math.min(f, l.length - 1));
        p = l[k];
      } else
        p = Math.round(p);
      u.push({
        pitch: p,
        duration: M,
        time: d ? Lt(m.time, a) : m.time,
        phasorData: {
          distance: m.distance,
          angle: m.angle,
          position: m.position
        }
      });
    }
    return u;
  }
  /**
   * Generate JMON tracks directly from phasor motion
   */
  generateTracks(t, e = {}, n = {}) {
    const r = this.mapToMusic(t, e), o = [];
    return r.forEach((i, s) => {
      const l = Ot(i, {
        label: `phasor-${s + 1}`,
        midiChannel: s % 16,
        synth: { type: "Synth" },
        ...n
      });
      o.push(l);
    }), o;
  }
  /**
   * Create complex harmonic patterns with sub-phasors (epicycles)
   */
  static createComplexSystem() {
    const t = new ue(), e = new It(0.2, 5, 0), n = new It(0.3, 3, Math.PI / 2), r = new It(0.1, 8, Math.PI);
    e.addSubPhasor(r);
    const o = new It(2, 1, 0, [e, n]), i = new It(3.5, 0.6, Math.PI / 3);
    return t.addPhasor(o), t.addPhasor(i), t;
  }
  /**
   * Generate time array with linear spacing
   */
  static generateTimeArray(t = 0, e = 10, n = 100) {
    const r = [], o = (e - t) / (n - 1);
    for (let i = 0; i < n; i++)
      r.push(t + i * o);
    return r;
  }
}
class Bn {
  /**
   * @param {MandelbrotOptions} [options={}] - Configuration options
   */
  constructor(t = {}) {
    this.width = t.width || 100, this.height = t.height || 100, this.maxIterations = t.maxIterations || 100, this.xMin = t.xMin || -2.5, this.xMax = t.xMax || 1.5, this.yMin = t.yMin || -2, this.yMax = t.yMax || 2;
  }
  /**
   * Generate Mandelbrot set data
   * @returns {number[][]} 2D array of iteration counts
   */
  generate() {
    const t = [];
    for (let e = 0; e < this.height; e++) {
      const n = [];
      for (let r = 0; r < this.width; r++) {
        const o = this.xMin + r / this.width * (this.xMax - this.xMin), i = this.yMin + e / this.height * (this.yMax - this.yMin), s = this.mandelbrotIterations({ real: o, imaginary: i });
        n.push(s);
      }
      t.push(n);
    }
    return t;
  }
  /**
   * Extract sequence from Mandelbrot data using various methods
   * @param {'diagonal'|'border'|'spiral'|'column'|'row'} [method='diagonal'] - Extraction method
   * @param {number} [index=0] - Index for column/row extraction
   * @returns {number[]} Extracted sequence
   */
  extractSequence(t = "diagonal", e = 0) {
    const n = this.generate();
    switch (t) {
      case "diagonal":
        return this.extractDiagonal(n);
      case "border":
        return this.extractBorder(n);
      case "spiral":
        return this.extractSpiral(n);
      case "column":
        return this.extractColumn(n, e);
      case "row":
        return this.extractRow(n, e);
      default:
        return this.extractDiagonal(n);
    }
  }
  /**
   * Calculate Mandelbrot iterations for a complex point
   * @param {ComplexPoint} c - Complex point to test
   * @returns {number} Number of iterations before escape
   */
  mandelbrotIterations(t) {
    let e = { real: 0, imaginary: 0 };
    for (let n = 0; n < this.maxIterations; n++) {
      const r = e.real * e.real - e.imaginary * e.imaginary + t.real, o = 2 * e.real * e.imaginary + t.imaginary;
      if (e.real = r, e.imaginary = o, e.real * e.real + e.imaginary * e.imaginary > 4)
        return n;
    }
    return this.maxIterations;
  }
  /**
   * Extract diagonal sequence
   * @param {number[][]} data - 2D fractal data
   * @returns {number[]} Diagonal sequence
   */
  extractDiagonal(t) {
    const e = [], n = Math.min(t.length, t[0]?.length || 0);
    for (let r = 0; r < n; r++)
      e.push(t[r][r]);
    return e;
  }
  /**
   * Extract border sequence (clockwise)
   * @param {number[][]} data - 2D fractal data
   * @returns {number[]} Border sequence
   */
  extractBorder(t) {
    const e = [], n = t.length, r = t[0]?.length || 0;
    if (n === 0 || r === 0) return e;
    for (let o = 0; o < r; o++)
      e.push(t[0][o]);
    for (let o = 1; o < n; o++)
      e.push(t[o][r - 1]);
    if (n > 1)
      for (let o = r - 2; o >= 0; o--)
        e.push(t[n - 1][o]);
    if (r > 1)
      for (let o = n - 2; o > 0; o--)
        e.push(t[o][0]);
    return e;
  }
  /**
   * Extract spiral sequence (from outside to inside)
   * @param {number[][]} data - 2D fractal data
   * @returns {number[]} Spiral sequence
   */
  extractSpiral(t) {
    const e = [], n = t.length, r = t[0]?.length || 0;
    if (n === 0 || r === 0) return e;
    let o = 0, i = n - 1, s = 0, l = r - 1;
    for (; o <= i && s <= l; ) {
      for (let a = s; a <= l; a++)
        e.push(t[o][a]);
      o++;
      for (let a = o; a <= i; a++)
        e.push(t[a][l]);
      if (l--, o <= i) {
        for (let a = l; a >= s; a--)
          e.push(t[i][a]);
        i--;
      }
      if (s <= l) {
        for (let a = i; a >= o; a--)
          e.push(t[a][s]);
        s++;
      }
    }
    return e;
  }
  /**
   * Extract specific column
   * @param {number[][]} data - 2D fractal data
   * @param {number} columnIndex - Column index to extract
   * @returns {number[]} Column sequence
   */
  extractColumn(t, e) {
    const n = [], r = t[0]?.length || 0, o = Math.max(0, Math.min(e, r - 1));
    for (const i of t)
      i[o] !== void 0 && n.push(i[o]);
    return n;
  }
  /**
   * Extract specific row
   * @param {number[][]} data - 2D fractal data
   * @param {number} rowIndex - Row index to extract
   * @returns {number[]} Row sequence
   */
  extractRow(t, e) {
    const n = Math.max(0, Math.min(e, t.length - 1));
    return t[n] ? [...t[n]] : [];
  }
  /**
   * Map fractal values to musical scale
   * @param {number[]} sequence - Fractal sequence
   * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Musical scale intervals
   * @param {number} [octaveRange=3] - Number of octaves to span
   * @returns {number[]} MIDI note sequence
   */
  mapToScale(t, e = [0, 2, 4, 5, 7, 9, 11], n = 3) {
    if (t.length === 0) return [];
    const r = Math.min(...t), i = Math.max(...t) - r || 1;
    return t.map((s) => {
      const l = (s - r) / i, a = Math.floor(l * e.length * n), d = Math.floor(a / e.length), u = a % e.length;
      return 60 + d * 12 + e[u];
    });
  }
  /**
   * Generate rhythmic pattern from fractal data
   * @param {number[]} sequence - Fractal sequence
   * @param {number[]} [subdivisions=[1, 2, 4, 8, 16]] - Rhythmic subdivisions
   * @returns {number[]} Rhythmic durations
   */
  mapToRhythm(t, e = [1, 2, 4, 8, 16]) {
    if (t.length === 0) return [];
    const n = Math.min(...t), o = Math.max(...t) - n || 1;
    return t.map((i) => {
      const s = (i - n) / o, l = Math.floor(s * e.length), a = Math.max(0, Math.min(l, e.length - 1));
      return 1 / e[a];
    });
  }
}
class Gn {
  /**
   * @param {LogisticMapOptions} [options={}] - Configuration options
   */
  constructor(t = {}) {
    this.r = t.r || 3.8, this.x0 = t.x0 || 0.5, this.iterations = t.iterations || 1e3, this.skipTransient = t.skipTransient || 100;
  }
  /**
   * Generate logistic map sequence
   * @returns {number[]} Generated sequence
   */
  generate() {
    const t = [];
    let e = this.x0;
    for (let n = 0; n < this.iterations + this.skipTransient; n++)
      e = this.r * e * (1 - e), n >= this.skipTransient && t.push(e);
    return t;
  }
  /**
   * Generate bifurcation data for different r values
   * @param {number} [rMin=2.5] - Minimum r value
   * @param {number} [rMax=4.0] - Maximum r value
   * @param {number} [rSteps=1000] - Number of r steps
   * @returns {Object} Bifurcation data with r and x arrays
   */
  bifurcationDiagram(t = 2.5, e = 4, n = 1e3) {
    const r = [], o = [], i = (e - t) / n;
    for (let s = 0; s < n; s++) {
      const l = t + s * i, a = this.r;
      this.r = l;
      const d = this.generate();
      this.r = a;
      const u = d.slice(-50);
      for (const m of u)
        r.push(l), o.push(m);
    }
    return { r, x: o };
  }
  /**
   * Map chaotic values to musical scale
   * @param {number[]} sequence - Chaotic sequence
   * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Musical scale intervals
   * @param {number} [octaveRange=3] - Number of octaves to span
   * @returns {number[]} MIDI note sequence
   */
  mapToScale(t, e = [0, 2, 4, 5, 7, 9, 11], n = 3) {
    return t.length === 0 ? [] : t.map((r) => {
      const o = Math.floor(r * e.length * n), i = Math.floor(o / e.length), s = o % e.length;
      return 60 + i * 12 + e[s];
    });
  }
  /**
   * Map to rhythmic durations
   * @param {number[]} sequence - Chaotic sequence
   * @param {number[]} [durations=[0.25, 0.5, 1, 2]] - Duration values
   * @returns {number[]} Rhythm sequence
   */
  mapToRhythm(t, e = [0.25, 0.5, 1, 2]) {
    return t.length === 0 ? [] : t.map((n) => {
      const r = Math.floor(n * e.length), o = Math.max(0, Math.min(r, e.length - 1));
      return e[o];
    });
  }
  /**
   * Map to velocities
   * @param {number[]} sequence - Chaotic sequence
   * @param {number} [minVel=0.3] - Minimum velocity
   * @param {number} [maxVel=1.0] - Maximum velocity
   * @returns {number[]} Velocity sequence
   */
  mapToVelocity(t, e = 0.3, n = 1) {
    if (t.length === 0) return [];
    const r = n - e;
    return t.map((o) => e + o * r);
  }
  /**
   * Detect periodic cycles in the sequence
   * @param {number[]} sequence - Sequence to analyze
   * @param {number} [tolerance=0.01] - Tolerance for cycle detection
   * @returns {number[]} Detected cycle periods
   */
  detectCycles(t, e = 0.01) {
    const n = [];
    for (let r = 1; r <= Math.floor(t.length / 2); r++) {
      let o = !0;
      for (let i = r; i < Math.min(t.length, r * 3); i++)
        if (Math.abs(t[i] - t[i - r]) > e) {
          o = !1;
          break;
        }
      o && n.push(r);
    }
    return n;
  }
  /**
   * Calculate Lyapunov exponent (measure of chaos)
   * @param {number} [iterations=10000] - Number of iterations for calculation
   * @returns {number} Lyapunov exponent
   */
  lyapunovExponent(t = 1e4) {
    let e = this.x0, n = 0;
    for (let r = 0; r < t; r++) {
      const o = this.r * (1 - 2 * e);
      n += Math.log(Math.abs(o)), e = this.r * e * (1 - e);
    }
    return n / t;
  }
  /**
   * Generate multiple correlated sequences
   * @param {number} [numSequences=2] - Number of sequences to generate
   * @param {number} [coupling=0.1] - Coupling strength between sequences
   * @returns {number[][]} Array of coupled sequences
   */
  generateCoupled(t = 2, e = 0.1) {
    const n = Array(t).fill(null).map(() => []), r = Array(t).fill(this.x0);
    for (let o = 0; o < this.iterations + this.skipTransient; o++) {
      const i = [...r];
      for (let s = 0; s < t; s++) {
        let l = 0;
        for (let a = 0; a < t; a++)
          a !== s && (l += e * (r[a] - r[s]));
        i[s] = this.r * r[s] * (1 - r[s]) + l, i[s] = Math.max(0, Math.min(1, i[s]));
      }
      if (r.splice(0, t, ...i), o >= this.skipTransient)
        for (let s = 0; s < t; s++)
          n[s].push(r[s]);
    }
    return n;
  }
  /**
   * Apply different chaotic regimes
   * @param {'periodic'|'chaotic'|'edge'|'custom'} regime - Regime type
   * @param {number} [customR] - Custom r value for 'custom' regime
   */
  setRegime(t, e) {
    switch (t) {
      case "periodic":
        this.r = 3.2;
        break;
      case "chaotic":
        this.r = 3.9;
        break;
      case "edge":
        this.r = 3.57;
        break;
      case "custom":
        e !== void 0 && (this.r = Math.max(0, Math.min(4, e)));
        break;
    }
  }
  /**
   * Get current parameters
   * @returns {LogisticMapOptions} Current configuration
   */
  getParameters() {
    return {
      r: this.r,
      x0: this.x0,
      iterations: this.iterations,
      skipTransient: this.skipTransient
    };
  }
}
class Dn {
  operation;
  direction;
  repetition;
  timingConfig;
  sequence = [];
  constructor(t) {
    const { operation: e, direction: n, repetition: r, timingConfig: o = wt } = t;
    if (!["additive", "subtractive"].includes(e))
      throw new Error("Invalid operation. Choose 'additive' or 'subtractive'.");
    if (!["forward", "backward", "inward", "outward"].includes(n))
      throw new Error("Invalid direction. Choose 'forward', 'backward', 'inward' or 'outward'.");
    if (r < 0 || !Number.isInteger(r))
      throw new Error("Invalid repetition value. Must be an integer greater than or equal to 0.");
    this.operation = e, this.direction = n, this.repetition = r, this.timingConfig = o;
  }
  /**
   * Generate processed sequence based on operation and direction
   * Accepts either:
   * - JMON note objects: { pitch, duration, time }
   * - Legacy objects: { pitch, duration, offset }
   * - Legacy tuples: [pitch, duration, offset]
   * Returns: JMON note objects with numeric time (quarter notes)
   */
  generate(t) {
    this.sequence = this.normalizeInput(t);
    let e;
    if (this.operation === "additive" && this.direction === "forward")
      e = this.additiveForward();
    else if (this.operation === "additive" && this.direction === "backward")
      e = this.additiveBackward();
    else if (this.operation === "additive" && this.direction === "inward")
      e = this.additiveInward();
    else if (this.operation === "additive" && this.direction === "outward")
      e = this.additiveOutward();
    else if (this.operation === "subtractive" && this.direction === "forward")
      e = this.subtractiveForward();
    else if (this.operation === "subtractive" && this.direction === "backward")
      e = this.subtractiveBackward();
    else if (this.operation === "subtractive" && this.direction === "inward")
      e = this.subtractiveInward();
    else if (this.operation === "subtractive" && this.direction === "outward")
      e = this.subtractiveOutward();
    else
      throw new Error("Invalid operation/direction combination");
    const n = this.adjustOffsets(e);
    return this.toJmonNotes(n, !1);
  }
  additiveForward() {
    const t = [];
    for (let e = 0; e < this.sequence.length; e++) {
      const n = this.sequence.slice(0, e + 1);
      for (let r = 0; r <= this.repetition; r++)
        t.push(...n);
    }
    return t;
  }
  additiveBackward() {
    const t = [];
    for (let e = this.sequence.length; e > 0; e--) {
      const n = this.sequence.slice(e - 1);
      for (let r = 0; r <= this.repetition; r++)
        t.push(...n);
    }
    return t;
  }
  additiveInward() {
    const t = [], e = this.sequence.length;
    for (let n = 0; n < Math.ceil(e / 2); n++) {
      let r;
      if (n < e - n - 1) {
        const o = this.sequence.slice(0, n + 1), i = this.sequence.slice(e - n - 1);
        r = [...o, ...i];
      } else
        r = [...this.sequence];
      for (let o = 0; o <= this.repetition; o++)
        t.push(...r);
    }
    return t;
  }
  additiveOutward() {
    const t = [], e = this.sequence.length;
    if (e % 2 === 0) {
      const n = Math.floor(e / 2) - 1, r = Math.floor(e / 2);
      for (let o = 0; o < e / 2; o++) {
        const i = this.sequence.slice(n - o, r + o + 1);
        for (let s = 0; s <= this.repetition; s++)
          t.push(...i);
      }
    } else {
      const n = Math.floor(e / 2);
      for (let r = 0; r <= n; r++) {
        const o = this.sequence.slice(n - r, n + r + 1);
        for (let i = 0; i <= this.repetition; i++)
          t.push(...o);
      }
    }
    return t;
  }
  subtractiveForward() {
    const t = [];
    for (let e = 0; e < this.sequence.length; e++) {
      const n = this.sequence.slice(e);
      for (let r = 0; r <= this.repetition; r++)
        t.push(...n);
    }
    return t;
  }
  subtractiveBackward() {
    const t = [];
    for (let e = this.sequence.length; e > 0; e--) {
      const n = this.sequence.slice(0, e);
      for (let r = 0; r <= this.repetition; r++)
        t.push(...n);
    }
    return t;
  }
  subtractiveInward() {
    const t = [], e = this.sequence.length, n = Math.floor(e / 2);
    for (let r = 0; r <= this.repetition; r++)
      t.push(...this.sequence);
    for (let r = 1; r <= n; r++) {
      const o = this.sequence.slice(r, e - r);
      if (o.length > 0)
        for (let i = 0; i <= this.repetition; i++)
          t.push(...o);
    }
    return t;
  }
  subtractiveOutward() {
    const t = [];
    let e = [...this.sequence];
    for (let n = 0; n <= this.repetition; n++)
      t.push(...e);
    for (; e.length > 2; ) {
      e = e.slice(1, -1);
      for (let n = 0; n <= this.repetition; n++)
        t.push(...e);
    }
    return t;
  }
  // Normalize heterogenous inputs into objects with pitch, duration, offset (beats)
  normalizeInput(t) {
    return Array.isArray(t) ? Array.isArray(t[0]) ? t.map(([e, n, r = 0]) => ({ pitch: e, duration: n, offset: r })) : t.map((e) => {
      const n = e.pitch, r = e.duration;
      let o = 0;
      return typeof e.offset == "number" ? o = e.offset : typeof e.time == "number" ? o = e.time : typeof e.time == "string" && (o = this.timeToBeats(e.time)), { ...e, pitch: n, duration: r, offset: o };
    }) : [];
  }
  // Convert beats to bars:beats:ticks using centralized utility
  beatsToTime(t) {
    return Lt(t, this.timingConfig);
  }
  // Convert bars:beats:ticks to beats using centralized utility
  timeToBeats(t) {
    return typeof t != "string" ? Number(t) || 0 : le(t, this.timingConfig);
  }
  // After process, recalc offsets sequentially in beats
  adjustOffsets(t) {
    let e = 0;
    return t.map((n) => {
      const r = {
        ...n,
        offset: e
      };
      return e += n.duration, r;
    });
  }
  // Produce JMON notes: { pitch, duration, time }
  // Always use numeric time in quarter notes (like pitch: 60, time: 4.5)
  toJmonNotes(t, e = !1) {
    return t.map(({ pitch: n, duration: r, offset: o, ...i }) => {
      const { time: s, ...l } = i;
      return {
        pitch: n,
        duration: r,
        time: e ? this.beatsToTime(o) : o,
        ...l
      };
    });
  }
  /**
   * Generate and convert to JMON track format
   * @param {Array} sequence - Input sequence
   * @param {Object} trackOptions - Track configuration options
   * @param {boolean} trackOptions.useStringTime - Use bars:beats:ticks strings for display (default: numeric)
   * @returns {Object} JMON track object
   */
  generateTrack(t, e = {}) {
    const n = this.generate(t);
    return Ot(n, {
      timingConfig: this.timingConfig,
      ...e
    });
  }
}
class zn {
  tChord;
  direction;
  rank;
  isAlternate;
  currentDirection;
  timingConfig;
  constructor(t, e = "down", n = 0, r = wt) {
    if (!["up", "down", "any", "alternate"].includes(e))
      throw new Error("Invalid direction. Choose 'up', 'down', 'any' or 'alternate'.");
    if (this.tChord = t, this.isAlternate = e === "alternate", this.currentDirection = this.isAlternate ? "up" : e, this.direction = e, this.timingConfig = r, !Number.isInteger(n) || n < 0)
      throw new Error("Rank must be a non-negative integer.");
    this.rank = Math.min(n, t.length - 1), this.rank >= t.length && console.warn("Rank exceeds the length of the t-chord. Using last note of the t-chord.");
  }
  /**
   * Generate t-voice from m-voice sequence
   * Accepts: JMON notes, legacy objects, or tuples
   * Returns: JMON notes with numeric time (quarter notes)
   * @param {Array} sequence - Input sequence
   * @param {boolean} useStringTime - Whether to use bars:beats:ticks strings for display (default: false)
   */
  generate(t, e = !1) {
    const n = this.normalizeInput(t), r = [];
    for (const o of n) {
      if (o.pitch === void 0) {
        const { offset: M, time: f, ...k } = o;
        r.push({
          ...k,
          pitch: void 0,
          time: e ? this.beatsToTime(M) : M
        });
        continue;
      }
      const i = o.pitch, l = this.tChord.map((M) => M - i).map((M, f) => ({ index: f, value: M })).sort((M, f) => Math.abs(M.value) - Math.abs(f.value));
      let a = this.rank, d;
      if (this.currentDirection === "up" || this.currentDirection === "down") {
        const M = l.filter(
          ({ value: f }) => this.currentDirection === "up" ? f >= 0 : f <= 0
        );
        if (M.length === 0)
          d = this.currentDirection === "up" ? Math.max(...this.tChord) : Math.min(...this.tChord);
        else {
          a >= M.length && (a = M.length - 1);
          const f = M[a].index;
          d = this.tChord[f];
        }
      } else {
        a >= l.length && (a = l.length - 1);
        const M = l[a].index;
        d = this.tChord[M];
      }
      this.isAlternate && (this.currentDirection = this.currentDirection === "up" ? "down" : "up");
      const { offset: u, time: m, ...p } = o;
      r.push({
        ...p,
        pitch: d,
        time: e ? this.beatsToTime(u) : u
      });
    }
    return r;
  }
  // Normalize input like MinimalismProcess
  normalizeInput(t) {
    return Array.isArray(t) ? Array.isArray(t[0]) ? t.map(([e, n, r = 0]) => ({ pitch: e, duration: n, offset: r })) : t.map((e) => {
      const n = e.pitch, r = e.duration;
      let o = 0;
      return typeof e.offset == "number" ? o = e.offset : typeof e.time == "number" ? o = e.time : typeof e.time == "string" && (o = this.timeToBeats(e.time)), { ...e, pitch: n, duration: r, offset: o };
    }) : [];
  }
  // Convert beats to bars:beats:ticks using centralized utility
  beatsToTime(t) {
    return Lt(t, this.timingConfig);
  }
  // Convert bars:beats:ticks to beats using centralized utility
  timeToBeats(t) {
    return typeof t != "string" ? Number(t) || 0 : le(t, this.timingConfig);
  }
}
class qn {
  /**
   * Calculate Gini coefficient for inequality measurement
   * @param {number[]} values - Values to analyze
   * @param {number[]} [weights] - Optional weights
   * @returns {number} Gini coefficient (0-1)
   */
  static gini(t, e) {
    if (t.length === 0) return 0;
    const n = t.length, r = e || Array(n).fill(1), o = t.map((u, m) => ({ value: u, weight: r[m] })).sort((u, m) => u.value - m.value), i = o.map((u) => u.value), s = o.map((u) => u.weight), l = s.reduce((u, m) => u + m, 0);
    let a = 0, d = 0;
    for (let u = 0; u < n; u++) {
      const m = s.slice(0, u + 1).reduce(
        (p, M) => p + M,
        0
      );
      a += s[u] * (2 * m - s[u] - l) * i[u], d += s[u] * i[u] * l;
    }
    return d === 0 ? 0 : a / d;
  }
  /**
   * Calculate center of mass (balance point) of a sequence
   * @param {number[]} values - Values to analyze
   * @param {number[]} [weights] - Optional weights
   * @returns {number} Balance point
   */
  static balance(t, e) {
    if (t.length === 0) return 0;
    const n = e || Array(t.length).fill(1), r = t.reduce((i, s, l) => i + s * n[l], 0), o = n.reduce((i, s) => i + s, 0);
    return o === 0 ? 0 : r / o;
  }
  /**
   * Calculate autocorrelation for pattern detection
   * @param {number[]} values - Values to analyze
   * @param {number} [maxLag] - Maximum lag to calculate
   * @returns {number[]} Autocorrelation array
   */
  static autocorrelation(t, e) {
    const n = t.length, r = e || Math.floor(n / 2), o = [], i = t.reduce((l, a) => l + a, 0) / n, s = t.reduce((l, a) => l + Math.pow(a - i, 2), 0) / n;
    for (let l = 0; l <= r; l++) {
      let a = 0;
      for (let d = 0; d < n - l; d++)
        a += (t[d] - i) * (t[d + l] - i);
      a /= n - l, o.push(s === 0 ? 0 : a / s);
    }
    return o;
  }
  /**
   * Detect and score musical motifs
   * @param {number[]} values - Values to analyze
   * @param {number} [patternLength=3] - Length of patterns to detect
   * @returns {number} Motif score
   */
  static motif(t, e = 3) {
    if (t.length < e * 2) return 0;
    const n = /* @__PURE__ */ new Map();
    for (let i = 0; i <= t.length - e; i++) {
      const s = t.slice(i, i + e).join(",");
      n.set(s, (n.get(s) || 0) + 1);
    }
    const r = Math.max(...n.values()), o = n.size;
    return o === 0 ? 0 : r / o;
  }
  /**
   * Calculate dissonance/scale conformity
   * @param {number[]} pitches - MIDI pitch values
   * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Scale to check against
   * @returns {number} Dissonance score (0-1)
   */
  static dissonance(t, e = [0, 2, 4, 5, 7, 9, 11]) {
    if (t.length === 0) return 0;
    let n = 0;
    for (const r of t) {
      const o = (r % 12 + 12) % 12;
      e.includes(o) && n++;
    }
    return 1 - n / t.length;
  }
  /**
   * Calculate rhythmic fit to a grid
   * @param {number[]} onsets - Onset times
   * @param {number} [gridDivision=16] - Grid division
   * @returns {number} Rhythmic alignment score
   */
  static rhythmic(t, e = 16) {
    if (t.length === 0) return 0;
    let n = 0;
    const r = 0.1;
    for (const o of t) {
      const i = o * e, s = Math.round(i);
      Math.abs(i - s) <= r && n++;
    }
    return n / t.length;
  }
  /**
   * Calculate Fibonacci/golden ratio index
   * @param {number[]} values - Values to analyze
   * @returns {number} Fibonacci index
   */
  static fibonacciIndex(t) {
    if (t.length < 2) return 0;
    const e = (1 + Math.sqrt(5)) / 2;
    let n = 0;
    for (let r = 1; r < t.length; r++)
      if (t[r - 1] !== 0) {
        const o = t[r] / t[r - 1], i = Math.abs(o - e);
        n += 1 / (1 + i);
      }
    return n / (t.length - 1);
  }
  /**
   * Calculate syncopation (off-beat emphasis)
   * @param {number[]} onsets - Onset times
   * @param {number} [beatDivision=4] - Beat division
   * @returns {number} Syncopation score
   */
  static syncopation(t, e = 4) {
    if (t.length === 0) return 0;
    let n = 0;
    for (const r of t) {
      const o = r * e % 1;
      o > 0.2 && o < 0.8 && Math.abs(o - 0.5) > 0.2 && n++;
    }
    return n / t.length;
  }
  /**
   * Calculate contour entropy (melodic direction randomness)
   * @param {number[]} pitches - Pitch values
   * @returns {number} Contour entropy
   */
  static contourEntropy(t) {
    if (t.length < 2) return 0;
    const e = [];
    for (let i = 1; i < t.length; i++) {
      const s = t[i] - t[i - 1];
      s > 0 ? e.push(1) : s < 0 ? e.push(-1) : e.push(0);
    }
    const n = { up: 0, down: 0, same: 0 };
    for (const i of e)
      i > 0 ? n.up++ : i < 0 ? n.down++ : n.same++;
    const r = e.length;
    return -[
      n.up / r,
      n.down / r,
      n.same / r
    ].filter((i) => i > 0).reduce((i, s) => i + s * Math.log2(s), 0);
  }
  /**
   * Calculate interval variance (pitch stability)
   * @param {number[]} pitches - Pitch values
   * @returns {number} Interval variance
   */
  static intervalVariance(t) {
    if (t.length < 2) return 0;
    const e = [];
    for (let o = 1; o < t.length; o++)
      e.push(Math.abs(t[o] - t[o - 1]));
    const n = e.reduce((o, i) => o + i, 0) / e.length;
    return e.reduce(
      (o, i) => o + Math.pow(i - n, 2),
      0
    ) / e.length;
  }
  /**
   * Calculate note density (notes per unit time)
   * @param {JMonNote[]} notes - Array of notes
   * @param {number} [timeWindow=1] - Time window for density calculation
   * @returns {number} Note density
   */
  static density(t, e = 1) {
    if (t.length === 0) return 0;
    const n = t.map((s) => typeof s.time == "string" ? parseFloat(s.time) || 0 : s.time || 0), r = Math.min(...n), i = Math.max(...n) - r || 1;
    return t.length / (i / e);
  }
  /**
   * Calculate gap variance (timing consistency)
   * @param {number[]} onsets - Onset times
   * @returns {number} Gap variance
   */
  static gapVariance(t) {
    if (t.length < 2) return 0;
    const e = [];
    for (let o = 1; o < t.length; o++)
      e.push(t[o] - t[o - 1]);
    const n = e.reduce((o, i) => o + i, 0) / e.length;
    return e.reduce((o, i) => o + Math.pow(i - n, 2), 0) / e.length;
  }
  /**
   * Comprehensive analysis of a musical sequence
   * @param {JMonNote[]} notes - Array of notes to analyze
   * @param {AnalysisOptions} [options={}] - Analysis options
   * @returns {AnalysisResult} Analysis results
   */
  static analyze(t, e = {}) {
    const { scale: n = [0, 2, 4, 5, 7, 9, 11] } = e, r = t.map((i) => typeof i.note == "number" ? i.note : typeof i.note == "string" ? 60 : Array.isArray(i.note) ? i.note[0] : 60), o = t.map((i) => typeof i.time == "number" ? i.time : parseFloat(i.time) || 0);
    return {
      gini: this.gini(r),
      balance: this.balance(r),
      motif: this.motif(r),
      dissonance: this.dissonance(r, n),
      rhythmic: this.rhythmic(o),
      fibonacciIndex: this.fibonacciIndex(r),
      syncopation: this.syncopation(o),
      contourEntropy: this.contourEntropy(r),
      intervalVariance: this.intervalVariance(r),
      density: this.density(t),
      gapVariance: this.gapVariance(o)
    };
  }
}
const Yn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MusicalAnalysis: qn,
  MusicalIndex: Dt
}, Symbol.toStringTag, { value: "Module" }));
function Ut(c, t = {}) {
  const { timeSignature: e = "4/4", tempo: n = 120 } = t, r = Array.isArray(c?.notes) ? c.notes : [], o = [];
  for (let i = 0; i < r.length; i++) {
    const s = r[i];
    if (!s || typeof s != "object") continue;
    const l = s.pitch === null || s.pitch === void 0, a = St(s.time, 0), d = St(s.duration, 0), u = a + Math.max(0, d), m = Wn(s);
    if (m.length !== 0)
      for (const p of m) {
        const M = typeof p == "string" ? p : p.type;
        if (M)
          switch (M) {
            // Simple articulations: duration / velocity shaping
            case "staccato": {
              o.push({
                type: "durationScale",
                index: i,
                factor: 0.5,
                start: a,
                end: u
              });
              break;
            }
            case "tenuto": {
              o.push({
                type: "durationScale",
                index: i,
                factor: 1.1,
                start: a,
                end: u
              });
              break;
            }
            case "accent": {
              o.push({
                type: "velocityBoost",
                index: i,
                amountBoost: 0.2,
                start: a,
                end: a + Math.min(0.1, d)
                // short emphasis
              });
              break;
            }
            case "marcato": {
              o.push({
                type: "velocityBoost",
                index: i,
                amountBoost: 0.3,
                start: a,
                end: a + Math.min(0.15, d)
              }), o.push({
                type: "durationScale",
                index: i,
                factor: 0.9,
                start: a,
                end: u
              });
              break;
            }
            // Complex articulations: curves / continuous modulations
            case "glissando":
            case "portamento": {
              if (l) break;
              const f = Kn(s.pitch), k = typeof p.target == "number" ? p.target : void 0;
              if (typeof f != "number" || typeof k != "number") break;
              o.push({
                type: "pitch",
                subtype: M,
                index: i,
                from: f,
                to: k,
                start: a,
                end: u,
                curve: p.curve || "linear"
              });
              break;
            }
            case "bend": {
              const f = St(p.amount, void 0);
              if (f === void 0) break;
              o.push({
                type: "pitch",
                subtype: "bend",
                index: i,
                amount: f,
                start: a,
                end: u,
                curve: p.curve || "linear"
              });
              break;
            }
            case "vibrato": {
              o.push({
                type: "pitch",
                subtype: "vibrato",
                index: i,
                rate: St(p.rate, 5),
                depth: St(p.depth, 50),
                start: a,
                end: u
              });
              break;
            }
            case "tremolo": {
              o.push({
                type: "amplitude",
                subtype: "tremolo",
                index: i,
                rate: St(p.rate, 8),
                depth: Xt(p.depth ?? 0.3),
                start: a,
                end: u
              });
              break;
            }
            case "crescendo":
            case "diminuendo": {
              const f = Xt(s.velocity ?? 0.8), k = Xt(St(p.endVelocity, M === "crescendo" ? Math.min(1, f + 0.2) : Math.max(0, f - 0.2)));
              o.push({
                type: "amplitude",
                subtype: M,
                index: i,
                startVelocity: f,
                endVelocity: k,
                start: a,
                end: u,
                curve: p.curve || "linear"
              });
              break;
            }
          }
      }
  }
  return { notes: r, modulations: o };
}
function Un(c, t = {}) {
  const n = Hn(c?.tracks).map((o) => Ut(o, t)), r = c?.metadata ? { ...c.metadata } : void 0;
  return { tracks: n, ...r ? { metadata: r } : {} };
}
function Wn(c) {
  const t = [];
  if (Array.isArray(c?.articulations))
    for (const e of c.articulations)
      typeof e == "string" ? t.push({ type: e }) : e && typeof e == "object" && typeof e.type == "string" && t.push({ ...e });
  return t;
}
function Hn(c) {
  return Array.isArray(c) ? c.map((t, e) => Array.isArray(t?.notes) ? t : { name: `Track ${e + 1}`, notes: Array.isArray(t) ? t : t?.notes || [] }) : c && typeof c == "object" ? Object.entries(c).map(([t, e], n) => ({
    name: t || `Track ${n + 1}`,
    notes: Array.isArray(e?.notes) ? e.notes : Array.isArray(e) ? e : []
  })) : [];
}
function Kn(c) {
  if (c != null) {
    if (Array.isArray(c)) {
      const t = c.filter((e) => typeof e == "number");
      return t.length === 0 ? void 0 : Math.min(...t);
    }
    if (typeof c == "number") return c;
  }
}
function St(c, t) {
  const e = typeof c == "number" ? c : Number(c);
  return Number.isFinite(e) ? e : t;
}
function Xt(c) {
  const t = St(c, 0);
  return Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
}
function Le(c, t = {}) {
  return Ut(c, t);
}
function Jn(c, t = {}) {
  return Ut(c, t);
}
function Xn(c, t = {}) {
  return Ut(c, t);
}
function Qn(c, t = {}) {
  return Un(c, t);
}
const Zn = {
  compileEvents: Le,
  compileTimeline: Jn,
  deriveTimeline: Xn,
  compileComposition: Qn
}, tr = {
  harmony: pn,
  rhythm: Nn,
  motifs: {
    MotifBank: Cn
  }
}, er = {
  theory: et
}, nr = {
  gaussian: {
    Regressor: $e,
    Kernel: Ln
  },
  automata: {
    Cellular: _n
  },
  loops: Yt,
  genetic: {
    Darwin: Fn
  },
  walks: {
    Random: Vn,
    Chain: On,
    Phasor: {
      Vector: It,
      System: ue
    }
  },
  fractals: {
    Mandelbrot: Bn,
    LogisticMap: Gn
  },
  minimalism: {
    Process: Dn,
    Tintinnabuli: zn
  }
}, rr = {
  ...Yn
}, or = {
  ...ln
}, ir = Zn, Ct = {
  theory: tr,
  constants: er,
  generative: nr,
  analysis: rr,
  audio: ir,
  utils: or
};
function sr(c) {
  const t = typeof c == "string" ? parseInt(c, 10) : c;
  if (!Number.isFinite(t)) return String(c);
  const n = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][(t % 12 + 12) % 12], r = Math.floor(t / 12) - 1;
  return `${n}${r}`;
}
function ar(c) {
  return !c || !Array.isArray(c.audioGraph) || c.audioGraph.forEach((t) => {
    try {
      if (!t || t.type !== "Sampler") return;
      const e = t.options || {}, n = e.urls;
      if (!n || typeof n != "object") return;
      const r = {};
      Object.keys(n).forEach((o) => {
        const i = String(o);
        let s = i;
        /^\d+$/.test(i) && (s = sr(parseInt(i, 10))), r[s] = n[o];
      }), t.options = { ...e, urls: r };
    } catch {
    }
  }), c;
}
class Qt {
  constructor(t = {}) {
    this.options = t;
  }
  // Parse bars:beats:ticks -> beats (supports fractional beats)
  static parseBBTToBeats(t, e = 4, n = 480) {
    if (typeof t == "number") return t;
    if (typeof t != "string") return 0;
    const r = t.match(/^(\d+):(\d+(?:\.\d+)?):(\d+)$/);
    if (!r) return 0;
    const o = parseInt(r[1], 10), i = parseFloat(r[2]), s = parseInt(r[3], 10);
    return o * e + i + s / n;
  }
  // Parse note value (e.g., 4n, 8n, 8t) or BBT to beats
  static parseDurationToBeats(t, e = 4, n = 480) {
    if (typeof t == "number") return t;
    if (typeof t != "string") return 0;
    if (/^\d+:\d+(?:\.\d+)?:\d+$/.test(t))
      return this.parseBBTToBeats(t, e, n);
    const r = t.match(/^(\d+)(n|t)$/);
    if (r) {
      const o = parseInt(r[1], 10), i = r[2];
      if (i === "n")
        return 4 / o;
      if (i === "t")
        return 4 / o * (2 / 3);
    }
    return 0;
  }
  convert(t) {
    return (t.tracks || []).map((n) => ({
      label: n.label,
      type: "PolySynth",
      // Default type for the current player
      part: (n.notes || []).map((r) => ({
        time: r.time,
        pitch: r.pitch,
        duration: r.duration,
        velocity: r.velocity || 0.8
      }))
    }));
  }
}
function _e(c, t = {}) {
  try {
    ar(c);
  } catch {
  }
  const r = new Qt(t).convert(c).map((m, p) => ({
    originalTrackIndex: p,
    voiceIndex: 0,
    totalVoices: 1,
    trackInfo: { label: m.label },
    synthConfig: { type: m.type || "PolySynth" },
    partEvents: m.part || []
  })), o = c.tempo || c.metadata?.tempo || c.bpm || 120, [i, s] = (c.timeSignature || "4/4").split("/").map((m) => parseInt(m, 10)), l = isFinite(i) ? i : 4;
  let a = 0;
  r.forEach((m) => {
    m.partEvents && m.partEvents.length > 0 && m.partEvents.forEach((p) => {
      const M = Qt.parseBBTToBeats(p.time, l), f = Qt.parseDurationToBeats(p.duration, l), k = M + f;
      k > a && (a = k);
    });
  });
  const d = 60 / o, u = a * d;
  return console.log(`[TONEJS] Duration calc: totalBeats=${a.toFixed(2)} beats = ${u.toFixed(2)}s - loop ends exactly when last note finishes`), {
    tracks: r,
    metadata: {
      totalDuration: u,
      // Use total duration - loop should end when last note finishes
      tempo: o
    }
  };
}
const $t = {
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
}, Wt = [
  "https://raw.githubusercontent.com/jmonlabs/midi-js-soundfonts/gh-pages/FluidR3_GM",
  "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM"
];
function Vt(c, t = Wt[0], e = [21, 108], n = "complete") {
  const r = $t[c];
  if (!r)
    return console.warn(
      `GM program ${c} not found, using Acoustic Grand Piano`
    ), Vt(0, t, e);
  const o = {}, [i, s] = e;
  let l = [];
  switch (n) {
    case "minimal":
      for (let a = i; a <= s; a += 12)
        l.push(a);
      l.push(60);
      break;
    case "balanced":
      for (let a = i; a <= s; a += 4)
        l.push(a);
      [60, 64, 67].forEach((a) => {
        a >= i && a <= s && !l.includes(a) && l.push(a);
      });
      break;
    case "quality":
      for (let a = i; a <= s; a += 3)
        l.push(a);
      break;
    case "complete":
      for (let a = i; a <= s; a++)
        l.push(a);
      break;
    default:
      return console.warn(`Unknown sampling strategy '${n}', using 'balanced'`), Vt(c, t, e, "balanced");
  }
  l = [...new Set(l)].sort((a, d) => a - d);
  for (const a of l) {
    const d = lr(a);
    o[d] = cr(r.folder, d, t);
  }
  return console.log(
    `[GM INSTRUMENT] Generated ${Object.keys(o).length} sample URLs for ${r.name} (${n} strategy)`
  ), o;
}
function cr(c, t, e) {
  return `${e}/${c}/${t}.mp3`;
}
function lr(c) {
  const t = [
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
  ], e = Math.floor(c / 12) - 1, n = c % 12;
  return `${t[n]}${e}`;
}
function Fe(c) {
  const t = c.toLowerCase().trim();
  for (const [e, n] of Object.entries($t))
    if (n.name.toLowerCase() === t)
      return parseInt(e, 10);
  for (const [e, n] of Object.entries($t)) {
    const r = n.name.toLowerCase();
    if (r.includes(t) || t.includes(r.split(" ")[0]))
      return parseInt(e, 10);
  }
  return null;
}
function ur(c, t, e = {}, n = "destination") {
  let r;
  if (typeof t == "string") {
    if (r = Fe(t), r === null) {
      console.warn(`GM instrument "${t}" not found. Available instruments:`);
      const d = Object.values($t).map((u) => u.name).slice(0, 10);
      console.warn(`Examples: ${d.join(", ")}...`), console.warn("Using Acoustic Grand Piano as fallback"), r = 0;
    }
  } else
    r = t;
  if (!$t[r]) return null;
  const {
    baseUrl: i = Wt[0],
    noteRange: s = [21, 108],
    // Complete MIDI range for maximum quality
    envelope: l = { attack: 0.1, release: 1 },
    strategy: a = "complete"
    // Use complete sampling by default
  } = e;
  return {
    id: c,
    type: "Sampler",
    options: {
      urls: Vt(r, i, s, a),
      baseUrl: "",
      // URLs are already complete
      envelope: {
        enabled: !0,
        attack: l.attack,
        release: l.release
      }
    },
    target: n
  };
}
function Ve() {
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
const hr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CDN_SOURCES: Wt,
  GM_INSTRUMENTS: $t,
  createGMInstrumentNode: ur,
  findGMProgramByName: Fe,
  generateSamplerUrls: Vt,
  getPopularInstruments: Ve
}, Symbol.toStringTag, { value: "Module" })), dr = [
  "Reverb",
  "JCReverb",
  "Freeverb"
], mr = [
  "Delay",
  "FeedbackDelay",
  "PingPongDelay"
], fr = [
  "Chorus",
  "Phaser",
  "Tremolo",
  "Vibrato",
  "AutoWah"
], pr = [
  "Distortion",
  "Chebyshev",
  "BitCrusher"
], gr = [
  "Compressor",
  "Limiter",
  "Gate",
  "MidSideCompressor"
], yr = [
  "Filter",
  "AutoFilter"
], wr = [
  "FrequencyShifter",
  "PitchShift",
  "StereoWidener"
], br = [
  ...dr,
  ...mr,
  ...fr,
  ...pr,
  ...gr,
  ...yr,
  ...wr
], xr = [
  "Synth",
  "PolySynth",
  "MonoSynth",
  "AMSynth",
  "FMSynth",
  "DuoSynth",
  "PluckSynth",
  "NoiseSynth"
], xe = {
  MAX_WIDTH: 800,
  MIN_WIDTH: 0
}, Zt = {
  MARGIN: "8px 0",
  GAP: 12,
  UPDATE_INTERVAL: 100
  // ms between timeline updates
}, vr = {}, Mr = {
  DEFAULT_TEMPO: 120
}, te = {
  INVALID_COMPOSITION: "Composition must be a valid JMON object",
  NO_SEQUENCES_OR_TRACKS: "Composition must have sequences or tracks",
  TRACKS_MUST_BE_ARRAY: "Tracks/sequences must be an array"
}, ee = {
  PLAYER: "[PLAYER]"
};
function Oe(c, t = {}) {
  if (!c || typeof c != "object")
    throw console.error(`${ee.PLAYER} Invalid composition:`, c), new Error(te.INVALID_COMPOSITION);
  const {
    autoplay: e = !1,
    showDebug: n = !1,
    customInstruments: r = {},
    autoMultivoice: o = !0,
    maxVoices: i = 4,
    Tone: s = null
  } = t;
  if (!c.sequences && !c.tracks)
    throw console.error(
      `${ee.PLAYER} No sequences or tracks found in composition:`,
      c
    ), new Error(te.NO_SEQUENCES_OR_TRACKS);
  const l = c.tracks || c.sequences || [];
  if (!Array.isArray(l))
    throw console.error(`${ee.PLAYER} Tracks/sequences must be an array:`, l), new Error(te.TRACKS_MUST_BE_ARRAY);
  const a = c.tempo || c.bpm || Mr.DEFAULT_TEMPO, u = _e(c, { autoMultivoice: o, maxVoices: i, showDebug: n }), { tracks: m, metadata: p } = u;
  let M = p.totalDuration;
  const f = vr, k = document.createElement("div");
  k.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        background-color: ${f.background};
        color: ${f.text};
        padding: 16px 16px 8px 16px;
        border-radius: 12px;
        width: 100%;
        max-width: ${xe.MAX_WIDTH}px;
        min-width: ${xe.MIN_WIDTH};
        border: 1px solid ${f.border};
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    `;
  const F = document.createElement("style");
  F.textContent = `
        /* iOS audio improvements */
        .jmon-music-player-container {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }
        .jmon-music-player-play {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }

        /* Button hover effects */
        .jmon-music-player-btn-vertical:hover {
            background-color: #555555 !important;
            transform: translateY(-1px);
        }
        .jmon-music-player-btn-vertical:active {
            transform: translateY(0px);
        }

        /* Large screens: Show vertical downloads, hide horizontal ones, horizontal track layout */
        @media (min-width: 600px) {
            .jmon-music-player-downloads {
                display: none !important;
            }
            .jmon-music-player-vertical-downloads {
                display: flex !important;
            }
            .jmon-music-player-top {
                gap: 32px !important;
            }
            .jmon-music-player-right {
                min-width: 140px !important;
                max-width: 160px !important;
            }
            .jmon-track-selector {
                flex-direction: row !important;
                align-items: center !important;
                gap: 16px !important;
            }
            .jmon-track-selector label {
                min-width: 120px !important;
                margin-bottom: 0 !important;
                flex-shrink: 0 !important;
            }
            .jmon-track-selector select {
                flex: 1 !important;
            }
        }

        /* Medium screens: Compact layout with horizontal track selectors */
        @media (min-width: 481px) and (max-width: 799px) {
            .jmon-music-player-downloads {
                display: none !important;
            }
            .jmon-music-player-vertical-downloads {
                display: flex !important;
            }
            .jmon-music-player-top {
                gap: 20px !important;
            }
            .jmon-music-player-right {
                min-width: 120px !important;
                max-width: 140px !important;
            }
            .jmon-track-selector {
                flex-direction: row !important;
                align-items: center !important;
                gap: 12px !important;
            }
            .jmon-track-selector label {
                min-width: 100px !important;
                margin-bottom: 0 !important;
                flex-shrink: 0 !important;
                font-size: 14px !important;
            }
            .jmon-track-selector select {
                flex: 1 !important;
            }
        }

        /* Small screens: Mobile layout */
        @media (max-width: 480px) {
            .jmon-music-player-downloads {
                display: flex !important;
            }
            .jmon-music-player-vertical-downloads {
                display: none !important;
            }
            .jmon-music-player-container {
                padding: 8px !important;
                border-radius: 8px !important;
                max-width: 100vw !important;
                min-width: 0 !important;
                box-shadow: none !important;
            }
            .jmon-music-player-top {
                flex-direction: column !important;
                gap: 12px !important;
                align-items: stretch !important;
            }
            .jmon-music-player-left, .jmon-music-player-right {
                width: 100% !important;
                min-width: 0 !important;
                max-width: none !important;
                flex: none !important;
            }
            .jmon-music-player-right {
                gap: 12px !important;
            }
            .jmon-track-selector {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 8px !important;
            }
            .jmon-track-selector label {
                min-width: auto !important;
                margin-bottom: 0 !important;
            }
            .jmon-track-selector select {
                flex: none !important;
            }
            .jmon-music-player-timeline {
                gap: 8px !important;
                margin: 6px 0 !important;
            }
            .jmon-music-player-downloads {
                flex-direction: column !important;
                gap: 8px !important;
                margin-top: 6px !important;
            }
            .jmon-music-player-btn {
                min-height: 40px !important;
                font-size: 14px !important;
                padding: 10px 0 !important;
            }
            .jmon-music-player-play {
                width: 40px !important;
                height: 40px !important;
                min-width: 40px !important;
                max-width: 40px !important;
                padding: 8px !important;
                margin: 0 4px !important;
                border-radius: 50% !important;
                flex-shrink: 0 !important;
            }
            .jmon-music-player-stop {
                width: 40px !important;
                height: 40px !important;
                min-width: 40px !important;
                max-width: 40px !important;
                padding: 8px !important;
                margin: 0 4px !important;
                flex-shrink: 0 !important;
            }
        }
    `, document.head.appendChild(F), k.classList.add("jmon-music-player-container");
  const B = document.createElement("div");
  B.style.cssText = `
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto;
        gap: 12px;
        margin-bottom: 0px;
        font-family: 'PT Sans', sans-serif;
    `, B.classList.add("jmon-music-player-main");
  const G = document.createElement("div");
  G.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-family: 'PT Sans', sans-serif;
        gap: 24px;
        flex-wrap: wrap;
    `, G.classList.add("jmon-music-player-top");
  const V = document.createElement("div");
  V.style.cssText = `
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
    `, V.classList.add("jmon-music-player-left");
  const X = document.createElement("div");
  X.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
    `;
  const Q = Ve(), bt = c.tracks || [], rt = [];
  bt.forEach((S, C) => {
    const N = m.find(
      (W) => W.originalTrackIndex === C
    )?.analysis;
    N?.hasGlissando && console.warn(
      `Track ${S.label || S.name || C + 1} contient un glissando : la polyphonie sera désactivée pour cette piste.`
    );
    const j = document.createElement("div");
    j.style.cssText = `
            margin-bottom: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `, j.classList.add("jmon-track-selector");
    const O = document.createElement("label");
    O.textContent = S.label || `Track ${C + 1}`, O.style.cssText = `
            font-family: 'PT Sans', sans-serif;
            font-size: 16px;
            color: ${f.text};
            display: block;
            margin-bottom: 0;
            font-weight: normal;
            flex-shrink: 0;
        `;
    const q = document.createElement("select");
    q.style.cssText = `
            padding: 4px;
            border: 1px solid ${f.secondary};
            border-radius: 4px;
            background-color: ${f.background};
            color: ${f.text};
            font-size: 12px;
            width: 100%;
            height: 28px;
            box-sizing: border-box;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            margin: 0;
            outline: none;
        `;
    const it = document.createElement("optgroup");
    it.label = "Synthesizers";
    const nt = [
      "PolySynth",
      "Synth",
      "AMSynth",
      "DuoSynth",
      "FMSynth",
      "MembraneSynth",
      "MetalSynth",
      "MonoSynth",
      "PluckSynth"
    ], dt = c.audioGraph || [];
    if (Array.isArray(dt) && dt.length > 0) {
      const W = c.tracks?.[C]?.synthRef;
      dt.forEach(($) => {
        if ($.id && $.type && $.type !== "Destination") {
          const st = document.createElement("option");
          st.value = `AudioGraph: ${$.id}`, st.textContent = $.id, W === $.id && (st.selected = !0), it.appendChild(st);
        }
      });
    }
    nt.forEach((W) => {
      const $ = document.createElement("option");
      $.value = W, $.textContent = W, (N?.hasGlissando && W === "Synth" || !N?.hasGlissando && !c.tracks?.[C]?.synthRef && W === "PolySynth") && ($.selected = !0), N?.hasGlissando && (W === "PolySynth" || W === "DuoSynth") && ($.disabled = !0, $.textContent += " (mono only for glissando)"), it.appendChild($);
    }), q.appendChild(it);
    const vt = document.createElement("optgroup");
    vt.label = "Sampled Instruments";
    const ut = {};
    Q.forEach((W) => {
      ut[W.category] || (ut[W.category] = []), ut[W.category].push(W);
    }), Object.keys(ut).sort().forEach((W) => {
      const $ = document.createElement("optgroup");
      $.label = W, ut[W].forEach((st) => {
        const D = document.createElement("option");
        D.value = `GM: ${st.name}`, D.textContent = st.name, N?.hasGlissando && (D.disabled = !0, D.textContent += " (not suitable for glissando)"), $.appendChild(D);
      }), q.appendChild($);
    }), rt.push(q), j.append(O, q), X.appendChild(j);
  }), V.appendChild(X);
  const ot = document.createElement("div");
  ot.style.cssText = `
        display: flex;
        flex-direction: column;
        min-width: 120px;
        max-width: 150px;
        box-sizing: border-box;
        gap: 16px;
    `, ot.classList.add("jmon-music-player-right");
  const At = document.createElement("div");
  At.style.cssText = `
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    `;
  const Pt = document.createElement("label");
  Pt.textContent = "Tempo", Pt.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin-bottom: 8px;
        color: ${f.text};
    `;
  const K = document.createElement("input");
  K.type = "number", K.min = 60, K.max = 240, K.value = a, K.style.cssText = `
        padding: 4px;
        border: 1px solid ${f.secondary};
        border-radius: 4px;
        background-color: ${f.background};
        color: ${f.text};
        font-size: 12px;
        text-align: center;
        width: 100%;
        height: 28px;
        box-sizing: border-box;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
        outline: none;
    `, At.append(Pt, K);
  const mt = document.createElement("div");
  mt.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
    `, mt.classList.add("jmon-music-player-vertical-downloads");
  const ft = document.createElement("button");
  ft.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-keyboard-music" style="margin-right: 8px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h4"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M2 12h20"/><path d="M6 12v4"/><path d="M10 12v4"/><path d="M14 12v4"/><path d="M18 12v4"/></svg><span>MIDI</span>', ft.style.cssText = `
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        box-sizing: border-box;
    `, ft.classList.add("jmon-music-player-btn-vertical");
  const Tt = document.createElement("button");
  Tt.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-audio-lines" style="margin-right: 8px;"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg><span>WAV</span>', Tt.style.cssText = `
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        box-sizing: border-box;
    `, Tt.classList.add("jmon-music-player-btn-vertical"), mt.append(ft, Tt), mt.style.display = "none", ot.append(At, mt);
  const pt = document.createElement("div");
  pt.style.cssText = `
        position: relative;
        width: 100%;
        margin: ${Zt.MARGIN};
        display: flex;
        align-items: center;
        gap: ${Zt.GAP}px;
        min-width: 0;
        box-sizing: border-box;
    `, pt.classList.add("jmon-music-player-timeline");
  const lt = document.createElement("div");
  lt.textContent = "0:00", lt.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        color: ${f.text};
        min-width: 40px;
        text-align: center;
    `;
  const ht = document.createElement("div");
  ht.textContent = "0:00", ht.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        color: ${f.text};
        min-width: 40px;
        text-align: center;
    `;
  const Z = document.createElement("input");
  Z.type = "range", Z.min = 0, Z.max = 100, Z.value = 0, Z.style.cssText = `
        flex-grow: 1;
        -webkit-appearance: none;
        background: ${f.secondary};
        outline: none;
        border-radius: 15px;
        overflow: visible;
        height: 8px;
    `;
  const xt = document.createElement("style");
  xt.textContent = `
        input[type="range"].jmon-timeline-slider {
            background: ${f.secondary} !important;
            border: 1px solid ${f.border} !important;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        input[type="range"].jmon-timeline-slider::-webkit-slider-track {
            background: ${f.secondary} !important;
            height: 8px !important;
            border-radius: 15px !important;
            border: 1px solid ${f.border} !important;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        input[type="range"].jmon-timeline-slider::-moz-range-track {
            background: ${f.secondary} !important;
            height: 8px !important;
            border-radius: 15px !important;
            border: 1px solid ${f.border} !important;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        input[type="range"].jmon-timeline-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            appearance: none !important;
            height: 20px !important;
            width: 20px !important;
            border-radius: 50% !important;
            background: ${f.primary} !important;
            cursor: pointer !important;
            border: 2px solid ${f.background} !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
        input[type="range"].jmon-timeline-slider::-moz-range-thumb {
            height: 20px !important;
            width: 20px !important;
            border-radius: 50% !important;
            background: ${f.primary} !important;
            cursor: pointer !important;
            border: 2px solid ${f.background} !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
    `, document.head.appendChild(xt), Z.classList.add("jmon-timeline-slider");
  const Y = document.createElement("button");
  Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>', Y.style.cssText = `
        width: 40px;
        height: 40px;
        min-width: 40px;
        max-width: 40px;
        padding: 8px;
        border: none;
        border-radius: 50%;
        background-color: ${f.primary};
        color: ${f.background};
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px 5px 0px 10px;
        box-sizing: border-box;
        flex-shrink: 0;
    `, Y.classList.add("jmon-music-player-play");
  const at = document.createElement("button");
  at.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>', at.style.cssText = `
        width: 40px;
        height: 40px;
        min-width: 40px;
        max-width: 40px;
        padding: 8px;
        border: none;
        border-radius: 8px;
        background-color: ${f.secondary};
        color: ${f.text};
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px 5px 0px 0px;
        box-sizing: border-box;
        flex-shrink: 0;
    `, at.classList.add("jmon-music-player-stop");
  const J = document.createElement("div");
  J.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: ${f.lightText};
        margin: 0px 0px 0px 10px;
    `;
  const ct = document.createElement("div");
  ct.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0px;
    `, ct.append(Y, at), pt.append(lt, Z, ht, ct);
  const A = document.createElement("div");
  A.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        gap: 10px;
        min-width: 0;
        box-sizing: border-box;
    `, A.classList.add("jmon-music-player-downloads");
  const P = document.createElement("button");
  P.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-keyboard-music" style="margin-right: 5px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h4"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M2 12h20"/><path d="M6 12v4"/><path d="M10 12v4"/><path d="M14 12v4"/><path d="M18 12v4"/></svg><span>MIDI</span>', P.style.cssText = `
        padding: 15px 30px;
        margin: 0 5px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        min-width: 0;
        box-sizing: border-box;
    `, P.classList.add("jmon-music-player-btn");
  const b = document.createElement("button");
  b.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-audio-lines" style="margin-right: 5px;"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg><span>WAV</span>', b.style.cssText = `
        padding: 15px 30px;
        margin: 0 5px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        min-width: 0;
        box-sizing: border-box;
    `, b.classList.add("jmon-music-player-btn"), A.append(P, b), G.append(V, ot), B.appendChild(G), B.appendChild(pt), k.append(
    B,
    A
  );
  let h, w = !1, y = [], g = [], v = [], T = null;
  const x = c.tracks || [], I = () => {
    if (!h || !c.audioGraph || !Array.isArray(c.audioGraph))
      return null;
    const S = {}, C = (N) => {
      const j = {};
      return Object.entries(N || {}).forEach(([O, q]) => {
        let it = O;
        if (typeof O == "number" || /^\d+$/.test(String(O)))
          try {
            it = h.Frequency(parseInt(O, 10), "midi").toNote();
          } catch {
          }
        j[it] = q;
      }), j;
    };
    try {
      return c.audioGraph.forEach((N) => {
        const { id: j, type: O, options: q = {}, target: it } = N;
        if (!j || !O) return;
        let nt = null;
        if (O === "Sampler") {
          const dt = C(q.urls);
          let vt, ut;
          const W = new Promise((st, D) => {
            vt = st, ut = D;
          }), $ = {
            urls: dt,
            onload: () => vt && vt(),
            onerror: (st) => {
              console.error(`[PLAYER] Sampler load error for ${j}:`, st), ut && ut(st);
            }
          };
          q.baseUrl && ($.baseUrl = q.baseUrl);
          try {
            console.log(
              `[PLAYER] Building Sampler ${j} with urls:`,
              dt,
              "baseUrl:",
              $.baseUrl || "(none)"
            ), nt = new h.Sampler($);
          } catch (st) {
            console.error("[PLAYER] Failed to create Sampler:", st), nt = null;
          }
          v.push(W), nt && q.envelope && q.envelope.enabled && (typeof q.envelope.attack == "number" && (nt.attack = q.envelope.attack), typeof q.envelope.release == "number" && (nt.release = q.envelope.release));
        } else if (xr.includes(O))
          try {
            nt = new h[O](q);
          } catch (dt) {
            console.warn(
              `[PLAYER] Failed to create ${O} from audioGraph, using PolySynth:`,
              dt
            ), nt = new h.PolySynth();
          }
        else if (br.includes(O))
          try {
            nt = new h[O](q), console.log(`[PLAYER] Created effect ${j} (${O}) with options:`, q);
          } catch (dt) {
            console.warn(`[PLAYER] Failed to create ${O} effect:`, dt), nt = null;
          }
        else O === "Destination" && (S[j] = h.Destination);
        nt && (S[j] = nt);
      }), Object.keys(S).length > 0 && c.audioGraph.forEach((N) => {
        const { id: j, target: O } = N;
        if (!j || !S[j]) return;
        const q = S[j];
        if (q !== h.Destination)
          if (O && S[O])
            try {
              S[O] === h.Destination ? (q.toDestination(), console.log(`[PLAYER] Connected ${j} -> Destination`)) : (q.connect(S[O]), console.log(`[PLAYER] Connected ${j} -> ${O}`));
            } catch (it) {
              console.warn(`[PLAYER] Failed to connect ${j} -> ${O}:`, it), q.toDestination();
            }
          else
            q.toDestination(), console.log(`[PLAYER] Connected ${j} -> Destination (no target specified)`);
      }), S;
    } catch (N) {
      return console.error("[PLAYER] Failed building audioGraph instruments:", N), null;
    }
  }, E = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1, L = (S) => `${Math.floor(S / 60)}:${Math.floor(S % 60).toString().padStart(2, "0")}`;
  ht.textContent = L(M);
  const _ = async () => {
    if (typeof window < "u") {
      const S = s || window.Tone || (typeof h < "u" ? h : null);
      if (S)
        console.log(
          "[PLAYER] Using existing Tone.js, version:",
          S.version || "unknown"
        ), window.Tone = S;
      else
        try {
          if (typeof require < "u") {
            console.log("[PLAYER] Loading Tone.js via require()...");
            const N = await require("tone@14.8.49/build/Tone.js");
            window.Tone = N.default || N.Tone || N;
          } else {
            console.log("[PLAYER] Loading Tone.js via import()...");
            const N = await import("https://esm.sh/tone@14.8.49");
            window.Tone = N.default || N.Tone || N;
          }
          if (!window.Tone || typeof window.Tone != "object" || !window.Tone.PolySynth) {
            console.warn(
              "[PLAYER] First load attempt failed, trying alternative CDN..."
            );
            try {
              const N = await import("https://cdn.skypack.dev/tone@14.8.49");
              if (window.Tone = N.default || N.Tone || N, !window.Tone || !window.Tone.PolySynth)
                throw new Error("Alternative CDN also failed");
            } catch {
              console.warn(
                "[PLAYER] Alternative CDN failed, trying jsdelivr..."
              );
              try {
                const j = await import("https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js");
                if (window.Tone = j.default || j.Tone || j, !window.Tone || !window.Tone.PolySynth)
                  throw new Error("All CDN attempts failed");
              } catch {
                throw new Error(
                  "Loaded Tone.js but got invalid object from all CDNs"
                );
              }
            }
          }
          console.log(
            "[PLAYER] Tone.js loaded successfully, version:",
            window.Tone.version || "unknown"
          );
        } catch (N) {
          return console.warn("Could not auto-load Tone.js:", N.message), console.log(
            "To use the player, load Tone.js manually first using one of these methods:"
          ), console.log(
            'Method 1: Tone = await require("tone@14.8.49/build/Tone.js")'
          ), console.log(
            'Method 2: Tone = await import("https://esm.sh/tone@14.8.49").then(m => m.default)'
          ), console.log(
            'Method 3: Tone = await import("https://cdn.skypack.dev/tone@14.8.49").then(m => m.default)'
          ), !1;
        }
      const C = window.Tone || S;
      if (C)
        return h = C, console.log("[PLAYER] Available Tone constructors:", {
          PolySynth: typeof h.PolySynth,
          Synth: typeof h.Synth,
          Part: typeof h.Part,
          Transport: typeof h.Transport,
          start: typeof h.start,
          context: !!h.context
        }), console.log(
          "[PLAYER] Tone.js initialized, context state:",
          h.context ? h.context.state : "no context"
        ), E() && console.log("[PLAYER] iOS device detected - audio context will start on user interaction"), !0;
    }
    return console.warn("Tone.js not available"), !1;
  }, H = () => {
    if (!h) {
      console.warn("[PLAYER] Tone.js not available, cannot setup audio");
      return;
    }
    const S = [];
    if (h.PolySynth || S.push("PolySynth"), h.Synth || S.push("Synth"), h.Part || S.push("Part"), h.Transport || S.push("Transport"), S.length > 0) {
      console.error(
        "[PLAYER] Tone.js is missing required constructors:",
        S
      ), console.error(
        "[PLAYER] Available Tone properties:",
        Object.keys(h).filter((C) => typeof h[C] == "function").slice(
          0,
          20
        )
      ), console.error("[PLAYER] Tone object:", h), console.error(
        "[PLAYER] This usually means Tone.js did not load correctly. Try refreshing the page or loading Tone.js manually."
      );
      return;
    }
    if (h.Transport.bpm.value = p.tempo, console.log(
      `[PLAYER] Set Transport BPM to ${p.tempo} before building instruments`
    ), !T && (T = I(), T)) {
      const C = Object.keys(T).filter(
        (N) => T[N] && T[N].name === "Sampler"
      );
      C.length > 0 && console.log(
        "[PLAYER] Using audioGraph Samplers for tracks with synthRef:",
        C
      );
    }
    console.log("[PLAYER] Cleaning up existing audio...", {
      synths: y.length,
      parts: g.length
    }), h.Transport.stop(), h.Transport.position = 0, g.forEach((C, N) => {
      try {
        C.stop();
      } catch (j) {
        console.warn(`[PLAYER] Failed to stop part ${N}:`, j);
      }
    }), g.forEach((C, N) => {
      try {
        C.dispose();
      } catch (j) {
        console.warn(`[PLAYER] Failed to dispose part ${N}:`, j);
      }
    }), y.forEach((C, N) => {
      if (!T || !Object.values(T).includes(C))
        try {
          C.disconnect && typeof C.disconnect == "function" && C.disconnect(), C.dispose();
        } catch (j) {
          console.warn(`[PLAYER] Failed to dispose synth ${N}:`, j);
        }
    }), y = [], g = [], console.log("[PLAYER] Audio cleanup completed"), console.log("[PLAYER] Converted tracks:", m.length), m.forEach((C) => {
      const {
        originalTrackIndex: N,
        voiceIndex: j,
        totalVoices: O,
        trackInfo: q,
        synthConfig: it,
        partEvents: nt
      } = C, vt = (x[N] || {}).synthRef, ut = 60 / p.tempo, W = (nt || []).map((D) => {
        const R = typeof D.time == "number" ? D.time * ut : D.time, z = typeof D.duration == "number" ? D.duration * ut : D.duration;
        return { ...D, time: R, duration: z };
      });
      let $ = null;
      if (vt && T && T[vt])
        $ = T[vt];
      else {
        const D = rt[N] ? rt[N].value : it.type;
        try {
          if (D.startsWith("AudioGraph: ")) {
            const R = D.substring(12);
            if (T && T[R])
              $ = T[R], console.log(
                `[PLAYER] Using audioGraph instrument: ${R}`
              );
            else
              throw new Error(
                `AudioGraph instrument ${R} not found`
              );
          } else if (D.startsWith("GM: ")) {
            const R = D.substring(4), z = Q.find(
              (tt) => tt.name === R
            );
            if (z) {
              console.log(`[PLAYER] Loading GM instrument: ${R}`);
              const tt = Vt(
                z.program,
                Wt[0],
                [36, 84],
                "balanced"
              );
              console.log(
                `[PLAYER] Loading GM instrument ${R} with ${Object.keys(tt).length} samples`
              ), console.log(
                "[PLAYER] Sample notes:",
                Object.keys(tt).sort()
              ), $ = new h.Sampler({
                urls: tt,
                onload: () => console.log(
                  `[PLAYER] GM instrument ${R} loaded successfully`
                ),
                onerror: (Mt) => {
                  console.error(
                    `[PLAYER] Failed to load GM instrument ${R}:`,
                    Mt
                  );
                }
              }).toDestination();
            } else
              throw new Error(`GM instrument ${R} not found`);
          } else {
            const R = it.reason === "glissando_compatibility" ? it.type : D;
            if (!h[R] || typeof h[R] != "function")
              throw new Error(`Tone.${R} is not a constructor`);
            $ = new h[R]().toDestination(), it.reason === "glissando_compatibility" && j === 0 && console.warn(
              `[MULTIVOICE] Using ${R} instead of ${it.original} for glissando in ${q.label}`
            );
          }
        } catch (R) {
          console.warn(
            `Failed to create ${D}, using PolySynth:`,
            R
          );
          try {
            if (!h.PolySynth || typeof h.PolySynth != "function")
              throw new Error("Tone.PolySynth is not available");
            $ = new h.PolySynth().toDestination();
          } catch (z) {
            console.error(
              "Fatal: Cannot create any synth, Tone.js may not be properly loaded:",
              z
            );
            return;
          }
        }
      }
      y.push($), O > 1 && console.log(
        `[MULTIVOICE] Track "${q.label}" voice ${j + 1}: ${nt.length} notes`
      );
      const st = new h.Part((D, R) => {
        if (Array.isArray(R.pitch))
          R.pitch.forEach((z) => {
            let tt = "C4";
            typeof z == "number" ? tt = h.Frequency(z, "midi").toNote() : typeof z == "string" ? tt = z : Array.isArray(z) && typeof z[0] == "string" && (tt = z[0]), $.triggerAttackRelease(tt, R.duration, D);
          });
        else if (Array.isArray(R.modulations) && R.modulations.some((z) => z.type === "pitch" && (z.subtype === "glissando" || z.subtype === "portamento") && (z.to !== void 0 || z.target !== void 0))) {
          let z = typeof R.pitch == "number" ? h.Frequency(R.pitch, "midi").toNote() : R.pitch;
          const tt = R.modulations.find((Nt) => Nt.type === "pitch" && (Nt.subtype === "glissando" || Nt.subtype === "portamento") && (Nt.to !== void 0 || Nt.target !== void 0)), Mt = tt && (tt.to !== void 0 ? tt.to : tt.target);
          let Et = typeof Mt == "number" ? h.Frequency(Mt, "midi").toNote() : Mt;
          console.log("[PLAYER] Glissando", {
            fromNote: z,
            toNote: Et,
            duration: R.duration,
            time: D
          }), console.log(
            "[PLAYER] Glissando effect starting from",
            z,
            "to",
            Et
          ), $.triggerAttack(z, D, R.velocity || 0.8);
          const Rt = h.Frequency(z).toFrequency(), _t = h.Frequency(Et).toFrequency(), kt = 1200 * Math.log2(_t / Rt);
          if ($.detune && $.detune.setValueAtTime && $.detune.linearRampToValueAtTime)
            $.detune.setValueAtTime(0, D), $.detune.linearRampToValueAtTime(
              kt,
              D + R.duration
            ), console.log(
              "[PLAYER] Applied detune glissando:",
              kt,
              "cents over",
              R.duration,
              "beats"
            );
          else {
            const Nt = h.Frequency(z).toMidi(), De = h.Frequency(Et).toMidi(), Bt = Math.max(3, Math.abs(De - Nt)), ye = R.duration / Bt;
            for (let Gt = 1; Gt < Bt; Gt++) {
              const ze = Gt / (Bt - 1), qe = Rt * Math.pow(_t / Rt, ze), Ye = h.Frequency(qe).toNote(), Ue = D + Gt * ye;
              $.triggerAttackRelease(
                Ye,
                ye * 0.8,
                Ue,
                (R.velocity || 0.8) * 0.7
              );
            }
            console.log(
              "[PLAYER] Applied chromatic glissando with",
              Bt,
              "steps"
            );
          }
          $.triggerRelease(D + R.duration);
        } else {
          let z = "C4";
          typeof R.pitch == "number" ? z = h.Frequency(R.pitch, "midi").toNote() : typeof R.pitch == "string" ? z = R.pitch : Array.isArray(R.pitch) && typeof R.pitch[0] == "string" && (z = R.pitch[0]);
          let tt = R.duration, Mt = R.velocity || 0.8;
          const Et = Array.isArray(R.modulations) ? R.modulations : [], Rt = Et.find((kt) => kt.type === "durationScale" && typeof kt.factor == "number");
          Rt && (tt = R.duration * Rt.factor);
          const _t = Et.find((kt) => kt.type === "velocityBoost" && typeof kt.amountBoost == "number");
          _t && (Mt = Math.min(Mt + _t.amountBoost, 1)), $.triggerAttackRelease(
            z,
            tt,
            D,
            Mt
          );
        }
      }, W);
      g.push(st);
    }), h.Transport.loopEnd = M, h.Transport.loop = !0, h.Transport.stop(), h.Transport.position = 0, ht.textContent = L(M);
  };
  let U = 0;
  const Ht = Zt.UPDATE_INTERVAL, me = () => {
    const S = performance.now(), C = S - U >= Ht;
    if (h && w) {
      const N = typeof h.Transport.loopEnd == "number" ? h.Transport.loopEnd : h.Time(h.Transport.loopEnd).toSeconds();
      if (C) {
        const j = h.Transport.seconds % N, O = j / N * 100;
        Z.value = Math.min(O, 100), lt.textContent = L(j), ht.textContent = L(N), U = S;
      }
      if (h.Transport.state === "started" && w)
        requestAnimationFrame(me);
      else if (h.Transport.state === "stopped" || h.Transport.state === "paused") {
        if (C) {
          const j = h.Transport.seconds % N, O = j / N * 100;
          Z.value = Math.min(O, 100), lt.textContent = L(j), U = S;
        }
        h.Transport.state === "stopped" && (h.Transport.seconds = 0, Z.value = 0, lt.textContent = L(0), w = !1, Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>');
      }
    }
  };
  Y.addEventListener("click", async () => {
    if (!h)
      if (await _())
        H();
      else {
        console.error("[PLAYER] Failed to initialize Tone.js");
        return;
      }
    if (w)
      console.log("[PLAYER] Pausing playback..."), h.Transport.pause(), w = !1, Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>', console.log("[PLAYER] Playback paused");
    else {
      if (!h.context || h.context.state !== "running")
        try {
          await h.start(), console.log(
            "[PLAYER] Audio context started:",
            h.context ? h.context.state : "unknown"
          ), h.context && typeof h.context.resume == "function" && (await h.context.resume(), console.log("[PLAYER] Audio context resumed for iOS compatibility"));
        } catch (S) {
          console.error("[PLAYER] Failed to start audio context:", S);
          let C = "Failed to start audio. ";
          E() ? C += "On iOS, please ensure your device isn't in silent mode and try again." : C += "Please check your audio settings and try again.", alert(C);
          return;
        }
      if (y.length === 0 && (console.log("[PLAYER] No synths found, setting up audio..."), H()), h.Transport.state !== "paused" ? (h.Transport.stop(), h.Transport.position = 0, console.log("[PLAYER] Starting from beginning")) : console.log("[PLAYER] Resuming from paused position"), console.log(
        "[PLAYER] Transport state before start:",
        h.Transport.state
      ), console.log(
        "[PLAYER] Transport position reset to:",
        h.Transport.position
      ), console.log(
        "[PLAYER] Audio context state:",
        h.context ? h.context.state : "unknown"
      ), console.log("[PLAYER] Parts count:", g.length), console.log("[PLAYER] Synths count:", y.length), T) {
        const S = Object.values(T).filter(
          (C) => C && C.name === "Sampler"
        );
        if (S.length > 0 && v.length > 0) {
          console.log(
            `[PLAYER] Waiting for ${S.length} sampler(s) to load...`
          );
          try {
            await Promise.all(v), console.log("[PLAYER] All samplers loaded.");
          } catch (C) {
            console.warn("[PLAYER] Sampler load wait error:", C);
            return;
          }
        }
      }
      if (g.length === 0) {
        console.error(
          "[PLAYER] No parts available to start. This usually means setupAudio() failed."
        ), console.error(
          "[PLAYER] Try refreshing the page or check if Tone.js is properly loaded."
        );
        return;
      }
      h.Transport.state !== "paused" && g.forEach((S, C) => {
        if (!S || typeof S.start != "function") {
          console.error(`[PLAYER] Part ${C} is invalid:`, S);
          return;
        }
        try {
          S.start(0);
        } catch (N) {
          console.error(`[PLAYER] Failed to start part ${C}:`, N);
        }
      }), h.Transport.start(), w = !0, Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-pause"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>', me();
    }
  }), at.addEventListener("click", async () => {
    h && (console.log("[PLAYER] Stopping playback completely..."), h.Transport.stop(), h.Transport.cancel(), h.Transport.position = 0, g.forEach((S, C) => {
      try {
        S.stop();
      } catch (N) {
        console.warn(
          `[PLAYER] Failed to stop part ${C} during complete stop:`,
          N
        );
      }
    }), w = !1, Z.value = 0, lt.textContent = L(0), Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>', console.log("[PLAYER] Playback stopped completely"));
  }), Z.addEventListener("input", () => {
    if (h && M > 0) {
      const S = Z.value / 100 * M, C = w;
      C && h.Transport.pause(), h.Transport.seconds = S, lt.textContent = L(S), C && setTimeout(() => {
        h.Transport.start();
      }, 50);
    }
  }), K.addEventListener("change", () => {
    const S = parseInt(K.value);
    h && S >= 60 && S <= 240 ? (console.log(`[PLAYER] Tempo changed to ${S} BPM`), h.Transport.bpm.value = S, console.log(`[PLAYER] Tempo changed to ${S} BPM`)) : K.value = h ? h.Transport.bpm.value : a;
  }), rt.forEach((S) => {
    S.addEventListener("change", () => {
      if (h && y.length > 0) {
        console.log(
          "[PLAYER] Synthesizer selection changed, reinitializing audio..."
        );
        const C = w;
        w && (h.Transport.stop(), w = !1), H(), C ? setTimeout(() => {
          h.Transport.start(), w = !0, Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-pause"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>';
        }, 100) : Y.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>';
      }
    });
  });
  const fe = () => {
    console.log("MIDI download - requires MIDI converter implementation");
  }, pe = () => {
    console.log("WAV download - requires WAV generator implementation");
  };
  P.addEventListener("click", fe), b.addEventListener("click", pe), ft.addEventListener("click", fe), Tt.addEventListener("click", pe);
  const ge = typeof window < "u" && window.Tone || (typeof h < "u" ? h : null);
  if (ge && _().then(() => {
    H(), e && setTimeout(() => {
      Y.click();
    }, 500);
  }), e && !ge) {
    const S = setInterval(() => {
      (typeof window < "u" && window.Tone || (typeof h < "u" ? h : null)) && (clearInterval(S), setTimeout(() => {
        Y.click();
      }, 500));
    }, 100);
    setTimeout(() => {
      clearInterval(S);
    }, 1e4);
  }
  return k;
}
class he {
  static midiToNoteName(t) {
    const e = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], n = Math.floor(t / 12) - 1, r = t % 12;
    return e[r] + n;
  }
  static convert(t) {
    const e = t.tempo || t.bpm || 120, n = t.timeSignature || "4/4", r = t.tracks || [], o = Array.isArray(r) ? r : r && typeof r == "object" ? Object.values(r) : [];
    return {
      header: {
        bpm: e,
        timeSignature: n
      },
      tracks: o.map((i) => {
        const s = i.label || i.name, l = Array.isArray(i.notes) ? i.notes : Array.isArray(i) ? i : [], a = Array.isArray(l) ? l : [], d = Le({ notes: a }, { tempo: e, timeSignature: n }), u = a.map((m) => ({
          pitch: m.pitch,
          noteName: typeof m.pitch == "number" ? he.midiToNoteName(m.pitch) : m.pitch,
          time: m.time,
          duration: m.duration,
          velocity: m.velocity || 0.8
        }));
        return {
          label: s,
          notes: u,
          modulations: d && Array.isArray(d.modulations) ? d.modulations : []
        };
      })
    };
  }
}
function Tr(c) {
  return he.convert(c);
}
class de {
  constructor(t = {}) {
    this.options = {
      Tone: null,
      trackNaming: "auto",
      // 'auto', 'numbered', 'channel', 'instrument'
      mergeDrums: !0,
      quantize: null,
      // e.g., 0.25 for 16th note quantization
      includeModulations: !0,
      includeTempo: !0,
      includeKeySignature: !0,
      ...t
    };
  }
  /**
   * Static conversion method
   * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
   * @param {Object} options - Conversion options
   * @returns {Promise<Object>} JMON composition
   */
  static async convert(t, e = {}) {
    return await new de(e).convertToJmon(t);
  }
  /**
   * Main conversion method
   * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
   * @returns {Promise<Object>} JMON composition
   */
  async convertToJmon(t) {
    const e = await this.initializeTone();
    let n;
    try {
      n = new e.Midi(t);
    } catch (a) {
      throw new Error(`Failed to parse MIDI file: ${a.message}`);
    }
    const r = this.buildJmonComposition(n, e), o = new se(), { valid: i, normalized: s, errors: l } = o.validateAndNormalize(
      r
    );
    return i || console.warn("Generated JMON failed validation:", l), i ? s : r;
  }
  /**
   * Initialize Tone.js instance following music-player.js pattern
   * @returns {Promise<Object>} Tone.js instance
   */
  async initializeTone() {
    const t = this.options.Tone;
    if (typeof window < "u") {
      const e = t || window.Tone || (typeof Tone < "u" ? Tone : null);
      if (e)
        return e;
      try {
        const n = await import("tone");
        return n.default || n;
      } catch {
        throw new Error(
          "Tone.js not found. Please provide Tone instance or load Tone.js"
        );
      }
    } else {
      if (t)
        return t;
      throw new Error("Tone instance required in Node.js environment");
    }
  }
  /**
   * Build JMON composition from parsed MIDI
   * @param {Object} parsed - Parsed MIDI from Tone.js
   * @param {Object} Tone - Tone.js instance
   * @returns {Object} JMON composition
   */
  buildJmonComposition(t, e) {
    const n = {
      format: "jmon",
      version: "1.0",
      tempo: this.extractTempo(t),
      tracks: this.convertTracks(t.tracks, e, t)
    }, r = this.extractTimeSignature(t);
    r && (n.timeSignature = r);
    const o = this.extractKeySignature(t);
    o && (n.keySignature = o);
    const i = this.extractMetadata(t);
    return Object.keys(i).length > 0 && (n.metadata = i), this.options.includeTempo && this.hasTempoChanges(t) && (n.tempoMap = this.extractTempoMap(t)), this.hasTimeSignatureChanges(t) && (n.timeSignatureMap = this.extractTimeSignatureMap(t)), n;
  }
  /**
   * Convert MIDI tracks to JMON tracks
   * @param {Array} tracks - MIDI tracks from Tone.js
   * @param {Object} Tone - Tone.js instance
   * @param {Object} parsed - Full parsed MIDI data
   * @returns {Array} JMON tracks
   */
  convertTracks(t, e, n) {
    const r = [];
    let o = 0;
    for (const i of t) {
      if (!i.notes || i.notes.length === 0)
        continue;
      const s = this.generateTrackName(i, o, n), l = this.isDrumTrack(i), a = i.notes.map(
        (m) => this.convertNote(m, e, i)
      ), d = this.options.quantize ? this.quantizeNotes(a, this.options.quantize) : a, u = {
        label: s,
        notes: d
      };
      if (i.channel !== void 0 && (u.midiChannel = i.channel), i.instrument && (u.synth = {
        type: l ? "Sampler" : "PolySynth",
        options: this.getInstrumentOptions(i.instrument, l)
      }), this.options.includeModulations && i.controlChanges) {
        const m = this.extractModulations(i.controlChanges);
        m.length > 0 && this.applyModulationsToTrack(u, m);
      }
      r.push(u), o++;
    }
    return r;
  }
  /**
   * Convert MIDI note to JMON note
   * @param {Object} note - MIDI note from Tone.js
   * @param {Object} Tone - Tone.js instance
   * @param {Object} track - Parent track for context
   * @returns {Object} JMON note
   */
  convertNote(t, e, n) {
    const r = {
      pitch: t.midi,
      // Use MIDI number as primary format
      time: t.time,
      // Tone.js already converts to seconds, we'll convert to quarters
      duration: this.convertDurationToNoteValue(t.duration),
      velocity: t.velocity
    }, o = t.tempo || 120;
    if (r.time = this.convertSecondsToQuarterNotes(t.time, o), this.options.includeModulations && t.controlChanges) {
      const i = this.convertNoteModulations(t.controlChanges);
      i.length > 0 && (r.modulations = i);
    }
    return r;
  }
  /**
   * Generate track name based on naming strategy
   * @param {Object} track - MIDI track
   * @param {number} index - Track index
   * @param {Object} parsed - Full parsed MIDI
   * @returns {string} Track name
   */
  generateTrackName(t, e, n) {
    switch (this.options.trackNaming) {
      case "numbered":
        return `Track ${e + 1}`;
      case "channel":
        return `Channel ${(t.channel || 0) + 1}`;
      case "instrument":
        return t.instrument ? t.instrument.name || `Instrument ${t.instrument.number}` : `Track ${e + 1}`;
      case "auto":
      default:
        return t.name && t.name.trim() ? t.name.trim() : this.isDrumTrack(t) ? "Drums" : t.instrument && t.instrument.name ? t.instrument.name : t.channel !== void 0 ? t.channel === 9 ? "Drums" : `Channel ${t.channel + 1}` : `Track ${e + 1}`;
    }
  }
  /**
   * Check if track is a drum track (channel 10/9 in MIDI)
   * @param {Object} track - MIDI track
   * @returns {boolean} True if drum track
   */
  isDrumTrack(t) {
    return t.channel === 9;
  }
  /**
   * Get instrument options for synth configuration
   * @param {Object} instrument - MIDI instrument info
   * @param {boolean} isDrum - Whether this is a drum track
   * @returns {Object} Synth options
   */
  getInstrumentOptions(t, e) {
    return e ? {
      envelope: {
        enabled: !0,
        attack: 0.02,
        decay: 0.1,
        sustain: 0.8,
        release: 0.3
      }
    } : {
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.7,
        release: 1
      }
    };
  }
  /**
   * Extract tempo from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {number} BPM
   */
  extractTempo(t) {
    if (t.header && t.header.tempos && t.header.tempos.length > 0)
      return Math.round(t.header.tempos[0].bpm);
    for (const e of t.tracks)
      if (e.tempoEvents && e.tempoEvents.length > 0)
        return Math.round(e.tempoEvents[0].bpm);
    return 120;
  }
  /**
   * Extract time signature from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {string|null} Time signature like "4/4"
   */
  extractTimeSignature(t) {
    if (t.header && t.header.timeSignatures && t.header.timeSignatures.length > 0) {
      const e = t.header.timeSignatures[0];
      return `${e.numerator}/${e.denominator}`;
    }
    for (const e of t.tracks)
      if (e.timeSignatureEvents && e.timeSignatureEvents.length > 0) {
        const n = e.timeSignatureEvents[0];
        return `${n.numerator}/${n.denominator}`;
      }
    return null;
  }
  /**
   * Extract key signature from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {string|null} Key signature like "C", "G", "Dm"
   */
  extractKeySignature(t) {
    return null;
  }
  /**
   * Extract metadata from MIDI
   * @param {Object} parsed - Parsed MIDI
   * @returns {Object} Metadata object
   */
  extractMetadata(t) {
    const e = {};
    for (const n of t.tracks)
      if (n.meta)
        for (const r of n.meta)
          switch (r.type) {
            case "trackName":
            case "text":
              !e.title && r.text && r.text.trim() && (e.title = r.text.trim());
              break;
            case "copyright":
              r.text && r.text.trim() && (e.copyright = r.text.trim());
              break;
            case "composer":
              r.text && r.text.trim() && (e.composer = r.text.trim());
              break;
          }
    return e;
  }
  /**
   * Check if MIDI has tempo changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {boolean} True if has tempo changes
   */
  hasTempoChanges(t) {
    if (t.header && t.header.tempos && t.header.tempos.length > 1)
      return !0;
    for (const e of t.tracks)
      if (e.tempoEvents && e.tempoEvents.length > 1)
        return !0;
    return !1;
  }
  /**
   * Extract tempo map for tempo changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {Array} Tempo map events
   */
  extractTempoMap(t) {
    const e = [], n = [];
    t.header && t.header.tempos && n.push(...t.header.tempos.map((r) => ({
      time: r.time,
      tempo: Math.round(r.bpm)
    })));
    for (const r of t.tracks)
      r.tempoEvents && n.push(...r.tempoEvents.map((o) => ({
        time: o.time,
        tempo: Math.round(o.bpm)
      })));
    n.sort((r, o) => r.time - o.time);
    for (const r of n)
      e.push({
        time: this.convertSecondsToQuarterNotes(r.time, r.tempo),
        tempo: r.tempo
      });
    return e;
  }
  /**
   * Check if MIDI has time signature changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {boolean} True if has time signature changes
   */
  hasTimeSignatureChanges(t) {
    if (t.header && t.header.timeSignatures && t.header.timeSignatures.length > 1)
      return !0;
    for (const e of t.tracks)
      if (e.timeSignatureEvents && e.timeSignatureEvents.length > 1)
        return !0;
    return !1;
  }
  /**
   * Extract time signature map for time signature changes
   * @param {Object} parsed - Parsed MIDI
   * @returns {Array} Time signature map events
   */
  extractTimeSignatureMap(t) {
    const e = [], n = [];
    t.header && t.header.timeSignatures && n.push(...t.header.timeSignatures);
    for (const r of t.tracks)
      r.timeSignatureEvents && n.push(...r.timeSignatureEvents);
    n.sort((r, o) => r.time - o.time);
    for (const r of n)
      e.push({
        time: this.convertSecondsToQuarterNotes(r.time, 120),
        // Use default tempo for conversion
        timeSignature: `${r.numerator}/${r.denominator}`
      });
    return e;
  }
  /**
   * Convert seconds to quarter notes
   * @param {number} seconds - Time in seconds
   * @param {number} bpm - Beats per minute
   * @returns {number} Time in quarter notes
   */
  convertSecondsToQuarterNotes(t, e) {
    const n = 60 / e;
    return t / n;
  }
  /**
   * Convert duration to note value string
   * @param {number} duration - Duration in seconds
   * @returns {string} Note value like "4n", "8n"
   */
  convertDurationToNoteValue(t) {
    const n = t / 0.5;
    return n >= 3.5 ? "1n" : n >= 1.75 ? "2n" : n >= 0.875 ? "4n" : n >= 0.4375 ? "8n" : n >= 0.21875 ? "16n" : n >= 0.109375 ? "32n" : "16n";
  }
  /**
   * Extract modulations from MIDI control changes
   * @param {Object} controlChanges - MIDI CC events
   * @returns {Array} Modulation events
   */
  extractModulations(t) {
    const e = [];
    for (const [n, r] of Object.entries(t)) {
      const o = parseInt(n);
      for (const i of r) {
        const s = {
          type: "cc",
          controller: o,
          value: i.value,
          time: this.convertSecondsToQuarterNotes(i.time, 120)
        };
        e.push(s);
      }
    }
    return e;
  }
  /**
   * Convert note-level modulations
   * @param {Object} controlChanges - Note-level CC events
   * @returns {Array} Note modulation events
   */
  convertNoteModulations(t) {
    return this.extractModulations(t);
  }
  /**
   * Apply modulations to track
   * @param {Object} track - JMON track
   * @param {Array} modulations - Modulation events
   */
  applyModulationsToTrack(t, e) {
    e.length > 0 && (t.automation = [{
      id: "midi_cc",
      target: "midi.cc1",
      // Default to modulation wheel
      anchorPoints: e.map((n) => ({
        time: n.time,
        value: n.value
      }))
    }]);
  }
  /**
   * Quantize notes to grid
   * @param {Array} notes - Notes to quantize
   * @param {number} grid - Grid size in quarter notes
   * @returns {Array} Quantized notes
   */
  quantizeNotes(t, e) {
    return t.map((n) => ({
      ...n,
      time: Math.round(n.time / e) * e
    }));
  }
}
async function kr(c, t = {}) {
  const e = typeof ArrayBuffer < "u" && c instanceof ArrayBuffer, n = typeof Uint8Array < "u" && c instanceof Uint8Array;
  if (!e && !n)
    throw new TypeError("midiToJmon: 'midiData' must be an ArrayBuffer or Uint8Array");
  return await de.convert(c, t);
}
function Sr(c, t = {}) {
  return {
    sampleRate: t.sampleRate || 44100,
    duration: t.duration || 10,
    channels: t.channels || 1,
    tempo: c.tempo || c.bpm || 120,
    notes: c.tracks?.flatMap((e) => e.notes) || []
  };
}
class Ar {
  static convert(t) {
    let n = `// SuperCollider script generated from JMON
// Title: ${t.metadata?.name || "Untitled"}
`;
    return (t.tracks?.[0]?.notes || []).forEach((o) => {
      n += `Synth("default", ["freq", ${o.pitch}, "dur", ${o.duration}]);
`;
    }), n;
  }
}
function Pr(c) {
  return Ar.convert(c);
}
function Er(c) {
  const t = [];
  if (!Array.isArray(c)) return t;
  for (const e of c)
    typeof e == "string" ? t.push({ type: e }) : e && typeof e == "object" && typeof e.type == "string" && t.push({ ...e });
  return t;
}
function Be(c) {
  const t = c.has("staccato"), e = c.has("marcato"), n = c.has("tenuto"), r = !e && c.has("accent");
  return { staccato: t, accent: r, tenuto: n, marcato: e };
}
function Nr(c) {
  const t = [];
  return c.staccato && t.push("a."), c.accent && t.push("a>"), c.tenuto && t.push("a-"), c.marcato && t.push("a^"), t;
}
function Cr(c, t = {}) {
  const e = t.includeFermata !== !1, n = [], r = new Set(c.map((s) => s.type)), o = Be(r);
  o.staccato && n.push("!staccato!"), o.accent && n.push("!accent!"), o.tenuto && n.push("!tenuto!"), o.marcato && n.push("!marcato!");
  const i = (s) => r.has(s);
  return e && i("fermata") && n.push("!fermata!"), i("trill") && n.push("!trill!"), i("mordent") && n.push("!mordent!"), i("turn") && n.push("!turn!"), i("arpeggio") && n.push("!arpeggio!"), (i("glissando") || i("portamento")) && n.push("!slide!"), n;
}
function Rr(c) {
  const t = c.find((r) => r.type === "stroke") || c.find((r) => r.type === "arpeggio") || c.find((r) => r.type === "arpeggiate");
  if (!t) return null;
  const e = typeof t.direction == "string" && t.direction.toLowerCase() === "down" ? "down" : "up", n = typeof t.style == "string" && t.style.toLowerCase() === "brush" ? "brush" : "roll";
  return { direction: e, style: n };
}
function Ir(c) {
  const t = c.find((r) => r.type === "glissando" || r.type === "portamento");
  if (!t) return null;
  const e = t.type === "portamento" ? "port." : "gliss.", n = { type: t.type, text: e };
  return typeof t.target == "number" && (n.target = t.target), typeof t.curve == "string" && (n.curve = t.curve), n;
}
function jr(c, t = {}) {
  const e = Er(c), n = new Set(e.map((a) => a.type)), r = Be(n), o = Cr(e, t.abc), i = Nr(r), s = Rr(e), l = Ir(e);
  return {
    has: n,
    abc: { decorations: o },
    vexflow: {
      articulations: i,
      stroke: s,
      gliss: l
    }
  };
}
class $r {
  constructor() {
    this.noteMap = {
      60: "C/4",
      61: "C#/4",
      62: "D/4",
      63: "D#/4",
      64: "E/4",
      65: "F/4",
      66: "F#/4",
      67: "G/4",
      68: "G#/4",
      69: "A/4",
      70: "A#/4",
      71: "B/4",
      72: "C/5",
      73: "C#/5",
      74: "D/5",
      75: "D#/5",
      76: "E/5",
      77: "F/5",
      78: "F#/5",
      79: "G/5",
      80: "G#/5",
      81: "A/5",
      82: "A#/5",
      83: "B/5"
    };
  }
  /**
   * Convert MIDI note number to VexFlow pitch notation
   */
  midiToVexFlow(t) {
    if (this.noteMap[t])
      return this.noteMap[t];
    const e = Math.floor(t / 12) - 1;
    return `${[
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B"
    ][t % 12]}/${e}`;
  }
  /**
   * Convert duration to VexFlow duration string
   */
  durationToVexFlow(t) {
    return t >= 4 ? "w" : t >= 2 ? "h" : t >= 1 ? "q" : t >= 0.5 ? "8" : t >= 0.25 ? "16" : "32";
  }
  /**
   * Convert JMON composition to VexFlow format
   */
  convertToVexFlow(t) {
    const e = {
      timeSignature: t.timeSignature || "4/4",
      keySignature: t.keySignature || "C",
      clef: t.clef,
      metadata: t.metadata || {},
      tempo: t.tempo ?? t.bpm ?? null,
      tracks: []
    };
    let n = [];
    return Array.isArray(t.tracks) ? n = t.tracks.map((r, o) => ({
      name: r.name || `Track ${o + 1}`,
      notes: r.notes || r,
      clef: r.clef
    })) : t.tracks && typeof t.tracks == "object" ? n = Object.entries(t.tracks).map(([r, o], i) => ({
      name: r || `Track ${i + 1}`,
      notes: o,
      clef: o && o.clef || void 0
    })) : t.notes ? n = [{
      name: t.name || "Track 1",
      notes: t.notes,
      clef: t.clef
    }] : n = [{
      name: "Track 1",
      notes: t,
      clef: t.clef
    }], n.forEach((r, o) => {
      const i = r.notes || r, s = [];
      Array.isArray(i) && i.forEach((l) => {
        const a = Array.isArray(l.pitch) ? l.pitch : l.pitch !== null && l.pitch !== void 0 ? [l.pitch] : [];
        if (a.length > 0) {
          const d = {
            keys: a.map(
              (u) => String(this.midiToVexFlow(u)).toLowerCase()
            ),
            duration: this.durationToVexFlow(l.duration || 1),
            time: l.time ?? 0
          };
          if (l.articulation || Array.isArray(l.articulations) && l.articulations.length) {
            if (l.articulation && typeof l.articulation == "string")
              d.articulations = [l.articulation];
            else if (Array.isArray(l.articulations) && l.articulations.length) {
              const u = jr(l.articulations);
              if (u && u.vexflow && (Array.isArray(u.vexflow.articulations) && u.vexflow.articulations.length && (d.vfArticulations = u.vexflow.articulations.slice()), u.vexflow.stroke && (d.stroke = { ...u.vexflow.stroke }), u.vexflow.gliss)) {
                const m = u.vexflow.gliss;
                try {
                  d.gliss = {
                    type: m.type,
                    targetKey: typeof m.target == "number" ? String(this.midiToVexFlow(m.target)).toLowerCase() : void 0,
                    curve: m.curve || "linear",
                    text: m.text || (m.type === "portamento" ? "port." : "gliss.")
                  };
                } catch {
                }
              }
            }
          }
          Array.isArray(l.ornaments) && l.ornaments.length && (d.ornaments = l.ornaments.map((u) => {
            const m = { type: u.type };
            return u.parameters && (m.parameters = { ...u.parameters }, u.type === "grace_note" && u.parameters.gracePitches && (m.parameters.gracePitches = u.parameters.gracePitches.map((p) => typeof p == "number" ? this.midiToVexFlow(p) : p))), m;
          })), s.push(d);
        } else
          s.push({
            keys: [],
            duration: this.durationToVexFlow(l.duration || 1),
            time: l.time ?? 0,
            isRest: !0
          });
      }), e.tracks.push({
        name: r.name || `Track ${o + 1}`,
        notes: s,
        clef: r.clef
      });
    }), e;
  }
  /**
   * Create VexFlow renderer configuration
   */
  createRenderer(t, e = 800, n = 200) {
    return {
      elementId: t,
      width: e,
      height: n,
      renderer: "svg",
      // or 'canvas'
      scale: 1
    };
  }
  /**
   * Generate VexFlow rendering instructions
   */
  generateRenderingInstructions(t, e) {
    return {
      type: "vexflow",
      data: t,
      config: e,
      render: function(n) {
        let o = e.element && e.element.nodeType === 1 ? e.element : e.elementId ? document.getElementById(e.elementId) : null;
        const i = document.body || document.documentElement;
        o ? (o.id || (o.id = e.elementId || `vexflow-${Date.now()}`), i.contains(o) || i.appendChild(o)) : (o = document.createElement("div"), o.id = e.elementId || `vexflow-${Date.now()}`, i.appendChild(o)), e.elementId = o.id;
        const s = (() => {
          const l = [
            n,
            n && n.default,
            typeof window < "u" && (window.VF || window.VexFlow),
            typeof window < "u" && window.Vex && (window.Vex.Flow || window.Vex)
          ];
          for (const a of l)
            if (a) return a;
          return null;
        })();
        try {
          const l = s && (s.Factory || s.Flow && s.Flow.Factory || s.VF && s.VF.Factory);
          if (!l)
            throw new Error("VexFlow Factory API not available on this build");
          const d = new l({
            renderer: {
              // Use elementId for VexFlow Factory (falls back to generated div id)
              elementId: e.elementId || o.id,
              width: e.width,
              height: e.height
            }
          }).getContext(), u = s && (s.Flow || s) || {}, m = e.accidentalsMode || "auto", M = ((b) => {
            const h = (b || "C").trim(), w = {
              C: 0,
              G: 1,
              D: 2,
              A: 3,
              E: 4,
              B: 5,
              "F#": 6,
              "C#": 7
            }, y = {
              C: 0,
              F: 1,
              Bb: 2,
              Eb: 3,
              Ab: 4,
              Db: 5,
              Gb: 6,
              Cb: 7
            }, g = {
              A: 0,
              E: 1,
              B: 2,
              "F#": 3,
              "C#": 4,
              "G#": 5,
              "D#": 6,
              "A#": 7
            }, v = {
              A: 0,
              D: 1,
              G: 2,
              C: 3,
              F: 4,
              Bb: 5,
              Eb: 6,
              Ab: 7
            }, T = ["f", "c", "g", "d", "a", "e", "b"], x = ["b", "e", "a", "d", "g", "c", "f"], I = /m(in)?$/i.test(h), E = h.replace(/m(in)?$/i, "");
            let L = 0, _ = "natural";
            I && g[E] !== void 0 ? (L = g[E], _ = "sharp") : I && v[E] !== void 0 ? (L = v[E], _ = "flat") : w[E] !== void 0 ? (L = w[E], _ = "sharp") : y[E] !== void 0 && (L = y[E], _ = "flat");
            const H = {
              a: "natural",
              b: "natural",
              c: "natural",
              d: "natural",
              e: "natural",
              f: "natural",
              g: "natural"
            };
            if (_ === "sharp")
              for (let U = 0; U < L; U++) H[T[U]] = "sharp";
            if (_ === "flat")
              for (let U = 0; U < L; U++) H[x[U]] = "flat";
            return H;
          })(t.keySignature), f = (b) => {
            const h = String(b).replace(/r/g, "");
            return { w: 32, h: 16, q: 8, 8: 4, 16: 2, 32: 1 }[h] || 0;
          }, F = ((b) => {
            const [h, w] = (b || "4/4").split("/").map((y) => parseInt(y, 10));
            return { n: h || 4, d: w || 4 };
          })(t.timeSignature), B = Math.max(1, Math.round(32 * F.n / F.d)), G = (b) => ({ 32: "w", 16: "h", 8: "q", 4: "8", 2: "16", 1: "32" })[b] || "q", V = [];
          let X = [], Q = (() => {
            const h = (t.tracks[0].notes || []).reduce(
              (y, g) => Math.min(y, g.time ?? 0),
              Number.POSITIVE_INFINITY
            ), w = h === Number.POSITIVE_INFINITY ? 0 : h;
            return Math.round(w * 8 % B);
          })();
          const bt = t.tracks[0].notes, rt = [];
          for (const b of bt) {
            const h = f(b.duration);
            if (!!b.grace) {
              rt.push(b);
              continue;
            }
            let y = h, g = !0;
            for (; y > 0; ) {
              const v = B - Q, T = Math.min(y, v), x = { ...b, duration: G(T) };
              g && rt.length && (x.graceNotes = rt.splice(0, rt.length)), g || (x.tieFromPrev = !0), T < y && (x.tieToNext = !0), X.push(x), Q += T, y -= T, g = !1, Q >= B && (V.push(X), X = [], Q = 0);
            }
          }
          X.length && V.push(X);
          const ot = 10, At = 10, Pt = 40, K = Math.max(
            100,
            (e.width || 800) - ot - At
          ), mt = Math.max(1, V.length), ft = Math.max(100, Math.floor(K / mt)), Tt = (b) => {
            const h = /^([a-g])(b|#)?\/(-?\d+)$/.exec(b);
            if (!h) return 60;
            const y = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[h[1]], g = h[2] === "#" ? 1 : h[2] === "b" ? -1 : 0;
            return (parseInt(h[3], 10) + 1) * 12 + y + g;
          }, pt = [];
          V.forEach((b) => {
            b.forEach((h) => {
              h && !h.isRest && Array.isArray(h.keys) && h.keys[0] && pt.push(Tt(String(h.keys[0]).toLowerCase()));
            });
          });
          const ht = (pt.length ? (() => {
            const b = [...pt].sort((w, y) => w - y), h = b.length / 2;
            return b.length % 2 ? b[Math.floor(h)] : (b[h - 1] + b[h]) / 2;
          })() : 60) < 60 ? "bass" : "treble", Z = e.measuresPerLine && e.measuresPerLine > 0 ? Math.max(1, Math.floor(e.measuresPerLine)) : Math.max(
            1,
            Math.floor(
              K / Math.max(120, Math.floor(K / Math.max(1, mt)))
            )
          ), xt = [];
          for (let b = 0; b < V.length; b += Z)
            xt.push(V.slice(b, b + Z));
          const Y = 80, at = [], J = [];
          xt.forEach((b, h) => {
            const w = Pt + h * Y, y = new u.Stave(ot, w, K), v = ((E) => {
              const L = (E || "").toString().toLowerCase();
              return {
                g: "treble",
                treble: "treble",
                f: "bass",
                bass: "bass",
                c: "alto",
                alto: "alto",
                tenor: "tenor",
                "treble-8vb": "treble-8vb",
                "treble-8va": "treble-8va",
                "bass-8vb": "bass-8vb"
              }[L] || "treble";
            })(
              t.clef || t.tracks && t.tracks[0] && t.tracks[0].clef || ht
            );
            if (y.addClef(v), t.timeSignature && h === 0 && y.addTimeSignature(t.timeSignature), t.keySignature && t.keySignature !== "C" && h === 0 && y.addKeySignature(t.keySignature), y.setContext(d).draw(), h === 0)
              try {
                const E = t.metadata && t.metadata.title;
                if (E && (d.save(), d.setFont("bold 16px Arial"), d.fillText(E, ot, w - 20), d.restore()), t.tempo) {
                  d.save(), d.setFont("12px Arial");
                  const L = `♩ = ${t.tempo}`;
                  d.fillText(L, ot + 200, w - 8), d.restore();
                }
              } catch {
              }
            const T = [];
            b.forEach((E, L) => {
              E.slice().sort(
                (H, U) => (H.time ?? 0) - (U.time ?? 0)
              ).forEach((H) => {
                if (H.isRest)
                  T.push(
                    new u.StaveNote({
                      keys: ["d/5"],
                      duration: String(H.duration).replace(/r?$/, "r")
                    })
                  );
                else {
                  const U = new u.StaveNote({
                    keys: H.keys.map((Ht) => Ht.toLowerCase()),
                    duration: H.duration
                  });
                  T.push(U), J.push({ vf: U, data: H });
                }
              }), L < b.length - 1 && u.BarNote && u.Barline && u.Barline.type && T.push(new u.BarNote(u.Barline.type.SINGLE));
            });
            const x = new u.Voice({
              num_beats: Math.max(1, b.length) * B,
              beat_value: 32
            });
            x.setMode && u.Voice && u.Voice.Mode && u.Voice.Mode.SOFT !== void 0 ? x.setMode(u.Voice.Mode.SOFT) : typeof x.setStrict == "function" && x.setStrict(!1), x.addTickables(
              T.filter(
                (E) => typeof E.getTicks == "function" ? E.getTicks().value() > 0 : !0
              )
            ), new u.Formatter().joinVoices([x]).format([x], K - 20), x.draw(d, y);
          });
          const ct = [];
          V.forEach((b, h) => {
            const w = b.slice().sort(
              (y, g) => (y.time ?? 0) - (g.time ?? 0)
            ).map((y) => {
              if (y.isRest)
                return new u.StaveNote({
                  keys: ["d/5"],
                  duration: String(y.duration).replace(/r?$/, "r")
                });
              const g = new u.StaveNote({
                keys: y.keys.map((T) => T.toLowerCase()),
                duration: y.duration
              });
              if (y.graceNotes && u.GraceNoteGroup && u.GraceNote)
                try {
                  const T = y.graceNotes.map(
                    (I) => new u.GraceNote({
                      keys: (I.keys || []).map(
                        (E) => String(E).toLowerCase()
                      ),
                      duration: "16",
                      slash: !0
                    })
                  ), x = new u.GraceNoteGroup(T, !0);
                  typeof x.beamNotes == "function" && x.beamNotes(), typeof x.setContext == "function" && typeof x.attachToNote == "function" && (x.setContext(d), x.attachToNote(g));
                } catch {
                }
              if (Array.isArray(y.ornaments) && y.ornaments.length && u.GraceNoteGroup && u.GraceNote) {
                const T = y.ornaments.filter((x) => x.type === "grace_note");
                if (T.length > 0)
                  try {
                    const x = T.flatMap((I) => I.parameters && I.parameters.gracePitches ? I.parameters.gracePitches.map(
                      (E) => new u.GraceNote({
                        keys: [String(E).toLowerCase()],
                        duration: "16",
                        slash: I.parameters.graceNoteType === "acciaccatura"
                      })
                    ) : []);
                    if (x.length > 0) {
                      const I = new u.GraceNoteGroup(x, !0);
                      typeof I.beamNotes == "function" && I.beamNotes(), typeof I.setContext == "function" && typeof I.attachToNote == "function" && (I.setContext(d), I.attachToNote(g));
                    }
                  } catch (x) {
                    console.warn("Failed to render grace note ornaments:", x);
                  }
              }
              u.Accidental && y.keys.forEach((T, x) => {
                const I = T.toLowerCase(), E = /^([a-g])(#{1,2}|b{1,2})?\/-?\d+$/.exec(I), L = E ? E[1] : I[0], _ = E && E[2] ? E[2].includes("#") ? "#" : "b" : "", H = M[L] || "natural";
                let U = null;
                _ === "#" && H !== "sharp" ? U = "#" : _ === "b" && H !== "flat" && (U = "b"), U && (typeof g.addAccidental == "function" ? g.addAccidental(x, new u.Accidental(U)) : typeof g.addModifier == "function" && g.addModifier(new u.Accidental(U), x));
              });
              const v = {
                staccato: "a.",
                accent: "a>",
                tenuto: "a-",
                marcato: "a^",
                legato: "a-"
                // similar to tenuto for VexFlow
              };
              if (Array.isArray(y.vfArticulations) && y.vfArticulations.length ? y.vfArticulations.forEach((T) => {
                if (u && u.Articulation && u.Modifier && u.Modifier.Position && (typeof g.addArticulation == "function" || typeof g.addModifier == "function")) {
                  const x = new u.Articulation(T);
                  x && typeof x.setPosition == "function" && x.setPosition(u.Modifier.Position.ABOVE), typeof g.addArticulation == "function" ? g.addArticulation(0, x) : typeof g.addModifier == "function" && g.addModifier(x, 0);
                }
              }) : Array.isArray(y.articulations) && y.articulations.forEach((T) => {
                const x = typeof T == "string" ? T : T && T.type, I = v[x] || null;
                if (I && u && u.Articulation && u.Modifier && u.Modifier.Position && (typeof g.addArticulation == "function" || typeof g.addModifier == "function")) {
                  const E = new u.Articulation(I);
                  E && typeof E.setPosition == "function" && E.setPosition(u.Modifier.Position.ABOVE), typeof g.addArticulation == "function" ? g.addArticulation(0, E) : typeof g.addModifier == "function" && g.addModifier(E, 0);
                }
              }), y.stroke && u && u.Stroke)
                try {
                  const T = (y.stroke.direction || "up").toLowerCase(), x = (y.stroke.style || "roll").toLowerCase(), I = u.Stroke.Type && (x === "brush" ? T === "down" ? u.Stroke.Type.BRUSH_DOWN : u.Stroke.Type.BRUSH_UP : T === "down" ? u.Stroke.Type.ROLL_DOWN : u.Stroke.Type.ROLL_UP);
                  I && typeof g.addStroke == "function" && g.addStroke(0, new u.Stroke(I));
                } catch {
                }
              return g;
            });
            if (w.forEach((y, g) => {
              const v = b[g];
              if (!v || v.isRest) return;
              const T = typeof v.dots == "number" ? v.dots : v.dots === !0 || v.dot === !0 || v.dotted === !0 ? 1 : 0;
              for (let x = 0; x < T; x++)
                typeof y.addDotToAll == "function" ? y.addDotToAll() : u.Dot && v.keys.forEach((I, E) => {
                  typeof y.addModifier == "function" && y.addModifier(new u.Dot(), E);
                });
              J.push({ vf: y, data: v });
            }), ct.push(...w), u.Beam && typeof u.Beam.generateBeams == "function") {
              const y = w.filter(
                (g) => typeof g.isRest != "function" || !g.isRest()
              );
              try {
                const g = u.Beam.generateBeams(y);
                g.forEach((v) => v.setContext(d)), at.push(...g);
              } catch {
              }
            }
            h < V.length - 1 && u.BarNote && u.Barline && u.Barline.type && ct.push(new u.BarNote(u.Barline.type.SINGLE));
          });
          const A = V.length * B, P = new u.Voice({
            num_beats: A,
            beat_value: 32
          });
          P.setMode && u.Voice && u.Voice.Mode && u.Voice.Mode.SOFT !== void 0 ? P.setMode(u.Voice.Mode.SOFT) : typeof P.setStrict == "function" && P.setStrict(!1), P.addTickables(
            ct.filter(
              (b) => typeof b.getTicks == "function" ? b.getTicks().value() > 0 : !0
            )
          ), at.length && at.forEach((b) => {
            try {
              b.draw();
            } catch {
            }
          });
          try {
            const b = document.createElement("details");
            b.style.marginTop = "10px";
            const h = document.createElement("summary");
            h.textContent = "VexFlow Source", h.style.cursor = "pointer", b.appendChild(h);
            const w = document.createElement("pre");
            w.textContent = JSON.stringify(t, null, 2), b.appendChild(w);
          } catch {
          }
          if (J.length && u.StaveTie)
            for (let b = 0; b < J.length - 1; b++) {
              const h = J[b];
              if (!h) continue;
              const w = h.data || {};
              if (!!!(w.tieToNext || w.tieStart || w.tie === "start")) continue;
              let g = null;
              for (let v = b + 1; v < J.length; v++)
                if (J[v]) {
                  g = J[v];
                  break;
                }
              if (g)
                try {
                  new u.StaveTie({
                    first_note: h.vf,
                    last_note: g.vf,
                    first_indices: [0],
                    last_indices: [0]
                  }).setContext(d).draw();
                } catch {
                }
            }
          if (J.length && u && u.Glissando)
            for (let b = 0; b < J.length - 1; b++) {
              const h = J[b];
              if (!h || !h.data || !h.vf) continue;
              const w = h.data.gliss;
              if (!w) continue;
              let y = null;
              if (w.targetKey)
                for (let g = b + 1; g < J.length; g++) {
                  const v = J[g];
                  if (v && v.data && Array.isArray(v.data.keys) && v.data.keys.some(
                    (x) => String(x).toLowerCase() === String(w.targetKey).toLowerCase()
                  )) {
                    y = v;
                    break;
                  }
                }
              if (!y) {
                for (let g = b + 1; g < J.length; g++)
                  if (J[g]) {
                    y = J[g];
                    break;
                  }
              }
              if (y && y.vf)
                try {
                  const g = new u.Glissando({
                    from: h.vf,
                    to: y.vf,
                    text: w.text || (w.type === "portamento" ? "port." : "gliss.")
                  });
                  g && typeof g.setContext == "function" && g.setContext(d).draw();
                } catch {
                }
            }
        } catch (l) {
          console.warn(
            "Factory API failed, trying low-level API:",
            l
          );
          const a = s && (s.Flow || s.VF || s) || {};
          e.accidentalsMode;
          const u = ((A) => {
            const P = (A || "C").trim(), b = {
              C: 0,
              G: 1,
              D: 2,
              A: 3,
              E: 4,
              B: 5,
              "F#": 6,
              "C#": 7
            }, h = {
              C: 0,
              F: 1,
              Bb: 2,
              Eb: 3,
              Ab: 4,
              Db: 5,
              Gb: 6,
              Cb: 7
            }, w = {
              A: 0,
              E: 1,
              B: 2,
              "F#": 3,
              "C#": 4,
              "G#": 5,
              "D#": 6,
              "A#": 7
            }, y = {
              A: 0,
              D: 1,
              G: 2,
              C: 3,
              F: 4,
              Bb: 5,
              Eb: 6,
              Ab: 7
            }, g = ["f", "c", "g", "d", "a", "e", "b"], v = ["b", "e", "a", "d", "g", "c", "f"], T = /m(in)?$/i.test(P), x = P.replace(/m(in)?$/i, "");
            let I = 0, E = "natural";
            T && w[x] !== void 0 ? (I = w[x], E = "sharp") : T && y[x] !== void 0 ? (I = y[x], E = "flat") : b[x] !== void 0 ? (I = b[x], E = "sharp") : h[x] !== void 0 && (I = h[x], E = "flat");
            const L = {
              a: "natural",
              b: "natural",
              c: "natural",
              d: "natural",
              e: "natural",
              f: "natural",
              g: "natural"
            };
            if (E === "sharp")
              for (let _ = 0; _ < I; _++) L[g[_]] = "sharp";
            if (E === "flat")
              for (let _ = 0; _ < I; _++) L[v[_]] = "flat";
            return L;
          })(t.keySignature), m = a && a.Renderer || s.Renderer || s.Flow && s.Flow.Renderer;
          if (!m || !m.Backends)
            throw new Error(
              "VexFlow low-level API not available (Renderer missing)"
            );
          const p = new m(
            o,
            m.Backends.SVG
          );
          p.resize(e.width, e.height);
          const M = p.getContext(), f = (A) => {
            const P = String(A).replace(/r/g, "");
            return { w: 32, h: 16, q: 8, 8: 4, 16: 2, 32: 1 }[P] || 0;
          }, F = ((A) => {
            const [P, b] = (A || "4/4").split("/").map((h) => parseInt(h, 10));
            return { n: P || 4, d: b || 4 };
          })(t.timeSignature), B = Math.max(1, Math.round(32 * F.n / F.d)), G = (A) => ({ 32: "w", 16: "h", 8: "q", 4: "8", 2: "16", 1: "32" })[A] || "q", V = [];
          let X = [], Q = (() => {
            const P = (t.tracks[0].notes || []).reduce(
              (h, w) => Math.min(h, w.time ?? 0),
              Number.POSITIVE_INFINITY
            ), b = P === Number.POSITIVE_INFINITY ? 0 : P;
            return Math.round(b * 8 % B);
          })();
          const bt = t.tracks[0].notes, rt = [];
          for (const A of bt) {
            const P = f(A.duration);
            if (!!A.grace) {
              rt.push(A);
              continue;
            }
            let h = P, w = !0;
            for (; h > 0; ) {
              const y = B - Q, g = Math.min(h, y), v = { ...A, duration: G(g) };
              w && rt.length && (v.graceNotes = rt.splice(0, rt.length)), w || (v.tieFromPrev = !0), g < h && (v.tieToNext = !0), X.push(v), Q += g, h -= g, w = !1, Q >= B && (V.push(X), X = [], Q = 0);
            }
          }
          X.length && V.push(X);
          const ot = 10, At = 10, Pt = 40, K = Math.max(
            100,
            (e.width || 800) - ot - At
          ), mt = (A) => {
            const P = /^([a-g])(b|#)?\/(-?\d+)$/.exec(A);
            if (!P) return 60;
            const h = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[P[1]], w = P[2] === "#" ? 1 : P[2] === "b" ? -1 : 0;
            return (parseInt(P[3], 10) + 1) * 12 + h + w;
          }, ft = [];
          V.forEach((A) => {
            A.forEach((P) => {
              P && !P.isRest && Array.isArray(P.keys) && P.keys[0] && ft.push(
                mt(String(P.keys[0]).toLowerCase())
              );
            });
          });
          const pt = (ft.length ? (() => {
            const A = [...ft].sort((b, h) => b - h), P = A.length / 2;
            return A.length % 2 ? A[Math.floor(P)] : (A[P - 1] + A[P]) / 2;
          })() : 60) < 60 ? "bass" : "treble", lt = e.measuresPerLine && e.measuresPerLine > 0 ? Math.max(1, Math.floor(e.measuresPerLine)) : Math.max(
            1,
            Math.floor(
              K / Math.max(
                120,
                Math.floor(K / Math.max(1, V.length))
              )
            )
          ), ht = [];
          for (let A = 0; A < V.length; A += lt)
            ht.push(V.slice(A, A + lt));
          const Z = 80, xt = [], Y = [];
          ht.forEach((A, P) => {
            const b = Pt + P * Z, h = new a.Stave(ot, b, K), y = ((x) => {
              const I = x.toString().toLowerCase();
              return {
                g: "treble",
                treble: "treble",
                f: "bass",
                bass: "bass",
                c: "alto",
                alto: "alto",
                tenor: "tenor",
                "treble-8vb": "treble-8vb",
                "treble-8va": "treble-8va",
                "bass-8vb": "bass-8vb"
              }[I] || "treble";
            })(
              t.clef || t.tracks && t.tracks[0] && t.tracks[0].clef || pt
            );
            if (h.addClef(y), t.timeSignature && P === 0 && h.addTimeSignature(t.timeSignature), t.keySignature && t.keySignature !== "C" && P === 0 && h.addKeySignature(t.keySignature), h.setContext(M).draw(), P === 0)
              try {
                const x = t.metadata && t.metadata.title;
                if (x && (M.save(), M.setFont("bold 16px Arial"), M.fillText(x, ot, b - 20), M.restore()), t.tempo) {
                  M.save(), M.setFont("12px Arial");
                  const I = `♩ = ${t.tempo}`;
                  M.fillText(I, ot + 200, b - 8), M.restore();
                }
              } catch {
              }
            const g = [];
            A.forEach((x, I) => {
              x.slice().sort(
                (L, _) => (L.time ?? 0) - (_.time ?? 0)
              ).forEach((L) => {
                if (L.isRest)
                  g.push(
                    new a.StaveNote({
                      keys: ["d/5"],
                      duration: String(L.duration).replace(/r?$/, "r")
                    })
                  );
                else {
                  const _ = new a.StaveNote({
                    keys: L.keys.map((H) => H.toLowerCase()),
                    duration: L.duration
                  });
                  g.push(_), Y.push({ vf: _, data: L });
                }
              }), I < A.length - 1 && a.BarNote && a.Barline && a.Barline.type && g.push(new a.BarNote(a.Barline.type.SINGLE));
            });
            const v = new a.Voice({
              num_beats: Math.max(1, A.length) * B,
              beat_value: 32
            });
            v.setMode && a.Voice && a.Voice.Mode && a.Voice.Mode.SOFT !== void 0 ? v.setMode(a.Voice.Mode.SOFT) : typeof v.setStrict == "function" && v.setStrict(!1), v.addTickables(
              g.filter(
                (x) => typeof x.getTicks == "function" ? x.getTicks().value() > 0 : !0
              )
            ), new a.Formatter().joinVoices([v]).format([v], K - 20), v.draw(M, h);
          });
          const at = [];
          V.forEach((A, P) => {
            const b = A.slice().sort(
              (h, w) => (h.time ?? 0) - (w.time ?? 0)
            ).map((h) => {
              if (h.isRest)
                return new a.StaveNote({
                  keys: ["d/5"],
                  duration: String(h.duration).replace(/r?$/, "r")
                });
              const w = new a.StaveNote({
                keys: h.keys.map((g) => g.toLowerCase()),
                duration: h.duration
              });
              if (h.graceNotes && a.GraceNoteGroup && a.GraceNote)
                try {
                  const g = h.graceNotes.map(
                    (T) => new a.GraceNote({
                      keys: (T.keys || []).map(
                        (x) => String(x).toLowerCase()
                      ),
                      duration: "16",
                      slash: !0
                    })
                  ), v = new a.GraceNoteGroup(g, !0);
                  typeof v.beamNotes == "function" && v.beamNotes(), typeof v.setContext == "function" && typeof v.attachToNote == "function" && (v.setContext(M), v.attachToNote(w));
                } catch {
                }
              if (Array.isArray(h.ornaments) && h.ornaments.length && a.GraceNoteGroup && a.GraceNote) {
                const g = h.ornaments.filter((v) => v.type === "grace_note");
                if (g.length > 0)
                  try {
                    const v = g.flatMap((T) => T.parameters && T.parameters.gracePitches ? T.parameters.gracePitches.map(
                      (x) => new a.GraceNote({
                        keys: [String(x).toLowerCase()],
                        duration: "16",
                        slash: T.parameters.graceNoteType === "acciaccatura"
                      })
                    ) : []);
                    if (v.length > 0) {
                      const T = new a.GraceNoteGroup(v, !0);
                      typeof T.beamNotes == "function" && T.beamNotes(), typeof T.setContext == "function" && typeof T.attachToNote == "function" && (T.setContext(M), T.attachToNote(w));
                    }
                  } catch (v) {
                    console.warn("Failed to render grace note ornaments:", v);
                  }
              }
              a.Accidental && h.keys.forEach((g, v) => {
                const T = g.toLowerCase(), x = /^([a-g])(#{1,2}|b{1,2})?\/-?\d+$/.exec(T), I = x ? x[1] : T[0], E = x && x[2] ? x[2].includes("#") ? "#" : "b" : "", L = u[I] || "natural";
                let _ = null;
                E === "#" && L !== "sharp" ? _ = "#" : E === "b" && L !== "flat" && (_ = "b"), _ && (typeof w.addAccidental == "function" ? w.addAccidental(v, new a.Accidental(_)) : typeof w.addModifier == "function" && w.addModifier(new a.Accidental(_), v));
              });
              const y = {
                staccato: "a.",
                accent: "a>",
                tenuto: "a-",
                marcato: "a^",
                legato: "a-"
                // similar to tenuto for VexFlow
              };
              return Array.isArray(h.vfArticulations) && h.vfArticulations.length ? h.vfArticulations.forEach((g) => {
                if (a && a.Articulation && a.Modifier && a.Modifier.Position && (typeof w.addArticulation == "function" || typeof w.addModifier == "function")) {
                  const v = new a.Articulation(g);
                  v && typeof v.setPosition == "function" && v.setPosition(a.Modifier.Position.ABOVE), typeof w.addArticulation == "function" ? w.addArticulation(0, v) : typeof w.addModifier == "function" && w.addModifier(v, 0);
                }
              }) : Array.isArray(h.articulations) && h.articulations.forEach((g) => {
                const v = typeof g == "string" ? g : g && g.type, T = y[v] || null;
                if (T && a && a.Articulation && a.Modifier && a.Modifier.Position && (typeof w.addArticulation == "function" || typeof w.addModifier == "function")) {
                  const x = new a.Articulation(T);
                  x && typeof x.setPosition == "function" && x.setPosition(a.Modifier.Position.ABOVE), typeof w.addArticulation == "function" ? w.addArticulation(0, x) : typeof w.addModifier == "function" && w.addModifier(x, 0);
                }
              }), w;
            });
            if (b.forEach((h, w) => {
              const y = A[w];
              if (!y || y.isRest) return;
              const g = typeof y.dots == "number" ? y.dots : y.dots === !0 || y.dot === !0 || y.dotted === !0 ? 1 : 0;
              for (let v = 0; v < g; v++)
                typeof h.addDotToAll == "function" ? h.addDotToAll() : a.Dot && y.keys.forEach((T, x) => {
                  typeof h.addModifier == "function" && h.addModifier(new a.Dot(), x);
                });
              Y.push({ vf: h, data: y });
            }), at.push(...b), a.Beam && typeof a.Beam.generateBeams == "function") {
              const h = b.filter(
                (w) => typeof w.isRest != "function" || !w.isRest()
              );
              try {
                const w = a.Beam.generateBeams(h);
                w.forEach((y) => y.setContext(M)), xt.push(...w);
              } catch {
              }
            }
            P < V.length - 1 && a.BarNote && a.Barline && a.Barline.type && at.push(new a.BarNote(a.Barline.type.SINGLE));
          });
          const J = V.length * B, ct = new a.Voice({
            num_beats: J,
            beat_value: 32
          });
          if (ct.setMode && a.Voice && a.Voice.Mode && a.Voice.Mode.SOFT !== void 0 ? ct.setMode(a.Voice.Mode.SOFT) : typeof ct.setStrict == "function" && ct.setStrict(!1), ct.addTickables(
            at.filter(
              (A) => typeof A.getTicks == "function" ? A.getTicks().value() > 0 : !0
            )
          ), xt.length && xt.forEach((A) => {
            try {
              A.draw();
            } catch {
            }
          }), Y.length && a.StaveTie)
            for (let A = 0; A < Y.length - 1; A++) {
              const P = Y[A];
              if (!P) continue;
              const b = P.data || {};
              if (!!!(b.tieToNext || b.tieStart || b.tie === "start")) continue;
              let w = null;
              for (let y = A + 1; y < Y.length; y++)
                if (Y[y]) {
                  w = Y[y];
                  break;
                }
              if (w)
                try {
                  new a.StaveTie({
                    first_note: P.vf,
                    last_note: w.vf,
                    first_indices: [0],
                    last_indices: [0]
                  }).setContext(M).draw();
                } catch {
                }
            }
        }
      }
    };
  }
}
function Ge(c, t = {}) {
  const e = new $r(), n = e.convertToVexFlow(c);
  if (t.elementId) {
    const r = e.createRenderer(
      t.elementId,
      t.width,
      t.height
    );
    return e.generateRenderingInstructions(n, r);
  }
  return n;
}
let zt, qt, re, oe, ie;
async function Lr() {
  if (!zt && !qt) {
    const c = await Promise.resolve().then(() => hr);
    zt = c.GM_INSTRUMENTS, qt = c.createGMInstrumentNode, re = c.findGMProgramByName, oe = c.generateSamplerUrls, ie = c.getPopularInstruments;
  }
  return {
    GM_INSTRUMENTS: zt,
    createGMInstrumentNode: qt,
    findGMProgramByName: re,
    generateSamplerUrls: oe,
    getPopularInstruments: ie
  };
}
function _r(c) {
  return new se().validateAndNormalize(c);
}
function Fr(c, t = {}) {
  if (!c || typeof c != "object")
    throw new Error("render() requires a valid JMON object");
  return Oe(c, t);
}
function Vr(c, t = {}) {
  const e = { autoplay: !1, ...t };
  return Oe(c, e);
}
function Or(c, t = {}, e = {}) {
  let n = "unknown", r = null;
  if (t && typeof t == "string" ? n = t.toLowerCase() : t && (typeof t == "object" || typeof t == "function") ? (t.Renderer || t.Flow || t.VF || t.Factory || t.Stave || t.StaveNote || t.Voice || t.Formatter || t.Vex && (t.Vex.Flow || t.Vex) || // Check for common VexFlow object patterns
  t.default && (t.default.Renderer || t.default.Stave || t.default.VF)) && (n = "vexflow", r = t) : typeof window < "u" && (window.VF || window.VexFlow || window.Vex && (window.Vex.Flow || window.Vex) || window.Flow && window.Flow.Factory) && (n = "vexflow", r = window.VF || window.VexFlow || window.Vex && (window.Vex.Flow || window.Vex) || window), n === "vexflow") {
    console.log("VexFlow engine detected, proceeding with rendering");
    const o = typeof document < "u";
    let i;
    if (o) {
      i = document.createElement("div");
      const s = `vexflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      i.id = s, i.style.display = "block", i.style.position = "static", i.style.visibility = "visible", i.style.width = "fit-content", i.style.height = "fit-content";
      try {
        try {
          const f = e.width || 800, k = e.height || 200, F = Ge(c, { elementId: s, width: f, height: k });
          if (F && F.type === "vexflow" && typeof F.render == "function") {
            if (F.config && (F.config.element = i), F.render(r), e.outputType) {
              const B = i.querySelector("svg");
              if (!B) return i;
              if (e.outputType === "svg")
                return B;
              if (e.outputType === "clonedSvg") {
                const G = B.cloneNode(!0);
                return G.style.display = "block", G.style.maxWidth = "100%", G.style.height = "auto", G;
              } else if (e.outputType === "div")
                return i;
            }
            return i;
          }
        } catch {
        }
        const l = r || typeof window < "u" && (window.VF || window.VexFlow || window.Vex && (window.Vex.Flow || window.Vex));
        if (!l || !l.Renderer)
          throw new Error("VexFlow not properly loaded");
        const a = e.width || 800, d = e.height || 200, u = new l.Renderer(i, l.Renderer.Backends.SVG);
        u.resize(a, d);
        const m = u.getContext(), p = new l.Stave(10, 40, a - 50);
        p.addClef("treble"), c.timeSignature && p.addTimeSignature(c.timeSignature), c.keySignature && c.keySignature !== "C" && p.addKeySignature(c.keySignature), p.setContext(m).draw();
        const M = (c.notes || []).map((f) => {
          if (!f.pitch) return null;
          const k = (G) => {
            const V = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"], X = Math.floor(G / 12) - 1, Q = G % 12;
            return V[Q].replace("#", "#") + "/" + X;
          }, F = (G) => G >= 4 ? "w" : G >= 2 ? "h" : G >= 1 ? "q" : G >= 0.5 ? "8" : "16", B = Array.isArray(f.pitch) ? f.pitch.map(k) : [k(f.pitch)];
          return new l.StaveNote({
            keys: B,
            duration: F(f.duration || 1)
          });
        }).filter(Boolean);
        if (M.length > 0)
          try {
            const f = new l.Voice({
              num_beats: 4,
              beat_value: 4
            });
            typeof f.setMode == "function" && l.Voice && l.Voice.Mode && l.Voice.Mode.SOFT !== void 0 ? f.setMode(l.Voice.Mode.SOFT) : typeof f.setStrict == "function" && f.setStrict(!1), typeof f.addTickables == "function" && f.addTickables(M);
            const k = new l.Formatter();
            typeof k.joinVoices == "function" && typeof k.format == "function" && k.joinVoices([f]).format([f], a - 80), typeof f.draw == "function" && f.draw(m, p);
          } catch (f) {
            console.warn("VexFlow voice/formatter error:", f);
            try {
              let k = 60;
              M.forEach((F) => {
                typeof F.setStave == "function" && F.setStave(p), typeof F.setContext == "function" && F.setContext(m), typeof F.preFormat == "function" && F.preFormat(), typeof F.setX == "function" && F.setX(k), typeof F.draw == "function" && F.draw(), k += 40;
              });
            } catch (k) {
              console.warn("Manual note drawing failed:", k);
            }
          }
        if (e.outputType) {
          const f = i.querySelector("svg");
          if (!f) return i;
          if (e.outputType === "svg")
            return f;
          if (e.outputType === "clonedSvg") {
            const k = f.cloneNode(!0);
            return k.style.display = "block", k.style.maxWidth = "100%", k.style.height = "auto", k;
          } else if (e.outputType === "div")
            return i;
        }
        return i;
      } catch (l) {
        throw new Error(`VexFlow rendering failed: ${l.message}. Please check your VexFlow instance.`);
      }
    } else
      throw new Error("VexFlow rendering requires a DOM environment. Use jm.converters.vexflow() for data conversion.");
  }
  throw new Error("Score rendering requires VexFlow. Please provide a VexFlow instance as the second parameter: jm.score(piece, vexflow)");
}
const Br = {
  // Core
  render: Fr,
  play: Vr,
  score: Or,
  validate: _r,
  // Converters
  converters: {
    midi: Tr,
    midiToJmon: kr,
    tonejs: _e,
    wav: Sr,
    supercollider: Pr,
    vexflow: Ge
  },
  // Namespaces from algorithms
  theory: Ct.theory,
  generative: Ct.generative,
  analysis: Ct.analysis,
  constants: Ct.constants,
  audio: Ct.audio,
  // Utils
  utils: {
    ...Ct.utils,
    JmonValidator: se,
    jmon: Sn
  },
  // Instruments (optional; may be undefined in non-browser builds)
  instruments: {
    // Lazy loader to initialize GM instrument helpers on demand
    // Usage: await jm.instruments.load()
    load: Lr,
    // These remain undefined until load() is called in environments where
    // gm-instruments are not preloaded.
    GM_INSTRUMENTS: zt,
    generateSamplerUrls: oe,
    createGMInstrumentNode: qt,
    findGMProgramByName: re,
    getPopularInstruments: ie
  },
  VERSION: "1.0.0"
}, Gr = Ct.audio;
export {
  Gr as audio,
  Br as default,
  Br as jm
};
