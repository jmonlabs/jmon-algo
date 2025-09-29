let d = null, v = !1;
async function C() {
  if (v) return d;
  v = !0;
  try {
    if (typeof window < "u" && window.Plotly)
      return d = window.Plotly, d;
    if (typeof window > "u") {
      const l = await import("plotly.js");
      return d = l.default || l, d;
    }
    return null;
  } catch {
    return console.warn("Plotly.js not available. Visualization methods will return placeholder data."), null;
  }
}
class E {
  /**
   * Plot loops using polar coordinate system, matching Python implementation
   * Works with JMON-compliant loop data
   */
  static async plotLoops(l, a = 4, t = 1 / 4, r = null, e = {}) {
    const {
      container: o = "loop-plot",
      title: g = "Loop Visualization",
      showDurationArcs: s = !0,
      showMarkers: n = !0,
      showShapes: f = !0,
      colorScheme: b = "colorblind"
      // 'colorblind', 'viridis', 'classic'
    } = e, c = Object.values(l), M = r || this.generateColors(c.length, b), w = [];
    c.forEach((h, u) => {
      if (!h.notes || h.notes.length === 0) return;
      const k = h.notes.filter((i) => i.pitch !== null);
      if (k.length !== 0 && ((s || n) && k.forEach((i) => {
        const p = i.time / a * 360, m = i.duration / a * 360;
        if (s && m > 1) {
          const y = this.generateArcPoints(p, m, 50), z = Array(50).fill(c.length - u - 1);
          w.push({
            type: "scatterpolar",
            r: z,
            theta: y,
            mode: "lines",
            line: {
              color: "rgba(60, 60, 60, 0.65)",
              width: 8
            },
            name: `${h.label} Duration`,
            showlegend: !1
          });
        }
        n && [p, (p + m) % 360].forEach((y) => {
          w.push({
            type: "scatterpolar",
            r: [c.length - u - 0.9, c.length - u - 1.1],
            theta: [y, y],
            mode: "lines",
            line: {
              color: "Black",
              width: 3
            },
            name: `${h.label} Markers`,
            showlegend: !1
          });
        });
      }), f)) {
        const i = k.map((p) => p.time / a * 360);
        i.length > 1 && (i.push(i[0]), w.push({
          type: "scatterpolar",
          r: Array(i.length).fill(c.length - u - 1),
          theta: i,
          mode: "lines",
          line: {
            color: "rgba(0, 0, 0, 0.65)",
            width: 1
          },
          fill: "toself",
          fillcolor: M[u % M.length],
          name: h.label,
          showlegend: !1
        }));
      }
    });
    const A = this.generateTickValues(a, t), x = this.generateTickLabels(a, t), V = c.map((h) => h.label).reverse(), $ = {
      title: { text: g },
      polar: {
        radialaxis: {
          visible: !0,
          range: [c.length, -0.1],
          tickvals: Array.from({ length: c.length }, (h, u) => u),
          ticktext: V
        },
        angularaxis: {
          tickvals: A,
          ticktext: x,
          direction: "clockwise",
          rotation: 90
        }
      },
      template: "none",
      showlegend: !1
    }, j = {
      responsive: !0,
      displayModeBar: !0
    }, T = await C();
    if (!T)
      throw new Error("Plotly.js not available for visualization");
    return T.newPlot(o, w, $, j);
  }
  /**
   * Generate colors using different schemes, optimized for accessibility
   */
  static generateColors(l, a = "colorblind") {
    const t = [];
    switch (a) {
      case "colorblind":
        const r = [
          "rgba(230, 159, 0, 0.65)",
          // Orange
          "rgba(86, 180, 233, 0.65)",
          // Sky blue  
          "rgba(0, 158, 115, 0.65)",
          // Bluish green
          "rgba(240, 228, 66, 0.65)",
          // Yellow
          "rgba(0, 114, 178, 0.65)",
          // Blue
          "rgba(213, 94, 0, 0.65)",
          // Vermillion
          "rgba(204, 121, 167, 0.65)"
          // Reddish purple
        ];
        for (let o = 0; o < l; o++)
          t.push(r[o % r.length]);
        break;
      case "viridis":
        const e = [
          "rgba(68, 1, 84, 0.65)",
          // Purple
          "rgba(59, 82, 139, 0.65)",
          // Blue-purple
          "rgba(33, 144, 140, 0.65)",
          // Teal
          "rgba(94, 201, 98, 0.65)",
          // Green
          "rgba(253, 231, 37, 0.65)"
          // Yellow
        ];
        for (let o = 0; o < l; o++)
          if (l <= e.length)
            t.push(e[o]);
          else {
            const s = o / (l - 1) * (e.length - 1), n = Math.floor(s);
            t.push(e[n]);
          }
        break;
      case "classic":
      default:
        for (let o = 0; o < l; o++) {
          const g = o / l, s = this.hsvToRgb(g, 1, 1);
          t.push(`rgba(${Math.round(s.r * 255)}, ${Math.round(s.g * 255)}, ${Math.round(s.b * 255)}, 0.5)`);
        }
        break;
    }
    return t;
  }
  /**
   * Convert HSV to RGB color space
   */
  static hsvToRgb(l, a, t) {
    let r, e, o;
    const g = Math.floor(l * 6), s = l * 6 - g, n = t * (1 - a), f = t * (1 - s * a), b = t * (1 - (1 - s) * a);
    switch (g % 6) {
      case 0:
        r = t, e = b, o = n;
        break;
      case 1:
        r = f, e = t, o = n;
        break;
      case 2:
        r = n, e = t, o = b;
        break;
      case 3:
        r = n, e = f, o = t;
        break;
      case 4:
        r = b, e = n, o = t;
        break;
      case 5:
        r = t, e = n, o = f;
        break;
      default:
        r = e = o = 0;
    }
    return { r, g: e, b: o };
  }
  /**
   * Generate arc points for smooth curves
   */
  static generateArcPoints(l, a, t) {
    const r = [];
    for (let e = 0; e < t; e++) {
      const o = l + e / (t - 1) * a;
      r.push(o % 360);
    }
    return r;
  }
  /**
   * Generate tick values for angular axis
   */
  static generateTickValues(l, a) {
    const t = [], r = Math.floor(l / a);
    for (let e = 0; e < r; e++)
      t.push(e * 360 / r);
    return t;
  }
  /**
   * Generate tick labels for angular axis
   */
  static generateTickLabels(l, a) {
    const t = [], r = Math.floor(l / a);
    for (let e = 0; e < r; e++) {
      const o = e * a % l;
      t.push(o.toString());
    }
    return t;
  }
}
export {
  E as LoopVisualizer
};
