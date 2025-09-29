/**
 * Score Renderer
 * Prefer VexFlow when available, fallback to ABCJS, and show ABC text if all else fails.
 */

import { abc as toAbc, convertToVexFlow } from "../converters/index.js";

export function score(composition, options = {}) {
  const { width = 800, height = 200, scale = 1.0 } = options;

  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.overflow = "hidden";

  // Where the notation will be rendered
  const notationDiv = document.createElement("div");
  notationDiv.id = `rendered-score-${Date.now()}`;
  notationDiv.style.width = "100%";
  container.appendChild(notationDiv);

  // Always prepare ABC as a textual fallback
  const abc = toAbc(composition);

  // Helper: attempt VexFlow rendering
  async function tryVexFlow() {
    const VF =
      (typeof window !== "undefined" &&
        (window.VF || window.VexFlow ||
          (window.Vex && (window.Vex.Flow || window.Vex)))) ||
      null;

    const vexData = convertToVexFlow(composition, {
      elementId: notationDiv.id,
      width,
      height,
    });

    if (VF && vexData && typeof vexData.render === "function") {
      vexData.render(VF);
      return true;
    }

    // Observable require() path: try loading a UMD build of VexFlow
    if (typeof require !== "undefined") {
      try {
        await require(
          "https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/umd/vexflow.min.js",
        );
        const VF2 =
          (typeof window !== "undefined" &&
            (window.VF || window.VexFlow ||
              (window.Vex && (window.Vex.Flow || window.Vex)))) ||
          null;
        if (VF2 && vexData && typeof vexData.render === "function") {
          vexData.render(VF2);
          return true;
        }
      } catch (_) {
        // ignore and fallback to ABCJS
      }
    }

    return false;
  }

  // Helper: attempt ABCJS rendering
  async function tryAbc() {
    if (typeof require !== "undefined") {
      try {
        const abcjs = await require("https://bundle.run/abcjs@5.1.2/midi.js");
        abcjs.renderAbc(notationDiv, abc, {
          responsive: "resize",
          scale: scale,
          staffwidth: width,
        });
        return true;
      } catch (error) {
        notationDiv.innerHTML =
          `<p>Error rendering score: ${error.message}</p>`;
        return false;
      }
    } else {
      notationDiv.innerHTML = "<pre>" + abc + "</pre>";
      return true;
    }
  }

  // Prefer VexFlow, fallback to ABCJS, finally show ABC text
  (async () => {
    const ok = await tryVexFlow();
    if (!ok) {
      await tryAbc();
    }
  })();

  return container;
}
