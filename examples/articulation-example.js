/**
 * Articulation Examples for JMON Studio
 * Shows different articulations supported by the JMON schema
 */

// Export for both Node.js and browser environments
const articulationExamples = {

  // Basic articulations
  basicArticulations: {
    format: "jmon",
    version: "1.0.0",
    tempo: 100,
    keySignature: "C",
    timeSignature: "4/4",
    metadata: { title: "Basic Articulations" },
    tracks: [{
      label: "melody",
      notes: [
        { pitch: 60, duration: "4n", time: 0, articulation: "staccato" },    // C staccato
        { pitch: 62, duration: "4n", time: 1, articulation: "accent" },      // D accent
        { pitch: 64, duration: "4n", time: 2, articulation: "tenuto" },      // E tenuto
        { pitch: 65, duration: "4n", time: 3, articulation: "marcato" },     // F marcato
      ]
    }]
  },

  // Advanced articulations
  advancedArticulations: {
    format: "jmon",
    version: "1.0.0",
    tempo: 90,
    keySignature: "G",
    timeSignature: "3/4",
    metadata: { title: "Advanced Articulations" },
    tracks: [{
      label: "melody",
      notes: [
        { pitch: 67, duration: "4n", time: 0, articulation: "legato" },      // G legato
        { pitch: 69, duration: "2n", time: 1, articulation: "staccato" },    // A staccato (longer note)
        { pitch: 71, duration: "4n", time: 3, articulation: "accent" },      // B accent
      ]
    }]
  },

  // Articulations with ornaments
  articulationsWithOrnaments: {
    format: "jmon",
    version: "1.0.0",
    tempo: 110,
    keySignature: "F",
    timeSignature: "2/4",
    metadata: { title: "Articulations + Ornaments" },
    tracks: [{
      label: "melody",
      notes: [
        {
          pitch: 65,
          duration: "4n",
          time: 0,
          articulation: "tenuto",
          ornaments: [{
            type: "grace_note",
            parameters: {
              graceNoteType: "acciaccatura", // crushed grace note
              gracePitches: [64] // E♭ grace note before F
            }
          }]
        },
        {
          pitch: 67,
          duration: "4n",
          time: 1,
          articulation: "accent",
          ornaments: [{
            type: "grace_note",
            parameters: {
              graceNoteType: "appoggiatura", // long grace note
              gracePitches: [69] // A grace note before G
            }
          }]
        }
      ]
    }]
  },

  // Mixed dynamics and articulations (if supported)
  dynamicsAndArticulations: {
    format: "jmon",
    version: "1.0.0",
    tempo: 120,
    keySignature: "D",
    timeSignature: "4/4",
    metadata: { title: "Dynamics & Articulations" },
    tracks: [{
      label: "melody",
      notes: [
        { pitch: 62, duration: "4n", time: 0, articulation: "staccato", dynamics: "f" },  // D forte staccato
        { pitch: 64, duration: "4n", time: 1, articulation: "tenuto", dynamics: "p" },    // E piano tenuto
        { pitch: 66, duration: "4n", time: 2, articulation: "accent", dynamics: "mf" },   // F# mezzo-forte accent
        { pitch: 69, duration: "4n", time: 3, articulation: "marcato", dynamics: "ff" },  // A fortissimo marcato
      ]
    }]
  },

  // Chords with articulations
  chordsWithArticulations: {
    format: "jmon",
    version: "1.0.0",
    tempo: 80,
    keySignature: "Bb",
    timeSignature: "4/4",
    metadata: { title: "Chords with Articulations" },
    tracks: [{
      label: "harmony",
      notes: [
        { pitch: [58, 62, 65], duration: "2n", time: 0, articulation: "accent" },      // Bb major chord - accent
        { pitch: [60, 64, 67], duration: "2n", time: 2, articulation: "tenuto" },      // C major chord - tenuto
        { pitch: [62, 65, 69], duration: "2n", time: 4, articulation: "staccato" },    // D minor chord - staccato
        { pitch: [58, 62, 65], duration: "2n", time: 6, articulation: "marcato" },     // Bb major chord - marcato
      ]
    }]
  }
};

// For Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = articulationExamples;
}

// For browser
if (typeof window !== 'undefined') {
  window.articulationExamples = articulationExamples;
}

export default articulationExamples;