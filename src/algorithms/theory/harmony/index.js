import { Scale } from "./Scale.js";
import { Progression } from "./Progression.js";
import { Voice } from "./Voice.js";
import { Ornament } from "./Ornament.js";
import { Articulation } from "./Articulation.js";
import { chordify, chordifyMany } from "./Chordify.js";
import { Arpeggiate, arpeggiate } from "./Arpeggiate.js";
import { Strum, strum } from "./Strum.js";

// Export both as namespace and individual exports
export {
  Arpeggiate,
  Articulation,
  Ornament,
  Progression,
  Scale,
  Strum,
  Voice,
  arpeggiate,
  chordify,
  chordifyMany,
  strum,
};

// Export harmony namespace
export default {
  Arpeggiate,
  Scale,
  Progression,
  Voice,
  Ornament,
  Articulation,
  Strum,
  arpeggiate,
  chordify,
  chordifyMany,
  strum,
};
