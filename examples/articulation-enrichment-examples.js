/**
 * JMON Studio Articulation Enrichment Examples
 * Real implementation using jmon-algo's core Articulation API
 */

import { jm } from "./dist/jmon.esm.js";

// Basic piece without articulations - using proper JMON track structure
const basicMelody = {
  format: "jmon",
  version: "1.0.0",
  tempo: 120,
  keySignature: "C",
  timeSignature: "4/4",
  metadata: { title: "Basic Melody" },
  tracks: [{
    label: "melody",
    notes: [
      { pitch: 60, duration: "4n", time: 0 }, // C
      { pitch: 62, duration: "4n", time: 1 }, // D
      { pitch: 64, duration: "4n", time: 2 }, // E
      { pitch: 65, duration: "4n", time: 3 }, // F
      { pitch: 67, duration: "2n", time: 4 }, // G
      { pitch: 65, duration: "4n", time: 6 }, // F
      { pitch: 64, duration: "4n", time: 7 }, // E
      { pitch: 60, duration: "1n", time: 8 }, // C
    ],
  }],
};

/**
 * REAL IMPLEMENTATION: Add staccato to quarter notes using jmon-algo API
 */
export function addStaccatoToShortNotes(piece) {
  const enriched = JSON.parse(JSON.stringify(piece)); // Deep clone

  enriched.tracks.forEach((track) => {
    // Use the real jmon-algo addArticulation API
    track.notes.forEach((note, index) => {
      if (note.duration === "4n") {
        // Use the immutable addArticulation function from jmon-algo
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "staccato",
        );
      }
    });
  });

  enriched.metadata.title += " (with Staccato)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Add accents to strong beats using jmon-algo API
 */
export function addAccentsToStrongBeats(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      // Add accents to notes on beats 0, 2, 4, 6 (strong beats in 4/4)
      if (note.time % 2 === 0) {
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "accent",
        );
      }
    });
  });

  enriched.metadata.title += " (with Accents)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Add tenuto to long notes using jmon-algo API
 */
export function addTenutoToLongNotes(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      // Add tenuto to half notes and whole notes for sustained effect
      if (note.duration === "2n" || note.duration === "1n") {
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "tenuto",
        );
      }
    });
  });

  enriched.metadata.title += " (with Tenuto)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Add complex articulations using jmon-algo API
 */
export function addGlissandos(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      const nextNote = track.notes[index + 1];
      // Add glissando to every third note that has a next note
      if (
        index % 3 === 0 && nextNote && typeof note.pitch === "number" &&
        typeof nextNote.pitch === "number"
      ) {
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "glissando",
          {
            target: nextNote.pitch,
          },
        );
      }
    });
  });

  enriched.metadata.title += " (with Glissandos)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Apply contextual articulations using jmon-algo API
 */
export function applyContextualArticulations(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      const nextNote = track.notes[index + 1];

      // Apply different articulations based on melodic movement
      if (
        nextNote && typeof note.pitch === "number" &&
        typeof nextNote.pitch === "number"
      ) {
        const interval = Math.abs(nextNote.pitch - note.pitch);

        if (interval >= 4) {
          // Large leap - use accent for emphasis
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "accent",
          );
        } else if (interval <= 1) {
          // Step-wise motion - use legato for smoothness
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "legato",
          );
        } else {
          // Medium intervals - use tenuto
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "tenuto",
          );
        }
      }

      // Final note gets marcato for strong ending
      if (index === track.notes.length - 1) {
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "marcato",
        );
      }
    });
  });

  enriched.metadata.title += " (Contextual Articulations)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Add vibrato and bends using jmon-algo API
 */
export function addExpressionArticulations(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      // Add vibrato to long notes
      if (note.duration === "2n" || note.duration === "1n") {
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "vibrato",
          {
            rate: 6.0, // 6 Hz vibrato
            depth: 25, // 25 cent depth
          },
        );
      }

      // Add subtle bends to every 4th note
      if (index % 4 === 0 && note.duration === "4n") {
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "bend",
          {
            amount: 50, // 50 cent bend
            returnToOriginal: true,
          },
        );
      }
    });
  });

  enriched.metadata.title += " (with Expression)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Add dynamics with crescendo/diminuendo using jmon-algo API
 */
export function addDynamicsAndArticulations(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      const totalNotes = track.notes.length;
      const position = index / totalNotes;

      if (position < 0.25) {
        // Beginning - piano with legato
        note.dynamics = "p";
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "legato",
        );
      } else if (position < 0.5) {
        // Building - add crescendo
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "crescendo",
          {
            endVelocity: 90,
          },
        );
      } else if (position < 0.75) {
        // Climax - forte with accents
        note.dynamics = "f";
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "accent",
        );
      } else {
        // Ending - add diminuendo
        track.notes = jm.theory.harmony.addArticulation(
          track.notes,
          index,
          "diminuendo",
          {
            endVelocity: 40,
          },
        );
      }
    });
  });

  enriched.metadata.title += " (Dynamics + Articulations)";
  return enriched;
}

/**
 * REAL IMPLEMENTATION: Rhythm-based articulations using jmon-algo API
 */
export function addRhythmBasedArticulations(piece) {
  const enriched = JSON.parse(JSON.stringify(piece));

  enriched.tracks.forEach((track) => {
    track.notes.forEach((note, index) => {
      // Apply articulations based on rhythmic pattern
      const beatPosition = note.time % 4; // Position within measure

      switch (beatPosition) {
        case 0: // Beat 1 - strong downbeat
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "marcato",
          );
          break;
        case 1: // Beat 2 - light
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "staccato",
          );
          break;
        case 2: // Beat 3 - medium emphasis
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "accent",
          );
          break;
        case 3: // Beat 4 - upbeat leading to next measure
          track.notes = jm.theory.harmony.addArticulation(
            track.notes,
            index,
            "tenuto",
          );
          break;
      }
    });
  });

  enriched.metadata.title += " (Rhythm-based Articulations)";
  return enriched;
}

// Usage examples object with REAL jmon-algo functions
export const articulationEnrichmentExamples = {
  original: basicMelody,

  // Apply different enrichment functions using REAL jmon-algo API
  withStaccato: () => addStaccatoToShortNotes(basicMelody),
  withAccents: () => addAccentsToStrongBeats(basicMelody),
  withTenuto: () => addTenutoToLongNotes(basicMelody),
  withGlissandos: () => addGlissandos(basicMelody),
  contextual: () => applyContextualArticulations(basicMelody),
  withExpression: () => addExpressionArticulations(basicMelody),
  withDynamics: () => addDynamicsAndArticulations(basicMelody),
  rhythmBased: () => addRhythmBasedArticulations(basicMelody),
};

// For browser environments
if (typeof window !== "undefined") {
  window.articulationEnrichmentExamples = articulationEnrichmentExamples;
  window.addStaccatoToShortNotes = addStaccatoToShortNotes;
  window.addAccentsToStrongBeats = addAccentsToStrongBeats;
  window.addTenutoToLongNotes = addTenutoToLongNotes;
  window.addGlissandos = addGlissandos;
  window.applyContextualArticulations = applyContextualArticulations;
  window.addExpressionArticulations = addExpressionArticulations;
  window.addDynamicsAndArticulations = addDynamicsAndArticulations;
  window.addRhythmBasedArticulations = addRhythmBasedArticulations;
}

export default articulationEnrichmentExamples;
