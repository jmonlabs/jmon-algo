import { Scale } from "./Scale.js";
import { Progression } from "./Progression.js";
import { Voice } from "./Voice.js";
import { Ornament } from "./Ornament.js";
import { Articulation } from "./Articulation.js";
import { chordify, chordifyMany } from "./Chordify.js";

// Export both as namespace and individual exports
export {
  Articulation,
  Ornament,
  Progression,
  Scale,
  Voice,
  chordify,
  chordifyMany,
};

// Export harmony namespace
export default {
  Scale,
  Progression,
  Voice,
  Ornament,
  Articulation,
  chordify,
  chordifyMany,
};
