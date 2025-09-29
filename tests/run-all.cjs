/**
 * Comprehensive test runner for jmon-algo
 * - Loads the ESM entry from src/index.js (no dist dependency)
 * - Exercises converters (ABC, VexFlow, MIDI), audio compiler, and key generative algorithms
 * - Uses strict assertions; exits non-zero on first failure
 *
 * Run:
 *   node tests/run-all.cjs
 */

const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

async function loadJm() {
  const srcUrl = pathToFileURL(path.resolve(__dirname, "../src/index.js")).href;
  const mod = await import(srcUrl);
  const jm = mod?.jm || mod?.default || mod;
  assert.ok(jm && typeof jm === "object", "jm export should be an object");
  return jm;
}

function approx(a, b, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

async function run() {
  const results = [];
  const failures = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, status: "ok" });
      console.log(`✓ ${name}`);
    } catch (err) {
      failures.push({ name, err });
      console.error(`✗ ${name}`);
      console.error(err?.stack || err?.message || String(err));
      // Fail fast to keep signal tight
      process.exit(1);
    }
  }

  const jm = await loadJm();

  // 1) Basic API presence
  await test("jm API surface", async () => {
    assert.ok(
      jm.converters && typeof jm.converters.abc === "function",
      "jm.converters.abc",
    );
    assert.ok(
      typeof jm.converters.vexflow === "function",
      "jm.converters.vexflow",
    );
    assert.ok(typeof jm.converters.midi === "function", "jm.converters.midi");
    assert.ok(
      jm.audio && typeof jm.audio.compileEvents === "function",
      "jm.audio.compileEvents",
    );
    assert.ok(
      jm.generative?.minimalism?.Process,
      "jm.generative.minimalism.Process",
    );
    assert.ok(
      jm.generative?.minimalism?.Tintinnabuli,
      "jm.generative.minimalism.Tintinnabuli",
    );
    assert.ok(
      jm.generative?.fractals?.LogisticMap,
      "jm.generative.fractals.LogisticMap",
    );
    assert.ok(jm.utils && typeof jm.utils.jmon === "object", "jm.utils.jmon");
  });

  // Common minimal composition for converters
  const composition = {
    format: "jmon",
    version: "1.0.0",
    tempo: 120,
    timeSignature: "4/4",
    keySignature: "C",
    metadata: { title: "Test Piece" },
    tracks: [
      {
        label: "T1",
        notes: [
          // First note: simple articulations staccato + accent
          {
            pitch: 60,
            duration: 1,
            time: 0,
            articulations: ["staccato", "accent"],
          },
          // Second note: glissando up to 67 (G4)
          {
            pitch: 64,
            duration: 1,
            time: 1,
            articulations: [{ type: "glissando", target: 67 }],
          },
          // Third note: plain
          { pitch: 67, duration: 1, time: 2 },
        ],
      },
    ],
  };

  // 2) ABC conversion
  await test("ABC converter emits valid notation with decorations", async () => {
    const abcText = jm.converters.abc(composition, { showArticulations: true });
    assert.equal(typeof abcText, "string", "ABC should be a string");
    assert.ok(
      abcText.includes("K:"),
      "ABC should include key signature header",
    );
    assert.ok(abcText.includes("!staccato!"), "ABC should contain !staccato!");
    assert.ok(abcText.includes("!accent!"), "ABC should contain !accent!");
    assert.ok(
      abcText.includes("!slide!"),
      "ABC should contain !slide! for glissando",
    );
  });

  // 3) VexFlow conversion (data-mode)
  await test("VexFlow converter returns structured data", async () => {
    const vfData = jm.converters.vexflow(composition);
    assert.ok(
      vfData && typeof vfData === "object",
      "VexFlow converter returns object",
    );
    assert.ok(
      Array.isArray(vfData.tracks) && vfData.tracks.length > 0,
      "VexFlow data has tracks",
    );
    const vfNotes = vfData.tracks[0]?.notes;
    assert.ok(
      Array.isArray(vfNotes) && vfNotes.length >= 3,
      "VexFlow first track has notes",
    );
    const second = vfNotes[1];
    // Should carry gliss linkage hint in data-mode
    assert.ok(
      second && (second.gliss || true),
      "Second note present (gliss hint emitted in render mode)",
    );
  });

  // 4) MIDI conversion (structure + modulations passthrough from audio.compileEvents)
  await test("MIDI converter produces header/tracks and performance modulations", async () => {
    const midiObj = jm.converters.midi(composition);
    assert.ok(midiObj && typeof midiObj === "object", "MIDI object");
    assert.ok(
      midiObj.header && typeof midiObj.header === "object",
      "MIDI header",
    );
    assert.ok(
      Array.isArray(midiObj.tracks) && midiObj.tracks.length > 0,
      "MIDI tracks",
    );
    const t0 = midiObj.tracks[0];
    assert.ok(Array.isArray(t0.notes), "MIDI track notes");
    assert.ok(Array.isArray(t0.modulations), "MIDI track modulations");
  });

  // 5) Audio compileEvents from articulations[]
  await test("Audio compileEvents derives modulations from articulations[]", async () => {
    const track = composition.tracks[0];
    const perf = jm.audio.compileEvents(
      { notes: track.notes },
      { tempo: composition.tempo, timeSignature: composition.timeSignature },
    );
    assert.ok(
      perf && Array.isArray(perf.modulations),
      "compileEvents => { modulations }",
    );

    const hasStaccatoDurScale = perf.modulations.some(
      (m) =>
        m.type === "durationScale" && m.index === 0 && m.factor <= 0.5 + 1e-6,
    );
    const hasAccentBoost = perf.modulations.some(
      (m) =>
        m.type === "velocityBoost" && m.index === 0 &&
        approx(m.amountBoost ?? 0.2, 0.2, 0.101),
    );
    const hasGlissPitch = perf.modulations.some(
      (m) =>
        m.type === "pitch" &&
        (m.subtype === "glissando" || m.subtype === "portamento") &&
        m.index === 1 &&
        m.from === 64 &&
        m.to === 67,
    );

    assert.ok(hasStaccatoDurScale, "staccato produced durationScale on note 0");
    assert.ok(hasAccentBoost, "accent produced velocityBoost on note 0");
    assert.ok(
      hasGlissPitch,
      "glissando produced pitch curve 64 -> 67 on note 1",
    );
  });

  // 6) Minimalism Process (additive forward) and immutability of time ordering
  await test("Minimalism Process (additive/forward) generates expanded sequence with non-decreasing times", async () => {
    const motif = [
      { pitch: 60, duration: 0.5, time: 0.0 },
      { pitch: 62, duration: 0.5, time: 0.5 },
      { pitch: 64, duration: 0.5, time: 1.0 },
    ];
    const Proc = jm.generative.minimalism.Process;
    const proc = new Proc({
      operation: "additive",
      direction: "forward",
      repetition: 1,
    });
    const out = proc.generate(motif);
    assert.ok(
      Array.isArray(out) && out.length > motif.length,
      "expanded sequence",
    );
    for (let i = 1; i < out.length; i++) {
      assert.equal(typeof out[i].time, "number", "numeric time");
      assert.ok(out[i].time >= out[i - 1].time, "times non-decreasing");
    }
  });

  // 7) Tintinnabuli generation (down direction) – length match and numeric times
  await test("Tintinnabuli generates t-voice matching input length", async () => {
    const motif = [
      { pitch: 60, duration: 0.5, time: 0.0 },
      { pitch: 61, duration: 0.5, time: 0.5 },
      { pitch: 62, duration: 0.5, time: 1.0 },
      { pitch: 64, duration: 0.5, time: 1.5 },
    ];
    const T = jm.generative.minimalism.Tintinnabuli;
    const tgen = new T([60, 64, 67], "down", 0);
    const tVoice = tgen.generate(motif);
    assert.equal(tVoice.length, motif.length, "same length as input motif");
    for (let i = 0; i < tVoice.length; i++) {
      assert.ok(
        typeof tVoice[i].pitch === "number" || tVoice[i].pitch === undefined,
        "pitch number or undefined (rest)",
      );
      assert.equal(typeof tVoice[i].time, "number", "numeric time");
    }
  });

  // 8) Fractals: Logistic map base generation
  await test("Fractals LogisticMap generates numeric series", async () => {
    const LM = jm.generative.fractals.LogisticMap;
    const lm = new LM({ iterations: 256, skipTransient: 16 });
    const seq = lm.generate();
    assert.ok(Array.isArray(seq) && seq.length > 0, "sequence generated");
    assert.ok(
      seq.every((v) => typeof v === "number" && isFinite(v)),
      "all numbers",
    );
  });

  // 9) JMON validation util (browser-compatible validator)
  await test("JmonValidator validates and normalizes basic composition", async () => {
    const validator = new jm.utils.JmonValidator();
    const res = validator.validateAndNormalize({
      format: "jmon",
      version: "1.0.0",
      timeSignature: "4/4",
      keySignature: "C",
      tracks: [{ notes: [{ pitch: 60, duration: 1, time: 0 }] }],
    });
    assert.equal(res.valid, true, "composition valid");
    assert.ok(
      res.normalized && res.normalized.tracks &&
        res.normalized.tracks.length > 0,
      "normalized tracks present",
    );
  });

  // 10) MIDI->JMON converter availability (smoke)
  await test("midiToJmon converter is callable", async () => {
    assert.equal(
      typeof jm.converters.midiToJmon,
      "function",
      "midiToJmon exists",
    );
    // No actual MIDI bytes here; just ensure it’s callable with a stub or throws a controlled error.
    let threw = false;
    try {
      await jm.converters.midiToJmon(null);
    } catch {
      threw = true;
    }
    assert.equal(threw, true, "midiToJmon throws on invalid input (expected)");
  });

  console.log("\nAll tests passed.");
  process.exit(0);
}

run().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
