/**
 * Score Renderer
 * Uses VexFlow for rendering musical notation.
 */

import { convertToVexFlow } from "../converters/index.js";

export function score(composition, options = {}) {
  const {
    width = 800,
    height = 200,
    scale = 1.0,
    observable = false,
  } = options;

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.overflow = "hidden";

  // Where the notation will be rendered
  const notationDiv = document.createElement("div");
  notationDiv.id = `rendered-score-${Date.now()}`;
  notationDiv.style.width = "100%";
  container.appendChild(notationDiv);

  // Direct mode: immediate VexFlow rendering (for standard browser environments)
  if (!observable) {
    setTimeout(() => {
      try {
        const VF = window.Vex?.Flow || window.VF || window.VexFlow;

        if (!VF) {
          notationDiv.innerHTML =
            '<p style="color:#ff6b6b">VexFlow not loaded</p>';
          return;
        }

        const renderer = new VF.Renderer(notationDiv, VF.Renderer.Backends.SVG);
        renderer.resize(width, height);
        const context = renderer.getContext();

        const stave = new VF.Stave(10, 40, width - 50);
        stave.addClef("treble");
        if (composition.timeSignature)
          stave.addTimeSignature(composition.timeSignature);
        stave.setContext(context).draw();

        const track = composition.tracks?.[0];
        if (!track?.notes?.length) return;

        const vfNotes = track.notes.map((note) => {
          let keys;
          if (typeof note.pitch === "number") {
            const octave = Math.floor(note.pitch / 12) - 1;
            const noteNames = [
              "c",
              "c#",
              "d",
              "d#",
              "e",
              "f",
              "f#",
              "g",
              "g#",
              "a",
              "a#",
              "b",
            ];
            const noteName = noteNames[note.pitch % 12];
            keys = [`${noteName}/${octave}`];
          } else if (Array.isArray(note.pitch)) {
            keys = note.pitch.map((p) => {
              const octave = Math.floor(p / 12) - 1;
              const noteNames = [
                "c",
                "c#",
                "d",
                "d#",
                "e",
                "f",
                "f#",
                "g",
                "g#",
                "a",
                "a#",
                "b",
              ];
              const noteName = noteNames[p % 12];
              return `${noteName}/${octave}`;
            });
          } else {
            keys = ["c/4"];
          }

          let duration = "q";
          const dur = note.duration || 1;
          if (dur >= 4) duration = "w";
          else if (dur >= 2) duration = "h";
          else if (dur >= 1) duration = "q";
          else if (dur >= 0.5) duration = "8";
          else if (dur >= 0.25) duration = "16";
          else duration = "32";

          return new VF.StaveNote({ keys, duration });
        });

        // VexFlow needs num_beats to match the number of beats the notes actually take
        // Calculate based on VexFlow duration values
        const vexflowBeats = vfNotes.reduce((sum, note) => {
          const dur = note.attrs.duration;
          if (dur === 'w') return sum + 4;
          if (dur === 'h') return sum + 2;
          if (dur === 'q') return sum + 1;
          if (dur === '8') return sum + 0.5;
          if (dur === '16') return sum + 0.25;
          if (dur === '32') return sum + 0.125;
          return sum + 1;
        }, 0);

        const voice = new VF.Voice({
          num_beats: vexflowBeats,
          beat_value: 4,
        });
        voice.addTickables(vfNotes);
        new VF.Formatter().joinVoices([voice]).format([voice], width - 100);
        voice.draw(context, stave);
      } catch (e) {
        console.error("[SCORE] Simple render error:", e);
        notationDiv.innerHTML = `<p style="color:#ff6b6b">Error: ${e.message}</p>`;
      }
    }, 10);

    return container;
  }

  // Helper: attempt VexFlow rendering
  async function tryVexFlow() {
    // Check for VexFlow in multiple possible locations
    let VF = null;
    if (typeof window !== "undefined") {
      VF = window.Vex?.Flow || window.VF || window.VexFlow || window.Vex;
    }

    console.log("[SCORE] VexFlow check:", {
      hasWindow: typeof window !== "undefined",
      hasVex: !!window?.Vex,
      hasVexFlow: !!window?.Vex?.Flow,
      hasVF: !!window?.VF,
      VF: VF ? "found" : "not found",
    });

    const vexData = convertToVexFlow(composition, {
      elementId: notationDiv.id,
      width,
      height,
    });

    console.log("[SCORE] VexData:", {
      hasVexData: !!vexData,
      hasRender: vexData && typeof vexData.render === "function",
      type: typeof vexData,
    });

    if (VF && vexData && typeof vexData.render === "function") {
      try {
        vexData.render(VF);
        console.log("[SCORE] ✓ Render successful");
        return true;
      } catch (e) {
        console.error("[SCORE] Render error:", e);
        notationDiv.innerHTML = `<p style="color:#ff6b6b">Render error: ${e.message}</p>`;
        return false;
      }
    }

    // Observable require() path: try loading a UMD build of VexFlow
    if (typeof require !== "undefined") {
      try {
        await require("https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/umd/vexflow.min.js");
        const VF2 =
          (typeof window !== "undefined" &&
            (window.VF ||
              window.VexFlow ||
              (window.Vex && (window.Vex.Flow || window.Vex)))) ||
          null;
        if (VF2 && vexData && typeof vexData.render === "function") {
          vexData.render(VF2);
          return true;
        }
      } catch (_) {
        // ignore and fallback
      }
    }

    return false;
  }

  // Render with VexFlow
  (async () => {
    const ok = await tryVexFlow();
    if (!ok) {
      notationDiv.innerHTML =
        '<p style="color:#ff6b6b">Error: Could not render score with VexFlow</p>';
    }
  })();

  return container;
}
