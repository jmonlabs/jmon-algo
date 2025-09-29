#!/usr/bin/env node
/**
 * Test real articulation enrichment API
 */

const jm = require('./dist/jmon.esm.js').default || require('./dist/jmon.esm.js');

// Basic test piece
const basicPiece = {
  format: "jmon",
  version: "1.0.0",
  tempo: 120,
  keySignature: "C",
  timeSignature: "4/4",
  metadata: { title: "Test Piece" },
  tracks: [{
    label: "melody",
    notes: [
      { pitch: 60, duration: "4n", time: 0 }, // C
      { pitch: 62, duration: "4n", time: 1 }, // D
      { pitch: 64, duration: "4n", time: 2 }, // E
      { pitch: 67, duration: "2n", time: 4 }  // G
    ]
  }]
};

console.log("🎵 Testing REAL jmon-studio articulation enrichment API\n");

// Test 1: Add staccato to quarter notes
console.log("Test 1: Adding staccato to quarter notes...");
try {
  let enriched = JSON.parse(JSON.stringify(basicPiece));

  enriched.tracks.forEach(track => {
    track.notes.forEach((note, index) => {
      if (note.duration === "4n") {
        track.notes = jm.theory.harmony.addArticulation(track.notes, index, "staccato");
      }
    });
  });

  // Check results
  const articulatedNotes = enriched.tracks[0].notes.filter(note =>
    note.articulations && note.articulations.includes("staccato")
  );

  console.log(`✅ Success! Added staccato to ${articulatedNotes.length} notes`);
  console.log("   Articulated notes:", articulatedNotes.map(n => `pitch ${n.pitch}`));
} catch (error) {
  console.log("❌ Error:", error.message);
}

// Test 2: Add complex articulation (glissando)
console.log("\nTest 2: Adding glissando with target parameter...");
try {
  let enriched = JSON.parse(JSON.stringify(basicPiece));

  // Add glissando from first to second note
  enriched.tracks[0].notes = jm.theory.harmony.addArticulation(
    enriched.tracks[0].notes,
    0,
    "glissando",
    { target: 62 }
  );

  const glissandoNote = enriched.tracks[0].notes[0];
  const hasGlissando = glissandoNote.articulations &&
    glissandoNote.articulations.some(a =>
      typeof a === 'object' && a.type === 'glissando' && a.target === 62
    );

  if (hasGlissando) {
    console.log("✅ Success! Added glissando articulation with target pitch 62");
  } else {
    console.log("❌ Failed to add glissando properly");
  }
} catch (error) {
  console.log("❌ Error:", error.message);
}

// Test 3: Validate articulations
console.log("\nTest 3: Validating articulations...");
try {
  const testNotes = [
    { pitch: 60, articulations: ["staccato", "accent"] },
    { pitch: 62, articulations: [{ type: "vibrato", rate: 6, depth: 25 }] },
    { pitch: 64, articulations: ["unknown_articulation"] } // This should fail
  ];

  const validation = jm.theory.harmony.validateArticulations(testNotes);
  console.log(`✅ Validation completed. Valid: ${validation.valid}`);
  console.log(`   Found ${validation.issues.length} issues:`);
  validation.issues.forEach(issue => {
    console.log(`   - ${issue.message}`);
  });
} catch (error) {
  console.log("❌ Error:", error.message);
}

console.log("\n🎉 Real articulation API testing complete!");