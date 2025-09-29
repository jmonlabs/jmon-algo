let p = null, w = !1;
async function d() {
  if (w) return p;
  w = !0;
  try {
    if (typeof window < "u" && window.Plotly)
      return p = window.Plotly, p;
    if (typeof window > "u") {
      const t = await import("plotly.js");
      return p = t.default || t, p;
    }
    return null;
  } catch {
    return console.warn("Plotly.js not available. Visualization methods will return placeholder data."), null;
  }
}
class h {
  /**
   * Create a line plot
   */
  static async line(t, i = {}, o = "plot") {
    const e = await d();
    if (!e)
      return { data: t, options: i, type: "line", message: "Plotly.js not available" };
    const {
      title: n,
      width: a = 640,
      height: s = 400,
      color: l = "steelblue",
      xTitle: c = "X",
      yTitle: r = "Y"
    } = i, y = {
      x: t.x,
      y: t.y,
      type: "scatter",
      mode: "lines",
      line: { color: l, width: 2 },
      name: "Line"
    }, x = {
      title: n ? { text: n } : void 0,
      width: a,
      height: s,
      xaxis: { title: { text: c } },
      yaxis: { title: { text: r } }
    };
    await e.newPlot(o, [y], x);
  }
  /**
   * Create a scatter plot
   */
  static async scatter(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      color: s = "steelblue",
      xTitle: l = "X",
      yTitle: c = "Y"
    } = i, r = {
      x: t.x,
      y: t.y,
      type: "scatter",
      mode: "markers",
      marker: {
        color: t.color || s,
        size: t.size || 8
      },
      name: "Scatter"
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: l } },
      yaxis: { title: { text: c } }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create a heatmap from 2D matrix data
   */
  static async heatmap(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      colorScale: s = "Viridis",
      xTitle: l = "X",
      yTitle: c = "Y"
    } = i, r = {
      z: t,
      type: "heatmap",
      colorscale: s,
      showscale: !0
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: l } },
      yaxis: { title: { text: c } }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create a bar chart
   */
  static async bar(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      color: s = "steelblue",
      xTitle: l = "X",
      yTitle: c = "Y"
    } = i, r = {
      x: t.x.map((x) => x.toString()),
      y: t.y,
      type: "bar",
      marker: { color: t.color || s },
      name: "Bar"
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: l } },
      yaxis: { title: { text: c } }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create a polar/radar plot for polyloops
   */
  static async radar(t, i = {}, o = "plot") {
    const { title: e, width: n = 400, height: a = 400, color: s = "steelblue" } = i, l = [...t.x, t.x[0]], r = {
      r: [...t.y, t.y[0]],
      theta: l,
      type: "scatterpolar",
      mode: "lines+markers",
      fill: "toself",
      line: { color: s },
      marker: { color: s, size: 8 },
      name: "Radar"
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      polar: {
        radialaxis: {
          visible: !0,
          range: [0, Math.max(...t.y) * 1.1]
        }
      }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create a time series plot
   */
  static async timeSeries(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      xTitle: s = "Time",
      yTitle: l = "Value"
    } = i, c = {
      x: t.x,
      y: t.y,
      type: "scatter",
      mode: "lines",
      line: { width: 2 },
      name: "Time Series"
    }, r = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: s } },
      yaxis: { title: { text: l } }
    };
    await plotly.newPlot(o, [c], r);
  }
  /**
   * Create a matrix visualization (for cellular automata)
   */
  static async matrix(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      xTitle: s = "Position",
      yTitle: l = "Time Step"
    } = i, r = {
      z: t.slice().reverse(),
      type: "heatmap",
      colorscale: [[0, "white"], [1, "black"]],
      showscale: !1,
      hoverinfo: "none"
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: {
        title: { text: s },
        showticklabels: !1
      },
      yaxis: {
        title: { text: l },
        showticklabels: !1
      }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create a 3D surface plot
   */
  static async surface(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      colorScale: s = "Viridis",
      xTitle: l = "X",
      yTitle: c = "Y",
      zTitle: r = "Z"
    } = i, y = {
      x: t.x,
      y: t.y,
      z: t.z,
      type: "surface",
      colorscale: s
    }, x = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      scene: {
        xaxis: { title: { text: l } },
        yaxis: { title: { text: c } },
        zaxis: { title: { text: r } }
      }
    };
    await plotly.newPlot(o, [y], x);
  }
  /**
   * Create multiple line plot
   */
  static async multiLine(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      xTitle: s = "X",
      yTitle: l = "Y"
    } = i, c = t.map((y, x) => ({
      x: y.x,
      y: y.y,
      type: "scatter",
      mode: "lines",
      name: `Series ${x + 1}`,
      line: { width: 2 }
    })), r = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: s } },
      yaxis: { title: { text: l } }
    };
    await plotly.newPlot(o, c, r);
  }
  /**
   * Create histogram
   */
  static async histogram(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      color: s = "steelblue",
      xTitle: l = "Value",
      yTitle: c = "Frequency"
    } = i, r = {
      x: t.x,
      type: "histogram",
      marker: { color: s },
      name: "Histogram"
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: l } },
      yaxis: { title: { text: c } }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create box plot
   */
  static async boxPlot(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      yTitle: s = "Value"
    } = i, l = t.map((r, y) => ({
      y: r.y,
      type: "box",
      name: `Dataset ${y + 1}`
    })), c = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      yaxis: { title: { text: s } }
    };
    await plotly.newPlot(o, l, c);
  }
  /**
   * Create a violin plot
   */
  static async violin(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      yTitle: s = "Value"
    } = i, l = t.map((r, y) => ({
      y: r.y,
      type: "violin",
      name: `Dataset ${y + 1}`,
      box: { visible: !0 },
      meanline: { visible: !0 }
    })), c = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      yaxis: { title: { text: s } }
    };
    await plotly.newPlot(o, l, c);
  }
  /**
   * Create a contour plot
   */
  static async contour(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      colorScale: s = "Viridis",
      xTitle: l = "X",
      yTitle: c = "Y"
    } = i, r = {
      x: t.x,
      y: t.y,
      z: t.z,
      type: "contour",
      colorscale: s,
      showscale: !0
    }, y = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: l } },
      yaxis: { title: { text: c } }
    };
    await plotly.newPlot(o, [r], y);
  }
  /**
   * Create a 3D scatter plot
   */
  static async scatter3D(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      color: s = "steelblue",
      xTitle: l = "X",
      yTitle: c = "Y",
      zTitle: r = "Z"
    } = i, y = {
      x: t.x,
      y: t.y,
      z: t.z,
      type: "scatter3d",
      mode: "markers",
      marker: {
        color: t.color || s,
        size: 4,
        opacity: 0.8
      },
      name: "3D Scatter"
    }, x = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      scene: {
        xaxis: { title: { text: l } },
        yaxis: { title: { text: c } },
        zaxis: { title: { text: r } }
      }
    };
    await plotly.newPlot(o, [y], x);
  }
  /**
   * Create animated plot with frames
   */
  static async animate(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      duration: s = 500,
      transition: l = 100
    } = i, c = t[0]?.data || [], r = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      updatemenus: [{
        type: "buttons",
        showactive: !1,
        buttons: [{
          label: "Play",
          method: "animate",
          args: [null, {
            frame: { duration: s, redraw: !0 },
            transition: { duration: l },
            fromcurrent: !0
          }]
        }, {
          label: "Pause",
          method: "animate",
          args: [[null], {
            frame: { duration: 0, redraw: !1 },
            mode: "immediate",
            transition: { duration: 0 }
          }]
        }]
      }],
      ...t[0]?.layout
    }, y = t.map((x, m) => ({
      name: m.toString(),
      data: x.data,
      layout: x.layout
    }));
    await p.newPlot(o, c, r), await plotly.addFrames(o, y);
  }
  /**
   * Create candlestick chart
   */
  static async candlestick(t, i = {}, o = "plot") {
    const {
      title: e,
      width: n = 640,
      height: a = 400,
      xTitle: s = "Time",
      yTitle: l = "Price"
    } = i, c = {
      x: t.x,
      open: t.open,
      high: t.high,
      low: t.low,
      close: t.close,
      type: "candlestick",
      name: "OHLC"
    }, r = {
      title: e ? { text: e } : void 0,
      width: n,
      height: a,
      xaxis: { title: { text: s } },
      yaxis: { title: { text: l } }
    };
    await plotly.newPlot(o, [c], r);
  }
}
class f {
  /**
   * Visualize cellular automata evolution over time
   */
  static plotEvolution(t, i = {}) {
    const {
      title: o = "Cellular Automata Evolution",
      width: e = 600,
      height: n = 400,
      colorScheme: a = "binary",
      showAxis: s = !1
    } = i, l = [];
    return t.forEach((c, r) => {
      c.forEach((y, x) => {
        l.push({
          x,
          y: t.length - 1 - r,
          // Flip Y to show time progression downward
          value: y
        });
      });
    }), h.matrix(t, {
      title: o,
      width: e,
      height: n,
      showAxis: s
    });
  }
  /**
   * Visualize a single CA generation
   */
  static plotGeneration(t, i = {}) {
    const {
      title: o = "CA Generation",
      width: e = 600,
      height: n = 100
      // colorScheme = 'binary' // supprimé car inutilisé
    } = i, a = {
      x: t.map((s, l) => l),
      y: t.map(() => 0),
      color: t.map((s) => s ? "black" : "white")
    };
    return h.scatter(a, {
      title: o,
      width: e,
      height: n,
      showAxis: !1
    });
  }
  /**
   * Compare multiple CA rules side by side
   */
  static compareRules(t, i = {}) {
    const {
      width: o = 300,
      height: e = 200,
      colorScheme: n = "binary"
    } = i;
    return t.map(
      ({ ruleNumber: a, history: s }) => this.plotEvolution(s, {
        title: `Rule ${a}`,
        width: o,
        height: e,
        colorScheme: n,
        showAxis: !1
      })
    );
  }
  /**
   * Create an animated visualization data structure
   */
  static createAnimationData(t) {
    return t.map((i, o) => ({
      frame: o,
      data: i.map((e, n) => ({
        x: n,
        y: 0,
        value: e
      }))
    }));
  }
  /**
   * Extract specific patterns from CA history
   */
  static extractPatterns(t) {
    const i = [], o = [], e = [], n = t[0]?.length || 0;
    for (let a = 0; a < n; a++) {
      const s = t.map((c) => c[a]), l = this.findPeriod(s.filter((c) => c !== void 0));
      l > 1 && l < 10 && i.push({ position: a, period: l });
    }
    if (t.length > 5) {
      const a = t[t.length - 1], s = t[t.length - 2];
      if (a && s)
        for (let l = 0; l < n - 3; l++)
          a.slice(l, l + 3).every(
            (r, y) => r === s[l + y] && r === 1
          ) && e.push({ position: l, width: 3 });
    }
    return { oscillators: i, gliders: o, stillLifes: e };
  }
  /**
   * Find the period of a repeating sequence
   */
  static findPeriod(t) {
    if (t.length < 4) return 1;
    for (let i = 1; i <= Math.floor(t.length / 2); i++) {
      let o = !0;
      for (let e = i; e < t.length; e++)
        if (t[e] !== t[e - i]) {
          o = !1;
          break;
        }
      if (o) return i;
    }
    return 1;
  }
  /**
   * Create a density plot showing CA activity over time
   */
  static plotDensity(t, i = {}) {
    const {
      title: o = "CA Density Over Time",
      width: e = 600,
      height: n = 300
    } = i, a = t.map((l, c) => ({
      time: c,
      density: l.reduce((r, y) => r + y, 0) / l.length
    })), s = {
      x: a.map((l) => l.time),
      y: a.map((l) => l.density)
    };
    return h.line(s, {
      title: o,
      width: e,
      height: n,
      color: "steelblue",
      showAxis: !0
    });
  }
  /**
   * Create a spacetime diagram with enhanced visualization
   */
  static plotSpacetime(t, i = {}) {
    const {
      title: o = "Spacetime Diagram",
      width: e = 600,
      height: n = 400,
      showGrid: a = !1
    } = i, s = [];
    return t.forEach((l, c) => {
      l.forEach((r, y) => {
        s.push({
          x: y,
          y: t.length - 1 - c,
          value: r,
          border: a
        });
      });
    }), h.matrix(t, {
      title: o,
      width: e,
      height: n,
      showAxis: !1
    });
  }
}
export {
  f as CAVisualizer
};
