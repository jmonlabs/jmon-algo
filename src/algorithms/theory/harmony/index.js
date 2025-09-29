import { Scale } from "./Scale.js";
import { Progression } from "./Progression.js";
import { Voice } from "./Voice.js";
import { Ornament } from "./Ornament.js";
import {
  addArticulation,
  Articulation,
  removeArticulation,
  validateArticulations,
} from "./Articulation.js"; // Create alias for addOrnament

const addOrnament = addArticulation;
const removeOrnament = removeArticulation;

// Export both as namespace and individual exports
export {
  addArticulation,
  addOrnament,
  Articulation,


  Ornament,
  Progression,
  removeArticulation,
  removeOrnament,
  Scale,
  validateArticulations,
  Voice,
};

// Export harmony namespace
export default {
  Scale,
  Progression,
  Voice,
  Ornament,
  Articulation,
  addArticulation,
  addOrnament, // Include the alias
  removeArticulation,
  removeOrnament, // Include the alias
  validateArticulations,


};
