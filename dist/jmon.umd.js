var JmonStudio = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/utils/jmon-validator.browser.js
  var JmonValidator;
  var init_jmon_validator_browser = __esm({
    "src/utils/jmon-validator.browser.js"() {
      JmonValidator = class {
        constructor() {
          console.warn(
            "[JMON] Using simplified browser validator. For full validation, use Node.js environment."
          );
        }
        /**
         * Basic validation and normalization for browser use
         * @param {Object} obj - JMON object to validate
         * @returns {Object} { valid, errors, normalized }
         */
        validateAndNormalize(obj) {
          const errors = [];
          let normalized = { ...obj };
          try {
            if (!obj || typeof obj !== "object") {
              errors.push("Object must be a valid object");
              return { valid: false, errors, normalized: null };
            }
            if (!normalized.tracks && !normalized.notes) {
              if (Array.isArray(obj)) {
                normalized = { tracks: [{ notes: obj }] };
              } else {
                normalized.tracks = normalized.tracks || [];
              }
            }
            if (normalized.notes && !normalized.tracks) {
              normalized.tracks = [{ notes: normalized.notes }];
              delete normalized.notes;
            }
            if (!Array.isArray(normalized.tracks)) {
              normalized.tracks = [normalized.tracks];
            }
            normalized.tracks.forEach((track, trackIndex) => {
              if (!track.notes) {
                errors.push(`Track ${trackIndex} missing notes array`);
                return;
              }
              if (!Array.isArray(track.notes)) {
                errors.push(`Track ${trackIndex} notes must be an array`);
                return;
              }
              track.notes.forEach((note, noteIndex) => {
                if (typeof note !== "object") {
                  errors.push(
                    `Track ${trackIndex}, note ${noteIndex}: must be an object`
                  );
                  return;
                }
                if (note.pitch === void 0) {
                  note.pitch = null;
                }
                if (note.duration === void 0) {
                  note.duration = 1;
                }
                if (note.time === void 0) {
                  note.time = 0;
                }
              });
            });
            normalized.format = normalized.format || "jmon";
            normalized.version = normalized.version || "1.0";
            normalized.timeSignature = normalized.timeSignature || "4/4";
            normalized.keySignature = normalized.keySignature || "C";
            return {
              valid: errors.length === 0,
              errors,
              normalized
            };
          } catch (error) {
            errors.push(`Validation error: ${error.message}`);
            return {
              valid: false,
              errors,
              normalized: null
            };
          }
        }
        /**
         * Simple validation without normalization
         * @param {Object} obj - JMON object to validate
         * @returns {boolean} true if valid
         */
        isValid(obj) {
          const result = this.validateAndNormalize(obj);
          return result.valid;
        }
      };
    }
  });

  // src/algorithms/visualization/plots/PlotRenderer.js
  async function getPlotly() {
    if (plotlyLoadAttempted)
      return Plotly;
    plotlyLoadAttempted = true;
    try {
      if (typeof window !== "undefined" && window.Plotly) {
        Plotly = window.Plotly;
        return Plotly;
      }
      if (typeof window === "undefined") {
        const plotlyPackage = "plotly.js";
        const plotlyModule = await import(plotlyPackage);
        Plotly = plotlyModule.default || plotlyModule;
        return Plotly;
      }
      return null;
    } catch (error) {
      console.warn("Plotly.js not available. Visualization methods will return placeholder data.");
      return null;
    }
  }
  var Plotly, plotlyLoadAttempted, PlotRenderer;
  var init_PlotRenderer = __esm({
    "src/algorithms/visualization/plots/PlotRenderer.js"() {
      Plotly = null;
      plotlyLoadAttempted = false;
      PlotRenderer = class {
        /**
         * Create a line plot
         */
        static async line(data, options = {}, elementId = "plot") {
          const plotly2 = await getPlotly();
          if (!plotly2) {
            return { data, options, type: "line", message: "Plotly.js not available" };
          }
          const {
            title,
            width = 640,
            height = 400,
            color = "steelblue",
            xTitle = "X",
            yTitle = "Y"
          } = options;
          const trace = {
            x: data.x,
            y: data.y,
            type: "scatter",
            mode: "lines",
            line: { color, width: 2 },
            name: "Line"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly2.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a scatter plot
         */
        static async scatter(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            color = "steelblue",
            xTitle = "X",
            yTitle = "Y"
          } = options;
          const trace = {
            x: data.x,
            y: data.y,
            type: "scatter",
            mode: "markers",
            marker: {
              color: data.color || color,
              size: data.size || 8
            },
            name: "Scatter"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a heatmap from 2D matrix data
         */
        static async heatmap(matrix, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            colorScale = "Viridis",
            xTitle = "X",
            yTitle = "Y"
          } = options;
          const trace = {
            z: matrix,
            type: "heatmap",
            colorscale: colorScale,
            showscale: true
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a bar chart
         */
        static async bar(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            color = "steelblue",
            xTitle = "X",
            yTitle = "Y"
          } = options;
          const trace = {
            x: data.x.map((x) => x.toString()),
            y: data.y,
            type: "bar",
            marker: { color: data.color || color },
            name: "Bar"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a polar/radar plot for polyloops
         */
        static async radar(data, options = {}, elementId = "plot") {
          const { title, width = 400, height = 400, color = "steelblue" } = options;
          const angles = [...data.x, data.x[0]];
          const values = [...data.y, data.y[0]];
          const trace = {
            r: values,
            theta: angles,
            type: "scatterpolar",
            mode: "lines+markers",
            fill: "toself",
            line: { color },
            marker: { color, size: 8 },
            name: "Radar"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            polar: {
              radialaxis: {
                visible: true,
                range: [0, Math.max(...data.y) * 1.1]
              }
            }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a time series plot
         */
        static async timeSeries(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            xTitle = "Time",
            yTitle = "Value"
          } = options;
          const trace = {
            x: data.x,
            y: data.y,
            type: "scatter",
            mode: "lines",
            line: { width: 2 },
            name: "Time Series"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a matrix visualization (for cellular automata)
         */
        static async matrix(matrix, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            xTitle = "Position",
            yTitle = "Time Step"
          } = options;
          const flippedMatrix = matrix.slice().reverse();
          const trace = {
            z: flippedMatrix,
            type: "heatmap",
            colorscale: [[0, "white"], [1, "black"]],
            showscale: false,
            hoverinfo: "none"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: {
              title: { text: xTitle },
              showticklabels: false
            },
            yaxis: {
              title: { text: yTitle },
              showticklabels: false
            }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a 3D surface plot
         */
        static async surface(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            colorScale = "Viridis",
            xTitle = "X",
            yTitle = "Y",
            zTitle = "Z"
          } = options;
          const trace = {
            x: data.x,
            y: data.y,
            z: data.z,
            type: "surface",
            colorscale: colorScale
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            scene: {
              xaxis: { title: { text: xTitle } },
              yaxis: { title: { text: yTitle } },
              zaxis: { title: { text: zTitle } }
            }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create multiple line plot
         */
        static async multiLine(datasets, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            xTitle = "X",
            yTitle = "Y"
          } = options;
          const traces = datasets.map((data, i) => ({
            x: data.x,
            y: data.y,
            type: "scatter",
            mode: "lines",
            name: `Series ${i + 1}`,
            line: { width: 2 }
          }));
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, traces, layout);
        }
        /**
         * Create histogram
         */
        static async histogram(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            color = "steelblue",
            xTitle = "Value",
            yTitle = "Frequency"
          } = options;
          const trace = {
            x: data.x,
            type: "histogram",
            marker: { color },
            name: "Histogram"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create box plot
         */
        static async boxPlot(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            yTitle = "Value"
          } = options;
          const traces = data.map((dataset, i) => ({
            y: dataset.y,
            type: "box",
            name: `Dataset ${i + 1}`
          }));
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, traces, layout);
        }
        /**
         * Create a violin plot
         */
        static async violin(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            yTitle = "Value"
          } = options;
          const traces = data.map((dataset, i) => ({
            y: dataset.y,
            type: "violin",
            name: `Dataset ${i + 1}`,
            box: { visible: true },
            meanline: { visible: true }
          }));
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, traces, layout);
        }
        /**
         * Create a contour plot
         */
        static async contour(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            colorScale = "Viridis",
            xTitle = "X",
            yTitle = "Y"
          } = options;
          const trace = {
            x: data.x,
            y: data.y,
            z: data.z,
            type: "contour",
            colorscale: colorScale,
            showscale: true
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a 3D scatter plot
         */
        static async scatter3D(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            color = "steelblue",
            xTitle = "X",
            yTitle = "Y",
            zTitle = "Z"
          } = options;
          const trace = {
            x: data.x,
            y: data.y,
            z: data.z,
            type: "scatter3d",
            mode: "markers",
            marker: {
              color: data.color || color,
              size: 4,
              opacity: 0.8
            },
            name: "3D Scatter"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            scene: {
              xaxis: { title: { text: xTitle } },
              yaxis: { title: { text: yTitle } },
              zaxis: { title: { text: zTitle } }
            }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
        /**
         * Create animated plot with frames
         */
        static async animate(frames, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            duration = 500,
            transition = 100
          } = options;
          const initialData = frames[0]?.data || [];
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            updatemenus: [{
              type: "buttons",
              showactive: false,
              buttons: [{
                label: "Play",
                method: "animate",
                args: [null, {
                  frame: { duration, redraw: true },
                  transition: { duration: transition },
                  fromcurrent: true
                }]
              }, {
                label: "Pause",
                method: "animate",
                args: [[null], {
                  frame: { duration: 0, redraw: false },
                  mode: "immediate",
                  transition: { duration: 0 }
                }]
              }]
            }],
            ...frames[0]?.layout
          };
          const plotlyFrames = frames.map((frame, i) => ({
            name: i.toString(),
            data: frame.data,
            layout: frame.layout
          }));
          await Plotly.newPlot(elementId, initialData, layout);
          await plotly.addFrames(elementId, plotlyFrames);
        }
        /**
         * Create candlestick chart
         */
        static async candlestick(data, options = {}, elementId = "plot") {
          const {
            title,
            width = 640,
            height = 400,
            xTitle = "Time",
            yTitle = "Price"
          } = options;
          const trace = {
            x: data.x,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            type: "candlestick",
            name: "OHLC"
          };
          const layout = {
            title: title ? { text: title } : void 0,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
          };
          await plotly.newPlot(elementId, [trace], layout);
        }
      };
    }
  });

  // src/algorithms/visualization/cellular-automata/CAVisualizer.js
  var CAVisualizer_exports = {};
  __export(CAVisualizer_exports, {
    CAVisualizer: () => CAVisualizer
  });
  var CAVisualizer;
  var init_CAVisualizer = __esm({
    "src/algorithms/visualization/cellular-automata/CAVisualizer.js"() {
      init_PlotRenderer();
      CAVisualizer = class {
        /**
         * Visualize cellular automata evolution over time
         */
        static plotEvolution(history, options = {}) {
          const {
            title = "Cellular Automata Evolution",
            width = 600,
            height = 400,
            colorScheme = "binary",
            showAxis = false
          } = options;
          const plotData = [];
          history.forEach((row, timeStep) => {
            row.forEach((cell, position) => {
              plotData.push({
                x: position,
                y: history.length - 1 - timeStep,
                // Flip Y to show time progression downward
                value: cell
              });
            });
          });
          return PlotRenderer.matrix(history, {
            title,
            width,
            height,
            showAxis
          });
        }
        /**
         * Visualize a single CA generation
         */
        static plotGeneration(generation, options = {}) {
          const {
            title = "CA Generation",
            width = 600,
            height = 100
            // colorScheme = 'binary' // supprimé car inutilisé
          } = options;
          const plotData = {
            x: generation.map((_, i) => i),
            y: generation.map(() => 0),
            color: generation.map((cell) => cell ? "black" : "white")
          };
          return PlotRenderer.scatter(plotData, {
            title,
            width,
            height,
            showAxis: false
          });
        }
        /**
         * Compare multiple CA rules side by side
         */
        static compareRules(rules, options = {}) {
          const {
            width = 300,
            height = 200,
            colorScheme = "binary"
          } = options;
          return rules.map(
            ({ ruleNumber, history }) => this.plotEvolution(history, {
              title: `Rule ${ruleNumber}`,
              width,
              height,
              colorScheme,
              showAxis: false
            })
          );
        }
        /**
         * Create an animated visualization data structure
         */
        static createAnimationData(history) {
          return history.map((generation, frame) => ({
            frame,
            data: generation.map((cell, x) => ({
              x,
              y: 0,
              value: cell
            }))
          }));
        }
        /**
         * Extract specific patterns from CA history
         */
        static extractPatterns(history) {
          const oscillators = [];
          const gliders = [];
          const stillLifes = [];
          const width = history[0]?.length || 0;
          for (let pos = 0; pos < width; pos++) {
            const column = history.map((row) => row[pos]);
            const period = this.findPeriod(column.filter((v) => v !== void 0));
            if (period > 1 && period < 10) {
              oscillators.push({ position: pos, period });
            }
          }
          if (history.length > 5) {
            const lastGen = history[history.length - 1];
            const prevGen = history[history.length - 2];
            if (lastGen && prevGen) {
              for (let pos = 0; pos < width - 3; pos++) {
                const isStable = lastGen.slice(pos, pos + 3).every(
                  (cell, i) => cell === prevGen[pos + i] && cell === 1
                );
                if (isStable) {
                  stillLifes.push({ position: pos, width: 3 });
                }
              }
            }
          }
          return { oscillators, gliders, stillLifes };
        }
        /**
         * Find the period of a repeating sequence
         */
        static findPeriod(sequence) {
          if (sequence.length < 4)
            return 1;
          for (let period = 1; period <= Math.floor(sequence.length / 2); period++) {
            let isRepeating = true;
            for (let i = period; i < sequence.length; i++) {
              if (sequence[i] !== sequence[i - period]) {
                isRepeating = false;
                break;
              }
            }
            if (isRepeating)
              return period;
          }
          return 1;
        }
        /**
         * Create a density plot showing CA activity over time
         */
        static plotDensity(history, options = {}) {
          const {
            title = "CA Density Over Time",
            width = 600,
            height = 300
          } = options;
          const densityData = history.map((generation, time) => ({
            time,
            density: generation.reduce((sum, cell) => sum + cell, 0) / generation.length
          }));
          const plotData = {
            x: densityData.map((d) => d.time),
            y: densityData.map((d) => d.density)
          };
          return PlotRenderer.line(plotData, {
            title,
            width,
            height,
            color: "steelblue",
            showAxis: true
          });
        }
        /**
         * Create a spacetime diagram with enhanced visualization
         */
        static plotSpacetime(history, options = {}) {
          const {
            title = "Spacetime Diagram",
            width = 600,
            height = 400,
            showGrid = false
          } = options;
          const plotData = [];
          history.forEach((row, timeStep) => {
            row.forEach((cell, position) => {
              plotData.push({
                x: position,
                y: history.length - 1 - timeStep,
                value: cell,
                border: showGrid
              });
            });
          });
          return PlotRenderer.matrix(history, {
            title,
            width,
            height,
            showAxis: false
          });
        }
      };
    }
  });

  // src/algorithms/visualization/loops/LoopVisualizer.js
  var LoopVisualizer_exports = {};
  __export(LoopVisualizer_exports, {
    LoopVisualizer: () => LoopVisualizer
  });
  async function getPlotly2() {
    if (plotlyLoadAttempted2)
      return Plotly2;
    plotlyLoadAttempted2 = true;
    try {
      if (typeof window !== "undefined" && window.Plotly) {
        Plotly2 = window.Plotly;
        return Plotly2;
      }
      if (typeof window === "undefined") {
        const plotlyPackage = "plotly.js";
        const plotlyModule = await import(plotlyPackage);
        Plotly2 = plotlyModule.default || plotlyModule;
        return Plotly2;
      }
      return null;
    } catch (error) {
      console.warn("Plotly.js not available. Visualization methods will return placeholder data.");
      return null;
    }
  }
  var Plotly2, plotlyLoadAttempted2, LoopVisualizer;
  var init_LoopVisualizer = __esm({
    "src/algorithms/visualization/loops/LoopVisualizer.js"() {
      Plotly2 = null;
      plotlyLoadAttempted2 = false;
      LoopVisualizer = class {
        /**
         * Plot loops using polar coordinate system, matching Python implementation
         * Works with JMON-compliant loop data
         */
        static async plotLoops(loops, measureLength = 4, pulse = 1 / 4, colors = null, options = {}) {
          const {
            container = "loop-plot",
            title = "Loop Visualization",
            showDurationArcs = true,
            showMarkers = true,
            showShapes = true,
            colorScheme = "colorblind"
            // 'colorblind', 'viridis', 'classic'
          } = options;
          const tracks = Object.values(loops);
          const layerColors = colors || this.generateColors(tracks.length, colorScheme);
          const traces = [];
          tracks.forEach((track, trackIndex) => {
            if (!track.notes || track.notes.length === 0)
              return;
            const activeNotes = track.notes.filter((note) => note.pitch !== null);
            if (activeNotes.length === 0)
              return;
            if (showDurationArcs || showMarkers) {
              activeNotes.forEach((note) => {
                const startTheta = note.time / measureLength * 360;
                const durationTheta = note.duration / measureLength * 360;
                if (showDurationArcs && durationTheta > 1) {
                  const arcPoints = this.generateArcPoints(startTheta, durationTheta, 50);
                  const radius = Array(50).fill(tracks.length - trackIndex - 1);
                  traces.push({
                    type: "scatterpolar",
                    r: radius,
                    theta: arcPoints,
                    mode: "lines",
                    line: {
                      color: "rgba(60, 60, 60, 0.65)",
                      width: 8
                    },
                    name: `${track.label} Duration`,
                    showlegend: false
                  });
                }
                if (showMarkers) {
                  [startTheta, (startTheta + durationTheta) % 360].forEach((theta) => {
                    traces.push({
                      type: "scatterpolar",
                      r: [tracks.length - trackIndex - 0.9, tracks.length - trackIndex - 1.1],
                      theta: [theta, theta],
                      mode: "lines",
                      line: {
                        color: "Black",
                        width: 3
                      },
                      name: `${track.label} Markers`,
                      showlegend: false
                    });
                  });
                }
              });
            }
            if (showShapes) {
              const noteAngles = activeNotes.map((note) => note.time / measureLength * 360);
              if (noteAngles.length > 1) {
                noteAngles.push(noteAngles[0]);
                traces.push({
                  type: "scatterpolar",
                  r: Array(noteAngles.length).fill(tracks.length - trackIndex - 1),
                  theta: noteAngles,
                  mode: "lines",
                  line: {
                    color: "rgba(0, 0, 0, 0.65)",
                    width: 1
                  },
                  fill: "toself",
                  fillcolor: layerColors[trackIndex % layerColors.length],
                  name: track.label,
                  showlegend: false
                });
              }
            }
          });
          const tickvals = this.generateTickValues(measureLength, pulse);
          const ticktext = this.generateTickLabels(measureLength, pulse);
          const trackNames = tracks.map((track) => track.label).reverse();
          const layout = {
            title: { text: title },
            polar: {
              radialaxis: {
                visible: true,
                range: [tracks.length, -0.1],
                tickvals: Array.from({ length: tracks.length }, (_, i) => i),
                ticktext: trackNames
              },
              angularaxis: {
                tickvals,
                ticktext,
                direction: "clockwise",
                rotation: 90
              }
            },
            template: "none",
            showlegend: false
          };
          const config = {
            responsive: true,
            displayModeBar: true
          };
          const plotly2 = await getPlotly2();
          if (!plotly2) {
            throw new Error("Plotly.js not available for visualization");
          }
          return plotly2.newPlot(container, traces, layout, config);
        }
        /**
         * Generate colors using different schemes, optimized for accessibility
         */
        static generateColors(count, scheme = "colorblind") {
          const colors = [];
          switch (scheme) {
            case "colorblind":
              const cbPalette = [
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
              for (let i = 0; i < count; i++) {
                colors.push(cbPalette[i % cbPalette.length]);
              }
              break;
            case "viridis":
              const viridisColors = [
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
              for (let i = 0; i < count; i++) {
                if (count <= viridisColors.length) {
                  colors.push(viridisColors[i]);
                } else {
                  const ratio = i / (count - 1);
                  const scaledIndex = ratio * (viridisColors.length - 1);
                  const lowerIndex = Math.floor(scaledIndex);
                  const upperIndex = Math.min(lowerIndex + 1, viridisColors.length - 1);
                  colors.push(viridisColors[lowerIndex]);
                }
              }
              break;
            case "classic":
            default:
              for (let i = 0; i < count; i++) {
                const hue = i / count;
                const rgb = this.hsvToRgb(hue, 1, 1);
                colors.push(`rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, 0.5)`);
              }
              break;
          }
          return colors;
        }
        /**
         * Convert HSV to RGB color space
         */
        static hsvToRgb(h, s, v) {
          let r, g, b;
          const i = Math.floor(h * 6);
          const f = h * 6 - i;
          const p = v * (1 - s);
          const q = v * (1 - f * s);
          const t = v * (1 - (1 - f) * s);
          switch (i % 6) {
            case 0:
              r = v;
              g = t;
              b = p;
              break;
            case 1:
              r = q;
              g = v;
              b = p;
              break;
            case 2:
              r = p;
              g = v;
              b = t;
              break;
            case 3:
              r = p;
              g = q;
              b = v;
              break;
            case 4:
              r = t;
              g = p;
              b = v;
              break;
            case 5:
              r = v;
              g = p;
              b = q;
              break;
            default:
              r = g = b = 0;
          }
          return { r, g, b };
        }
        /**
         * Generate arc points for smooth curves
         */
        static generateArcPoints(startTheta, durationTheta, numPoints) {
          const points = [];
          const endTheta = startTheta + durationTheta;
          for (let i = 0; i < numPoints; i++) {
            const theta = startTheta + i / (numPoints - 1) * durationTheta;
            points.push(theta % 360);
          }
          return points;
        }
        /**
         * Generate tick values for angular axis
         */
        static generateTickValues(measureLength, pulse) {
          const tickvals = [];
          const numTicks = Math.floor(measureLength / pulse);
          for (let i = 0; i < numTicks; i++) {
            tickvals.push(i * 360 / numTicks);
          }
          return tickvals;
        }
        /**
         * Generate tick labels for angular axis
         */
        static generateTickLabels(measureLength, pulse) {
          const ticktext = [];
          const numTicks = Math.floor(measureLength / pulse);
          for (let i = 0; i < numTicks; i++) {
            const beat = i * pulse % measureLength;
            ticktext.push(beat.toString());
          }
          return ticktext;
        }
      };
    }
  });

  // src/algorithms/theory/harmony/PerformanceCompiler.js
  function compilePerformanceTrack(track, options = {}) {
    const { timeSignature = "4/4", tempo = 120 } = options;
    const notes = Array.isArray(track?.notes) ? track.notes : [];
    const modulations = [];
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      if (!n || typeof n !== "object")
        continue;
      const isRest = n.pitch === null || n.pitch === void 0;
      const onset = toNumber(n.time, 0);
      const dur = toNumber(n.duration, 0);
      const end = onset + Math.max(0, dur);
      const arts = normalizeArticulations(n);
      if (arts.length === 0)
        continue;
      for (const art of arts) {
        const type = typeof art === "string" ? art : art.type;
        if (!type)
          continue;
        switch (type) {
          case "staccato": {
            modulations.push({
              type: "durationScale",
              index: i,
              factor: 0.5,
              start: onset,
              end
            });
            break;
          }
          case "tenuto": {
            modulations.push({
              type: "durationScale",
              index: i,
              factor: 1.1,
              start: onset,
              end
            });
            break;
          }
          case "accent": {
            modulations.push({
              type: "velocityBoost",
              index: i,
              amountBoost: 0.2,
              start: onset,
              end: onset + Math.min(0.1, dur)
              // short emphasis
            });
            break;
          }
          case "marcato": {
            modulations.push({
              type: "velocityBoost",
              index: i,
              amountBoost: 0.3,
              start: onset,
              end: onset + Math.min(0.15, dur)
            });
            modulations.push({
              type: "durationScale",
              index: i,
              factor: 0.9,
              start: onset,
              end
            });
            break;
          }
          case "glissando":
          case "portamento": {
            if (isRest)
              break;
            const fromPitch = toMainPitch(n.pitch);
            const toPitch = typeof art.target === "number" ? art.target : void 0;
            if (typeof fromPitch !== "number" || typeof toPitch !== "number")
              break;
            modulations.push({
              type: "pitch",
              subtype: type,
              index: i,
              from: fromPitch,
              to: toPitch,
              start: onset,
              end,
              curve: art.curve || "linear"
            });
            break;
          }
          case "bend": {
            const amount = toNumber(art.amount, void 0);
            if (amount === void 0)
              break;
            modulations.push({
              type: "pitch",
              subtype: "bend",
              index: i,
              amount,
              start: onset,
              end,
              curve: art.curve || "linear"
            });
            break;
          }
          case "vibrato": {
            modulations.push({
              type: "pitch",
              subtype: "vibrato",
              index: i,
              rate: toNumber(art.rate, 5),
              depth: toNumber(art.depth, 50),
              start: onset,
              end
            });
            break;
          }
          case "tremolo": {
            modulations.push({
              type: "amplitude",
              subtype: "tremolo",
              index: i,
              rate: toNumber(art.rate, 8),
              depth: clamp01(art.depth ?? 0.3),
              start: onset,
              end
            });
            break;
          }
          case "crescendo":
          case "diminuendo": {
            const startV = clamp01(n.velocity ?? 0.8);
            const endV = clamp01(toNumber(art.endVelocity, type === "crescendo" ? Math.min(1, startV + 0.2) : Math.max(0, startV - 0.2)));
            modulations.push({
              type: "amplitude",
              subtype: type,
              index: i,
              startVelocity: startV,
              endVelocity: endV,
              start: onset,
              end,
              curve: art.curve || "linear"
            });
            break;
          }
          default:
            break;
        }
      }
    }
    return { notes, modulations };
  }
  function compilePerformance(composition, options = {}) {
    const tracks = normalizeTracks(composition?.tracks);
    const compiled = tracks.map((t) => compilePerformanceTrack(t, options));
    const metadata = composition?.metadata ? { ...composition.metadata } : void 0;
    return { tracks: compiled, ...metadata ? { metadata } : {} };
  }
  function normalizeArticulations(note) {
    const out = [];
    if (Array.isArray(note?.articulations)) {
      for (const a of note.articulations) {
        if (typeof a === "string")
          out.push({ type: a });
        else if (a && typeof a === "object" && typeof a.type === "string")
          out.push({ ...a });
      }
    }
    return out;
  }
  function normalizeTracks(tracks) {
    if (Array.isArray(tracks)) {
      return tracks.map((t, i) => Array.isArray(t?.notes) ? t : { name: `Track ${i + 1}`, notes: Array.isArray(t) ? t : t?.notes || [] });
    }
    if (tracks && typeof tracks === "object") {
      return Object.entries(tracks).map(([name, notes], i) => ({
        name: name || `Track ${i + 1}`,
        notes: Array.isArray(notes?.notes) ? notes.notes : Array.isArray(notes) ? notes : []
      }));
    }
    return [];
  }
  function toMainPitch(pitch) {
    if (pitch == null)
      return void 0;
    if (Array.isArray(pitch)) {
      const arr = pitch.filter((x) => typeof x === "number");
      if (arr.length === 0)
        return void 0;
      return Math.min(...arr);
    }
    if (typeof pitch === "number")
      return pitch;
    return void 0;
  }
  function toNumber(v, fallback) {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  function clamp01(v) {
    const n = toNumber(v, 0);
    if (!Number.isFinite(n))
      return 0;
    return Math.max(0, Math.min(1, n));
  }
  var init_PerformanceCompiler = __esm({
    "src/algorithms/theory/harmony/PerformanceCompiler.js"() {
    }
  });

  // src/algorithms/audio/index.js
  function compileEvents(track, options = {}) {
    return compilePerformanceTrack(track, options);
  }
  function compileTimeline(track, options = {}) {
    return compilePerformanceTrack(track, options);
  }
  function deriveTimeline(track, options = {}) {
    return compilePerformanceTrack(track, options);
  }
  function compileComposition(composition, options = {}) {
    return compilePerformance(composition, options);
  }
  var audio_default;
  var init_audio = __esm({
    "src/algorithms/audio/index.js"() {
      init_PerformanceCompiler();
      audio_default = {
        compileEvents,
        compileTimeline,
        deriveTimeline,
        compileComposition
      };
    }
  });

  // src/utils/normalize.js
  function midiToNoteName(midiLike) {
    const n = typeof midiLike === "string" ? parseInt(midiLike, 10) : midiLike;
    if (!Number.isFinite(n))
      return String(midiLike);
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const note = names[(n % 12 + 12) % 12];
    const octave = Math.floor(n / 12) - 1;
    return `${note}${octave}`;
  }
  function normalizeSamplerUrlsToNoteNames(composition) {
    if (!composition || !Array.isArray(composition.audioGraph))
      return composition;
    composition.audioGraph.forEach((node) => {
      try {
        if (!node || node.type !== "Sampler")
          return;
        const opts = node.options || {};
        const urls = opts.urls;
        if (!urls || typeof urls !== "object")
          return;
        const normalized = {};
        Object.keys(urls).forEach((k) => {
          const keyStr = String(k);
          let noteKey = keyStr;
          if (/^\d+$/.test(keyStr)) {
            noteKey = midiToNoteName(parseInt(keyStr, 10));
          }
          normalized[noteKey] = urls[k];
        });
        node.options = { ...opts, urls: normalized };
      } catch (_) {
      }
    });
    return composition;
  }
  var init_normalize = __esm({
    "src/utils/normalize.js"() {
    }
  });

  // src/converters/tonejs.js
  function tonejs(composition, options = {}) {
    try {
      normalizeSamplerUrlsToNoteNames(composition);
    } catch (_) {
    }
    const converter = new Tonejs(options);
    const originalTracks = converter.convert(composition);
    const tracks = originalTracks.map((track, index) => ({
      originalTrackIndex: index,
      voiceIndex: 0,
      totalVoices: 1,
      trackInfo: { label: track.label },
      synthConfig: { type: track.type || "PolySynth" },
      partEvents: track.part || []
    }));
    const bpm = composition.tempo || composition.metadata?.tempo || composition.bpm || 120;
    const [tsNum, tsDen] = (composition.timeSignature || "4/4").split("/").map((x) => parseInt(x, 10));
    const beatsPerBar = isFinite(tsNum) ? tsNum : 4;
    let totalBeats = 0;
    tracks.forEach((track) => {
      if (track.partEvents && track.partEvents.length > 0) {
        track.partEvents.forEach((ev) => {
          const startBeats = Tonejs.parseBBTToBeats(ev.time, beatsPerBar);
          const durBeats = Tonejs.parseDurationToBeats(ev.duration, beatsPerBar);
          const endBeats = startBeats + durBeats;
          if (endBeats > totalBeats)
            totalBeats = endBeats;
        });
      }
    });
    const secondsPerBeat = 60 / bpm;
    const totalDuration = totalBeats * secondsPerBeat;
    console.log(`[TONEJS] Duration calc: totalBeats=${totalBeats.toFixed(2)} beats = ${totalDuration.toFixed(2)}s - loop ends exactly when last note finishes`);
    return {
      tracks,
      metadata: {
        totalDuration,
        // Use total duration - loop should end when last note finishes
        tempo: bpm
      }
    };
  }
  var Tonejs;
  var init_tonejs = __esm({
    "src/converters/tonejs.js"() {
      init_normalize();
      Tonejs = class {
        constructor(options = {}) {
          this.options = options;
        }
        // Parse bars:beats:ticks -> beats (supports fractional beats)
        static parseBBTToBeats(timeStr, beatsPerBar = 4, ppq = 480) {
          if (typeof timeStr === "number")
            return timeStr;
          if (typeof timeStr !== "string")
            return 0;
          const m = timeStr.match(/^(\d+):(\d+(?:\.\d+)?):(\d+)$/);
          if (!m)
            return 0;
          const bars = parseInt(m[1], 10);
          const beats = parseFloat(m[2]);
          const ticks = parseInt(m[3], 10);
          return bars * beatsPerBar + beats + ticks / ppq;
        }
        // Parse note value (e.g., 4n, 8n, 8t) or BBT to beats
        static parseDurationToBeats(dur, beatsPerBar = 4, ppq = 480) {
          if (typeof dur === "number")
            return dur;
          if (typeof dur !== "string")
            return 0;
          if (/^\d+:\d+(?:\.\d+)?:\d+$/.test(dur)) {
            return this.parseBBTToBeats(dur, beatsPerBar, ppq);
          }
          const m = dur.match(/^(\d+)(n|t)$/);
          if (m) {
            const val = parseInt(m[1], 10);
            const type = m[2];
            if (type === "n") {
              return 4 / val;
            } else if (type === "t") {
              return 4 / val * (2 / 3);
            }
          }
          return 0;
        }
        convert(composition) {
          const tracks = composition.tracks || [];
          return tracks.map((track) => ({
            label: track.label,
            type: "PolySynth",
            // Default type for the current player
            part: (track.notes || []).map((note) => ({
              time: note.time,
              pitch: note.pitch,
              duration: note.duration,
              velocity: note.velocity || 0.8
            }))
          }));
        }
      };
    }
  });

  // src/utils/gm-instruments.js
  var gm_instruments_exports = {};
  __export(gm_instruments_exports, {
    CDN_SOURCES: () => CDN_SOURCES,
    GM_INSTRUMENTS: () => GM_INSTRUMENTS,
    createGMInstrumentNode: () => createGMInstrumentNode,
    findGMProgramByName: () => findGMProgramByName,
    generateCompleteSamplerUrls: () => generateCompleteSamplerUrls,
    generateSamplerUrls: () => generateSamplerUrls,
    getPopularInstruments: () => getPopularInstruments
  });
  function generateSamplerUrls(gmProgram, baseUrl = CDN_SOURCES[0], noteRange = [21, 108], strategy = "complete") {
    const instrument = GM_INSTRUMENTS[gmProgram];
    if (!instrument) {
      console.warn(
        `GM program ${gmProgram} not found, using Acoustic Grand Piano`
      );
      return generateSamplerUrls(0, baseUrl, noteRange);
    }
    const urls = {};
    const [minNote, maxNote] = noteRange;
    let selectedMidis = [];
    switch (strategy) {
      case "minimal":
        for (let midi2 = minNote; midi2 <= maxNote; midi2 += 12) {
          selectedMidis.push(midi2);
        }
        selectedMidis.push(60);
        break;
      case "balanced":
        for (let midi2 = minNote; midi2 <= maxNote; midi2 += 4) {
          selectedMidis.push(midi2);
        }
        [60, 64, 67].forEach((key) => {
          if (key >= minNote && key <= maxNote && !selectedMidis.includes(key)) {
            selectedMidis.push(key);
          }
        });
        break;
      case "quality":
        for (let midi2 = minNote; midi2 <= maxNote; midi2 += 3) {
          selectedMidis.push(midi2);
        }
        break;
      case "complete":
        for (let midi2 = minNote; midi2 <= maxNote; midi2++) {
          selectedMidis.push(midi2);
        }
        break;
      default:
        console.warn(`Unknown sampling strategy '${strategy}', using 'balanced'`);
        return generateSamplerUrls(gmProgram, baseUrl, noteRange, "balanced");
    }
    selectedMidis = [...new Set(selectedMidis)].sort((a, b) => a - b);
    for (const midi2 of selectedMidis) {
      const noteName = midiToNoteName2(midi2);
      urls[noteName] = generateFallbackUrl(instrument.folder, noteName, baseUrl);
    }
    console.log(
      `[GM INSTRUMENT] Generated ${Object.keys(urls).length} sample URLs for ${instrument.name} (${strategy} strategy)`
    );
    return urls;
  }
  function generateFallbackUrl(folder, noteName, preferredBaseUrl) {
    return `${preferredBaseUrl}/${folder}/${noteName}.mp3`;
  }
  function generateCompleteSamplerUrls(gmProgram, baseUrl = CDN_SOURCES[0], noteRange = [21, 108]) {
    const instrument = GM_INSTRUMENTS[gmProgram];
    if (!instrument) {
      console.warn(
        `GM program ${gmProgram} not found, using Acoustic Grand Piano`
      );
      return generateCompleteSamplerUrls(0, baseUrl, noteRange);
    }
    const urls = {};
    const [minNote, maxNote] = noteRange;
    for (let midi2 = minNote; midi2 <= maxNote; midi2++) {
      const noteName = midiToNoteName2(midi2);
      urls[noteName] = `${baseUrl}/${instrument.folder}/${noteName}.mp3`;
    }
    return urls;
  }
  function midiToNoteName2(midi2) {
    const noteNames = [
      "C",
      "Db",
      "D",
      "Eb",
      "E",
      "F",
      "Gb",
      "G",
      "Ab",
      "A",
      "Bb",
      "B"
    ];
    const octave = Math.floor(midi2 / 12) - 1;
    const noteIndex = midi2 % 12;
    return `${noteNames[noteIndex]}${octave}`;
  }
  function findGMProgramByName(instrumentName) {
    const searchName = instrumentName.toLowerCase().trim();
    for (const [program, instrument] of Object.entries(GM_INSTRUMENTS)) {
      if (instrument.name.toLowerCase() === searchName) {
        return parseInt(program, 10);
      }
    }
    for (const [program, instrument] of Object.entries(GM_INSTRUMENTS)) {
      const instName = instrument.name.toLowerCase();
      if (instName.includes(searchName) || searchName.includes(instName.split(" ")[0])) {
        return parseInt(program, 10);
      }
    }
    return null;
  }
  function createGMInstrumentNode(id, instrument, options = {}, target = "destination") {
    let gmProgram;
    if (typeof instrument === "string") {
      gmProgram = findGMProgramByName(instrument);
      if (gmProgram === null) {
        console.warn(`GM instrument "${instrument}" not found. Available instruments:`);
        const availableNames = Object.values(GM_INSTRUMENTS).map((inst) => inst.name).slice(0, 10);
        console.warn(`Examples: ${availableNames.join(", ")}...`);
        console.warn("Using Acoustic Grand Piano as fallback");
        gmProgram = 0;
      }
    } else {
      gmProgram = instrument;
    }
    const instrumentData = GM_INSTRUMENTS[gmProgram];
    if (!instrumentData)
      return null;
    const {
      baseUrl = CDN_SOURCES[0],
      noteRange = [21, 108],
      // Complete MIDI range for maximum quality
      envelope = { attack: 0.1, release: 1 },
      strategy = "complete"
      // Use complete sampling by default
    } = options;
    return {
      id,
      type: "Sampler",
      options: {
        urls: generateSamplerUrls(gmProgram, baseUrl, noteRange, strategy),
        baseUrl: "",
        // URLs are already complete
        envelope: {
          enabled: true,
          attack: envelope.attack,
          release: envelope.release
        }
      },
      target
    };
  }
  function getPopularInstruments() {
    return [
      // Piano & Keys
      { program: 0, name: "Acoustic Grand Piano", category: "Piano" },
      { program: 1, name: "Bright Acoustic Piano", category: "Piano" },
      { program: 4, name: "Electric Piano 1", category: "Piano" },
      { program: 6, name: "Harpsichord", category: "Piano" },
      // Strings
      { program: 40, name: "Violin", category: "Strings" },
      { program: 42, name: "Cello", category: "Strings" },
      { program: 48, name: "String Ensemble 1", category: "Strings" },
      // Brass
      { program: 56, name: "Trumpet", category: "Brass" },
      { program: 57, name: "Trombone", category: "Brass" },
      // Woodwinds
      { program: 65, name: "Alto Sax", category: "Woodwinds" },
      { program: 71, name: "Clarinet", category: "Woodwinds" },
      { program: 73, name: "Flute", category: "Woodwinds" },
      // Guitar & Bass
      { program: 24, name: "Acoustic Guitar (nylon)", category: "Guitar" },
      { program: 25, name: "Acoustic Guitar (steel)", category: "Guitar" },
      { program: 33, name: "Electric Bass (finger)", category: "Bass" },
      // Organ & Accordion
      { program: 16, name: "Drawbar Organ", category: "Organ" },
      { program: 21, name: "Accordion", category: "Organ" }
    ];
  }
  var GM_INSTRUMENTS, CDN_SOURCES;
  var init_gm_instruments = __esm({
    "src/utils/gm-instruments.js"() {
      GM_INSTRUMENTS = {
        // Piano Family
        0: { name: "Acoustic Grand Piano", folder: "acoustic_grand_piano-mp3" },
        1: { name: "Bright Acoustic Piano", folder: "bright_acoustic_piano-mp3" },
        2: { name: "Electric Grand Piano", folder: "electric_grand_piano-mp3" },
        3: { name: "Honky-tonk Piano", folder: "honkytonk_piano-mp3" },
        4: { name: "Electric Piano 1", folder: "electric_piano_1-mp3" },
        5: { name: "Electric Piano 2", folder: "electric_piano_2-mp3" },
        6: { name: "Harpsichord", folder: "harpsichord-mp3" },
        7: { name: "Clavinet", folder: "clavinet-mp3" },
        // Chromatic Percussion
        8: { name: "Celesta", folder: "celesta-mp3" },
        9: { name: "Glockenspiel", folder: "glockenspiel-mp3" },
        10: { name: "Music Box", folder: "music_box-mp3" },
        11: { name: "Vibraphone", folder: "vibraphone-mp3" },
        12: { name: "Marimba", folder: "marimba-mp3" },
        13: { name: "Xylophone", folder: "xylophone-mp3" },
        14: { name: "Tubular Bells", folder: "tubular_bells-mp3" },
        15: { name: "Dulcimer", folder: "dulcimer-mp3" },
        // Organ
        16: { name: "Drawbar Organ", folder: "drawbar_organ-mp3" },
        17: { name: "Percussive Organ", folder: "percussive_organ-mp3" },
        18: { name: "Rock Organ", folder: "rock_organ-mp3" },
        19: { name: "Church Organ", folder: "church_organ-mp3" },
        20: { name: "Reed Organ", folder: "reed_organ-mp3" },
        21: { name: "Accordion", folder: "accordion-mp3" },
        22: { name: "Harmonica", folder: "harmonica-mp3" },
        23: { name: "Tango Accordion", folder: "tango_accordion-mp3" },
        // Guitar
        24: { name: "Acoustic Guitar (nylon)", folder: "acoustic_guitar_nylon-mp3" },
        25: { name: "Acoustic Guitar (steel)", folder: "acoustic_guitar_steel-mp3" },
        26: { name: "Electric Guitar (jazz)", folder: "electric_guitar_jazz-mp3" },
        27: { name: "Electric Guitar (clean)", folder: "electric_guitar_clean-mp3" },
        28: { name: "Electric Guitar (muted)", folder: "electric_guitar_muted-mp3" },
        29: { name: "Overdriven Guitar", folder: "overdriven_guitar-mp3" },
        30: { name: "Distortion Guitar", folder: "distortion_guitar-mp3" },
        31: { name: "Guitar Harmonics", folder: "guitar_harmonics-mp3" },
        // Bass
        32: { name: "Acoustic Bass", folder: "acoustic_bass-mp3" },
        33: { name: "Electric Bass (finger)", folder: "electric_bass_finger-mp3" },
        34: { name: "Electric Bass (pick)", folder: "electric_bass_pick-mp3" },
        35: { name: "Fretless Bass", folder: "fretless_bass-mp3" },
        36: { name: "Slap Bass 1", folder: "slap_bass_1-mp3" },
        37: { name: "Slap Bass 2", folder: "slap_bass_2-mp3" },
        38: { name: "Synth Bass 1", folder: "synth_bass_1-mp3" },
        39: { name: "Synth Bass 2", folder: "synth_bass_2-mp3" },
        // Strings
        40: { name: "Violin", folder: "violin-mp3" },
        41: { name: "Viola", folder: "viola-mp3" },
        42: { name: "Cello", folder: "cello-mp3" },
        43: { name: "Contrabass", folder: "contrabass-mp3" },
        44: { name: "Tremolo Strings", folder: "tremolo_strings-mp3" },
        45: { name: "Pizzicato Strings", folder: "pizzicato_strings-mp3" },
        46: { name: "Orchestral Harp", folder: "orchestral_harp-mp3" },
        47: { name: "Timpani", folder: "timpani-mp3" },
        // Popular selections for common use
        48: { name: "String Ensemble 1", folder: "string_ensemble_1-mp3" },
        49: { name: "String Ensemble 2", folder: "string_ensemble_2-mp3" },
        56: { name: "Trumpet", folder: "trumpet-mp3" },
        57: { name: "Trombone", folder: "trombone-mp3" },
        58: { name: "Tuba", folder: "tuba-mp3" },
        64: { name: "Soprano Sax", folder: "soprano_sax-mp3" },
        65: { name: "Alto Sax", folder: "alto_sax-mp3" },
        66: { name: "Tenor Sax", folder: "tenor_sax-mp3" },
        67: { name: "Baritone Sax", folder: "baritone_sax-mp3" },
        68: { name: "Oboe", folder: "oboe-mp3" },
        69: { name: "English Horn", folder: "english_horn-mp3" },
        70: { name: "Bassoon", folder: "bassoon-mp3" },
        71: { name: "Clarinet", folder: "clarinet-mp3" },
        72: { name: "Piccolo", folder: "piccolo-mp3" },
        73: { name: "Flute", folder: "flute-mp3" },
        74: { name: "Recorder", folder: "recorder-mp3" }
      };
      CDN_SOURCES = [
        "https://raw.githubusercontent.com/jmonlabs/midi-js-soundfonts/gh-pages/FluidR3_GM",
        "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM"
      ];
    }
  });

  // src/converters/midi.js
  function midi(composition) {
    return Midi.convert(composition);
  }
  var Midi;
  var init_midi = __esm({
    "src/converters/midi.js"() {
      init_audio();
      Midi = class _Midi {
        static midiToNoteName(midi2) {
          const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
          const octave = Math.floor(midi2 / 12) - 1;
          const noteIndex = midi2 % 12;
          return noteNames[noteIndex] + octave;
        }
        static convert(composition) {
          const bpm = composition.tempo || composition.bpm || 120;
          const timeSignature = composition.timeSignature || "4/4";
          const rawTracks = composition.tracks || [];
          const tracksArray = Array.isArray(rawTracks) ? rawTracks : rawTracks && typeof rawTracks === "object" ? Object.values(rawTracks) : [];
          return {
            header: {
              bpm,
              timeSignature
            },
            tracks: tracksArray.map((track) => {
              const label = track.label || track.name;
              const notesSrc = Array.isArray(track.notes) ? track.notes : Array.isArray(track) ? track : [];
              const safeNotes = Array.isArray(notesSrc) ? notesSrc : [];
              const perf = compileEvents({ notes: safeNotes }, { tempo: bpm, timeSignature });
              const notes = safeNotes.map((note) => ({
                pitch: note.pitch,
                noteName: typeof note.pitch === "number" ? _Midi.midiToNoteName(note.pitch) : note.pitch,
                time: note.time,
                duration: note.duration,
                velocity: note.velocity || 0.8
              }));
              return {
                label,
                notes,
                modulations: perf && Array.isArray(perf.modulations) ? perf.modulations : []
              };
            })
          };
        }
      };
    }
  });

  // src/converters/midi-to-jmon.js
  async function midiToJmon(midiData, options = {}) {
    const isArrayBuffer = typeof ArrayBuffer !== "undefined" && midiData instanceof ArrayBuffer;
    const isUint8Array = typeof Uint8Array !== "undefined" && midiData instanceof Uint8Array;
    if (!isArrayBuffer && !isUint8Array) {
      throw new TypeError("midiToJmon: 'midiData' must be an ArrayBuffer or Uint8Array");
    }
    return await MidiToJmon.convert(midiData, options);
  }
  var MidiToJmon;
  var init_midi_to_jmon = __esm({
    "src/converters/midi-to-jmon.js"() {
      init_jmon_validator_browser();
      MidiToJmon = class _MidiToJmon {
        constructor(options = {}) {
          this.options = {
            Tone: null,
            trackNaming: "auto",
            // 'auto', 'numbered', 'channel', 'instrument'
            mergeDrums: true,
            quantize: null,
            // e.g., 0.25 for 16th note quantization
            includeModulations: true,
            includeTempo: true,
            includeKeySignature: true,
            ...options
          };
        }
        /**
         * Static conversion method
         * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
         * @param {Object} options - Conversion options
         * @returns {Promise<Object>} JMON composition
         */
        static async convert(midiData, options = {}) {
          const converter = new _MidiToJmon(options);
          return await converter.convertToJmon(midiData);
        }
        /**
         * Main conversion method
         * @param {ArrayBuffer|Uint8Array} midiData - MIDI file data
         * @returns {Promise<Object>} JMON composition
         */
        async convertToJmon(midiData) {
          const Tone2 = await this.initializeTone();
          let parsed;
          try {
            parsed = new Tone2.Midi(midiData);
          } catch (error) {
            throw new Error(`Failed to parse MIDI file: ${error.message}`);
          }
          const composition = this.buildJmonComposition(parsed, Tone2);
          const validator = new JmonValidator();
          const { valid, normalized, errors } = validator.validateAndNormalize(
            composition
          );
          if (!valid) {
            console.warn("Generated JMON failed validation:", errors);
          }
          return valid ? normalized : composition;
        }
        /**
         * Initialize Tone.js instance following music-player.js pattern
         * @returns {Promise<Object>} Tone.js instance
         */
        async initializeTone() {
          const externalTone = this.options.Tone;
          if (typeof window !== "undefined") {
            const existingTone = externalTone || window.Tone || (typeof Tone !== "undefined" ? Tone : null);
            if (existingTone) {
              return existingTone;
            }
            try {
              const toneModule = await import("tone");
              return toneModule.default || toneModule;
            } catch (error) {
              throw new Error(
                "Tone.js not found. Please provide Tone instance or load Tone.js"
              );
            }
          } else {
            if (externalTone) {
              return externalTone;
            }
            throw new Error("Tone instance required in Node.js environment");
          }
        }
        /**
         * Build JMON composition from parsed MIDI
         * @param {Object} parsed - Parsed MIDI from Tone.js
         * @param {Object} Tone - Tone.js instance
         * @returns {Object} JMON composition
         */
        buildJmonComposition(parsed, Tone2) {
          const composition = {
            format: "jmon",
            version: "1.0",
            tempo: this.extractTempo(parsed),
            tracks: this.convertTracks(parsed.tracks, Tone2, parsed)
          };
          const timeSignature = this.extractTimeSignature(parsed);
          if (timeSignature) {
            composition.timeSignature = timeSignature;
          }
          const keySignature = this.extractKeySignature(parsed);
          if (keySignature) {
            composition.keySignature = keySignature;
          }
          const metadata = this.extractMetadata(parsed);
          if (Object.keys(metadata).length > 0) {
            composition.metadata = metadata;
          }
          if (this.options.includeTempo && this.hasTempoChanges(parsed)) {
            composition.tempoMap = this.extractTempoMap(parsed);
          }
          if (this.hasTimeSignatureChanges(parsed)) {
            composition.timeSignatureMap = this.extractTimeSignatureMap(parsed);
          }
          return composition;
        }
        /**
         * Convert MIDI tracks to JMON tracks
         * @param {Array} tracks - MIDI tracks from Tone.js
         * @param {Object} Tone - Tone.js instance
         * @param {Object} parsed - Full parsed MIDI data
         * @returns {Array} JMON tracks
         */
        convertTracks(tracks, Tone2, parsed) {
          const jmonTracks = [];
          let trackIndex = 0;
          for (const track of tracks) {
            if (!track.notes || track.notes.length === 0) {
              continue;
            }
            const trackName = this.generateTrackName(track, trackIndex, parsed);
            const isDrumTrack = this.isDrumTrack(track);
            const notes = track.notes.map(
              (note) => this.convertNote(note, Tone2, track)
            );
            const processedNotes = this.options.quantize ? this.quantizeNotes(notes, this.options.quantize) : notes;
            const jmonTrack = {
              label: trackName,
              notes: processedNotes
            };
            if (track.channel !== void 0) {
              jmonTrack.midiChannel = track.channel;
            }
            if (track.instrument) {
              jmonTrack.synth = {
                type: isDrumTrack ? "Sampler" : "PolySynth",
                options: this.getInstrumentOptions(track.instrument, isDrumTrack)
              };
            }
            if (this.options.includeModulations && track.controlChanges) {
              const modulations = this.extractModulations(track.controlChanges);
              if (modulations.length > 0) {
                this.applyModulationsToTrack(jmonTrack, modulations);
              }
            }
            jmonTracks.push(jmonTrack);
            trackIndex++;
          }
          return jmonTracks;
        }
        /**
         * Convert MIDI note to JMON note
         * @param {Object} note - MIDI note from Tone.js
         * @param {Object} Tone - Tone.js instance
         * @param {Object} track - Parent track for context
         * @returns {Object} JMON note
         */
        convertNote(note, Tone2, track) {
          const jmonNote = {
            pitch: note.midi,
            // Use MIDI number as primary format
            time: note.time,
            // Tone.js already converts to seconds, we'll convert to quarters
            duration: this.convertDurationToNoteValue(note.duration),
            velocity: note.velocity
          };
          const bpm = note.tempo || 120;
          jmonNote.time = this.convertSecondsToQuarterNotes(note.time, bpm);
          if (this.options.includeModulations && note.controlChanges) {
            const noteModulations = this.convertNoteModulations(note.controlChanges);
            if (noteModulations.length > 0) {
              jmonNote.modulations = noteModulations;
            }
          }
          return jmonNote;
        }
        /**
         * Generate track name based on naming strategy
         * @param {Object} track - MIDI track
         * @param {number} index - Track index
         * @param {Object} parsed - Full parsed MIDI
         * @returns {string} Track name
         */
        generateTrackName(track, index, parsed) {
          switch (this.options.trackNaming) {
            case "numbered":
              return `Track ${index + 1}`;
            case "channel":
              return `Channel ${(track.channel || 0) + 1}`;
            case "instrument":
              if (track.instrument) {
                return track.instrument.name || `Instrument ${track.instrument.number}`;
              }
              return `Track ${index + 1}`;
            case "auto":
            default:
              if (track.name && track.name.trim()) {
                return track.name.trim();
              }
              if (this.isDrumTrack(track)) {
                return "Drums";
              }
              if (track.instrument && track.instrument.name) {
                return track.instrument.name;
              }
              if (track.channel !== void 0) {
                return track.channel === 9 ? "Drums" : `Channel ${track.channel + 1}`;
              }
              return `Track ${index + 1}`;
          }
        }
        /**
         * Check if track is a drum track (channel 10/9 in MIDI)
         * @param {Object} track - MIDI track
         * @returns {boolean} True if drum track
         */
        isDrumTrack(track) {
          return track.channel === 9;
        }
        /**
         * Get instrument options for synth configuration
         * @param {Object} instrument - MIDI instrument info
         * @param {boolean} isDrum - Whether this is a drum track
         * @returns {Object} Synth options
         */
        getInstrumentOptions(instrument, isDrum) {
          if (isDrum) {
            return {
              envelope: {
                enabled: true,
                attack: 0.02,
                decay: 0.1,
                sustain: 0.8,
                release: 0.3
              }
            };
          }
          return {
            oscillator: { type: "triangle" },
            envelope: {
              attack: 0.1,
              decay: 0.2,
              sustain: 0.7,
              release: 1
            }
          };
        }
        /**
         * Extract tempo from MIDI
         * @param {Object} parsed - Parsed MIDI
         * @returns {number} BPM
         */
        extractTempo(parsed) {
          if (parsed.header && parsed.header.tempos && parsed.header.tempos.length > 0) {
            return Math.round(parsed.header.tempos[0].bpm);
          }
          for (const track of parsed.tracks) {
            if (track.tempoEvents && track.tempoEvents.length > 0) {
              return Math.round(track.tempoEvents[0].bpm);
            }
          }
          return 120;
        }
        /**
         * Extract time signature from MIDI
         * @param {Object} parsed - Parsed MIDI
         * @returns {string|null} Time signature like "4/4"
         */
        extractTimeSignature(parsed) {
          if (parsed.header && parsed.header.timeSignatures && parsed.header.timeSignatures.length > 0) {
            const ts = parsed.header.timeSignatures[0];
            return `${ts.numerator}/${ts.denominator}`;
          }
          for (const track of parsed.tracks) {
            if (track.timeSignatureEvents && track.timeSignatureEvents.length > 0) {
              const ts = track.timeSignatureEvents[0];
              return `${ts.numerator}/${ts.denominator}`;
            }
          }
          return null;
        }
        /**
         * Extract key signature from MIDI
         * @param {Object} parsed - Parsed MIDI
         * @returns {string|null} Key signature like "C", "G", "Dm"
         */
        extractKeySignature(parsed) {
          return null;
        }
        /**
         * Extract metadata from MIDI
         * @param {Object} parsed - Parsed MIDI
         * @returns {Object} Metadata object
         */
        extractMetadata(parsed) {
          const metadata = {};
          for (const track of parsed.tracks) {
            if (track.meta) {
              for (const meta of track.meta) {
                switch (meta.type) {
                  case "trackName":
                  case "text":
                    if (!metadata.title && meta.text && meta.text.trim()) {
                      metadata.title = meta.text.trim();
                    }
                    break;
                  case "copyright":
                    if (meta.text && meta.text.trim()) {
                      metadata.copyright = meta.text.trim();
                    }
                    break;
                  case "composer":
                    if (meta.text && meta.text.trim()) {
                      metadata.composer = meta.text.trim();
                    }
                    break;
                }
              }
            }
          }
          return metadata;
        }
        /**
         * Check if MIDI has tempo changes
         * @param {Object} parsed - Parsed MIDI
         * @returns {boolean} True if has tempo changes
         */
        hasTempoChanges(parsed) {
          if (parsed.header && parsed.header.tempos && parsed.header.tempos.length > 1) {
            return true;
          }
          for (const track of parsed.tracks) {
            if (track.tempoEvents && track.tempoEvents.length > 1) {
              return true;
            }
          }
          return false;
        }
        /**
         * Extract tempo map for tempo changes
         * @param {Object} parsed - Parsed MIDI
         * @returns {Array} Tempo map events
         */
        extractTempoMap(parsed) {
          const tempoMap = [];
          const allTempoEvents = [];
          if (parsed.header && parsed.header.tempos) {
            allTempoEvents.push(...parsed.header.tempos.map((t) => ({
              time: t.time,
              tempo: Math.round(t.bpm)
            })));
          }
          for (const track of parsed.tracks) {
            if (track.tempoEvents) {
              allTempoEvents.push(...track.tempoEvents.map((t) => ({
                time: t.time,
                tempo: Math.round(t.bpm)
              })));
            }
          }
          allTempoEvents.sort((a, b) => a.time - b.time);
          for (const event of allTempoEvents) {
            tempoMap.push({
              time: this.convertSecondsToQuarterNotes(event.time, event.tempo),
              tempo: event.tempo
            });
          }
          return tempoMap;
        }
        /**
         * Check if MIDI has time signature changes
         * @param {Object} parsed - Parsed MIDI
         * @returns {boolean} True if has time signature changes
         */
        hasTimeSignatureChanges(parsed) {
          if (parsed.header && parsed.header.timeSignatures && parsed.header.timeSignatures.length > 1) {
            return true;
          }
          for (const track of parsed.tracks) {
            if (track.timeSignatureEvents && track.timeSignatureEvents.length > 1) {
              return true;
            }
          }
          return false;
        }
        /**
         * Extract time signature map for time signature changes
         * @param {Object} parsed - Parsed MIDI
         * @returns {Array} Time signature map events
         */
        extractTimeSignatureMap(parsed) {
          const timeSignatureMap = [];
          const allTSEvents = [];
          if (parsed.header && parsed.header.timeSignatures) {
            allTSEvents.push(...parsed.header.timeSignatures);
          }
          for (const track of parsed.tracks) {
            if (track.timeSignatureEvents) {
              allTSEvents.push(...track.timeSignatureEvents);
            }
          }
          allTSEvents.sort((a, b) => a.time - b.time);
          for (const event of allTSEvents) {
            timeSignatureMap.push({
              time: this.convertSecondsToQuarterNotes(event.time, 120),
              // Use default tempo for conversion
              timeSignature: `${event.numerator}/${event.denominator}`
            });
          }
          return timeSignatureMap;
        }
        /**
         * Convert seconds to quarter notes
         * @param {number} seconds - Time in seconds
         * @param {number} bpm - Beats per minute
         * @returns {number} Time in quarter notes
         */
        convertSecondsToQuarterNotes(seconds, bpm) {
          const quarterNoteLength = 60 / bpm;
          return seconds / quarterNoteLength;
        }
        /**
         * Convert duration to note value string
         * @param {number} duration - Duration in seconds
         * @returns {string} Note value like "4n", "8n"
         */
        convertDurationToNoteValue(duration) {
          const quarterNote = 0.5;
          const ratio = duration / quarterNote;
          if (ratio >= 3.5)
            return "1n";
          if (ratio >= 1.75)
            return "2n";
          if (ratio >= 0.875)
            return "4n";
          if (ratio >= 0.4375)
            return "8n";
          if (ratio >= 0.21875)
            return "16n";
          if (ratio >= 0.109375)
            return "32n";
          return "16n";
        }
        /**
         * Extract modulations from MIDI control changes
         * @param {Object} controlChanges - MIDI CC events
         * @returns {Array} Modulation events
         */
        extractModulations(controlChanges) {
          const modulations = [];
          for (const [cc, events] of Object.entries(controlChanges)) {
            const ccNumber = parseInt(cc);
            for (const event of events) {
              const modulation = {
                type: "cc",
                controller: ccNumber,
                value: event.value,
                time: this.convertSecondsToQuarterNotes(event.time, 120)
              };
              modulations.push(modulation);
            }
          }
          return modulations;
        }
        /**
         * Convert note-level modulations
         * @param {Object} controlChanges - Note-level CC events
         * @returns {Array} Note modulation events
         */
        convertNoteModulations(controlChanges) {
          return this.extractModulations(controlChanges);
        }
        /**
         * Apply modulations to track
         * @param {Object} track - JMON track
         * @param {Array} modulations - Modulation events
         */
        applyModulationsToTrack(track, modulations) {
          if (modulations.length > 0) {
            track.automation = [{
              id: "midi_cc",
              target: "midi.cc1",
              // Default to modulation wheel
              anchorPoints: modulations.map((mod) => ({
                time: mod.time,
                value: mod.value
              }))
            }];
          }
        }
        /**
         * Quantize notes to grid
         * @param {Array} notes - Notes to quantize
         * @param {number} grid - Grid size in quarter notes
         * @returns {Array} Quantized notes
         */
        quantizeNotes(notes, grid) {
          return notes.map((note) => ({
            ...note,
            time: Math.round(note.time / grid) * grid
          }));
        }
      };
    }
  });

  // src/converters/wav.js
  function wav(composition, options = {}) {
    return {
      sampleRate: options.sampleRate || 44100,
      duration: options.duration || 10,
      channels: options.channels || 1,
      tempo: composition.tempo || composition.bpm || 120,
      notes: composition.tracks?.flatMap((t) => t.notes) || []
    };
  }
  var init_wav = __esm({
    "src/converters/wav.js"() {
    }
  });

  // src/converters/supercollider.js
  function supercollider(composition) {
    return Supercollider.convert(composition);
  }
  var Supercollider;
  var init_supercollider = __esm({
    "src/converters/supercollider.js"() {
      Supercollider = class {
        static convert(composition) {
          const title = composition.metadata?.name || "Untitled";
          let sc = `// SuperCollider script generated from JMON
// Title: ${title}
`;
          const notes = composition.tracks?.[0]?.notes || [];
          notes.forEach((note) => {
            sc += `Synth("default", ["freq", ${note.pitch}, "dur", ${note.duration}]);
`;
          });
          return sc;
        }
      };
    }
  });

  // src/utils/notation/deriveVisualFromArticulations.js
  function normalizeArticulations2(articulations) {
    const out = [];
    if (!Array.isArray(articulations))
      return out;
    for (const a of articulations) {
      if (typeof a === "string") {
        out.push({ type: a });
      } else if (a && typeof a === "object" && typeof a.type === "string") {
        out.push({ ...a });
      }
    }
    return out;
  }
  function resolveAccentPrecedence(types) {
    const staccato = types.has("staccato");
    const marcato = types.has("marcato");
    const tenuto = types.has("tenuto");
    const accent = !marcato && types.has("accent");
    return { staccato, accent, tenuto, marcato };
  }
  function mapToVexFlowArticulationCodes(resolved) {
    const codes = [];
    if (resolved.staccato)
      codes.push("a.");
    if (resolved.accent)
      codes.push("a>");
    if (resolved.tenuto)
      codes.push("a-");
    if (resolved.marcato)
      codes.push("a^");
    return codes;
  }
  function mapToAbcDecorations(arts, options = {}) {
    const includeFermata = options.includeFermata !== false;
    const abc = [];
    const types = new Set(arts.map((a) => a.type));
    const resolved = resolveAccentPrecedence(types);
    if (resolved.staccato)
      abc.push("!staccato!");
    if (resolved.accent)
      abc.push("!accent!");
    if (resolved.tenuto)
      abc.push("!tenuto!");
    if (resolved.marcato)
      abc.push("!marcato!");
    const want = (t) => types.has(t);
    if (includeFermata && want("fermata"))
      abc.push("!fermata!");
    if (want("trill"))
      abc.push("!trill!");
    if (want("mordent"))
      abc.push("!mordent!");
    if (want("turn"))
      abc.push("!turn!");
    if (want("arpeggio"))
      abc.push("!arpeggio!");
    if (want("glissando") || want("portamento"))
      abc.push("!slide!");
    return abc;
  }
  function extractStrokeHint(arts) {
    const stroke = arts.find((a) => a.type === "stroke") || arts.find((a) => a.type === "arpeggio") || arts.find((a) => a.type === "arpeggiate");
    if (!stroke)
      return null;
    const dir = typeof stroke.direction === "string" && stroke.direction.toLowerCase() === "down" ? "down" : "up";
    const style = typeof stroke.style === "string" && stroke.style.toLowerCase() === "brush" ? "brush" : "roll";
    return { direction: dir, style };
  }
  function extractGlissHint(arts) {
    const a = arts.find((x) => x.type === "glissando" || x.type === "portamento");
    if (!a)
      return null;
    const text = a.type === "portamento" ? "port." : "gliss.";
    const out = { type: a.type, text };
    if (typeof a.target === "number")
      out.target = a.target;
    if (typeof a.curve === "string")
      out.curve = a.curve;
    return out;
  }
  function deriveVisualFromArticulations(articulations, options = {}) {
    const arts = normalizeArticulations2(articulations);
    const has = new Set(arts.map((a) => a.type));
    const resolved = resolveAccentPrecedence(has);
    const abcDecorations = mapToAbcDecorations(arts, options.abc);
    const vfArticulations = mapToVexFlowArticulationCodes(resolved);
    const vfStroke = extractStrokeHint(arts);
    const vfGliss = extractGlissHint(arts);
    return {
      has,
      abc: { decorations: abcDecorations },
      vexflow: {
        articulations: vfArticulations,
        stroke: vfStroke,
        gliss: vfGliss
      }
    };
  }
  var init_deriveVisualFromArticulations = __esm({
    "src/utils/notation/deriveVisualFromArticulations.js"() {
    }
  });

  // src/converters/vexflow.js
  function convertToVexFlow(composition, options = {}) {
    const converter = new VexFlowConverter();
    const vexFlowData = converter.convertToVexFlow(composition);
    if (options.elementId) {
      const rendererConfig = converter.createRenderer(
        options.elementId,
        options.width,
        options.height
      );
      return converter.generateRenderingInstructions(vexFlowData, rendererConfig);
    }
    return vexFlowData;
  }
  var VexFlowConverter;
  var init_vexflow = __esm({
    "src/converters/vexflow.js"() {
      init_deriveVisualFromArticulations();
      VexFlowConverter = class {
        constructor() {
          this.noteMap = {
            60: "C/4",
            61: "C#/4",
            62: "D/4",
            63: "D#/4",
            64: "E/4",
            65: "F/4",
            66: "F#/4",
            67: "G/4",
            68: "G#/4",
            69: "A/4",
            70: "A#/4",
            71: "B/4",
            72: "C/5",
            73: "C#/5",
            74: "D/5",
            75: "D#/5",
            76: "E/5",
            77: "F/5",
            78: "F#/5",
            79: "G/5",
            80: "G#/5",
            81: "A/5",
            82: "A#/5",
            83: "B/5"
          };
        }
        /**
         * Convert MIDI note number to VexFlow pitch notation
         */
        midiToVexFlow(midiNote) {
          if (this.noteMap[midiNote]) {
            return this.noteMap[midiNote];
          }
          const octave = Math.floor(midiNote / 12) - 1;
          const noteNames = [
            "C",
            "C#",
            "D",
            "D#",
            "E",
            "F",
            "F#",
            "G",
            "G#",
            "A",
            "A#",
            "B"
          ];
          const noteName = noteNames[midiNote % 12];
          return `${noteName}/${octave}`;
        }
        /**
         * Convert duration to VexFlow duration string
         */
        durationToVexFlow(duration) {
          if (duration >= 4)
            return "w";
          if (duration >= 2)
            return "h";
          if (duration >= 1)
            return "q";
          if (duration >= 0.5)
            return "8";
          if (duration >= 0.25)
            return "16";
          return "32";
        }
        /**
         * Convert JMON composition to VexFlow format
         */
        convertToVexFlow(composition) {
          const result = {
            timeSignature: composition.timeSignature || "4/4",
            keySignature: composition.keySignature || "C",
            clef: composition.clef,
            metadata: composition.metadata || {},
            tempo: composition.tempo ?? composition.bpm ?? null,
            tracks: []
          };
          let tracks = [];
          if (Array.isArray(composition.tracks)) {
            tracks = composition.tracks.map((t, i) => ({
              name: t.name || `Track ${i + 1}`,
              notes: t.notes || t,
              clef: t.clef
            }));
          } else if (composition.tracks && typeof composition.tracks === "object") {
            tracks = Object.entries(composition.tracks).map(([name, notes], i) => ({
              name: name || `Track ${i + 1}`,
              notes,
              clef: notes && notes.clef || void 0
            }));
          } else if (composition.notes) {
            tracks = [{
              name: composition.name || "Track 1",
              notes: composition.notes,
              clef: composition.clef
            }];
          } else {
            tracks = [{
              name: "Track 1",
              notes: composition,
              clef: composition.clef
            }];
          }
          tracks.forEach((track, trackIndex) => {
            const notes = track.notes || track;
            const vexFlowNotes = [];
            if (Array.isArray(notes)) {
              notes.forEach((note) => {
                const pitches = Array.isArray(note.pitch) ? note.pitch : note.pitch !== null && note.pitch !== void 0 ? [note.pitch] : [];
                if (pitches.length > 0) {
                  const vexFlowNote = {
                    keys: pitches.map(
                      (p) => String(this.midiToVexFlow(p)).toLowerCase()
                    ),
                    duration: this.durationToVexFlow(note.duration || 1),
                    time: note.time ?? 0
                  };
                  if (note.articulation || Array.isArray(note.articulations) && note.articulations.length) {
                    if (note.articulation && typeof note.articulation === "string") {
                      vexFlowNote.articulations = [note.articulation];
                    } else if (Array.isArray(note.articulations) && note.articulations.length) {
                      const hints = deriveVisualFromArticulations(note.articulations);
                      if (hints && hints.vexflow) {
                        if (Array.isArray(hints.vexflow.articulations) && hints.vexflow.articulations.length) {
                          vexFlowNote.vfArticulations = hints.vexflow.articulations.slice();
                        }
                        if (hints.vexflow.stroke) {
                          vexFlowNote.stroke = { ...hints.vexflow.stroke };
                        }
                        if (hints.vexflow.gliss) {
                          const g = hints.vexflow.gliss;
                          try {
                            vexFlowNote.gliss = {
                              type: g.type,
                              targetKey: typeof g.target === "number" ? String(this.midiToVexFlow(g.target)).toLowerCase() : void 0,
                              curve: g.curve || "linear",
                              text: g.text || (g.type === "portamento" ? "port." : "gliss.")
                            };
                          } catch (_) {
                          }
                        }
                      }
                    }
                  }
                  if (Array.isArray(note.ornaments) && note.ornaments.length) {
                    vexFlowNote.ornaments = note.ornaments.map((ornament) => {
                      const processedOrnament = { type: ornament.type };
                      if (ornament.parameters) {
                        processedOrnament.parameters = { ...ornament.parameters };
                        if (ornament.type === "grace_note" && ornament.parameters.gracePitches) {
                          processedOrnament.parameters.gracePitches = ornament.parameters.gracePitches.map((pitch) => {
                            if (typeof pitch === "number") {
                              return this.midiToVexFlow(pitch);
                            }
                            return pitch;
                          });
                        }
                      }
                      return processedOrnament;
                    });
                  }
                  vexFlowNotes.push(vexFlowNote);
                } else {
                  vexFlowNotes.push({
                    keys: [],
                    duration: this.durationToVexFlow(note.duration || 1),
                    time: note.time ?? 0,
                    isRest: true
                  });
                }
              });
            }
            result.tracks.push({
              name: track.name || `Track ${trackIndex + 1}`,
              notes: vexFlowNotes,
              clef: track.clef
            });
          });
          return result;
        }
        /**
         * Create VexFlow renderer configuration
         */
        createRenderer(elementId, width = 800, height = 200) {
          return {
            elementId,
            width,
            height,
            renderer: "svg",
            // or 'canvas'
            scale: 1
          };
        }
        /**
         * Generate VexFlow rendering instructions
         */
        generateRenderingInstructions(vexFlowData, rendererConfig) {
          return {
            type: "vexflow",
            data: vexFlowData,
            config: rendererConfig,
            render: function(VF) {
              const targetEl = rendererConfig.element && rendererConfig.element.nodeType === 1 ? rendererConfig.element : rendererConfig.elementId ? document.getElementById(rendererConfig.elementId) : null;
              let div = targetEl;
              const root = document.body || document.documentElement;
              if (!div) {
                div = document.createElement("div");
                div.id = rendererConfig.elementId || `vexflow-${Date.now()}`;
                root.appendChild(div);
              } else {
                if (!div.id) {
                  div.id = rendererConfig.elementId || `vexflow-${Date.now()}`;
                }
                if (!root.contains(div)) {
                  root.appendChild(div);
                }
              }
              rendererConfig.elementId = div.id;
              const VFNS = (() => {
                const candidates = [
                  VF,
                  VF && VF.default,
                  typeof window !== "undefined" && (window.VF || window.VexFlow),
                  typeof window !== "undefined" && window.Vex && (window.Vex.Flow || window.Vex)
                ];
                for (const c of candidates) {
                  if (c)
                    return c;
                }
                return null;
              })();
              try {
                const FactoryCtor = VFNS && (VFNS.Factory || VFNS.Flow && VFNS.Flow.Factory || VFNS.VF && VFNS.VF.Factory);
                if (!FactoryCtor) {
                  throw new Error("VexFlow Factory API not available on this build");
                }
                const factory = new FactoryCtor({
                  renderer: {
                    // Use elementId for VexFlow Factory (falls back to generated div id)
                    elementId: rendererConfig.elementId || div.id,
                    width: rendererConfig.width,
                    height: rendererConfig.height
                  }
                });
                const context = factory.getContext();
                const Flow = VFNS && (VFNS.Flow || VFNS) || {};
                const accMode = rendererConfig.accidentalsMode || "auto";
                const getKeyAccidentalMap = (key) => {
                  const k = (key || "C").trim();
                  const majorSharps = {
                    C: 0,
                    G: 1,
                    D: 2,
                    A: 3,
                    E: 4,
                    B: 5,
                    "F#": 6,
                    "C#": 7
                  };
                  const majorFlats = {
                    C: 0,
                    F: 1,
                    Bb: 2,
                    Eb: 3,
                    Ab: 4,
                    Db: 5,
                    Gb: 6,
                    Cb: 7
                  };
                  const minorSharps = {
                    A: 0,
                    E: 1,
                    B: 2,
                    "F#": 3,
                    "C#": 4,
                    "G#": 5,
                    "D#": 6,
                    "A#": 7
                  };
                  const minorFlats = {
                    A: 0,
                    D: 1,
                    G: 2,
                    C: 3,
                    F: 4,
                    Bb: 5,
                    Eb: 6,
                    Ab: 7
                  };
                  const orderSharps = ["f", "c", "g", "d", "a", "e", "b"];
                  const orderFlats = ["b", "e", "a", "d", "g", "c", "f"];
                  const isMinor = /m(in)?$/i.test(k);
                  const base = k.replace(/m(in)?$/i, "");
                  let count = 0;
                  let type = "natural";
                  if (isMinor && minorSharps[base] !== void 0) {
                    count = minorSharps[base];
                    type = "sharp";
                  } else if (isMinor && minorFlats[base] !== void 0) {
                    count = minorFlats[base];
                    type = "flat";
                  } else if (majorSharps[base] !== void 0) {
                    count = majorSharps[base];
                    type = "sharp";
                  } else if (majorFlats[base] !== void 0) {
                    count = majorFlats[base];
                    type = "flat";
                  }
                  const map = {
                    a: "natural",
                    b: "natural",
                    c: "natural",
                    d: "natural",
                    e: "natural",
                    f: "natural",
                    g: "natural"
                  };
                  if (type === "sharp") {
                    for (let i = 0; i < count; i++)
                      map[orderSharps[i]] = "sharp";
                  }
                  if (type === "flat") {
                    for (let i = 0; i < count; i++)
                      map[orderFlats[i]] = "flat";
                  }
                  return map;
                };
                const keyAccMap = getKeyAccidentalMap(vexFlowData.keySignature);
                const durToTicks = (d) => {
                  const s = String(d).replace(/r/g, "");
                  const map = { w: 32, h: 16, q: 8, "8": 4, "16": 2, "32": 1 };
                  return map[s] || 0;
                };
                const parseTS = (ts2) => {
                  const [n, d] = (ts2 || "4/4").split("/").map((x) => parseInt(x, 10));
                  return { n: n || 4, d: d || 4 };
                };
                const ts = parseTS(vexFlowData.timeSignature);
                const measureCapacity = Math.max(1, Math.round(32 * ts.n / ts.d));
                const ticksToDur = (ticks) => {
                  const inv = { 32: "w", 16: "h", 8: "q", 4: "8", 2: "16", 1: "32" };
                  return inv[ticks] || "q";
                };
                const measures = [];
                let cur = [];
                let acc = (() => {
                  const notes = vexFlowData.tracks[0].notes || [];
                  const minTime = notes.reduce(
                    (m, n) => Math.min(m, n.time ?? 0),
                    Number.POSITIVE_INFINITY
                  );
                  const base = minTime === Number.POSITIVE_INFINITY ? 0 : minTime;
                  return Math.round(base * 8 % measureCapacity);
                })();
                const originalNotes = vexFlowData.tracks[0].notes;
                const graceBuf = [];
                for (const nd of originalNotes) {
                  const ticks = durToTicks(nd.duration);
                  const isGrace = !!nd.grace;
                  if (isGrace) {
                    graceBuf.push(nd);
                    continue;
                  }
                  let t = ticks;
                  let firstPart = true;
                  while (t > 0) {
                    const remaining = measureCapacity - acc;
                    const slice = Math.min(t, remaining);
                    const part = { ...nd, duration: ticksToDur(slice) };
                    if (firstPart && graceBuf.length) {
                      part.graceNotes = graceBuf.splice(0, graceBuf.length);
                    }
                    if (!firstPart)
                      part.tieFromPrev = true;
                    if (slice < t)
                      part.tieToNext = true;
                    cur.push(part);
                    acc += slice;
                    t -= slice;
                    firstPart = false;
                    if (acc >= measureCapacity) {
                      measures.push(cur);
                      cur = [];
                      acc = 0;
                    }
                  }
                }
                if (cur.length)
                  measures.push(cur);
                const left = 10;
                const right = 10;
                const top = 40;
                const avail = Math.max(
                  100,
                  (rendererConfig.width || 800) - left - right
                );
                const mCount = Math.max(1, measures.length);
                const mWidth = Math.max(100, Math.floor(avail / mCount));
                const keyToMidi = (k) => {
                  const m = /^([a-g])(b|#)?\/(-?\d+)$/.exec(k);
                  if (!m)
                    return 60;
                  const letters = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
                  const letter = letters[m[1]];
                  const acc2 = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
                  const octave = parseInt(m[3], 10);
                  return (octave + 1) * 12 + letter + acc2;
                };
                const allPitches = [];
                measures.forEach((ms) => {
                  ms.forEach((n) => {
                    if (n && !n.isRest && Array.isArray(n.keys) && n.keys[0]) {
                      allPitches.push(keyToMidi(String(n.keys[0]).toLowerCase()));
                    }
                  });
                });
                const median = allPitches.length ? (() => {
                  const arr = [...allPitches].sort((a, b) => a - b);
                  const mid = arr.length / 2;
                  return arr.length % 2 ? arr[Math.floor(mid)] : (arr[mid - 1] + arr[mid]) / 2;
                })() : 60;
                const detectedClef = median < 60 ? "bass" : "treble";
                const measuresPerLine = rendererConfig.measuresPerLine && rendererConfig.measuresPerLine > 0 ? Math.max(1, Math.floor(rendererConfig.measuresPerLine)) : Math.max(
                  1,
                  Math.floor(
                    avail / Math.max(120, Math.floor(avail / Math.max(1, mCount)))
                  )
                );
                const lines = [];
                for (let i = 0; i < measures.length; i += measuresPerLine) {
                  lines.push(measures.slice(i, i + measuresPerLine));
                }
                const systemGap = 80;
                const allBeams = [];
                const createdNotes = [];
                lines.forEach((lineMeasures, sysIndex) => {
                  const y = top + sysIndex * systemGap;
                  const stave = new Flow.Stave(left, y, avail);
                  const normalizeClef = (c) => {
                    const m = (c || "").toString().toLowerCase();
                    const map = {
                      g: "treble",
                      treble: "treble",
                      f: "bass",
                      bass: "bass",
                      c: "alto",
                      alto: "alto",
                      tenor: "tenor",
                      "treble-8vb": "treble-8vb",
                      "treble-8va": "treble-8va",
                      "bass-8vb": "bass-8vb"
                    };
                    return map[m] || "treble";
                  };
                  const clefToUse = normalizeClef(
                    vexFlowData.clef || vexFlowData.tracks && vexFlowData.tracks[0] && vexFlowData.tracks[0].clef || detectedClef
                  );
                  stave.addClef(clefToUse);
                  if (vexFlowData.timeSignature && sysIndex === 0) {
                    stave.addTimeSignature(vexFlowData.timeSignature);
                  }
                  if (vexFlowData.keySignature && vexFlowData.keySignature !== "C" && sysIndex === 0) {
                    stave.addKeySignature(vexFlowData.keySignature);
                  }
                  stave.setContext(context).draw();
                  if (sysIndex === 0) {
                    try {
                      const title = vexFlowData.metadata && vexFlowData.metadata.title;
                      if (title) {
                        context.save();
                        context.setFont("bold 16px Arial");
                        context.fillText(title, left, y - 20);
                        context.restore();
                      }
                      if (vexFlowData.tempo) {
                        context.save();
                        context.setFont("12px Arial");
                        const tempoText = `\u2669 = ${vexFlowData.tempo}`;
                        context.fillText(tempoText, left + 200, y - 8);
                        context.restore();
                      }
                    } catch {
                    }
                  }
                  const tickables = [];
                  lineMeasures.forEach((mNotes, idxInLine) => {
                    const sorted = mNotes.slice().sort(
                      (a, b) => (a.time ?? 0) - (b.time ?? 0)
                    );
                    sorted.forEach((noteData) => {
                      if (noteData.isRest) {
                        tickables.push(
                          new Flow.StaveNote({
                            keys: ["d/5"],
                            duration: String(noteData.duration).replace(/r?$/, "r")
                          })
                        );
                      } else {
                        const note = new Flow.StaveNote({
                          keys: noteData.keys.map((k) => k.toLowerCase()),
                          duration: noteData.duration
                        });
                        tickables.push(note);
                        createdNotes.push({ vf: note, data: noteData });
                      }
                    });
                    if (idxInLine < lineMeasures.length - 1 && Flow.BarNote && Flow.Barline && Flow.Barline.type) {
                      tickables.push(new Flow.BarNote(Flow.Barline.type.SINGLE));
                    }
                  });
                  const voice2 = new Flow.Voice({
                    num_beats: Math.max(1, lineMeasures.length) * measureCapacity,
                    beat_value: 32
                  });
                  if (voice2.setMode && Flow.Voice && Flow.Voice.Mode && Flow.Voice.Mode.SOFT !== void 0) {
                    voice2.setMode(Flow.Voice.Mode.SOFT);
                  } else if (typeof voice2.setStrict === "function") {
                    voice2.setStrict(false);
                  }
                  voice2.addTickables(
                    tickables.filter(
                      (t) => typeof t.getTicks === "function" ? t.getTicks().value() > 0 : true
                    )
                  );
                  const formatter = new Flow.Formatter().joinVoices([voice2]);
                  formatter.format([voice2], avail - 20);
                  voice2.draw(context, stave);
                });
                const allTickables = [];
                measures.forEach((mNotes, idx) => {
                  const tickables = mNotes.slice().sort(
                    (a, b) => (a.time ?? 0) - (b.time ?? 0)
                  ).map((noteData) => {
                    if (noteData.isRest) {
                      return new Flow.StaveNote({
                        keys: ["d/5"],
                        duration: String(noteData.duration).replace(/r?$/, "r")
                      });
                    }
                    const note = new Flow.StaveNote({
                      keys: noteData.keys.map((k) => k.toLowerCase()),
                      duration: noteData.duration
                    });
                    if (noteData.graceNotes && Flow.GraceNoteGroup && Flow.GraceNote) {
                      try {
                        const gnotes = noteData.graceNotes.map(
                          (g) => new Flow.GraceNote({
                            keys: (g.keys || []).map(
                              (kk) => String(kk).toLowerCase()
                            ),
                            duration: "16",
                            slash: true
                          })
                        );
                        const ggroup = new Flow.GraceNoteGroup(gnotes, true);
                        if (typeof ggroup.beamNotes === "function") {
                          ggroup.beamNotes();
                        }
                        if (typeof ggroup.setContext === "function" && typeof ggroup.attachToNote === "function") {
                          ggroup.setContext(context);
                          ggroup.attachToNote(note);
                        }
                      } catch {
                      }
                    }
                    if (Array.isArray(noteData.ornaments) && noteData.ornaments.length && Flow.GraceNoteGroup && Flow.GraceNote) {
                      const graceNoteOrnaments = noteData.ornaments.filter((orn) => orn.type === "grace_note");
                      if (graceNoteOrnaments.length > 0) {
                        try {
                          const allGraceNotes = graceNoteOrnaments.flatMap((orn) => {
                            if (orn.parameters && orn.parameters.gracePitches) {
                              return orn.parameters.gracePitches.map(
                                (pitch) => new Flow.GraceNote({
                                  keys: [String(pitch).toLowerCase()],
                                  duration: "16",
                                  slash: orn.parameters.graceNoteType === "acciaccatura"
                                })
                              );
                            }
                            return [];
                          });
                          if (allGraceNotes.length > 0) {
                            const ggroup = new Flow.GraceNoteGroup(allGraceNotes, true);
                            if (typeof ggroup.beamNotes === "function") {
                              ggroup.beamNotes();
                            }
                            if (typeof ggroup.setContext === "function" && typeof ggroup.attachToNote === "function") {
                              ggroup.setContext(context);
                              ggroup.attachToNote(note);
                            }
                          }
                        } catch (e) {
                          console.warn("Failed to render grace note ornaments:", e);
                        }
                      }
                    }
                    if (Flow.Accidental) {
                      noteData.keys.forEach((origKey, idx2) => {
                        const k = origKey.toLowerCase();
                        const m = /^([a-g])(#{1,2}|b{1,2})?\/-?\d+$/.exec(k);
                        const letter = m ? m[1] : k[0];
                        const acc2 = m && m[2] ? m[2].includes("#") ? "#" : "b" : "";
                        const sig = keyAccMap[letter] || "natural";
                        let glyph = null;
                        if (acc2 === "#" && sig !== "sharp") {
                          glyph = "#";
                        } else if (acc2 === "b" && sig !== "flat") {
                          glyph = "b";
                        }
                        if (glyph) {
                          if (typeof note.addAccidental === "function") {
                            note.addAccidental(idx2, new Flow.Accidental(glyph));
                          } else if (typeof note.addModifier === "function") {
                            note.addModifier(new Flow.Accidental(glyph), idx2);
                          }
                        }
                      });
                    }
                    const articulationMap = {
                      staccato: "a.",
                      accent: "a>",
                      tenuto: "a-",
                      marcato: "a^",
                      legato: "a-"
                      // similar to tenuto for VexFlow
                    };
                    if (Array.isArray(noteData.vfArticulations) && noteData.vfArticulations.length) {
                      noteData.vfArticulations.forEach((code) => {
                        if (Flow && Flow.Articulation && Flow.Modifier && Flow.Modifier.Position && (typeof note.addArticulation === "function" || typeof note.addModifier === "function")) {
                          const art = new Flow.Articulation(code);
                          if (art && typeof art.setPosition === "function") {
                            art.setPosition(Flow.Modifier.Position.ABOVE);
                          }
                          if (typeof note.addArticulation === "function") {
                            note.addArticulation(0, art);
                          } else if (typeof note.addModifier === "function") {
                            note.addModifier(art, 0);
                          }
                        }
                      });
                    } else if (Array.isArray(noteData.articulations)) {
                      noteData.articulations.forEach((a) => {
                        const articulationType = typeof a === "string" ? a : a && a.type;
                        const code = articulationMap[articulationType] || null;
                        if (!code)
                          return;
                        if (Flow && Flow.Articulation && Flow.Modifier && Flow.Modifier.Position && (typeof note.addArticulation === "function" || typeof note.addModifier === "function")) {
                          const art = new Flow.Articulation(code);
                          if (art && typeof art.setPosition === "function") {
                            art.setPosition(Flow.Modifier.Position.ABOVE);
                          }
                          if (typeof note.addArticulation === "function") {
                            note.addArticulation(0, art);
                          } else if (typeof note.addModifier === "function") {
                            note.addModifier(art, 0);
                          }
                        }
                      });
                    }
                    if (noteData.stroke && Flow && Flow.Stroke) {
                      try {
                        const dir = (noteData.stroke.direction || "up").toLowerCase();
                        const style = (noteData.stroke.style || "roll").toLowerCase();
                        const type = Flow.Stroke.Type && (style === "brush" ? dir === "down" ? Flow.Stroke.Type.BRUSH_DOWN : Flow.Stroke.Type.BRUSH_UP : dir === "down" ? Flow.Stroke.Type.ROLL_DOWN : Flow.Stroke.Type.ROLL_UP);
                        if (type && typeof note.addStroke === "function") {
                          note.addStroke(0, new Flow.Stroke(type));
                        }
                      } catch (_) {
                      }
                    }
                    return note;
                  });
                  tickables.forEach((n, i) => {
                    const d = mNotes[i];
                    if (!d || d.isRest)
                      return;
                    const dotCount = typeof d.dots === "number" ? d.dots : d.dots === true || d.dot === true || d.dotted === true ? 1 : 0;
                    for (let k = 0; k < dotCount; k++) {
                      if (typeof n.addDotToAll === "function") {
                        n.addDotToAll();
                      } else if (Flow.Dot) {
                        d.keys.forEach((_, idx2) => {
                          if (typeof n.addModifier === "function") {
                            n.addModifier(new Flow.Dot(), idx2);
                          }
                        });
                      }
                    }
                    createdNotes.push({ vf: n, data: d });
                  });
                  allTickables.push(...tickables);
                  if (Flow.Beam && typeof Flow.Beam.generateBeams === "function") {
                    const beamables = tickables.filter(
                      (t) => typeof t.isRest !== "function" || !t.isRest()
                    );
                    try {
                      const beams = Flow.Beam.generateBeams(beamables);
                      beams.forEach((b) => b.setContext(context));
                      allBeams.push(...beams);
                    } catch (_) {
                    }
                  }
                  if (idx < measures.length - 1 && Flow.BarNote && Flow.Barline && Flow.Barline.type) {
                    allTickables.push(new Flow.BarNote(Flow.Barline.type.SINGLE));
                  }
                });
                const totalTicks = measures.length * measureCapacity;
                const voice = new Flow.Voice({
                  num_beats: totalTicks,
                  beat_value: 32
                });
                if (voice.setMode && Flow.Voice && Flow.Voice.Mode && Flow.Voice.Mode.SOFT !== void 0) {
                  voice.setMode(Flow.Voice.Mode.SOFT);
                } else if (typeof voice.setStrict === "function") {
                  voice.setStrict(false);
                }
                voice.addTickables(
                  allTickables.filter(
                    (t) => typeof t.getTicks === "function" ? t.getTicks().value() > 0 : true
                  )
                );
                if (allBeams.length) {
                  allBeams.forEach((b) => {
                    try {
                      b.draw();
                    } catch (_) {
                    }
                  });
                }
                try {
                  const details = document.createElement("details");
                  details.style.marginTop = "10px";
                  const summary = document.createElement("summary");
                  summary.textContent = "VexFlow Source";
                  summary.style.cursor = "pointer";
                  details.appendChild(summary);
                  const pre = document.createElement("pre");
                  pre.textContent = JSON.stringify(vexFlowData, null, 2);
                  details.appendChild(pre);
                } catch (_) {
                }
                if (createdNotes.length && Flow.StaveTie) {
                  for (let i = 0; i < createdNotes.length - 1; i++) {
                    const cur2 = createdNotes[i];
                    if (!cur2)
                      continue;
                    const d = cur2.data || {};
                    const isTieStart = !!(d.tieToNext || d.tieStart || d.tie === "start");
                    if (!isTieStart)
                      continue;
                    let next = null;
                    for (let j = i + 1; j < createdNotes.length; j++) {
                      if (createdNotes[j]) {
                        next = createdNotes[j];
                        break;
                      }
                    }
                    if (next) {
                      try {
                        new Flow.StaveTie({
                          first_note: cur2.vf,
                          last_note: next.vf,
                          first_indices: [0],
                          last_indices: [0]
                        }).setContext(context).draw();
                      } catch (_) {
                      }
                    }
                  }
                }
                if (createdNotes.length && Flow && Flow.Glissando) {
                  for (let i = 0; i < createdNotes.length - 1; i++) {
                    const start = createdNotes[i];
                    if (!start || !start.data || !start.vf)
                      continue;
                    const g = start.data.gliss;
                    if (!g)
                      continue;
                    let end = null;
                    if (g.targetKey) {
                      for (let j = i + 1; j < createdNotes.length; j++) {
                        const cand = createdNotes[j];
                        if (cand && cand.data && Array.isArray(cand.data.keys)) {
                          const hasKey = cand.data.keys.some(
                            (k) => String(k).toLowerCase() === String(g.targetKey).toLowerCase()
                          );
                          if (hasKey) {
                            end = cand;
                            break;
                          }
                        }
                      }
                    }
                    if (!end) {
                      for (let j = i + 1; j < createdNotes.length; j++) {
                        if (createdNotes[j]) {
                          end = createdNotes[j];
                          break;
                        }
                      }
                    }
                    if (end && end.vf) {
                      try {
                        const gl = new Flow.Glissando({
                          from: start.vf,
                          to: end.vf,
                          text: g.text || (g.type === "portamento" ? "port." : "gliss.")
                        });
                        if (gl && typeof gl.setContext === "function") {
                          gl.setContext(context).draw();
                        }
                      } catch (_) {
                      }
                    }
                  }
                }
              } catch (factoryError) {
                console.warn(
                  "Factory API failed, trying low-level API:",
                  factoryError
                );
                const Flow = VFNS && (VFNS.Flow || VFNS.VF || VFNS) || {};
                const accMode = rendererConfig.accidentalsMode || "auto";
                const getKeyAccidentalMap = (key) => {
                  const k = (key || "C").trim();
                  const majorSharps = {
                    C: 0,
                    G: 1,
                    D: 2,
                    A: 3,
                    E: 4,
                    B: 5,
                    "F#": 6,
                    "C#": 7
                  };
                  const majorFlats = {
                    C: 0,
                    F: 1,
                    Bb: 2,
                    Eb: 3,
                    Ab: 4,
                    Db: 5,
                    Gb: 6,
                    Cb: 7
                  };
                  const minorSharps = {
                    A: 0,
                    E: 1,
                    B: 2,
                    "F#": 3,
                    "C#": 4,
                    "G#": 5,
                    "D#": 6,
                    "A#": 7
                  };
                  const minorFlats = {
                    A: 0,
                    D: 1,
                    G: 2,
                    C: 3,
                    F: 4,
                    Bb: 5,
                    Eb: 6,
                    Ab: 7
                  };
                  const orderSharps = ["f", "c", "g", "d", "a", "e", "b"];
                  const orderFlats = ["b", "e", "a", "d", "g", "c", "f"];
                  const isMinor = /m(in)?$/i.test(k);
                  const base = k.replace(/m(in)?$/i, "");
                  let count = 0;
                  let type = "natural";
                  if (isMinor && minorSharps[base] !== void 0) {
                    count = minorSharps[base];
                    type = "sharp";
                  } else if (isMinor && minorFlats[base] !== void 0) {
                    count = minorFlats[base];
                    type = "flat";
                  } else if (majorSharps[base] !== void 0) {
                    count = majorSharps[base];
                    type = "sharp";
                  } else if (majorFlats[base] !== void 0) {
                    count = majorFlats[base];
                    type = "flat";
                  }
                  const map = {
                    a: "natural",
                    b: "natural",
                    c: "natural",
                    d: "natural",
                    e: "natural",
                    f: "natural",
                    g: "natural"
                  };
                  if (type === "sharp") {
                    for (let i = 0; i < count; i++)
                      map[orderSharps[i]] = "sharp";
                  }
                  if (type === "flat") {
                    for (let i = 0; i < count; i++)
                      map[orderFlats[i]] = "flat";
                  }
                  return map;
                };
                const keyAccMap = getKeyAccidentalMap(vexFlowData.keySignature);
                const Renderer = Flow && Flow.Renderer || VFNS.Renderer || VFNS.Flow && VFNS.Flow.Renderer;
                if (!Renderer || !Renderer.Backends) {
                  throw new Error(
                    "VexFlow low-level API not available (Renderer missing)"
                  );
                }
                const renderer = new Renderer(
                  div,
                  Renderer.Backends.SVG
                );
                renderer.resize(rendererConfig.width, rendererConfig.height);
                const context = renderer.getContext();
                const durToTicks = (d) => {
                  const s = String(d).replace(/r/g, "");
                  const map = { w: 32, h: 16, q: 8, "8": 4, "16": 2, "32": 1 };
                  return map[s] || 0;
                };
                const parseTS = (ts2) => {
                  const [n, d] = (ts2 || "4/4").split("/").map((x) => parseInt(x, 10));
                  return { n: n || 4, d: d || 4 };
                };
                const ts = parseTS(vexFlowData.timeSignature);
                const measureCapacity = Math.max(1, Math.round(32 * ts.n / ts.d));
                const ticksToDur = (ticks) => {
                  const inv = { 32: "w", 16: "h", 8: "q", 4: "8", 2: "16", 1: "32" };
                  return inv[ticks] || "q";
                };
                const measures = [];
                let cur = [];
                let acc = (() => {
                  const notes = vexFlowData.tracks[0].notes || [];
                  const minTime = notes.reduce(
                    (m, n) => Math.min(m, n.time ?? 0),
                    Number.POSITIVE_INFINITY
                  );
                  const base = minTime === Number.POSITIVE_INFINITY ? 0 : minTime;
                  return Math.round(base * 8 % measureCapacity);
                })();
                const originalNotes = vexFlowData.tracks[0].notes;
                const graceBuf = [];
                for (const nd of originalNotes) {
                  const ticks = durToTicks(nd.duration);
                  const isGrace = !!nd.grace;
                  if (isGrace) {
                    graceBuf.push(nd);
                    continue;
                  }
                  let t = ticks;
                  let firstPart = true;
                  while (t > 0) {
                    const remaining = measureCapacity - acc;
                    const slice = Math.min(t, remaining);
                    const part = { ...nd, duration: ticksToDur(slice) };
                    if (firstPart && graceBuf.length) {
                      part.graceNotes = graceBuf.splice(0, graceBuf.length);
                    }
                    if (!firstPart)
                      part.tieFromPrev = true;
                    if (slice < t)
                      part.tieToNext = true;
                    cur.push(part);
                    acc += slice;
                    t -= slice;
                    firstPart = false;
                    if (acc >= measureCapacity) {
                      measures.push(cur);
                      cur = [];
                      acc = 0;
                    }
                  }
                }
                if (cur.length)
                  measures.push(cur);
                const left = 10;
                const right = 10;
                const top = 40;
                const avail = Math.max(
                  100,
                  (rendererConfig.width || 800) - left - right
                );
                const mCount = Math.max(1, measures.length);
                const mWidth = Math.max(100, Math.floor(avail / mCount));
                const fallbackKeyToMidi = (k) => {
                  const m = /^([a-g])(b|#)?\/(-?\d+)$/.exec(k);
                  if (!m)
                    return 60;
                  const letters = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
                  const letter = letters[m[1]];
                  const acc2 = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
                  const octave = parseInt(m[3], 10);
                  return (octave + 1) * 12 + letter + acc2;
                };
                const fallbackPitches = [];
                measures.forEach((ms) => {
                  ms.forEach((n) => {
                    if (n && !n.isRest && Array.isArray(n.keys) && n.keys[0]) {
                      fallbackPitches.push(
                        fallbackKeyToMidi(String(n.keys[0]).toLowerCase())
                      );
                    }
                  });
                });
                const fallbackMedian = fallbackPitches.length ? (() => {
                  const arr = [...fallbackPitches].sort((a, b) => a - b);
                  const mid = arr.length / 2;
                  return arr.length % 2 ? arr[Math.floor(mid)] : (arr[mid - 1] + arr[mid]) / 2;
                })() : 60;
                const detectedClef = fallbackMedian < 60 ? "bass" : "treble";
                const measuresPerLine = rendererConfig.measuresPerLine && rendererConfig.measuresPerLine > 0 ? Math.max(1, Math.floor(rendererConfig.measuresPerLine)) : Math.max(
                  1,
                  Math.floor(
                    avail / Math.max(
                      120,
                      Math.floor(avail / Math.max(1, measures.length))
                    )
                  )
                );
                const lines = [];
                for (let i = 0; i < measures.length; i += measuresPerLine) {
                  lines.push(measures.slice(i, i + measuresPerLine));
                }
                const systemGap = 80;
                const allBeams = [];
                const createdNotes = [];
                lines.forEach((lineMeasures, sysIndex) => {
                  const y = top + sysIndex * systemGap;
                  const stave = new Flow.Stave(left, y, avail);
                  const normalizeClef = (c) => {
                    const m = (c || "").toString().toLowerCase();
                    const map = {
                      g: "treble",
                      treble: "treble",
                      f: "bass",
                      bass: "bass",
                      c: "alto",
                      alto: "alto",
                      tenor: "tenor",
                      "treble-8vb": "treble-8vb",
                      "treble-8va": "treble-8va",
                      "bass-8vb": "bass-8vb"
                    };
                    return map[m] || "treble";
                  };
                  const clefToUse = normalizeClef(
                    vexFlowData.clef || vexFlowData.tracks && vexFlowData.tracks[0] && vexFlowData.tracks[0].clef || detectedClef
                  );
                  stave.addClef(clefToUse);
                  if (vexFlowData.timeSignature && sysIndex === 0) {
                    stave.addTimeSignature(vexFlowData.timeSignature);
                  }
                  if (vexFlowData.keySignature && vexFlowData.keySignature !== "C" && sysIndex === 0) {
                    stave.addKeySignature(vexFlowData.keySignature);
                  }
                  stave.setContext(context).draw();
                  if (sysIndex === 0) {
                    try {
                      const title = vexFlowData.metadata && vexFlowData.metadata.title;
                      if (title) {
                        context.save();
                        context.setFont("bold 16px Arial");
                        context.fillText(title, left, y - 20);
                        context.restore();
                      }
                      if (vexFlowData.tempo) {
                        context.save();
                        context.setFont("12px Arial");
                        const tempoText = `\u2669 = ${vexFlowData.tempo}`;
                        context.fillText(tempoText, left + 200, y - 8);
                        context.restore();
                      }
                    } catch {
                    }
                  }
                  const tickables = [];
                  lineMeasures.forEach((mNotes, idxInLine) => {
                    const sorted = mNotes.slice().sort(
                      (a, b) => (a.time ?? 0) - (b.time ?? 0)
                    );
                    sorted.forEach((noteData) => {
                      if (noteData.isRest) {
                        tickables.push(
                          new Flow.StaveNote({
                            keys: ["d/5"],
                            duration: String(noteData.duration).replace(/r?$/, "r")
                          })
                        );
                      } else {
                        const note = new Flow.StaveNote({
                          keys: noteData.keys.map((k) => k.toLowerCase()),
                          duration: noteData.duration
                        });
                        tickables.push(note);
                        createdNotes.push({ vf: note, data: noteData });
                      }
                    });
                    if (idxInLine < lineMeasures.length - 1 && Flow.BarNote && Flow.Barline && Flow.Barline.type) {
                      tickables.push(new Flow.BarNote(Flow.Barline.type.SINGLE));
                    }
                  });
                  const voice2 = new Flow.Voice({
                    num_beats: Math.max(1, lineMeasures.length) * measureCapacity,
                    beat_value: 32
                  });
                  if (voice2.setMode && Flow.Voice && Flow.Voice.Mode && Flow.Voice.Mode.SOFT !== void 0) {
                    voice2.setMode(Flow.Voice.Mode.SOFT);
                  } else if (typeof voice2.setStrict === "function") {
                    voice2.setStrict(false);
                  }
                  voice2.addTickables(
                    tickables.filter(
                      (t) => typeof t.getTicks === "function" ? t.getTicks().value() > 0 : true
                    )
                  );
                  const formatter = new Flow.Formatter().joinVoices([voice2]);
                  formatter.format([voice2], avail - 20);
                  voice2.draw(context, stave);
                });
                const allTickables = [];
                measures.forEach((mNotes, idx) => {
                  const tickables = mNotes.slice().sort(
                    (a, b) => (a.time ?? 0) - (b.time ?? 0)
                  ).map((noteData) => {
                    if (noteData.isRest) {
                      return new Flow.StaveNote({
                        keys: ["d/5"],
                        duration: String(noteData.duration).replace(/r?$/, "r")
                      });
                    }
                    const note = new Flow.StaveNote({
                      keys: noteData.keys.map((k) => k.toLowerCase()),
                      duration: noteData.duration
                    });
                    if (noteData.graceNotes && Flow.GraceNoteGroup && Flow.GraceNote) {
                      try {
                        const gnotes = noteData.graceNotes.map(
                          (g) => new Flow.GraceNote({
                            keys: (g.keys || []).map(
                              (kk) => String(kk).toLowerCase()
                            ),
                            duration: "16",
                            slash: true
                          })
                        );
                        const ggroup = new Flow.GraceNoteGroup(gnotes, true);
                        if (typeof ggroup.beamNotes === "function") {
                          ggroup.beamNotes();
                        }
                        if (typeof ggroup.setContext === "function" && typeof ggroup.attachToNote === "function") {
                          ggroup.setContext(context);
                          ggroup.attachToNote(note);
                        }
                      } catch {
                      }
                    }
                    if (Array.isArray(noteData.ornaments) && noteData.ornaments.length && Flow.GraceNoteGroup && Flow.GraceNote) {
                      const graceNoteOrnaments = noteData.ornaments.filter((orn) => orn.type === "grace_note");
                      if (graceNoteOrnaments.length > 0) {
                        try {
                          const allGraceNotes = graceNoteOrnaments.flatMap((orn) => {
                            if (orn.parameters && orn.parameters.gracePitches) {
                              return orn.parameters.gracePitches.map(
                                (pitch) => new Flow.GraceNote({
                                  keys: [String(pitch).toLowerCase()],
                                  duration: "16",
                                  slash: orn.parameters.graceNoteType === "acciaccatura"
                                })
                              );
                            }
                            return [];
                          });
                          if (allGraceNotes.length > 0) {
                            const ggroup = new Flow.GraceNoteGroup(allGraceNotes, true);
                            if (typeof ggroup.beamNotes === "function") {
                              ggroup.beamNotes();
                            }
                            if (typeof ggroup.setContext === "function" && typeof ggroup.attachToNote === "function") {
                              ggroup.setContext(context);
                              ggroup.attachToNote(note);
                            }
                          }
                        } catch (e) {
                          console.warn("Failed to render grace note ornaments:", e);
                        }
                      }
                    }
                    if (Flow.Accidental) {
                      noteData.keys.forEach((origKey, idx2) => {
                        const k = origKey.toLowerCase();
                        const m = /^([a-g])(#{1,2}|b{1,2})?\/-?\d+$/.exec(k);
                        const letter = m ? m[1] : k[0];
                        const acc2 = m && m[2] ? m[2].includes("#") ? "#" : "b" : "";
                        const sig = keyAccMap[letter] || "natural";
                        let glyph = null;
                        if (acc2 === "#" && sig !== "sharp") {
                          glyph = "#";
                        } else if (acc2 === "b" && sig !== "flat") {
                          glyph = "b";
                        }
                        if (glyph) {
                          if (typeof note.addAccidental === "function") {
                            note.addAccidental(idx2, new Flow.Accidental(glyph));
                          } else if (typeof note.addModifier === "function") {
                            note.addModifier(new Flow.Accidental(glyph), idx2);
                          }
                        }
                      });
                    }
                    const articulationMap = {
                      staccato: "a.",
                      accent: "a>",
                      tenuto: "a-",
                      marcato: "a^",
                      legato: "a-"
                      // similar to tenuto for VexFlow
                    };
                    if (Array.isArray(noteData.vfArticulations) && noteData.vfArticulations.length) {
                      noteData.vfArticulations.forEach((code) => {
                        if (Flow && Flow.Articulation && Flow.Modifier && Flow.Modifier.Position && (typeof note.addArticulation === "function" || typeof note.addModifier === "function")) {
                          const art = new Flow.Articulation(code);
                          if (art && typeof art.setPosition === "function") {
                            art.setPosition(Flow.Modifier.Position.ABOVE);
                          }
                          if (typeof note.addArticulation === "function") {
                            note.addArticulation(0, art);
                          } else if (typeof note.addModifier === "function") {
                            note.addModifier(art, 0);
                          }
                        }
                      });
                    } else if (Array.isArray(noteData.articulations)) {
                      noteData.articulations.forEach((a) => {
                        const articulationType = typeof a === "string" ? a : a && a.type;
                        const code = articulationMap[articulationType] || null;
                        if (!code)
                          return;
                        if (Flow && Flow.Articulation && Flow.Modifier && Flow.Modifier.Position && (typeof note.addArticulation === "function" || typeof note.addModifier === "function")) {
                          const art = new Flow.Articulation(code);
                          if (art && typeof art.setPosition === "function") {
                            art.setPosition(Flow.Modifier.Position.ABOVE);
                          }
                          if (typeof note.addArticulation === "function") {
                            note.addArticulation(0, art);
                          } else if (typeof note.addModifier === "function") {
                            note.addModifier(art, 0);
                          }
                        }
                      });
                    }
                    return note;
                  });
                  tickables.forEach((n, i) => {
                    const d = mNotes[i];
                    if (!d || d.isRest)
                      return;
                    const dotCount = typeof d.dots === "number" ? d.dots : d.dots === true || d.dot === true || d.dotted === true ? 1 : 0;
                    for (let k = 0; k < dotCount; k++) {
                      if (typeof n.addDotToAll === "function") {
                        n.addDotToAll();
                      } else if (Flow.Dot) {
                        d.keys.forEach((_, idx2) => {
                          if (typeof n.addModifier === "function") {
                            n.addModifier(new Flow.Dot(), idx2);
                          }
                        });
                      }
                    }
                    createdNotes.push({ vf: n, data: d });
                  });
                  allTickables.push(...tickables);
                  if (Flow.Beam && typeof Flow.Beam.generateBeams === "function") {
                    const beamables = tickables.filter(
                      (t) => typeof t.isRest !== "function" || !t.isRest()
                    );
                    try {
                      const beams = Flow.Beam.generateBeams(beamables);
                      beams.forEach((b) => b.setContext(context));
                      allBeams.push(...beams);
                    } catch (_) {
                    }
                  }
                  if (idx < measures.length - 1 && Flow.BarNote && Flow.Barline && Flow.Barline.type) {
                    allTickables.push(new Flow.BarNote(Flow.Barline.type.SINGLE));
                  }
                });
                const totalTicks = measures.length * measureCapacity;
                const voice = new Flow.Voice({
                  num_beats: totalTicks,
                  beat_value: 32
                });
                if (voice.setMode && Flow.Voice && Flow.Voice.Mode && Flow.Voice.Mode.SOFT !== void 0) {
                  voice.setMode(Flow.Voice.Mode.SOFT);
                } else if (typeof voice.setStrict === "function") {
                  voice.setStrict(false);
                }
                voice.addTickables(
                  allTickables.filter(
                    (t) => typeof t.getTicks === "function" ? t.getTicks().value() > 0 : true
                  )
                );
                if (allBeams.length) {
                  allBeams.forEach((b) => {
                    try {
                      b.draw();
                    } catch (_) {
                    }
                  });
                }
                if (createdNotes.length && Flow.StaveTie) {
                  for (let i = 0; i < createdNotes.length - 1; i++) {
                    const cur2 = createdNotes[i];
                    if (!cur2)
                      continue;
                    const d = cur2.data || {};
                    const isTieStart = !!(d.tieToNext || d.tieStart || d.tie === "start");
                    if (!isTieStart)
                      continue;
                    let next = null;
                    for (let j = i + 1; j < createdNotes.length; j++) {
                      if (createdNotes[j]) {
                        next = createdNotes[j];
                        break;
                      }
                    }
                    if (next) {
                      try {
                        new Flow.StaveTie({
                          first_note: cur2.vf,
                          last_note: next.vf,
                          first_indices: [0],
                          last_indices: [0]
                        }).setContext(context).draw();
                      } catch (_) {
                      }
                    }
                  }
                }
              }
            }
          };
        }
      };
    }
  });

  // src/converters/index.js
  var converters_exports = {};
  __export(converters_exports, {
    VexFlowConverter: () => VexFlowConverter,
    convertToVexFlow: () => convertToVexFlow,
    midi: () => midi,
    midiToJmon: () => midiToJmon,
    supercollider: () => supercollider,
    tonejs: () => tonejs,
    wav: () => wav
  });
  var init_converters = __esm({
    "src/converters/index.js"() {
      init_midi();
      init_midi_to_jmon();
      init_tonejs();
      init_wav();
      init_supercollider();
      init_vexflow();
    }
  });

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    audio: () => audio2,
    default: () => src_default,
    jm: () => jm
  });
  init_jmon_validator_browser();

  // src/algorithms/constants/MusicTheoryConstants.js
  var MusicTheoryConstants = class {
    static chromatic_scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    static flat_to_sharp = {
      "Bb": "A#",
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#",
      "B\u266D": "A#",
      "D\u266D": "C#",
      "E\u266D": "D#",
      "G\u266D": "F#",
      "A\u266D": "G#",
      "B-": "A#",
      "D-": "C#",
      "E-": "D#",
      "G-": "F#",
      "A-": "G#"
    };
    static scale_intervals = {
      "major": [0, 2, 4, 5, 7, 9, 11],
      // Ionian
      "minor": [0, 2, 3, 5, 7, 8, 10],
      // Aeolian
      "diminished": [0, 2, 3, 5, 6, 8, 9, 11],
      "major pentatonic": [0, 2, 4, 7, 9],
      "minor pentatonic": [0, 3, 5, 7, 10],
      "chromatic": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      "lydian": [0, 2, 4, 6, 7, 9, 11],
      "mixolydian": [0, 2, 4, 5, 7, 9, 10],
      "dorian": [0, 2, 3, 5, 7, 9, 10],
      "phrygian": [0, 1, 3, 5, 7, 8, 10],
      "locrian": [0, 1, 3, 5, 6, 8, 10],
      "harmonic minor": [0, 2, 3, 5, 7, 8, 11],
      "melodic minor ascending": [0, 2, 3, 5, 7, 9, 11],
      "melodic minor descending": [0, 2, 3, 5, 7, 8, 10]
      // same as natural minor
    };
    static intervals = {
      "P1": 0,
      "m2": 1,
      "M2": 2,
      "m3": 3,
      "M3": 4,
      "P4": 5,
      "P5": 7,
      "m6": 8,
      "M6": 9,
      "m7": 10,
      "M7": 11,
      "P8": 12
    };
    /**
     * Convert flat notes to their equivalent sharp notes
     * @param {string} note - The note to convert
     * @returns {string} The converted note or original if no conversion needed
     */
    static convertFlatToSharp(note) {
      return this.flat_to_sharp[note] || note;
    }
    /**
     * Convert note name with octave to MIDI number
     * @param {string} noteName - Note name with octave (e.g. 'C4', 'F#5', 'Bb3')
     * @returns {number} MIDI note number
     */
    static noteNameToMidi(noteName) {
      const match = noteName.match(/^([A-G][#b♭-]?)(-?\d+)$/);
      if (!match) {
        throw new Error(`Invalid note name format: ${noteName}`);
      }
      const [, note, octave] = match;
      const normalizedNote = this.convertFlatToSharp(note);
      const noteIndex = this.chromatic_scale.indexOf(normalizedNote);
      if (noteIndex === -1) {
        throw new Error(`Invalid note name: ${note}`);
      }
      return noteIndex + (parseInt(octave) + 1) * 12;
    }
    /**
     * Convert MIDI number to note name
     * @param {number} midiNumber - MIDI note number
     * @param {boolean} [preferFlat=false] - Whether to prefer flat notation
     * @returns {string} Note name with octave (e.g. 'C4', 'F#5')
     */
    static midiToNoteName(midiNumber, preferFlat = false) {
      const octave = Math.floor(midiNumber / 12) - 1;
      const noteIndex = midiNumber % 12;
      const noteName = this.chromatic_scale[noteIndex];
      return `${noteName}${octave}`;
    }
    /**
     * Returns the intervals for a triad based on the given scale intervals
     * @param {Array} scale - Scale intervals
     * @returns {Array} Triad intervals [root, third, fifth]
     */
    static scaleToTriad(scale) {
      return [scale[0], scale[2], scale[4]];
    }
  };

  // src/algorithms/theory/harmony/Scale.js
  var Scale = class {
    /**
     * Create a Scale
     * @param {string} tonic - The tonic note of the scale
     * @param {string} mode - The type of scale
     */
    constructor(tonic, mode = "major") {
      const convertedTonic = MusicTheoryConstants.convertFlatToSharp(tonic);
      if (!MusicTheoryConstants.chromatic_scale.includes(convertedTonic)) {
        throw new Error(`'${tonic}' is not a valid tonic note. Select one among '${MusicTheoryConstants.chromatic_scale.join(", ")}'.`);
      }
      this.tonic = convertedTonic;
      if (!Object.keys(MusicTheoryConstants.scale_intervals).includes(mode)) {
        throw new Error(`'${mode}' is not a valid scale. Select one among '${Object.keys(MusicTheoryConstants.scale_intervals).join(", ")}'.`);
      }
      this.mode = mode;
    }
    /**
    * Generate a scale with flexible start/end points
    * @param {Object} options - Configuration object
    * @param {number|string} [options.start] - Starting MIDI note number or note name (e.g. 'C4')
    * @param {number|string} [options.end] - Ending MIDI note number or note name
    * @param {number} [options.length] - Number of notes to generate
    * @returns {Array} Array of MIDI note numbers representing the scale
    */
    generate(options = {}) {
      const intervals = MusicTheoryConstants.scale_intervals[this.mode];
      if (!intervals) {
        console.warn(`Unknown scale mode: ${this.mode}`);
        return [];
      }
      if (typeof options.start === "string") {
        options.start = MusicTheoryConstants.noteNameToMidi(options.start);
      }
      if (typeof options.end === "string") {
        options.end = MusicTheoryConstants.noteNameToMidi(options.end);
      }
      const startNote = options.start ?? 60;
      const tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(this.tonic);
      if (tonicIndex === -1) {
        console.warn(`Unknown tonic: ${this.tonic}`);
        return [];
      }
      const getNextNote = (baseNote, step) => {
        const scaleIndex = step % intervals.length;
        const octaveOffset = Math.floor(step / intervals.length) * 12;
        const interval = intervals[scaleIndex];
        return baseNote + interval + octaveOffset;
      };
      const result = [];
      if (options.end !== void 0) {
        for (let i = 0; ; i++) {
          const note = getNextNote(startNote, i);
          if (note > options.end)
            break;
          result.push(note);
        }
      } else if (options.length) {
        for (let i = 0; i < options.length; i++) {
          result.push(getNextNote(startNote, i));
        }
      } else {
        return intervals.map((interval) => startNote + interval);
      }
      return result;
    }
    /**
     * Get the note names of the scale
     * @returns {Array} Array of note names in the scale
     */
    getNoteNames() {
      const intervals = MusicTheoryConstants.scale_intervals[this.mode];
      if (!intervals)
        return [];
      const tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(this.tonic);
      if (tonicIndex === -1)
        return [];
      return intervals.map((interval) => {
        const noteIndex = (tonicIndex + interval) % 12;
        return MusicTheoryConstants.chromatic_scale[noteIndex];
      });
    }
    /**
     * Check if a given pitch is in the scale
     * @param {number} pitch - MIDI note number
     * @returns {boolean} True if the pitch class is in the scale
     */
    isInScale(pitch) {
      const pitchClass = pitch % 12;
      const scalePitches = this.generate().map((p) => p % 12);
      return scalePitches.includes(pitchClass);
    }
  };

  // src/algorithms/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    adjustNoteDurationsToPreventOverlaps: () => adjustNoteDurationsToPreventOverlaps,
    cdeToMidi: () => cdeToMidi,
    checkInput: () => checkInput,
    fibonacci: () => fibonacci,
    fillGapsWithRests: () => fillGapsWithRests,
    findClosestPitchAtMeasureStart: () => findClosestPitchAtMeasureStart,
    getDegreeFromPitch: () => getDegreeFromPitch,
    getOctave: () => getOctave,
    getPitchFromDegree: () => getPitchFromDegree,
    getSharp: () => getSharp,
    instrumentMapping: () => instrumentMapping,
    midiToCde: () => midiToCde,
    noOverlap: () => noOverlap,
    offsetTrack: () => offsetTrack,
    qlToSeconds: () => qlToSeconds,
    quantizeNotes: () => quantizeNotes,
    repairNotes: () => repairNotes,
    repeatPolyloops: () => repeatPolyloops,
    roundToList: () => roundToList,
    scaleList: () => scaleList,
    setOffsetsAccordingToDurations: () => setOffsetsAccordingToDurations,
    tracksToDict: () => tracksToDict,
    tune: () => tune
  });
  function tracksToDict(tracks) {
    if (typeof tracks === "object" && !Array.isArray(tracks)) {
      return tracks;
    }
    if (Array.isArray(tracks)) {
      if (tracks.length === 0) {
        return {};
      }
      if (tracks.every((note) => Array.isArray(note) && note.length === 3)) {
        return { "track 1": tracks };
      }
      const result = {};
      tracks.forEach((track, i) => {
        result[`track ${i + 1}`] = track;
      });
      return result;
    }
    throw new Error("Input must be a list or dict of tracks.");
  }
  function roundToList(value, scale) {
    return scale.reduce(
      (prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  }
  function getOctave(midiNote) {
    return Math.floor(midiNote / 12) - 1;
  }
  function getSharp(noteString) {
    const dictFlat = {
      "D-": "C#",
      "E-": "D#",
      "G-": "F#",
      "A-": "G#",
      "B-": "A#",
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#",
      "Bb": "A#"
    };
    return dictFlat[noteString] || noteString;
  }
  function getDegreeFromPitch(pitch, scaleList2, tonicPitch) {
    if (typeof pitch === "string") {
      pitch = cdeToMidi(pitch);
    }
    if (typeof tonicPitch === "string") {
      tonicPitch = cdeToMidi(tonicPitch);
    }
    const tonicIndex = scaleList2.indexOf(tonicPitch);
    if (scaleList2.includes(pitch)) {
      const pitchIndex = scaleList2.indexOf(pitch);
      return pitchIndex - tonicIndex;
    } else {
      const upperPitch = roundToList(pitch, scaleList2);
      const upperIndex = scaleList2.indexOf(upperPitch);
      const lowerIndex = upperIndex > 0 ? upperIndex - 1 : upperIndex;
      const lowerPitch = scaleList2[lowerIndex];
      const distanceToUpper = upperPitch - pitch;
      const distanceToLower = pitch - lowerPitch;
      const totalDistance = distanceToUpper + distanceToLower;
      if (totalDistance === 0)
        return upperIndex - tonicIndex;
      const upperWeight = 1 - distanceToUpper / totalDistance;
      const lowerWeight = 1 - distanceToLower / totalDistance;
      const upperDegree = upperIndex - tonicIndex;
      const lowerDegree = lowerIndex - tonicIndex;
      return upperDegree * upperWeight + lowerDegree * lowerWeight;
    }
  }
  function getPitchFromDegree(degree, scaleList2, tonicPitch) {
    const tonicIndex = scaleList2.indexOf(tonicPitch);
    const pitchIndex = Math.round(tonicIndex + degree);
    if (pitchIndex >= 0 && pitchIndex < scaleList2.length) {
      return scaleList2[pitchIndex];
    } else {
      const lowerIndex = Math.max(0, Math.min(pitchIndex, scaleList2.length - 1));
      const upperIndex = Math.min(scaleList2.length - 1, Math.max(pitchIndex, 0));
      const lowerPitch = scaleList2[lowerIndex];
      const upperPitch = scaleList2[upperIndex];
      const distanceToUpper = upperIndex - pitchIndex;
      const distanceToLower = pitchIndex - lowerIndex;
      const totalDistance = distanceToUpper + distanceToLower;
      if (totalDistance === 0) {
        return (upperPitch + lowerPitch) / 2;
      }
      const upperWeight = 1 - distanceToUpper / totalDistance;
      const lowerWeight = 1 - distanceToLower / totalDistance;
      return upperPitch * upperWeight + lowerPitch * lowerWeight;
    }
  }
  function setOffsetsAccordingToDurations(notes) {
    if (notes.length > 0 && notes[0].length === 2) {
      notes = notes.map((note) => [note[0], note[1], 0]);
    }
    const adjustedNotes = [];
    let currentOffset = 0;
    for (const [pitch, duration, _] of notes) {
      adjustedNotes.push([pitch, duration, currentOffset]);
      currentOffset += duration;
    }
    return adjustedNotes;
  }
  function fillGapsWithRests(notes, parentOffset = 0) {
    const notesSorted = [...notes].sort((a, b) => a[2] - b[2]);
    let lastOffset = 0;
    const filledNotes = [];
    for (const note of notesSorted) {
      const [pitch, duration, offset] = note;
      const currentOffset = parentOffset + offset;
      if (currentOffset > lastOffset) {
        const gapDuration = currentOffset - lastOffset;
        const restToInsert = [null, gapDuration, lastOffset - parentOffset];
        filledNotes.push(restToInsert);
      }
      filledNotes.push(note);
      lastOffset = Math.max(lastOffset, currentOffset + duration);
    }
    return filledNotes;
  }
  function adjustNoteDurationsToPreventOverlaps(notes) {
    notes.sort((a, b) => a[2] - b[2]);
    for (let i = 0; i < notes.length - 1; i++) {
      const currentNote = notes[i];
      const nextNote = notes[i + 1];
      const currentNoteEnd = currentNote[2] + currentNote[1];
      if (currentNoteEnd > nextNote[2]) {
        const newDuration = nextNote[2] - currentNote[2];
        notes[i] = [currentNote[0], newDuration, currentNote[2]];
      }
    }
    return notes;
  }
  function repairNotes(notes) {
    return adjustNoteDurationsToPreventOverlaps(fillGapsWithRests(notes));
  }
  function cdeToMidi(pitch) {
    const pitches = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatToSharp = {
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#",
      "Bb": "A#",
      "Cb": "B"
    };
    let octave = 4;
    let noteStr = pitch;
    if (pitch.includes("b")) {
      const noteBase = pitch.slice(0, -1);
      if (flatToSharp[noteBase]) {
        noteStr = flatToSharp[noteBase] + pitch.slice(-1);
      }
    }
    let note;
    if (noteStr.length > 2 || noteStr.length === 2 && !isNaN(noteStr[1])) {
      note = noteStr.slice(0, -1);
      octave = parseInt(noteStr.slice(-1));
    } else {
      note = noteStr[0];
    }
    const midi2 = 12 * (octave + 1) + pitches.indexOf(note);
    return midi2;
  }
  function midiToCde(midi2) {
    const pitches = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(midi2 / 12) - 1;
    const key = midi2 % 12;
    return pitches[key] + octave.toString();
  }
  function noOverlap(notes, adjust = "offsets") {
    const adjustedNotes = [];
    let currentOffset = 0;
    for (const [pitch, duration, _] of notes) {
      adjustedNotes.push([pitch, duration, currentOffset]);
      currentOffset += duration;
    }
    return adjustedNotes;
  }
  function checkInput(inputList) {
    if (inputList.every((item) => Array.isArray(item))) {
      return "list of tuples";
    } else if (inputList.every((item) => !Array.isArray(item))) {
      return "list";
    } else {
      return "unknown";
    }
  }
  function scaleList(numbers, toMin, toMax, minNumbers = null, maxNumbers = null) {
    const minNum = minNumbers !== null ? minNumbers : Math.min(...numbers);
    const maxNum = maxNumbers !== null ? maxNumbers : Math.max(...numbers);
    if (minNum === maxNum) {
      return new Array(numbers.length).fill((toMin + toMax) / 2);
    }
    return numbers.map(
      (num) => (num - minNum) * (toMax - toMin) / (maxNum - minNum) + toMin
    );
  }
  function offsetTrack(track, by) {
    return track.map(([pitch, duration, offset]) => [pitch, duration, offset + by]);
  }
  function quantizeNotes(notes, measureLength, timeResolution) {
    const quantizedNotes = [];
    for (const [pitch, duration, offset] of notes) {
      const quantizedOffset = Math.round(offset / timeResolution) * timeResolution;
      const measureEnd = (Math.floor(quantizedOffset / measureLength) + 1) * measureLength;
      let quantizedDuration = Math.round(duration / timeResolution) * timeResolution;
      quantizedDuration = Math.min(quantizedDuration, measureEnd - quantizedOffset);
      if (quantizedDuration > 0) {
        quantizedNotes.push([pitch, quantizedDuration, quantizedOffset]);
      }
    }
    return quantizedNotes;
  }
  function findClosestPitchAtMeasureStart(notes, measureLength) {
    const validNotes = notes.filter(([pitch, , offset]) => pitch !== null && offset !== null);
    const notesSorted = validNotes.sort((a, b) => a[2] - b[2]);
    const maxOffset = Math.max(...notesSorted.map(([, , offset]) => offset));
    const numMeasures = Math.floor(maxOffset / measureLength) + 1;
    const closestPitches = [];
    for (let measureNum = 0; measureNum < numMeasures; measureNum++) {
      const measureStart = measureNum * measureLength;
      let closestPitch = null;
      let closestDistance = Infinity;
      for (const [pitch, , offset] of notesSorted) {
        const distance = measureStart - offset;
        if (distance >= 0 && distance < closestDistance) {
          closestDistance = distance;
          closestPitch = pitch;
        }
        if (offset > measureStart)
          break;
      }
      if (closestPitch !== null) {
        closestPitches.push(closestPitch);
      }
    }
    return closestPitches;
  }
  function tune(pitch, scale) {
    return scale.reduce(
      (prev, curr) => Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev
    );
  }
  function qlToSeconds(ql, bpm) {
    return 60 / bpm * ql;
  }
  function* fibonacci(a = 0, b = 1, base = 0, scale = 1) {
    while (true) {
      yield base + scale * a;
      [a, b] = [b, a + b];
    }
  }
  function repeatPolyloops(polyloopsDict, nMeasures, measureLength) {
    const repeatedDict = {};
    for (const [name, polyloop] of Object.entries(polyloopsDict)) {
      const repeatedPolyloop = [];
      for (let m = 0; m < nMeasures; m++) {
        const measureOffset = m * measureLength;
        const offsetPolyloop = offsetTrack(polyloop, measureOffset);
        repeatedPolyloop.push(...offsetPolyloop);
      }
      repeatedDict[name] = repeatedPolyloop;
    }
    return repeatedDict;
  }
  var instrumentMapping = {
    "Acoustic Grand Piano": 0,
    "Bright Acoustic Piano": 1,
    "Electric Grand Piano": 2,
    "Honky-tonk Piano": 3,
    "Electric Piano 1": 4,
    "Electric Piano 2": 5,
    "Harpsichord": 6,
    "Clavinet": 7,
    // ... (full mapping truncated for brevity, but would include all 128 instruments)
    "Gunshot": 127
  };

  // src/algorithms/theory/harmony/Progression.js
  var Progression = class extends MusicTheoryConstants {
    /**
     * Initialize a Progression object
     * @param {string} tonicPitch - The tonic pitch of the progression (default: 'C4')
     * @param {string} circleOf - The interval to form the circle (default: 'P5')
     * @param {string} type - The type of progression ('chords' or 'pitches')
     * @param {Array} radius - Range for major, minor, and diminished chords [3, 3, 1]
     * @param {Array} weights - Weights for selecting chord types
     */
    constructor(tonicPitch = "C4", circleOf = "P5", type = "chords", radius = [3, 3, 1], weights = null) {
      super();
      this.tonicMidi = cdeToMidi(tonicPitch);
      this.circleOf = circleOf;
      this.type = type;
      this.radius = radius;
      this.weights = weights || radius;
      if (!Object.keys(this.intervals).includes(this.circleOf)) {
        throw new Error(`Select a circleOf among ${Object.keys(this.intervals).join(", ")}.`);
      }
      if (!["chords", "pitches"].includes(this.type)) {
        throw new Error("Type must either be 'pitches' or 'chords'.");
      }
    }
    /**
     * Compute chords based on the circle of fifths, thirds, etc., within the specified radius
     * @returns {Object} Object containing major, minor, and diminished chord roots
     */
    computeCircle() {
      const nSemitones = this.intervals[this.circleOf];
      const circleNotes = [this.tonicMidi];
      for (let i = 0; i < Math.max(...this.radius); i++) {
        const nextNote = (circleNotes[circleNotes.length - 1] + nSemitones) % 12 + Math.floor(circleNotes[circleNotes.length - 1] / 12) * 12;
        circleNotes.push(nextNote);
      }
      return {
        major: circleNotes.slice(0, this.radius[0]),
        minor: circleNotes.slice(0, this.radius[1]),
        diminished: circleNotes.slice(0, this.radius[2])
      };
    }
    /**
     * Generate a chord based on root MIDI note and chord type
     * @param {number} rootNoteMidi - The root MIDI note of the chord
     * @param {string} chordType - The type of chord ('major', 'minor', 'diminished')
     * @returns {Array} Array of MIDI notes representing the chord
     */
    generateChord(rootNoteMidi, chordType) {
      const chordIntervals = {
        "major": [0, 4, 7],
        "minor": [0, 3, 7],
        "diminished": [0, 3, 6]
      };
      const intervals = chordIntervals[chordType] || [0, 4, 7];
      const chordNotes = intervals.map((interval) => rootNoteMidi + interval);
      return chordNotes.map((note) => note > 127 ? note - 12 : note);
    }
    /**
     * Generate a musical progression
     * @param {number} length - The length of the progression in number of chords (default: 4)
     * @param {number} seed - The seed value for the random number generator
     * @returns {Array} Array of chord arrays representing the progression
     */
    generate(length = 4, seed = null) {
      if (seed !== null) {
        Math.seedrandom = seed;
      }
      const { major, minor, diminished } = this.computeCircle();
      const chordRoots = [major, minor, diminished];
      const chordTypes = ["major", "minor", "diminished"];
      const progression = [];
      for (let i = 0; i < length; i++) {
        const chordTypeIndex = this.weightedRandomChoice(this.weights);
        if (chordRoots[chordTypeIndex].length > 0) {
          const rootNoteMidi = chordRoots[chordTypeIndex][Math.floor(Math.random() * chordRoots[chordTypeIndex].length)];
          const chordType = chordTypes[chordTypeIndex];
          const actualRoot = Array.isArray(rootNoteMidi) ? rootNoteMidi[0] : rootNoteMidi;
          const chosenChord = this.generateChord(actualRoot, chordType);
          progression.push(chosenChord);
        }
      }
      return progression;
    }
    /**
     * Weighted random choice helper
     * @param {Array} weights - Array of weights
     * @returns {number} Selected index
     */
    weightedRandomChoice(weights) {
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return i;
        }
      }
      return weights.length - 1;
    }
  };

  // src/algorithms/theory/harmony/Voice.js
  var Voice = class extends MusicTheoryConstants {
    /**
     * Constructs all the necessary attributes for the voice object
     * @param {string} mode - The type of the scale (default: 'major')
     * @param {string} tonic - The tonic note of the scale (default: 'C')
     * @param {Array} degrees - Relative degrees for chord formation (default: [0, 2, 4])
     */
    constructor(mode = "major", tonic = "C", degrees = [0, 2, 4]) {
      super();
      this.tonic = tonic;
      this.scale = new Scale(tonic, mode).generate();
      this.degrees = degrees;
    }
    /**
     * Convert a MIDI note to a chord based on the scale using the specified degrees
     * @param {number} pitch - The MIDI note to convert
     * @returns {Array} Array of MIDI notes representing the chord
     */
    pitchToChord(pitch) {
      const octave = getOctave(pitch);
      const tonicCdePitch = this.tonic + octave.toString();
      const tonicMidiPitch = cdeToMidi(tonicCdePitch);
      const scaleDegrees = this.scale.map((p) => getDegreeFromPitch(p, this.scale, tonicMidiPitch));
      const pitchDegree = Math.round(getDegreeFromPitch(pitch, this.scale, tonicMidiPitch));
      const chord = [];
      for (const degree of this.degrees) {
        const absoluteDegree = pitchDegree + degree;
        const absoluteIndex = scaleDegrees.indexOf(absoluteDegree);
        if (absoluteIndex !== -1) {
          chord.push(this.scale[absoluteIndex]);
        }
      }
      return chord;
    }
    /**
     * Generate chords or arpeggios based on the given notes
     * @param {Array} notes - The notes to generate chords or arpeggios from
     * @param {Array} durations - The durations of each note (optional)
     * @param {boolean} arpeggios - If true, generate arpeggios instead of chords (default: false)
     * @returns {Array} The generated chords or arpeggios
     */
    generate(notes, durations = null, arpeggios = false) {
      if (!Array.isArray(notes) || notes.length === 0) {
        return [];
      }
      let processedNotes = notes;
      if (typeof notes[0] === "number") {
        if (durations === null) {
          durations = [1];
        }
        let durationsIndex = 0;
        let currentOffset = 0;
        processedNotes = notes.map((p) => {
          const d = durations[durationsIndex % durations.length];
          const result = [p, d, currentOffset];
          currentOffset += d;
          durationsIndex++;
          return result;
        });
      }
      const chords = processedNotes.map(([pitch, duration, offset]) => {
        const chordPitches = this.pitchToChord(pitch);
        return [chordPitches, duration, offset];
      });
      if (!arpeggios) {
        return chords;
      } else {
        const arpeggioNotes = [];
        for (const [chordPitches, duration, offset] of chords) {
          const noteDuration = duration / chordPitches.length;
          chordPitches.forEach((pitch, index) => {
            arpeggioNotes.push([pitch, noteDuration, offset + index * noteDuration]);
          });
        }
        return arpeggioNotes;
      }
    }
  };

  // src/algorithms/constants/OrnamentTypes.js
  var ORNAMENT_TYPES = {
    "grace_note": {
      requiredParams: ["graceNoteType"],
      optionalParams: ["gracePitches"],
      conflicts: [],
      description: "Single note before the main note",
      defaultParams: {
        graceNoteType: "acciaccatura"
      },
      validate: (note, params) => {
        if (!["acciaccatura", "appoggiatura"].includes(params.graceNoteType)) {
          return { valid: false, error: "graceNoteType must be either acciaccatura or appoggiatura" };
        }
        if (params.gracePitches && !Array.isArray(params.gracePitches)) {
          return { valid: false, error: "gracePitches must be an array of pitches" };
        }
        return { valid: true };
      }
    },
    "trill": {
      requiredParams: [],
      optionalParams: ["by", "trillRate"],
      conflicts: ["mordent"],
      minDuration: "8n",
      description: "Rapid alternation between main note and auxiliary note",
      defaultParams: {
        by: 1,
        trillRate: 0.125
      },
      validate: (note, params) => {
        if (params.by && typeof params.by !== "number") {
          return { valid: false, error: "trill step (by) must be a number" };
        }
        if (params.trillRate && typeof params.trillRate !== "number") {
          return { valid: false, error: "trillRate must be a number" };
        }
        return { valid: true };
      }
    },
    "mordent": {
      requiredParams: [],
      optionalParams: ["by"],
      conflicts: ["trill"],
      description: "Quick alternation with note above or below",
      defaultParams: {
        by: 1
      },
      validate: (note, params) => {
        if (params.by && typeof params.by !== "number") {
          return { valid: false, error: "mordent step (by) must be a number" };
        }
        return { valid: true };
      }
    },
    "turn": {
      requiredParams: [],
      optionalParams: ["scale"],
      conflicts: [],
      description: "Melodic turn around the main note",
      validate: (note, params) => {
        if (params.scale && typeof params.scale !== "string") {
          return { valid: false, error: "scale must be a string" };
        }
        return { valid: true };
      }
    },
    "arpeggio": {
      requiredParams: ["arpeggioDegrees"],
      optionalParams: ["direction"],
      conflicts: [],
      description: "Notes played in sequence",
      defaultParams: {
        direction: "up"
      },
      validate: (note, params) => {
        if (!Array.isArray(params.arpeggioDegrees)) {
          return { valid: false, error: "arpeggioDegrees must be an array" };
        }
        if (params.direction && !["up", "down", "both"].includes(params.direction)) {
          return { valid: false, error: "direction must be up, down, or both" };
        }
        return { valid: true };
      }
    }
  };

  // src/algorithms/theory/harmony/Ornament.js
  var Ornament = class _Ornament {
    /**
     * Validate ornament parameters and compatibility
     * @param {Object} note - The note to apply the ornament to
     * @param {string} type - The type of ornament
     * @param {Object} params - Parameters for the ornament
     * @returns {Object} Validation result with success status and any messages
     */
    static validateOrnament(note, type, params = {}) {
      const result = {
        valid: false,
        warnings: [],
        errors: []
      };
      const ornamentDef = ORNAMENT_TYPES[type];
      if (!ornamentDef) {
        result.errors.push(`Unknown ornament type: ${type}`);
        return result;
      }
      if (ornamentDef.requiredParams) {
        for (const param of ornamentDef.requiredParams) {
          if (!(param in params)) {
            result.errors.push(`Missing required parameter '${param}' for ${type}`);
            return result;
          }
        }
      }
      if (ornamentDef.minDuration) {
        result.warnings.push(`Duration check not implemented for ${type}`);
      }
      if (note.ornaments && ornamentDef.conflicts) {
        const existingConflicts = note.ornaments.filter((o) => ornamentDef.conflicts.includes(o.type)).map((o) => o.type);
        if (existingConflicts.length > 0) {
          result.errors.push(`${type} conflicts with existing ornaments: ${existingConflicts.join(", ")}`);
          return result;
        }
      }
      if (ornamentDef.validate) {
        const specificValidation = ornamentDef.validate(note, params);
        if (!specificValidation.valid) {
          result.errors.push(specificValidation.error);
          return result;
        }
      }
      result.valid = true;
      return result;
    }
    /**
     * Create a new ornament instance with validation
     * @param {Object} options - Ornament configuration
     */
    constructor(options) {
      const ornamentDef = ORNAMENT_TYPES[options.type];
      if (!ornamentDef) {
        throw new Error(`Unknown ornament type: ${options.type}`);
      }
      this.type = options.type;
      this.params = {
        ...ornamentDef.defaultParams,
        ...options.parameters
      };
      if (options.tonic && options.mode) {
        this.tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(options.tonic);
        this.scale = this.generateScale(options.tonic, options.mode);
      } else {
        this.scale = null;
      }
    }
    /**
     * Generate a scale for pitch-based ornaments
     */
    generateScale(tonic, mode) {
      const scalePattern = MusicTheoryConstants.scale_intervals[mode];
      const tonicIndex = MusicTheoryConstants.chromatic_scale.indexOf(tonic);
      const scaleNotes = scalePattern.map((interval) => (tonicIndex + interval) % 12);
      const completeScale = [];
      for (let octave = -1; octave < 10; octave++) {
        for (const note of scaleNotes) {
          const midiNote = 12 * octave + note;
          if (midiNote >= 0 && midiNote <= 127) {
            completeScale.push(midiNote);
          }
        }
      }
      return completeScale;
    }
    /**
     * Apply the ornament to notes
     */
    apply(notes, noteIndex = null) {
      if (!Array.isArray(notes) || notes.length === 0) {
        return notes;
      }
      if (noteIndex === null) {
        noteIndex = Math.floor(Math.random() * notes.length);
      }
      if (noteIndex < 0 || noteIndex >= notes.length) {
        return notes;
      }
      const note = notes[noteIndex];
      const validation = _Ornament.validateOrnament(note, this.type, this.params);
      if (!validation.valid) {
        console.warn(`Ornament validation failed: ${validation.errors.join(", ")}`);
        return notes;
      }
      switch (this.type) {
        case "grace_note":
          return this.addGraceNote(notes, noteIndex);
        case "trill":
          return this.addTrill(notes, noteIndex);
        case "mordent":
          return this.addMordent(notes, noteIndex);
        case "turn":
          return this.addTurn(notes, noteIndex);
        case "arpeggio":
          return this.addArpeggio(notes, noteIndex);
        default:
          return notes;
      }
    }
    /**
     * Add a grace note
     */
    addGraceNote(notes, noteIndex) {
      const mainNote = notes[noteIndex];
      const mainPitch = mainNote.pitch;
      const mainDuration = mainNote.duration;
      const mainOffset = mainNote.time;
      const ornamentPitch = this.params.gracePitches ? this.params.gracePitches[Math.floor(Math.random() * this.params.gracePitches.length)] : mainPitch + 1;
      if (this.params.graceNoteType === "acciaccatura") {
        const graceDuration = mainDuration * 0.125;
        const modifiedMain = { pitch: mainPitch, duration: mainDuration, time: mainOffset + graceDuration };
        return [
          ...notes.slice(0, noteIndex),
          { pitch: ornamentPitch, duration: graceDuration, time: mainOffset },
          modifiedMain,
          ...notes.slice(noteIndex + 1)
        ];
      } else {
        const graceDuration = mainDuration / 2;
        const modifiedMain = { pitch: mainPitch, duration: graceDuration, time: mainOffset + graceDuration };
        return [
          ...notes.slice(0, noteIndex),
          { pitch: ornamentPitch, duration: graceDuration, time: mainOffset },
          modifiedMain,
          ...notes.slice(noteIndex + 1)
        ];
      }
    }
    /**
     * Add a trill
     */
    addTrill(notes, noteIndex) {
      const mainNote = notes[noteIndex];
      const mainPitch = mainNote.pitch;
      const mainDuration = mainNote.duration;
      const mainOffset = mainNote.time;
      const trillNotes = [];
      let currentOffset = mainOffset;
      const by = this.params.by || 1;
      const trillRate = this.params.trillRate || 0.125;
      let trillPitch;
      if (this.scale && this.scale.includes(mainPitch)) {
        const pitchIndex = this.scale.indexOf(mainPitch);
        const trillIndex = (pitchIndex + Math.round(by)) % this.scale.length;
        trillPitch = this.scale[trillIndex];
      } else {
        trillPitch = mainPitch + by;
      }
      while (currentOffset < mainOffset + mainDuration) {
        const remainingTime = mainOffset + mainDuration - currentOffset;
        const noteLength = Math.min(trillRate, remainingTime / 2);
        if (remainingTime >= noteLength * 2) {
          trillNotes.push({ pitch: mainPitch, duration: noteLength, time: currentOffset });
          trillNotes.push({ pitch: trillPitch, duration: noteLength, time: currentOffset + noteLength });
          currentOffset += 2 * noteLength;
        } else {
          break;
        }
      }
      return [
        ...notes.slice(0, noteIndex),
        ...trillNotes,
        ...notes.slice(noteIndex + 1)
      ];
    }
    /**
     * Add a mordent
     */
    addMordent(notes, noteIndex) {
      const mainNote = notes[noteIndex];
      const mainPitch = mainNote.pitch;
      const mainDuration = mainNote.duration;
      const mainOffset = mainNote.time;
      const by = this.params.by || 1;
      let mordentPitch;
      if (this.scale && this.scale.includes(mainPitch)) {
        const pitchIndex = this.scale.indexOf(mainPitch);
        const mordentIndex = pitchIndex + Math.round(by);
        mordentPitch = this.scale[mordentIndex] || mainPitch + by;
      } else {
        mordentPitch = mainPitch + by;
      }
      const partDuration = mainDuration / 3;
      const mordentNotes = [
        { pitch: mainPitch, duration: partDuration, time: mainOffset },
        { pitch: mordentPitch, duration: partDuration, time: mainOffset + partDuration },
        { pitch: mainPitch, duration: partDuration, time: mainOffset + 2 * partDuration }
      ];
      return [
        ...notes.slice(0, noteIndex),
        ...mordentNotes,
        ...notes.slice(noteIndex + 1)
      ];
    }
    /**
     * Add a turn
     */
    addTurn(notes, noteIndex) {
      const mainNote = notes[noteIndex];
      const mainPitch = mainNote.pitch;
      const mainDuration = mainNote.duration;
      const mainOffset = mainNote.time;
      const partDuration = mainDuration / 4;
      let upperPitch, lowerPitch;
      if (this.scale && this.scale.includes(mainPitch)) {
        const pitchIndex = this.scale.indexOf(mainPitch);
        upperPitch = this.scale[pitchIndex + 1] || mainPitch + 2;
        lowerPitch = this.scale[pitchIndex - 1] || mainPitch - 2;
      } else {
        upperPitch = mainPitch + 2;
        lowerPitch = mainPitch - 2;
      }
      const turnNotes = [
        { pitch: mainPitch, duration: partDuration, time: mainOffset },
        { pitch: upperPitch, duration: partDuration, time: mainOffset + partDuration },
        { pitch: mainPitch, duration: partDuration, time: mainOffset + 2 * partDuration },
        { pitch: lowerPitch, duration: partDuration, time: mainOffset + 3 * partDuration }
      ];
      return [
        ...notes.slice(0, noteIndex),
        ...turnNotes,
        ...notes.slice(noteIndex + 1)
      ];
    }
    /**
     * Add an arpeggio
     */
    addArpeggio(notes, noteIndex) {
      const mainNote = notes[noteIndex];
      const mainPitch = mainNote.pitch;
      const mainDuration = mainNote.duration;
      const mainOffset = mainNote.time;
      const { arpeggioDegrees, direction = "up" } = this.params;
      if (!arpeggioDegrees || !Array.isArray(arpeggioDegrees)) {
        return notes;
      }
      const pitches = [];
      if (this.scale && this.scale.includes(mainPitch)) {
        const pitchIndex = this.scale.indexOf(mainPitch);
        pitches.push(...arpeggioDegrees.map((degree) => this.scale[pitchIndex + degree] || mainPitch + degree));
      } else {
        pitches.push(...arpeggioDegrees.map((degree) => mainPitch + degree));
      }
      if (direction === "down")
        pitches.reverse();
      if (direction === "both")
        pitches.push(...pitches.slice(0, -1).reverse());
      const partDuration = mainDuration / pitches.length;
      const arpeggioNotes = pitches.map((pitch, i) => ({
        pitch,
        duration: partDuration,
        time: mainOffset + i * partDuration
      }));
      return [
        ...notes.slice(0, noteIndex),
        ...arpeggioNotes,
        ...notes.slice(noteIndex + 1)
      ];
    }
  };

  // src/algorithms/constants/ArticulationTypes.js
  var ARTICULATION_TYPES = {
    // Simple articulations
    "staccato": {
      complex: false,
      description: "Shortens note duration to ~50%"
    },
    "accent": {
      complex: false,
      description: "Increases note velocity/emphasis"
    },
    "tenuto": {
      complex: false,
      description: "Holds note for full duration with emphasis"
    },
    "legato": {
      complex: false,
      description: "Smooth connection between notes"
    },
    "marcato": {
      complex: false,
      description: "Strong accent with slight separation"
    },
    // Complex articulations
    "glissando": {
      complex: true,
      requiredParams: ["target"],
      description: "Smooth slide from note to target pitch"
    },
    "portamento": {
      complex: true,
      requiredParams: ["target"],
      optionalParams: ["curve", "speed"],
      description: "Expressive slide between pitches"
    },
    "bend": {
      complex: true,
      requiredParams: ["amount"],
      optionalParams: ["curve", "returnToOriginal"],
      description: "Pitch bend up or down in cents"
    },
    "vibrato": {
      complex: true,
      optionalParams: ["rate", "depth", "delay"],
      description: "Periodic pitch variation"
    },
    "tremolo": {
      complex: true,
      optionalParams: ["rate", "depth"],
      description: "Rapid volume variation"
    },
    "crescendo": {
      complex: true,
      requiredParams: ["endVelocity"],
      optionalParams: ["curve"],
      description: "Gradual volume increase"
    },
    "diminuendo": {
      complex: true,
      requiredParams: ["endVelocity"],
      optionalParams: ["curve"],
      description: "Gradual volume decrease"
    }
  };

  // src/algorithms/theory/harmony/Articulation.js
  var Articulation = class {
    /**
     * Add articulation to a note in a sequence
     * @param {Array} sequence - The note sequence
     * @param {string} articulationType - Type of articulation
     * @param {number} noteIndex - Index of note to articulate
     * @param {Object} params - Parameters for complex articulations
     * @returns {Object} Result with success status and any warnings
     */
    static addArticulation(sequence, articulationType, noteIndex, params = {}) {
      const result = {
        success: false,
        warnings: [],
        errors: []
      };
      if (!Array.isArray(sequence)) {
        result.errors.push("Sequence must be an array");
        return result;
      }
      if (noteIndex < 0 || noteIndex >= sequence.length) {
        result.errors.push(
          `Note index ${noteIndex} out of bounds (sequence length: ${sequence.length})`
        );
        return result;
      }
      const articulationDef = ARTICULATION_TYPES[articulationType];
      if (!articulationDef) {
        result.errors.push(`Unknown articulation type: ${articulationType}`);
        return result;
      }
      const note = sequence[noteIndex];
      if (!note || typeof note !== "object") {
        result.errors.push(`Invalid note at index ${noteIndex}`);
        return result;
      }
      if (!articulationDef.complex) {
        const arr = Array.isArray(note.articulations) ? note.articulations : [];
        note.articulations = [...arr, articulationType];
        result.success = true;
        return result;
      }
      return this._addComplexArticulation(
        note,
        articulationType,
        articulationDef,
        params,
        result
      );
    }
    /**
     * Add complex articulation with parameter validation and synchronization
     */
    static _addComplexArticulation(note, articulationType, articulationDef, params, result) {
      if (articulationDef.requiredParams) {
        for (const param of articulationDef.requiredParams) {
          if (!(param in params)) {
            result.errors.push(
              `Missing required parameter '${param}' for ${articulationType}`
            );
            return result;
          }
        }
      }
      switch (articulationType) {
        case "glissando":
        case "portamento":
          return this._applyGlissando(note, articulationType, params, result);
        case "bend":
          return this._applyBend(note, params, result);
        case "vibrato":
          return this._applyVibrato(note, params, result);
        case "tremolo":
          return this._applyTremolo(note, params, result);
        case "crescendo":
        case "diminuendo":
          return this._applyDynamicChange(note, articulationType, params, result);
        default:
          result.errors.push(
            `Complex articulation ${articulationType} not implemented`
          );
          return result;
      }
    }
    /**
     * Apply glissando/portamento articulation
     */
    static _applyGlissando(note, type, params, result) {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      note.articulations = [...arr, { type, ...params }];
      result.success = true;
      return result;
    }
    /**
     * Apply pitch bend articulation
     */
    static _applyBend(note, params, result) {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      note.articulations = [...arr, { type: "bend", ...params }];
      result.success = true;
      return result;
    }
    /**
     * Apply vibrato articulation
     */
    static _applyVibrato(note, params, result) {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      note.articulations = [...arr, { type: "vibrato", ...params }];
      result.success = true;
      return result;
    }
    /**
     * Apply tremolo articulation
     */
    static _applyTremolo(note, params, result) {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      note.articulations = [...arr, { type: "tremolo", ...params }];
      result.success = true;
      return result;
    }
    /**
     * Apply dynamic change (crescendo/diminuendo)
     */
    static _applyDynamicChange(note, type, params, result) {
      const arr = Array.isArray(note.articulations) ? note.articulations : [];
      note.articulations = [...arr, { type, ...params }];
      result.success = true;
      return result;
    }
    /**
     * Remove articulation from a note
     */
    static removeArticulation(sequence, noteIndex) {
      if (!Array.isArray(sequence) || noteIndex < 0 || noteIndex >= sequence.length) {
        return { success: false, error: "Invalid sequence or note index" };
      }
      const note = sequence[noteIndex];
      if (!note || typeof note !== "object") {
        return { success: false, error: "Invalid note" };
      }
      const removed = Array.isArray(note.articulations) ? note.articulations.slice() : [];
      note.articulations = [];
      return {
        success: true,
        removed,
        message: "Removed articulations from note"
      };
    }
    /**
     * Validate articulation consistency in a sequence
     */
    static validateSequence(sequence) {
      const issues = [];
      sequence.forEach((note, index) => {
        const arr = Array.isArray(note.articulations) ? note.articulations : [];
        for (const a of arr) {
          const type = typeof a === "string" ? a : a?.type;
          const articulationDef = ARTICULATION_TYPES[type];
          if (!type || !articulationDef) {
            issues.push({
              type: "unknown_articulation",
              noteIndex: index,
              articulation: type,
              message: `Unknown articulation type: ${type}`
            });
            continue;
          }
          if (Array.isArray(articulationDef.requiredParams)) {
            for (const param of articulationDef.requiredParams) {
              if (typeof a !== "object" || !(param in a)) {
                issues.push({
                  type: "missing_parameter",
                  noteIndex: index,
                  articulation: type,
                  message: `Missing required parameter '${param}' for ${type}`
                });
              }
            }
          }
        }
      });
      return {
        valid: issues.length === 0,
        issues
      };
    }
    /**
     * Get available articulation types with descriptions
     */
    static getAvailableTypes() {
      return Object.entries(ARTICULATION_TYPES).map(([type, def]) => ({
        type,
        complex: def.complex,
        description: def.description,
        requiredParams: def.requiredParams || [],
        optionalParams: def.optionalParams || []
      }));
    }
  };
  function validateArticulations(sequence) {
    return Articulation.validateSequence(sequence);
  }
  function addArticulation(notes, index, type, params = {}) {
    if (!Array.isArray(notes))
      return notes;
    const next = notes.slice();
    const src = notes[index];
    if (!src || typeof src !== "object")
      return next;
    const isSimple = (t) => t === "staccato" || t === "accent" || t === "tenuto" || t === "marcato";
    const articulations = Array.isArray(src.articulations) ? src.articulations.slice() : [];
    if (isSimple(type)) {
      articulations.push(type);
    } else {
      articulations.push({ type, ...params });
    }
    const updated = {
      ...src,
      articulations
    };
    next[index] = updated;
    return next;
  }
  function removeArticulation(notes, index, predicate) {
    if (!Array.isArray(notes))
      return notes;
    const next = notes.slice();
    const src = notes[index];
    if (!src || typeof src !== "object")
      return next;
    const shouldRemove = (t) => typeof predicate === "function" ? predicate(t) : true;
    const arts = Array.isArray(src.articulations) ? src.articulations.filter((a) => {
      const t = typeof a === "string" ? a : a.type;
      return !shouldRemove(t);
    }) : [];
    const updated = { ...src, articulations: arts };
    next[index] = updated;
    return next;
  }

  // src/algorithms/theory/harmony/index.js
  var addOrnament = addArticulation;
  var removeOrnament = removeArticulation;
  var harmony_default = {
    Scale,
    Progression,
    Voice,
    Ornament,
    Articulation,
    addArticulation,
    addOrnament,
    // Include the alias
    removeArticulation,
    removeOrnament,
    // Include the alias
    validateArticulations
  };

  // src/algorithms/theory/rhythm/Rhythm.js
  var Rhythm = class {
    /**
     * Constructs all the necessary attributes for the Rhythm object
     * @param {number} measureLength - The length of the measure
     * @param {Array} durations - The durations of the notes
     */
    constructor(measureLength, durations) {
      this.measureLength = measureLength;
      this.durations = durations;
    }
    /**
     * Generate a random rhythm as a list of (duration, offset) tuples
     * @param {number} seed - Random seed for reproducibility
     * @param {number} restProbability - Probability of a rest (0-1)
     * @param {number} maxIter - Maximum number of iterations
     * @returns {Array} Array of [duration, offset] tuples representing the rhythm
     */
    random(seed = null, restProbability = 0, maxIter = 100) {
      if (seed !== null) {
        Math.seedrandom = seed;
      }
      const rhythm = [];
      let totalLength = 0;
      let nIter = 0;
      while (totalLength < this.measureLength && nIter < maxIter) {
        const duration = this.durations[Math.floor(Math.random() * this.durations.length)];
        if (totalLength + duration > this.measureLength) {
          nIter++;
          continue;
        }
        if (Math.random() < restProbability) {
          nIter++;
          continue;
        }
        rhythm.push([duration, totalLength]);
        totalLength += duration;
        nIter++;
      }
      if (nIter >= maxIter) {
        console.warn("Max iterations reached. The sum of the durations may not equal the measure length.");
      }
      return rhythm;
    }
    /**
     * Executes the Darwinian evolution algorithm to generate the best rhythm
     * @param {number} seed - Random seed for reproducibility
     * @param {number} populationSize - Number of rhythms in each generation
     * @param {number} maxGenerations - Maximum number of generations
     * @param {number} mutationRate - Probability of mutation (0-1)
     * @returns {Array} The best rhythm found after evolution
     */
    darwin(seed = null, populationSize = 10, maxGenerations = 50, mutationRate = 0.1) {
      const ga = new GeneticRhythm(
        seed,
        populationSize,
        this.measureLength,
        maxGenerations,
        mutationRate,
        this.durations
      );
      return ga.generate();
    }
  };
  var GeneticRhythm = class {
    constructor(seed, populationSize, measureLength, maxGenerations, mutationRate, durations) {
      if (seed !== null) {
        Math.seedrandom = seed;
      }
      this.populationSize = populationSize;
      this.measureLength = measureLength;
      this.maxGenerations = maxGenerations;
      this.mutationRate = mutationRate;
      this.durations = durations;
      this.population = this.initializePopulation();
    }
    /**
     * Initialize a population of random rhythms
     */
    initializePopulation() {
      const population = [];
      for (let i = 0; i < this.populationSize; i++) {
        population.push(this.createRandomRhythm());
      }
      return population;
    }
    /**
     * Create a random rhythm ensuring it respects the measure length
     * @returns {Array} Array of [duration, offset] tuples
     */
    createRandomRhythm() {
      const rhythm = [];
      let totalLength = 0;
      while (totalLength < this.measureLength) {
        const remaining = this.measureLength - totalLength;
        const noteLength = this.durations[Math.floor(Math.random() * this.durations.length)];
        if (noteLength <= remaining) {
          rhythm.push([noteLength, totalLength]);
          totalLength += noteLength;
        } else {
          break;
        }
      }
      return rhythm;
    }
    /**
     * Evaluate the fitness of a rhythm
     * @param {Array} rhythm - The rhythm to evaluate
     * @returns {number} Fitness score (lower is better)
     */
    evaluateFitness(rhythm) {
      const totalLength = rhythm.reduce((sum, note) => sum + note[0], 0);
      return Math.abs(this.measureLength - totalLength);
    }
    /**
     * Select a parent using simple random selection with fitness bias
     * @returns {Array} Selected parent rhythm
     */
    selectParent() {
      const parent1 = this.population[Math.floor(Math.random() * this.population.length)];
      const parent2 = this.population[Math.floor(Math.random() * this.population.length)];
      return this.evaluateFitness(parent1) < this.evaluateFitness(parent2) ? parent1 : parent2;
    }
    /**
     * Perform crossover between two parents
     * @param {Array} parent1 - First parent rhythm
     * @param {Array} parent2 - Second parent rhythm
     * @returns {Array} Child rhythm
     */
    crossover(parent1, parent2) {
      if (parent1.length === 0 || parent2.length === 0) {
        return parent1.length > 0 ? [...parent1] : [...parent2];
      }
      const crossoverPoint = Math.floor(Math.random() * (parent1.length - 1)) + 1;
      const child = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
      return this.ensureMeasureLength(child);
    }
    /**
     * Ensure rhythm respects measure length
     * @param {Array} rhythm - The rhythm to adjust
     * @returns {Array} Adjusted rhythm
     */
    ensureMeasureLength(rhythm) {
      const totalLength = rhythm.reduce((sum, note) => sum + note[0], 0);
      if (totalLength > this.measureLength && rhythm.length > 0) {
        rhythm.pop();
      }
      return rhythm;
    }
    /**
     * Mutate a rhythm with certain probability
     * @param {Array} rhythm - The rhythm to mutate
     * @returns {Array} Mutated rhythm
     */
    mutate(rhythm) {
      if (Math.random() < this.mutationRate && rhythm.length > 1) {
        const index = Math.floor(Math.random() * (rhythm.length - 1));
        const [duration, offset] = rhythm[index];
        const nextOffset = index === rhythm.length - 1 ? this.measureLength : rhythm[index + 1][1];
        const maxNewDuration = nextOffset - offset;
        const validDurations = this.durations.filter((d) => d <= maxNewDuration);
        if (validDurations.length > 0) {
          const newDuration = validDurations[Math.floor(Math.random() * validDurations.length)];
          rhythm[index] = [newDuration, offset];
        }
      }
      return rhythm;
    }
    /**
     * Execute the genetic algorithm
     * @returns {Array} Best rhythm found, sorted by offset
     */
    generate() {
      for (let generation = 0; generation < this.maxGenerations; generation++) {
        const newPopulation = [];
        for (let i = 0; i < this.populationSize; i++) {
          const parent1 = this.selectParent();
          const parent2 = this.selectParent();
          let child = this.crossover(parent1, parent2);
          child = this.mutate(child);
          child.sort((a, b) => a[1] - b[1]);
          newPopulation.push(child);
        }
        this.population = newPopulation;
      }
      const bestRhythm = this.population.reduce(
        (best, current) => this.evaluateFitness(current) < this.evaluateFitness(best) ? current : best
      );
      return bestRhythm.sort((a, b) => a[1] - b[1]);
    }
  };

  // src/utils/jmon-utils.js
  var jmon_utils_exports = {};
  __export(jmon_utils_exports, {
    beatsToTime: () => beatsToTime,
    combineSequences: () => combineSequences,
    concatenateSequences: () => concatenateSequences,
    createComposition: () => createComposition,
    createPart: () => createPart,
    createScale: () => createScale,
    getTimingInfo: () => getTimingInfo,
    jmonToTuples: () => jmonToTuples,
    normalizeNotes: () => normalizeNotes,
    offsetNotes: () => offsetNotes,
    timeToBeats: () => timeToBeats,
    tuplesToJmon: () => tuplesToJmon
  });
  function beatsToTime(beats, beatsPerBar = 4, ticksPerBeat = 480) {
    const bars = Math.floor(beats / beatsPerBar);
    const remainingBeats = beats - bars * beatsPerBar;
    const wholeBeats = Math.floor(remainingBeats);
    const fractionalBeat = remainingBeats - wholeBeats;
    const ticks = Math.round(fractionalBeat * ticksPerBeat);
    return `${bars}:${wholeBeats}:${ticks}`;
  }
  function timeToBeats(timeString, beatsPerBar = 4, ticksPerBeat = 480) {
    if (typeof timeString === "number")
      return timeString;
    if (typeof timeString !== "string")
      return 0;
    const parts = timeString.split(":").map((x) => parseFloat(x || "0"));
    const [bars = 0, beats = 0, ticks = 0] = parts;
    return bars * beatsPerBar + beats + ticks / ticksPerBeat;
  }
  function createPart(notes, name = "Untitled Part", options = {}) {
    const normalizedNotes = normalizeNotes(notes);
    return {
      name,
      notes: normalizedNotes,
      ...options
    };
  }
  function createComposition(parts, metadata = {}) {
    const normalizedParts = parts.map((part, index) => {
      if (Array.isArray(part)) {
        return createPart(part, `Track ${index + 1}`);
      } else if (part.name && part.notes) {
        return {
          ...part,
          notes: normalizeNotes(part.notes)
        };
      } else {
        return part;
      }
    });
    const composition = {
      format: "jmon",
      version: "1.0",
      bpm: metadata.bpm || 120,
      keySignature: metadata.keySignature || "C",
      timeSignature: metadata.timeSignature || "4/4",
      tracks: normalizedParts,
      ...metadata
    };
    delete composition.metadata?.bpm;
    delete composition.metadata?.keySignature;
    delete composition.metadata?.timeSignature;
    return composition;
  }
  function normalizeNotes(notes) {
    if (!Array.isArray(notes))
      return [];
    return notes.map((note, index) => {
      if (Array.isArray(note)) {
        const [pitch, duration, offset = 0] = note;
        return {
          pitch,
          duration,
          time: beatsToTime(offset)
        };
      }
      if (typeof note === "object" && note !== null) {
        const { pitch, duration } = note;
        let time = "0:0:0";
        if (typeof note.time === "string") {
          time = note.time;
        } else if (typeof note.time === "number") {
          time = beatsToTime(note.time);
        } else if (typeof note.offset === "number") {
          time = beatsToTime(note.offset);
        }
        return {
          pitch,
          duration,
          time,
          // Preserve other properties
          ...Object.fromEntries(
            Object.entries(note).filter(
              ([key]) => !["time", "offset"].includes(key)
            )
          )
        };
      }
      console.warn(`Unexpected note format at index ${index}:`, note);
      return {
        pitch: 60,
        // Default to middle C
        duration: 1,
        time: "0:0:0"
      };
    });
  }
  function tuplesToJmon(tuples) {
    return tuples.map(([pitch, duration, offset = 0]) => ({
      pitch,
      duration,
      time: beatsToTime(offset)
    }));
  }
  function jmonToTuples(notes) {
    return notes.map((note) => [
      note.pitch,
      note.duration,
      timeToBeats(note.time)
    ]);
  }
  function createScale(pitches, duration = 1, startTime = 0) {
    let currentTime = startTime;
    return pitches.map((pitch) => {
      const note = {
        pitch,
        duration,
        time: beatsToTime(currentTime)
      };
      currentTime += duration;
      return note;
    });
  }
  function offsetNotes(notes, offsetBeats) {
    return notes.map((note) => ({
      ...note,
      time: beatsToTime(timeToBeats(note.time) + offsetBeats)
    }));
  }
  function concatenateSequences(sequences) {
    if (sequences.length === 0)
      return [];
    const result = [];
    let currentOffset = 0;
    for (const sequence of sequences) {
      const offsetSequence = offsetNotes(sequence, currentOffset);
      result.push(...offsetSequence);
      const endTimes = offsetSequence.map(
        (note) => timeToBeats(note.time) + note.duration
      );
      currentOffset = Math.max(...endTimes, currentOffset);
    }
    return result;
  }
  function combineSequences(sequences) {
    return sequences.flat();
  }
  function getTimingInfo(notes) {
    if (notes.length === 0)
      return { start: 0, end: 0, duration: 0 };
    const startTimes = notes.map((note) => timeToBeats(note.time));
    const endTimes = notes.map((note) => timeToBeats(note.time) + note.duration);
    const start = Math.min(...startTimes);
    const end = Math.max(...endTimes);
    return {
      start,
      end,
      duration: end - start,
      startTime: beatsToTime(start),
      endTime: beatsToTime(end)
    };
  }

  // src/algorithms/theory/rhythm/isorhythm.js
  function isorhythm(pitches, durations, options = {}) {
    const cleanPitches = pitches.map((p) => Array.isArray(p) || typeof p === "object" && p.length ? p[0] : p);
    const lcm = calculateLCM(cleanPitches.length, durations.length);
    const pRepeated = [];
    const dRepeated = [];
    for (let i = 0; i < lcm; i++) {
      pRepeated.push(cleanPitches[i % cleanPitches.length]);
      dRepeated.push(durations[i % durations.length]);
    }
    const notes = pRepeated.map((pitch, i) => [pitch, dRepeated[i], 1]);
    const tuplesWithOffsets = setOffsetsAccordingToDurations(notes);
    if (options.legacy) {
      return tuplesWithOffsets;
    }
    return tuplesWithOffsets.map(([pitch, duration, offset]) => ({
      pitch,
      duration,
      time: options.useStringTime ? beatsToTime(offset) : offset
    }));
  }
  function calculateLCM(a, b) {
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    return Math.abs(a * b) / gcd(a, b);
  }

  // src/algorithms/theory/rhythm/beatcycle.js
  function beatcycle(pitches, durations) {
    const notes = [];
    let currentOffset = 0;
    let durationIndex = 0;
    for (const pitch of pitches) {
      const duration = durations[durationIndex % durations.length];
      notes.push([pitch, duration, currentOffset]);
      currentOffset += duration;
      durationIndex++;
    }
    return notes;
  }

  // src/algorithms/theory/rhythm/index.js
  var rhythm_default = {
    Rhythm,
    isorhythm,
    beatcycle
  };

  // src/algorithms/theory/motifs/index.js
  var MotifBank = class {
    // Dummy implementation, replace with actual logic
    constructor() {
    }
  };

  // src/algorithms/utils/matrix.js
  var Matrix = class _Matrix {
    data;
    // rows: number;
    // columns: number;
    constructor(data, columns) {
      if (typeof data === "number") {
        if (columns === void 0) {
          throw new Error("Columns parameter required when creating matrix from dimensions");
        }
        this.rows = data;
        this.columns = columns;
        this.data = Array(this.rows).fill(0).map(() => Array(this.columns).fill(0));
      } else {
        this.data = data.map((row) => [...row]);
        this.rows = this.data.length;
        this.columns = this.data[0]?.length || 0;
      }
    }
    static zeros(rows, columns) {
      return new _Matrix(rows, columns);
    }
    static from2DArray(data) {
      return new _Matrix(data);
    }
    get(row, column) {
      if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
        throw new Error(`Index out of bounds: (${row}, ${column})`);
      }
      return this.data[row][column];
    }
    set(row, column, value) {
      if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
        throw new Error(`Index out of bounds: (${row}, ${column})`);
      }
      this.data[row][column] = value;
    }
    getRow(row) {
      if (row < 0 || row >= this.rows) {
        throw new Error(`Row index out of bounds: ${row}`);
      }
      return [...this.data[row]];
    }
    getColumn(column) {
      if (column < 0 || column >= this.columns) {
        throw new Error(`Column index out of bounds: ${column}`);
      }
      return this.data.map((row) => row[column]);
    }
    transpose() {
      const transposed = Array(this.columns).fill(0).map(() => Array(this.rows).fill(0));
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          transposed[j][i] = this.data[i][j];
        }
      }
      return new _Matrix(transposed);
    }
    clone() {
      return new _Matrix(this.data);
    }
    toArray() {
      return this.data.map((row) => [...row]);
    }
  };
  function ensure2D(X) {
    if (Array.isArray(X[0])) {
      return Matrix.from2DArray(X);
    } else {
      return Matrix.from2DArray([X]);
    }
  }
  function choleskyDecomposition(matrix) {
    if (matrix.rows !== matrix.columns) {
      throw new Error("Matrix must be square for Cholesky decomposition");
    }
    const n = matrix.rows;
    const L = Matrix.zeros(n, n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        if (i === j) {
          let sum = 0;
          for (let k = 0; k < j; k++) {
            sum += L.get(j, k) * L.get(j, k);
          }
          const diagonal = matrix.get(j, j) - sum;
          if (diagonal <= 0) {
            throw new Error(`Matrix is not positive definite at position (${j}, ${j})`);
          }
          L.set(j, j, Math.sqrt(diagonal));
        } else {
          let sum = 0;
          for (let k = 0; k < j; k++) {
            sum += L.get(i, k) * L.get(j, k);
          }
          L.set(i, j, (matrix.get(i, j) - sum) / L.get(j, j));
        }
      }
    }
    return L;
  }

  // src/algorithms/generative/gaussian-processes/kernels/base.js
  var Kernel = class {
    constructor(params = {}) {
      this.params = { ...params };
    }
    call(X1, X2) {
      const X2_actual = X2 || X1;
      const K = Matrix.zeros(X1.rows, X2_actual.rows);
      for (let i = 0; i < X1.rows; i++) {
        for (let j = 0; j < X2_actual.rows; j++) {
          K.set(i, j, this.compute(X1.getRow(i), X2_actual.getRow(j)));
        }
      }
      return K;
    }
    // compute(x1, x2) { throw new Error('Not implemented'); }
    getParams() {
      return { ...this.params };
    }
    setParams(newParams) {
      Object.assign(this.params, newParams);
    }
    euclideanDistance(x1, x2) {
      let sum = 0;
      for (let i = 0; i < x1.length; i++) {
        sum += Math.pow(x1[i] - x2[i], 2);
      }
      return Math.sqrt(sum);
    }
    squaredEuclideanDistance(x1, x2) {
      let sum = 0;
      for (let i = 0; i < x1.length; i++) {
        sum += Math.pow(x1[i] - x2[i], 2);
      }
      return sum;
    }
  };

  // src/algorithms/generative/gaussian-processes/GaussianProcessRegressor.js
  var GaussianProcessRegressor = class {
    kernel;
    alpha;
    XTrain;
    yTrain;
    L;
    alphaVector;
    constructor(kernel, options = {}) {
      this.kernel = kernel;
      this.alpha = options.alpha || 1e-10;
    }
    fit(X, y) {
      this.XTrain = ensure2D(X);
      this.yTrain = [...y];
      const K = this.kernel.call(this.XTrain);
      for (let i = 0; i < K.rows; i++) {
        K.set(i, i, K.get(i, i) + this.alpha);
      }
      try {
        this.L = choleskyDecomposition(K);
      } catch (error) {
        throw new Error(`Failed to compute Cholesky decomposition: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
      this.alphaVector = this.solveCholesky(this.L, this.yTrain);
    }
    predict(X, returnStd = false) {
      if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
        throw new Error("Model must be fitted before prediction");
      }
      const XTest = ensure2D(X);
      const KStar = this.kernel.call(this.XTrain, XTest);
      const mean = new Array(XTest.rows);
      for (let i = 0; i < XTest.rows; i++) {
        mean[i] = 0;
        for (let j = 0; j < this.XTrain.rows; j++) {
          mean[i] += KStar.get(j, i) * this.alphaVector[j];
        }
      }
      const result = { mean };
      if (returnStd) {
        const std = this.computeStd(XTest, KStar);
        result.std = std;
      }
      return result;
    }
    sampleY(X, nSamples = 1) {
      if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
        throw new Error("Model must be fitted before sampling");
      }
      const XTest = ensure2D(X);
      const prediction = this.predict(X, true);
      if (!prediction.std) {
        throw new Error("Standard deviation computation failed");
      }
      const samples = [];
      for (let i = 0; i < nSamples; i++) {
        const sample = new Array(XTest.rows);
        for (let j = 0; j < XTest.rows; j++) {
          const mean = prediction.mean[j];
          const std = prediction.std[j];
          sample[j] = mean + std * this.sampleStandardNormal();
        }
        samples.push(sample);
      }
      return samples;
    }
    logMarginalLikelihood() {
      if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
        throw new Error("Model must be fitted before computing log marginal likelihood");
      }
      let logLikelihood = 0;
      for (let i = 0; i < this.yTrain.length; i++) {
        logLikelihood -= 0.5 * this.yTrain[i] * this.alphaVector[i];
      }
      for (let i = 0; i < this.L.rows; i++) {
        logLikelihood -= Math.log(this.L.get(i, i));
      }
      logLikelihood -= 0.5 * this.yTrain.length * Math.log(2 * Math.PI);
      return logLikelihood;
    }
    computeStd(XTest, KStar) {
      if (!this.L) {
        throw new Error("Cholesky decomposition not available");
      }
      const std = new Array(XTest.rows);
      for (let i = 0; i < XTest.rows; i++) {
        const kStarStar = this.kernel.compute(XTest.getRow(i), XTest.getRow(i));
        const kStarColumn = KStar.getColumn(i);
        const v = this.forwardSubstitution(this.L, kStarColumn);
        let vTv = 0;
        for (let j = 0; j < v.length; j++) {
          vTv += v[j] * v[j];
        }
        const variance = kStarStar - vTv;
        std[i] = Math.sqrt(Math.max(0, variance));
      }
      return std;
    }
    solveCholesky(L, y) {
      const z = this.forwardSubstitution(L, y);
      return this.backSubstitution(L, z);
    }
    forwardSubstitution(L, b) {
      const n = L.rows;
      const x = new Array(n);
      for (let i = 0; i < n; i++) {
        x[i] = b[i];
        for (let j = 0; j < i; j++) {
          x[i] -= L.get(i, j) * x[j];
        }
        x[i] /= L.get(i, i);
      }
      return x;
    }
    backSubstitution(L, b) {
      const n = L.rows;
      const x = new Array(n);
      for (let i = n - 1; i >= 0; i--) {
        x[i] = b[i];
        for (let j = i + 1; j < n; j++) {
          x[i] -= L.get(j, i) * x[j];
        }
        x[i] /= L.get(i, i);
      }
      return x;
    }
    sampleStandardNormal() {
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
  };

  // src/algorithms/generative/gaussian-processes/kernels/rbf.js
  var RBF = class extends Kernel {
    constructor(lengthScale = 1, variance = 1) {
      super({ length_scale: lengthScale, variance });
      this.lengthScale = lengthScale;
      this.variance = variance;
    }
    compute(x1, x2) {
      const distance = this.euclideanDistance(x1, x2);
      return this.variance * Math.exp(-0.5 * Math.pow(distance / this.lengthScale, 2));
    }
    getParams() {
      return {
        length_scale: this.lengthScale,
        variance: this.variance
      };
    }
  };

  // src/algorithms/generative/gaussian-processes/utils.js
  function sampleNormal(mean = 0, std = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
  }
  function sampleMultivariateNormal(mean, covariance) {
    const n = mean.length;
    const L = choleskyDecomposition(covariance);
    const z = Array.from({ length: n }, () => sampleNormal());
    const sample = new Array(n);
    for (let i = 0; i < n; i++) {
      sample[i] = mean[i];
      for (let j = 0; j <= i; j++) {
        sample[i] += L.get(i, j) * z[j];
      }
    }
    return sample;
  }

  // src/algorithms/utils/jmon-timing.js
  var DEFAULT_TIMING_CONFIG = {
    timeSignature: [4, 4],
    // 4/4 time
    ticksPerQuarterNote: 480,
    // Standard MIDI resolution
    beatsPerBar: 4
    // Derived from time signature
  };
  function offsetToBarsBeatsTicks(offsetInBeats, config = DEFAULT_TIMING_CONFIG) {
    const { timeSignature, ticksPerQuarterNote } = config;
    const [numerator, denominator] = timeSignature;
    const beatsPerBar = numerator * 4 / denominator;
    const bars = Math.floor(offsetInBeats / beatsPerBar);
    const remainingBeats = offsetInBeats % beatsPerBar;
    const beats = Math.floor(remainingBeats);
    const fractionalBeat = remainingBeats - beats;
    const ticks = Math.round(fractionalBeat * ticksPerQuarterNote);
    return `${bars}:${beats}:${ticks}`;
  }
  function barsBeatsTicksToOffset(barsBeatsTicks, config = DEFAULT_TIMING_CONFIG) {
    const { timeSignature, ticksPerQuarterNote } = config;
    const [numerator, denominator] = timeSignature;
    const parts = barsBeatsTicks.split(":");
    if (parts.length !== 3) {
      throw new Error(`Invalid bars:beats:ticks format: ${barsBeatsTicks}`);
    }
    const bars = parseInt(parts[0], 10);
    const beats = parseFloat(parts[1]);
    const ticks = parseInt(parts[2], 10);
    if (isNaN(bars) || isNaN(beats) || isNaN(ticks)) {
      throw new Error(`Invalid numeric values in bars:beats:ticks: ${barsBeatsTicks}`);
    }
    const beatsPerBar = numerator * 4 / denominator;
    const totalBeats = bars * beatsPerBar + beats + ticks / ticksPerQuarterNote;
    return totalBeats;
  }
  function sequenceToJMONTiming(sequence, config = DEFAULT_TIMING_CONFIG, keepNumericDuration = true) {
    return sequence.map((note) => {
      const jmonNote = { ...note };
      if (note.offset !== void 0) {
        jmonNote.time = note.offset;
        delete jmonNote.offset;
      }
      if (typeof note.time === "string" && note.time.includes(":")) {
        jmonNote.time = barsBeatsTicksToOffset(note.time, config);
      }
      if (typeof note.duration === "number" && !keepNumericDuration) {
        const duration = note.duration;
        if (duration === 1)
          jmonNote.duration = "4n";
        else if (duration === 0.5)
          jmonNote.duration = "8n";
        else if (duration === 0.25)
          jmonNote.duration = "16n";
        else if (duration === 2)
          jmonNote.duration = "2n";
        else if (duration === 4)
          jmonNote.duration = "1n";
      }
      return jmonNote;
    });
  }
  function notesToTrack(notes, options = {}) {
    const {
      label = "track",
      midiChannel = 0,
      synth = { type: "Synth" },
      timingConfig = DEFAULT_TIMING_CONFIG,
      keepNumericDuration = true
      // Default to numeric for MIDI consistency
    } = options;
    const jmonNotes = sequenceToJMONTiming(notes, timingConfig, keepNumericDuration);
    return {
      label,
      midiChannel,
      synth,
      notes: jmonNotes
    };
  }

  // src/algorithms/generative/gaussian-processes/Kernel.js
  var KernelGenerator = class {
    data;
    lengthScale;
    amplitude;
    noiseLevel;
    walkAround;
    timingConfig;
    isFitted;
    gpr;
    constructor(data = [], lengthScale = 1, amplitude = 1, noiseLevel = 0.1, walkAround = false, timingConfig = DEFAULT_TIMING_CONFIG) {
      this.data = [...data];
      this.lengthScale = lengthScale;
      this.amplitude = amplitude;
      this.noiseLevel = noiseLevel;
      this.walkAround = walkAround;
      this.timingConfig = timingConfig;
      this.isFitted = false;
      this.gpr = null;
    }
    generate(options = {}) {
      const length = options.length || 100;
      const nsamples = options.nsamples || 1;
      const seed = options.seed;
      const useStringTime = options.useStringTime || false;
      if (seed !== void 0) {
        Math.seedrandom = this.seededRandom(seed);
      }
      if (this.data.length > 0 && Array.isArray(this.data[0])) {
        return this.generateFitted(options);
      }
      return this.generateUnfitted(options);
    }
    /**
     * Generate from unfitted Gaussian Process
     */
    generateUnfitted(options = {}) {
      const length = options.length || 100;
      const nsamples = options.nsamples || 1;
      const lengthScale = options.lengthScale || this.lengthScale;
      const amplitude = options.amplitude || this.amplitude;
      const noiseLevel = options.noiseLevel || this.noiseLevel;
      const useStringTime = options.useStringTime || false;
      const samples = [];
      for (let sampleIdx = 0; sampleIdx < nsamples; sampleIdx++) {
        const X = Array.from({ length }, (_, i) => [i]);
        const XMatrix = new Matrix(X);
        const kernel = new RBF(lengthScale, amplitude);
        const K = kernel.call(XMatrix);
        for (let i = 0; i < K.rows; i++) {
          K.set(i, i, K.get(i, i) + noiseLevel);
        }
        let mean = new Array(length).fill(this.walkAround || 0);
        if (this.walkAround && typeof this.walkAround === "number") {
          mean = new Array(length).fill(this.walkAround);
        }
        const sample = sampleMultivariateNormal(mean, K);
        samples.push(sample);
      }
      return nsamples === 1 ? samples[0] : samples;
    }
    /**
     * Generate from fitted Gaussian Process using training data
     */
    generateFitted(options = {}) {
      const length = options.length || 100;
      const nsamples = options.nsamples || 1;
      const lengthScale = options.lengthScale || this.lengthScale;
      const amplitude = options.amplitude || this.amplitude;
      const X_train = this.data.map((point) => [point[0]]);
      const y_train = this.data.map((point) => point[1]);
      const kernel = new RBF(lengthScale, amplitude);
      this.gpr = new GaussianProcessRegressor(kernel);
      try {
        this.gpr.fit(X_train, y_train);
        this.isFitted = true;
      } catch (error) {
        throw new Error(`Failed to fit Gaussian Process: ${error.message}`);
      }
      const minTime = Math.min(...this.data.map((p) => p[0]));
      const maxTime = Math.max(...this.data.map((p) => p[0]));
      const timeStep = (maxTime - minTime) / (length - 1);
      const X_pred = Array.from({ length }, (_, i) => [minTime + i * timeStep]);
      const samples = this.gpr.sampleY(X_pred, nsamples);
      const timePoints = X_pred.map((x) => x[0]);
      if (nsamples === 1) {
        return [timePoints, samples[0]];
      } else {
        return [timePoints, samples];
      }
    }
    rbfKernel(x1, x2) {
      let distanceSquared = 0;
      for (let i = 0; i < x1.length; i++) {
        distanceSquared += Math.pow(x1[i] - x2[i], 2);
      }
      return this.amplitude * Math.exp(-distanceSquared / (2 * Math.pow(this.lengthScale, 2)));
    }
    setData(data) {
      this.data = [...data];
    }
    getData() {
      return [...this.data];
    }
    setLengthScale(lengthScale) {
      this.lengthScale = lengthScale;
    }
    setAmplitude(amplitude) {
      this.amplitude = amplitude;
    }
    setNoiseLevel(noiseLevel) {
      this.noiseLevel = noiseLevel;
    }
    /**
     * Convert GP samples to JMON notes
     * @param {Array|Array<Array>} samples - GP samples (single array or array of arrays)
     * @param {Array} durations - Duration sequence
     * @param {Array} timePoints - Time points (for fitted GP)
     * @param {Object} options - Conversion options
     * @returns {Array} JMON note objects
     */
    toJmonNotes(samples, durations = [1], timePoints = null, options = {}) {
      const {
        useStringTime = false,
        mapToScale = null,
        scaleRange = [60, 72],
        quantize = false
      } = options;
      const notes = [];
      let currentTime = 0;
      const sampleArray = Array.isArray(samples[0]) ? samples : [samples];
      const times = timePoints || Array.from({ length: sampleArray[0].length }, (_, i) => i);
      for (let i = 0; i < sampleArray[0].length; i++) {
        const duration = durations[i % durations.length];
        const timeValue = timePoints ? times[i] : currentTime;
        const pitchValues = sampleArray.map((sample) => {
          let value = sample[i];
          if (mapToScale) {
            const minVal = Math.min(...sample);
            const maxVal = Math.max(...sample);
            const range = maxVal - minVal || 1;
            const normalized = (value - minVal) / range;
            const scaleIndex = Math.floor(normalized * mapToScale.length);
            const clampedIndex = Math.max(0, Math.min(scaleIndex, mapToScale.length - 1));
            value = mapToScale[clampedIndex];
          } else {
            const minVal = Math.min(...sample);
            const maxVal = Math.max(...sample);
            const range = maxVal - minVal || 1;
            const normalized = (value - minVal) / range;
            value = scaleRange[0] + normalized * (scaleRange[1] - scaleRange[0]);
          }
          if (quantize) {
            value = Math.round(value);
          }
          return value;
        });
        const pitch = pitchValues.length === 1 ? pitchValues[0] : pitchValues;
        notes.push({
          pitch,
          duration,
          time: useStringTime ? offsetToBarsBeatsTicks(timeValue, this.timingConfig) : timeValue
        });
        if (!timePoints) {
          currentTime += duration;
        }
      }
      return notes;
    }
    /**
     * Generate JMON track directly from GP
     * @param {Object} options - Generation options
     * @param {Object} trackOptions - Track options
     * @returns {Object} JMON track
     */
    generateTrack(options = {}, trackOptions = {}) {
      const samples = this.generate(options);
      const durations = options.durations || [1];
      let notes;
      if (this.isFitted || this.data.length > 0 && Array.isArray(this.data[0])) {
        const [timePoints, sampleData] = samples;
        notes = this.toJmonNotes(sampleData, durations, timePoints, options);
      } else {
        notes = this.toJmonNotes(samples, durations, null, options);
      }
      return notesToTrack(notes, {
        label: "gaussian-process",
        midiChannel: 0,
        synth: { type: "Synth" },
        ...trackOptions
      });
    }
    /**
     * Simple seeded random number generator
     */
    seededRandom(seed) {
      return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    }
  };

  // src/algorithms/generative/cellular-automata/CellularAutomata.js
  var CellularAutomata = class {
    /**
     * @param {CellularAutomataOptions} [options={}] - Configuration options
     */
    constructor(options = {}) {
      this.width = options.width || 51;
      this.ruleNumber = options.ruleNumber || 30;
      this.initialState = options.initialState || this.generateRandomInitialState();
      this.state = [...this.initialState];
      this.rules = this.loadRules(this.ruleNumber);
      this.history = [];
    }
    /**
     * Generate cellular automaton evolution
     * @param {number} steps - Number of evolution steps
     * @returns {Matrix2D} Evolution history
     */
    generate(steps) {
      this.history = [];
      this.state = [...this.initialState];
      this.history.push([...this.state]);
      for (let step = 0; step < steps; step++) {
        this.updateState();
        this.history.push([...this.state]);
      }
      return this.history;
    }
    /**
     * Generate cellular automaton evolution with binary output
     * @param {number} steps - Number of evolution steps
     * @returns {Matrix2D} Binary evolution history
     */
    generate01(steps) {
      const result = this.generate(steps);
      return result.map((row) => row.map((cell) => cell > 0 ? 1 : 0));
    }
    /**
     * Load rules based on rule number
     * @param {number} ruleNumber - Rule number (0-255)
     * @returns {CellularAutomataRule} Rule mapping
     */
    loadRules(ruleNumber) {
      const binary = ruleNumber.toString(2).padStart(8, "0");
      const rules = {};
      const neighborhoods = ["111", "110", "101", "100", "011", "010", "001", "000"];
      for (let i = 0; i < 8; i++) {
        rules[neighborhoods[i]] = parseInt(binary[i], 10);
      }
      return rules;
    }
    /**
     * Update the current state based on rules
     */
    updateState() {
      const newState = new Array(this.width);
      for (let i = 0; i < this.width; i++) {
        const left = this.state[(i - 1 + this.width) % this.width];
        const center = this.state[i];
        const right = this.state[(i + 1) % this.width];
        const neighborhood = `${left}${center}${right}`;
        newState[i] = this.rules[neighborhood] || 0;
      }
      this.state = newState;
    }
    /**
     * Validate strips matrix format
     * @param {Matrix2D} strips - Matrix to validate
     * @returns {boolean} Whether the matrix is valid
     */
    validateStrips(strips) {
      if (!Array.isArray(strips) || strips.length === 0) {
        return false;
      }
      const width = strips[0]?.length;
      if (!width)
        return false;
      return strips.every(
        (strip) => Array.isArray(strip) && strip.length === width && strip.every((cell) => typeof cell === "number" && (cell === 0 || cell === 1))
      );
    }
    /**
     * Validate values array
     * @param {number[]} values - Values to validate
     * @returns {boolean} Whether the values are valid
     */
    validateValues(values) {
      return Array.isArray(values) && values.length === this.width && values.every((val) => typeof val === "number" && (val === 0 || val === 1));
    }
    /**
     * Set initial state
     * @param {number[]} state - New initial state
     */
    setInitialState(state) {
      if (this.validateValues(state)) {
        this.initialState = [...state];
        this.state = [...state];
      } else {
        throw new Error("Invalid initial state");
      }
    }
    /**
     * Set rule number
     * @param {number} ruleNumber - New rule number (0-255)
     */
    setRuleNumber(ruleNumber) {
      if (ruleNumber >= 0 && ruleNumber <= 255) {
        this.ruleNumber = ruleNumber;
        this.rules = this.loadRules(ruleNumber);
      } else {
        throw new Error("Rule number must be between 0 and 255");
      }
    }
    /**
     * Get evolution history
     * @returns {Matrix2D} Copy of evolution history
     */
    getHistory() {
      return this.history.map((row) => [...row]);
    }
    /**
     * Get current state
     * @returns {number[]} Copy of current state
     */
    getCurrentState() {
      return [...this.state];
    }
    /**
     * Generate random initial state with single center cell
     * @returns {number[]} Initial state array
     */
    generateRandomInitialState() {
      const state = new Array(this.width).fill(0);
      state[Math.floor(this.width / 2)] = 1;
      return state;
    }
    /**
     * Generate completely random state
     * @returns {number[]} Random state array
     */
    generateRandomState() {
      return Array.from({ length: this.width }, () => Math.random() > 0.5 ? 1 : 0);
    }
    /**
     * Get plot data
     * @returns {Object} Plot data with dimensions
     */
    plot() {
      return {
        data: this.getHistory(),
        width: this.width,
        height: this.history.length
      };
    }
    /**
     * Create Observable Plot visualization of CA evolution
     * @param {Object} [options] - Plot options
     * @returns {Object} Observable Plot spec
     */
    async plotEvolution(options) {
      const CAVisualizerModule = await Promise.resolve().then(() => (init_CAVisualizer(), CAVisualizer_exports));
      return CAVisualizerModule.CAVisualizer.plotEvolution(this.getHistory(), options);
    }
    /**
     * Create Observable Plot visualization of current generation
     * @param {Object} [options] - Plot options
     * @returns {Object} Observable Plot spec
     */
    async plotGeneration(options) {
      const CAVisualizerModule = await Promise.resolve().then(() => (init_CAVisualizer(), CAVisualizer_exports));
      return CAVisualizerModule.CAVisualizer.plotGeneration(this.getCurrentState(), options);
    }
    /**
     * Create Observable Plot density visualization
     * @param {Object} [options] - Plot options
     * @returns {Object} Observable Plot spec
     */
    async plotDensity(options) {
      const CAVisualizerModule = await Promise.resolve().then(() => (init_CAVisualizer(), CAVisualizer_exports));
      return CAVisualizerModule.CAVisualizer.plotDensity(this.getHistory(), options);
    }
  };

  // src/algorithms/generative/loops/Loop.js
  var Loop = class _Loop {
    /**
     * Initializes a Loop object.
     * 
     * @param {Object|Array} loops - Dictionary or array of JMON tracks. Each track has notes: [{pitch, duration, time, velocity}, ...]
     * @param {number} measureLength - The length of a measure in beats. Defaults to 4.
     * @param {boolean} insertRests - Whether to insert rests. Defaults to true.
     */
    constructor(loops, measureLength = 4, insertRests = true) {
      if (!loops) {
        throw new Error("Loops parameter is required");
      }
      if (typeof measureLength !== "number" || measureLength <= 0) {
        throw new Error("measureLength must be a positive number");
      }
      if (typeof insertRests !== "boolean") {
        throw new Error("insertRests must be a boolean");
      }
      this.measureLength = measureLength;
      if (Array.isArray(loops)) {
        if (loops.length === 0) {
          throw new Error("Loops array cannot be empty");
        }
        const loopObj = {};
        loops.forEach((loop, i) => {
          const label = loop?.label || `Loop ${i + 1}`;
          loopObj[label] = loop;
        });
        loops = loopObj;
      }
      if (typeof loops !== "object" || Object.keys(loops).length === 0) {
        throw new Error("Loops must be a non-empty object or array");
      }
      this.loops = {};
      for (const [name, loopData] of Object.entries(loops)) {
        if (!loopData) {
          throw new Error(`Loop data for "${name}" is null or undefined`);
        }
        const notes = Array.isArray(loopData) ? loopData : loopData.notes || [];
        if (!Array.isArray(notes)) {
          throw new Error(`Notes for loop "${name}" must be an array`);
        }
        const validatedNotes = notes.map((note, index) => {
          if (!note || typeof note !== "object") {
            throw new Error(`Note ${index} in loop "${name}" must be an object`);
          }
          if (note.pitch !== null && (typeof note.pitch !== "number" || note.pitch < 0 || note.pitch > 127)) {
            throw new Error(`Note ${index} in loop "${name}" has invalid pitch: ${note.pitch}`);
          }
          if (typeof note.time !== "number" || note.time < 0) {
            throw new Error(`Note ${index} in loop "${name}" has invalid time: ${note.time}`);
          }
          if (typeof note.duration !== "number" || note.duration <= 0) {
            throw new Error(`Note ${index} in loop "${name}" has invalid duration: ${note.duration}`);
          }
          return {
            pitch: note.pitch,
            time: note.time,
            duration: note.duration,
            velocity: typeof note.velocity === "number" ? Math.max(0, Math.min(1, note.velocity)) : 0.8
          };
        });
        this.loops[name] = {
          label: loopData.label || name,
          notes: insertRests ? this.fillGapsWithRests(validatedNotes) : validatedNotes,
          synth: loopData.synth || {
            type: "Synth",
            options: {
              oscillator: { type: "sine" },
              envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
            }
          }
        };
      }
    }
    /**
     * Fill gaps between notes with rests (JMON format)
     */
    fillGapsWithRests(notes) {
      if (notes.length === 0)
        return notes;
      const result = [];
      let currentTime = 0;
      const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
      for (const note of sortedNotes) {
        if (note.time > currentTime) {
          result.push({
            pitch: null,
            // null indicates rest
            duration: note.time - currentTime,
            time: currentTime,
            velocity: 0
          });
        }
        result.push({
          pitch: note.pitch,
          duration: note.duration,
          time: note.time,
          velocity: note.velocity || 0.8
        });
        currentTime = note.time + note.duration;
      }
      return result;
    }
    /**
     * Create a loop from a single JMON track
     */
    static fromTrack(track, measureLength = 4) {
      const notes = track.notes || [];
      if (notes.length === 0) {
        throw new Error("Track must have notes to create loop");
      }
      return new _Loop({ [track.label || "Track"]: track }, measureLength);
    }
    /**
     * Create loop from Euclidean rhythm (JMON format)
     */
    static euclidean(beats, pulses, pitches = [60], label = null) {
      if (typeof beats !== "number" || beats <= 0 || !Number.isInteger(beats)) {
        throw new Error("beats must be a positive integer");
      }
      if (typeof pulses !== "number" || pulses < 0 || !Number.isInteger(pulses)) {
        throw new Error("pulses must be a non-negative integer");
      }
      if (pulses > beats) {
        throw new Error("pulses cannot be greater than beats");
      }
      if (!Array.isArray(pitches) || pitches.length === 0) {
        throw new Error("pitches must be a non-empty array");
      }
      const pattern = this.generateEuclideanRhythm(beats, pulses);
      const notes = [];
      const beatDuration = 1;
      pattern.forEach((active, index) => {
        if (active) {
          const time = index * beatDuration;
          const pitch = pitches[index % pitches.length];
          notes.push({
            pitch,
            duration: beatDuration * 0.8,
            time,
            velocity: 0.8
          });
        }
      });
      const track = {
        label: label || `Euclidean ${pulses}/${beats}`,
        notes,
        synth: {
          type: "Synth",
          options: {
            oscillator: { type: "sine" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
          }
        }
      };
      return new _Loop({ [track.label]: track }, beats);
    }
    /**
     * Generate Euclidean rhythm pattern using Bjorklund algorithm
     * This creates the most even distribution of pulses across beats
     */
    static generateEuclideanRhythm(beats, pulses) {
      if (pulses === 0) {
        return Array(beats).fill(false);
      }
      if (pulses >= beats) {
        return Array(beats).fill(true);
      }
      const pattern = [];
      let groups = [
        { pattern: [1], count: pulses },
        // Groups with pulses
        { pattern: [0], count: beats - pulses }
        // Groups without pulses
      ];
      while (groups.length > 1) {
        const [first, second] = groups;
        if (first.count <= second.count) {
          const newCount = first.count;
          const remaining = second.count - first.count;
          groups = [
            { pattern: [...second.pattern, ...first.pattern], count: newCount }
          ];
          if (remaining > 0) {
            groups.push({ pattern: second.pattern, count: remaining });
          }
        } else {
          const newCount = second.count;
          const remaining = first.count - second.count;
          groups = [
            { pattern: [...first.pattern, ...second.pattern], count: newCount }
          ];
          if (remaining > 0) {
            groups.push({ pattern: first.pattern, count: remaining });
          }
        }
      }
      const finalGroup = groups[0];
      const result = [];
      for (let i = 0; i < finalGroup.count; i++) {
        result.push(...finalGroup.pattern);
      }
      return result.map((x) => x === 1);
    }
    /**
     * Get loops as JMON tracks (already in JMON format)
     */
    toJMonSequences() {
      return Object.values(this.loops);
    }
    /**
     * Simple plotting method matching Python implementation
     */
    async plot(pulse = 1 / 4, colors = null, options = {}) {
      const { LoopVisualizer: LoopVisualizer2 } = await Promise.resolve().then(() => (init_LoopVisualizer(), LoopVisualizer_exports));
      return LoopVisualizer2.plotLoops(
        this.loops,
        this.measureLength,
        pulse,
        colors,
        options
      );
    }
  };

  // src/algorithms/analysis/MusicalIndex.js
  var MusicalIndex = class {
    /**
     * Create a musical index analyzer for a sequence
     * @param {Array} sequence - Array of musical values (pitches, durations, etc.)
     */
    constructor(sequence) {
      this.sequence = sequence.filter((val) => val !== null && val !== void 0);
      this.originalSequence = sequence;
    }
    /**
     * Calculate Gini coefficient (measure of inequality/diversity)
     * 0 = perfect equality, 1 = maximum inequality
     * @returns {number} Gini coefficient
     */
    gini() {
      if (this.sequence.length === 0)
        return 0;
      const sorted = [...this.sequence].sort((a, b) => a - b);
      const n = sorted.length;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += (2 * (i + 1) - n - 1) * sorted[i];
      }
      const totalSum = sorted.reduce((acc, val) => acc + val, 0);
      return totalSum === 0 ? 0 : sum / (n * totalSum);
    }
    /**
     * Calculate balance (measure of how evenly distributed values are around the mean)
     * Lower values indicate better balance around the center
     * @returns {number} Balance metric
     */
    balance() {
      if (this.sequence.length === 0)
        return 0;
      const mean = this.sequence.reduce((sum, val) => sum + val, 0) / this.sequence.length;
      const variance = this.sequence.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.sequence.length;
      return mean === 0 ? 0 : Math.sqrt(variance) / Math.abs(mean);
    }
    /**
     * Calculate motif strength (measure of repetitive patterns)
     * Higher values indicate stronger motif presence
     * @param {number} maxMotifLength - Maximum motif length to consider
     * @returns {number} Motif strength
     */
    motif(maxMotifLength = 4) {
      if (this.sequence.length < 2)
        return 0;
      const motifCounts = /* @__PURE__ */ new Map();
      let totalMotifs = 0;
      for (let length = 2; length <= Math.min(maxMotifLength, this.sequence.length); length++) {
        for (let i = 0; i <= this.sequence.length - length; i++) {
          const motif = this.sequence.slice(i, i + length).join(",");
          motifCounts.set(motif, (motifCounts.get(motif) || 0) + 1);
          totalMotifs++;
        }
      }
      let motifStrength = 0;
      for (const count of motifCounts.values()) {
        if (count > 1) {
          motifStrength += count * count;
        }
      }
      return totalMotifs === 0 ? 0 : motifStrength / totalMotifs;
    }
    /**
     * Calculate dissonance relative to a musical scale
     * 0 = all notes in scale, higher values = more dissonance
     * @param {Array} scale - Array of pitches considered consonant
     * @returns {number} Dissonance level
     */
    dissonance(scale) {
      if (!scale || scale.length === 0 || this.sequence.length === 0)
        return 0;
      const scaleClasses = new Set(scale.map((pitch) => pitch % 12));
      let dissonantNotes = 0;
      for (const pitch of this.sequence) {
        if (pitch !== null && pitch !== void 0) {
          const pitchClass = pitch % 12;
          if (!scaleClasses.has(pitchClass)) {
            dissonantNotes++;
          }
        }
      }
      return dissonantNotes / this.sequence.length;
    }
    /**
     * Calculate rhythmic fitness (how well durations fit within measure boundaries)
     * 1 = perfect fit, lower values = poor rhythmic alignment
     * @param {number} measureLength - Length of a measure in beats
     * @returns {number} Rhythmic fitness
     */
    rhythmic(measureLength = 4) {
      if (this.sequence.length === 0)
        return 0;
      let currentBeat = 0;
      let rhythmicErrors = 0;
      const totalDuration = this.sequence.reduce(
        (sum, duration) => sum + duration,
        0
      );
      for (const duration of this.sequence) {
        const nextBeat = currentBeat + duration;
        const currentMeasure = Math.floor(currentBeat / measureLength);
        const nextMeasure = Math.floor(nextBeat / measureLength);
        if (currentMeasure !== nextMeasure) {
          const remainingInMeasure = measureLength - currentBeat % measureLength;
          if (remainingInMeasure < duration && remainingInMeasure > 0) {
            rhythmicErrors += Math.min(
              remainingInMeasure,
              duration - remainingInMeasure
            );
          }
        }
        currentBeat = nextBeat;
      }
      return totalDuration === 0 ? 0 : 1 - rhythmicErrors / totalDuration;
    }
    /**
     * Calculate proportion of rests in the sequence
     * @returns {number} Proportion of rests (0-1)
     */
    restProportion() {
      if (this.originalSequence.length === 0)
        return 0;
      const restCount = this.originalSequence.filter((val) => val === null || val === void 0).length;
      return restCount / this.originalSequence.length;
    }
    /**
     * Calculate all metrics at once for efficiency
     * @param {Array} scale - Musical scale for dissonance calculation
     * @param {number} measureLength - Measure length for rhythmic analysis
     * @returns {Object} All calculated metrics
     */
    calculateAll(scale = null, measureLength = 4) {
      return {
        gini: this.gini(),
        balance: this.balance(),
        motif: this.motif(),
        dissonance: scale ? this.dissonance(scale) : 0,
        rhythmic: this.rhythmic(measureLength),
        rest: this.restProportion()
      };
    }
    /**
     * Calculate statistical properties of the sequence
     * @returns {Object} Statistical properties
     */
    getStats() {
      if (this.sequence.length === 0) {
        return { mean: 0, std: 0, min: 0, max: 0, range: 0 };
      }
      const mean = this.sequence.reduce((sum, val) => sum + val, 0) / this.sequence.length;
      const variance = this.sequence.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.sequence.length;
      const std = Math.sqrt(variance);
      const min = Math.min(...this.sequence);
      const max = Math.max(...this.sequence);
      return {
        mean,
        std,
        min,
        max,
        range: max - min
      };
    }
    /**
     * Compare two sequences and return similarity score
     * @param {MusicalIndex} other - Another MusicalIndex to compare with
     * @param {Array} scale - Scale for dissonance comparison
     * @param {number} measureLength - Measure length for rhythmic comparison
     * @returns {number} Similarity score (0-1, higher is more similar)
     */
    similarity(other, scale = null, measureLength = 4) {
      const metrics1 = this.calculateAll(scale, measureLength);
      const metrics2 = other.calculateAll(scale, measureLength);
      let totalSimilarity = 0;
      let count = 0;
      for (const [key, value1] of Object.entries(metrics1)) {
        const value2 = metrics2[key];
        if (typeof value1 === "number" && typeof value2 === "number") {
          const maxVal = Math.max(Math.abs(value1), Math.abs(value2), 1);
          const similarity = 1 - Math.abs(value1 - value2) / maxVal;
          totalSimilarity += similarity;
          count++;
        }
      }
      return count === 0 ? 0 : totalSimilarity / count;
    }
  };

  // src/algorithms/generative/genetic/Darwin.js
  var Darwin = class {
    /**
     * Initialize the Darwin genetic algorithm
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
      const {
        initialPhrases = [],
        mutationRate = 0.05,
        populationSize = 50,
        mutationProbabilities = null,
        scale = null,
        measureLength = 4,
        timeResolution = [0.125, 4],
        weights = null,
        targets = null,
        seed = null
      } = config;
      this.initialPhrases = initialPhrases;
      this.mutationRate = mutationRate;
      this.populationSize = populationSize;
      this.scale = scale;
      this.measureLength = measureLength;
      this.timeResolution = timeResolution;
      if (seed !== null) {
        this.seed = seed;
        this.randomState = this.createSeededRandom(seed);
      } else {
        this.randomState = Math;
      }
      const allDurations = [0.125, 0.25, 0.5, 1, 2, 3, 4, 8];
      this.possibleDurations = allDurations.filter(
        (d) => d >= timeResolution[0] && d <= Math.min(timeResolution[1], measureLength)
      );
      this.mutationProbabilities = mutationProbabilities || {
        pitch: () => {
          return Math.max(0, Math.min(127, Math.floor(this.gaussianRandom(60, 5))));
        },
        duration: () => {
          const weights2 = this.possibleDurations.map((_, i) => Math.pow(2, -i));
          return this.weightedChoice(this.possibleDurations, weights2);
        },
        rest: () => {
          return this.randomState.random() < 0.02 ? null : 1;
        }
      };
      this.weights = weights || {
        gini: [1, 1, 0],
        // [pitch, duration, offset]
        balance: [1, 1, 0],
        motif: [10, 1, 0],
        dissonance: [1, 0, 0],
        rhythmic: [0, 10, 0],
        rest: [1, 0, 0]
      };
      this.targets = targets || {
        gini: [0.05, 0.5, 0],
        balance: [0.1, 0.1, 0],
        motif: [1, 1, 0],
        dissonance: [0, 0, 0],
        rhythmic: [0, 1, 0],
        rest: [0, 0, 0]
      };
      this.population = this.initializePopulation();
      this.bestIndividuals = [];
      this.bestScores = [];
      this.generationCount = 0;
    }
    /**
     * Create a seeded random number generator
     * @param {number} seed - Random seed
     * @returns {Object} Random number generator with seeded methods
     */
    createSeededRandom(seed) {
      let currentSeed = seed;
      const random = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
      return {
        random,
        choice: (array) => array[Math.floor(random() * array.length)],
        sample: (array, n) => {
          const result = [];
          const shuffled = [...array].sort(() => random() - 0.5);
          return shuffled.slice(0, n);
        }
      };
    }
    /**
     * Generate Gaussian random number using Box-Muller transform
     * @param {number} mean - Mean of distribution
     * @param {number} stdDev - Standard deviation
     * @returns {number} Gaussian random number
     */
    gaussianRandom(mean = 0, stdDev = 1) {
      if (this.gaussianSpare !== void 0) {
        const spare = this.gaussianSpare;
        this.gaussianSpare = void 0;
        return mean + stdDev * spare;
      }
      const u1 = this.randomState.random();
      const u2 = this.randomState.random();
      const mag = stdDev * Math.sqrt(-2 * Math.log(u1));
      this.gaussianSpare = mag * Math.cos(2 * Math.PI * u2);
      return mean + mag * Math.sin(2 * Math.PI * u2);
    }
    /**
     * Choose random element from array with weights
     * @param {Array} choices - Array of choices
     * @param {Array} weights - Array of weights
     * @returns {*} Weighted random choice
     */
    weightedChoice(choices, weights) {
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = this.randomState.random() * totalWeight;
      for (let i = 0; i < choices.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return choices[i];
        }
      }
      return choices[choices.length - 1];
    }
    /**
     * Initialize population by mutating initial phrases
     * @returns {Array} Initial population
     */
    initializePopulation() {
      const population = [];
      const phrasesPerInitial = Math.floor(this.populationSize / this.initialPhrases.length);
      for (const phrase of this.initialPhrases) {
        for (let i = 0; i < phrasesPerInitial; i++) {
          population.push(this.mutate(phrase, 0));
        }
      }
      while (population.length < this.populationSize) {
        const randomPhrase = this.randomState.choice(this.initialPhrases);
        population.push(this.mutate(randomPhrase, 0));
      }
      return population;
    }
    /**
     * Calculate fitness components for a musical phrase
     * @param {Array} phrase - Musical phrase as [pitch, duration, offset] tuples
     * @returns {Object} Fitness components
     */
    calculateFitnessComponents(phrase) {
      if (phrase.length === 0)
        return {};
      const pitches = phrase.map((note) => note[0]);
      const durations = phrase.map((note) => note[1]);
      const offsets = phrase.map((note) => note[2]);
      const fitnessComponents = {};
      if (pitches.length > 0) {
        const pitchIndex = new MusicalIndex(pitches);
        fitnessComponents.gini_pitch = pitchIndex.gini();
        fitnessComponents.balance_pitch = pitchIndex.balance();
        fitnessComponents.motif_pitch = pitchIndex.motif();
        if (this.scale) {
          fitnessComponents.dissonance_pitch = pitchIndex.dissonance(this.scale);
        }
      }
      if (durations.length > 0) {
        const durationIndex = new MusicalIndex(durations);
        fitnessComponents.gini_duration = durationIndex.gini();
        fitnessComponents.balance_duration = durationIndex.balance();
        fitnessComponents.motif_duration = durationIndex.motif();
        fitnessComponents.rhythmic = durationIndex.rhythmic(this.measureLength);
      }
      if (offsets.length > 0) {
        const offsetIndex = new MusicalIndex(offsets);
        fitnessComponents.gini_offset = offsetIndex.gini();
        fitnessComponents.balance_offset = offsetIndex.balance();
        fitnessComponents.motif_offset = offsetIndex.motif();
      }
      const restProportion = pitches.filter((p) => p === null || p === void 0).length / pitches.length;
      fitnessComponents.rest = restProportion;
      return fitnessComponents;
    }
    /**
     * Calculate fitness score for a musical phrase
     * @param {Array} phrase - Musical phrase
     * @returns {number} Fitness score
     */
    fitness(phrase) {
      const components = this.calculateFitnessComponents(phrase);
      let fitnessScore = 0;
      for (const [metric, targets] of Object.entries(this.targets)) {
        const weights = this.weights[metric];
        for (let i = 0; i < 3; i++) {
          const componentKey = i === 0 ? `${metric}_pitch` : i === 1 ? `${metric}_duration` : `${metric}_offset`;
          const actualValue = components[componentKey] || 0;
          const targetValue = targets[i];
          const weight = weights[i];
          if (weight > 0 && targetValue !== void 0) {
            const maxVal = Math.max(Math.abs(targetValue), 1);
            const similarity = 1 - Math.abs(actualValue - targetValue) / maxVal;
            fitnessScore += Math.max(0, similarity) * weight;
          }
        }
      }
      if (this.weights.rest[0] > 0) {
        const actualRest = components.rest || 0;
        const targetRest = this.targets.rest[0];
        const similarity = 1 - Math.abs(actualRest - targetRest) / Math.max(targetRest, 1);
        fitnessScore += Math.max(0, similarity) * this.weights.rest[0];
      }
      return fitnessScore;
    }
    /**
     * Mutate a musical phrase
     * @param {Array} phrase - Original phrase
     * @param {number} rate - Mutation rate (null to use default)
     * @returns {Array} Mutated phrase
     */
    mutate(phrase, rate = null) {
      if (rate === null)
        rate = this.mutationRate;
      const newPhrase = [];
      let totalOffset = 0;
      for (const note of phrase) {
        let [pitch, duration, offset] = note;
        if (this.randomState.random() < rate) {
          pitch = this.mutationProbabilities.pitch();
        }
        if (this.randomState.random() < rate) {
          duration = this.mutationProbabilities.duration();
        }
        if (this.randomState.random() < rate) {
          const restResult = this.mutationProbabilities.rest();
          if (restResult === null) {
            pitch = null;
          }
        }
        const newOffset = totalOffset;
        totalOffset += duration;
        newPhrase.push([pitch, duration, newOffset]);
      }
      return newPhrase;
    }
    /**
     * Select top performers from population
     * @param {number} k - Number of individuals to select
     * @returns {Array} Selected phrases
     */
    select(k = 25) {
      const fitnessScores = this.population.map((phrase) => ({
        phrase,
        fitness: this.fitness(phrase)
      }));
      fitnessScores.sort((a, b) => b.fitness - a.fitness);
      return fitnessScores.slice(0, k).map((item) => item.phrase);
    }
    /**
     * Crossover (breed) two parent phrases
     * @param {Array} parent1 - First parent phrase
     * @param {Array} parent2 - Second parent phrase
     * @returns {Array} Child phrase
     */
    crossover(parent1, parent2) {
      if (parent1.length === 0 || parent2.length === 0) {
        return parent1.length > 0 ? [...parent1] : [...parent2];
      }
      const minLength = Math.min(parent1.length, parent2.length);
      const cut1 = Math.floor(this.randomState.random() * minLength);
      const cut2 = Math.floor(this.randomState.random() * minLength);
      const [start, end] = [Math.min(cut1, cut2), Math.max(cut1, cut2)];
      const child = [];
      for (let i = 0; i < start; i++) {
        if (i < parent1.length) {
          child.push([...parent1[i]]);
        }
      }
      for (let i = start; i < end; i++) {
        if (i < parent2.length) {
          child.push([...parent2[i]]);
        }
      }
      for (let i = end; i < Math.max(parent1.length, parent2.length); i++) {
        if (i < parent1.length) {
          child.push([...parent1[i]]);
        } else if (i < parent2.length) {
          child.push([...parent2[i]]);
        }
      }
      let totalOffset = 0;
      for (let i = 0; i < child.length; i++) {
        child[i][2] = totalOffset;
        totalOffset += child[i][1];
      }
      return child;
    }
    /**
     * Evolve the population for one generation
     * @param {number} k - Number of parents to select
     * @param {number} restRate - Rate for introducing rests (unused, kept for compatibility)
     * @returns {Object} Evolution statistics
     */
    evolve(k = 25) {
      const selectedParents = this.select(k);
      const bestFitness = this.fitness(selectedParents[0]);
      this.bestIndividuals.push([...selectedParents[0]]);
      this.bestScores.push(bestFitness);
      const newPopulation = [];
      while (newPopulation.length < this.populationSize) {
        const parent1 = this.randomState.choice(selectedParents);
        const parent2 = this.randomState.choice(selectedParents);
        const child = this.crossover([...parent1], [...parent2]);
        const mutatedChild = this.mutate(child);
        newPopulation.push(mutatedChild);
      }
      this.population = newPopulation;
      this.generationCount++;
      return {
        generation: this.generationCount,
        bestFitness,
        averageFitness: selectedParents.reduce((sum, phrase) => sum + this.fitness(phrase), 0) / selectedParents.length,
        populationSize: this.populationSize
      };
    }
    /**
     * Evolve for multiple generations
     * @param {number} generations - Number of generations to evolve
     * @param {number} k - Number of parents per generation
     * @param {Function} callback - Optional callback for progress updates
     * @returns {Array} Array of evolution statistics
     */
    evolveGenerations(generations, k = 25, callback = null) {
      const stats = [];
      for (let i = 0; i < generations; i++) {
        const generationStats = this.evolve(k);
        stats.push(generationStats);
        if (callback) {
          callback(generationStats, i, generations);
        }
      }
      return stats;
    }
    /**
     * Get the current best individual
     * @returns {Array} Best musical phrase
     */
    getBestIndividual() {
      return this.bestIndividuals.length > 0 ? [...this.bestIndividuals[this.bestIndividuals.length - 1]] : null;
    }
    /**
     * Get evolution history
     * @returns {Object} Evolution history with individuals and scores
     */
    getEvolutionHistory() {
      return {
        individuals: this.bestIndividuals.map((ind) => [...ind]),
        scores: [...this.bestScores],
        generations: this.generationCount
      };
    }
    /**
     * Reset the evolution state
     */
    reset() {
      this.population = this.initializePopulation();
      this.bestIndividuals = [];
      this.bestScores = [];
      this.generationCount = 0;
    }
    /**
     * Get population statistics
     * @returns {Object} Population statistics
     */
    getPopulationStats() {
      const fitnessValues = this.population.map((phrase) => this.fitness(phrase));
      const mean = fitnessValues.reduce((sum, f) => sum + f, 0) / fitnessValues.length;
      const variance = fitnessValues.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / fitnessValues.length;
      return {
        populationSize: this.population.length,
        meanFitness: mean,
        standardDeviation: Math.sqrt(variance),
        minFitness: Math.min(...fitnessValues),
        maxFitness: Math.max(...fitnessValues),
        generation: this.generationCount
      };
    }
  };

  // src/algorithms/generative/walks/RandomWalk.js
  var RandomWalk = class {
    options;
    walkers;
    history;
    constructor(options = {}) {
      this.options = {
        length: options.length || 100,
        dimensions: options.dimensions || 1,
        stepSize: options.stepSize || 1,
        bounds: options.bounds || [-100, 100],
        branchProbability: options.branchProbability || 0.05,
        mergeProbability: options.mergeProbability || 0.02,
        attractorStrength: options.attractorStrength || 0,
        attractorPosition: options.attractorPosition || Array(options.dimensions || 1).fill(0)
      };
      this.walkers = [];
      this.history = [];
    }
    /**
     * Generate random walk sequence
     */
    generate(startPosition) {
      this.initialize(startPosition);
      this.history = [];
      for (let step = 0; step < this.options.length; step++) {
        this.updateWalkers();
        this.recordState();
        this.handleBranching();
        this.handleMerging();
      }
      return this.history;
    }
    /**
     * Initialize walker(s)
     */
    initialize(startPosition) {
      const initialPosition = startPosition || Array(this.options.dimensions).fill(0);
      this.walkers = [{
        position: [...initialPosition],
        velocity: Array(this.options.dimensions).fill(0),
        branches: [],
        age: 0,
        active: true
      }];
    }
    /**
     * Update all active walkers
     */
    updateWalkers() {
      for (const walker of this.walkers) {
        if (!walker.active)
          continue;
        for (let dim = 0; dim < this.options.dimensions; dim++) {
          const randomStep = (Math.random() - 0.5) * 2 * this.options.stepSize;
          let attractorForce = 0;
          if (this.options.attractorStrength > 0) {
            const distance = walker.position[dim] - this.options.attractorPosition[dim];
            attractorForce = -this.options.attractorStrength * distance;
          }
          walker.velocity[dim] = walker.velocity[dim] * 0.9 + randomStep + attractorForce;
          walker.position[dim] += walker.velocity[dim];
          if (walker.position[dim] < this.options.bounds[0]) {
            walker.position[dim] = this.options.bounds[0];
            walker.velocity[dim] *= -0.5;
          } else if (walker.position[dim] > this.options.bounds[1]) {
            walker.position[dim] = this.options.bounds[1];
            walker.velocity[dim] *= -0.5;
          }
        }
        walker.age++;
      }
    }
    /**
     * Record current state of all walkers
     */
    recordState() {
      const activeWalkers = this.walkers.filter((w) => w.active);
      if (activeWalkers.length > 0) {
        const avgPosition = Array(this.options.dimensions).fill(0);
        for (const walker of activeWalkers) {
          for (let dim = 0; dim < this.options.dimensions; dim++) {
            avgPosition[dim] += walker.position[dim];
          }
        }
        for (let dim = 0; dim < this.options.dimensions; dim++) {
          avgPosition[dim] /= activeWalkers.length;
        }
        this.history.push([...avgPosition]);
      }
    }
    /**
     * Handle branching (walker splitting)
     */
    handleBranching() {
      const newBranches = [];
      for (const walker of this.walkers) {
        if (!walker.active)
          continue;
        if (Math.random() < this.options.branchProbability) {
          const branch = {
            position: [...walker.position],
            velocity: walker.velocity.map((v) => v + (Math.random() - 0.5) * this.options.stepSize),
            branches: [],
            age: 0,
            active: true
          };
          newBranches.push(branch);
          walker.branches.push(branch);
        }
      }
      this.walkers.push(...newBranches);
    }
    /**
     * Handle merging (walker combining)
     */
    handleMerging() {
      if (this.walkers.length <= 1)
        return;
      const activeWalkers = this.walkers.filter((w) => w.active);
      const mergeThreshold = this.options.stepSize * 2;
      for (let i = 0; i < activeWalkers.length; i++) {
        for (let j = i + 1; j < activeWalkers.length; j++) {
          if (Math.random() < this.options.mergeProbability) {
            const distance = this.calculateDistance(activeWalkers[i].position, activeWalkers[j].position);
            if (distance < mergeThreshold) {
              for (let dim = 0; dim < this.options.dimensions; dim++) {
                activeWalkers[i].position[dim] = (activeWalkers[i].position[dim] + activeWalkers[j].position[dim]) / 2;
                activeWalkers[i].velocity[dim] = (activeWalkers[i].velocity[dim] + activeWalkers[j].velocity[dim]) / 2;
              }
              activeWalkers[j].active = false;
            }
          }
        }
      }
      this.walkers = this.walkers.filter((w) => w.active);
    }
    /**
     * Calculate Euclidean distance between two positions
     */
    calculateDistance(pos1, pos2) {
      let sum = 0;
      for (let i = 0; i < pos1.length; i++) {
        sum += Math.pow(pos1[i] - pos2[i], 2);
      }
      return Math.sqrt(sum);
    }
    /**
     * Get 1D projection of multi-dimensional walk
     */
    getProjection(dimension = 0) {
      return this.history.map((state) => state[dimension] || 0);
    }
    /**
     * Map walk to musical scale
     */
    mapToScale(dimension = 0, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
      const projection = this.getProjection(dimension);
      if (projection.length === 0)
        return [];
      const minVal = Math.min(...projection);
      const maxVal = Math.max(...projection);
      const range = maxVal - minVal || 1;
      return projection.map((value) => {
        const normalized = (value - minVal) / range;
        const scaleIndex = Math.floor(normalized * scale.length * octaveRange);
        const octave = Math.floor(scaleIndex / scale.length);
        const noteIndex = scaleIndex % scale.length;
        return 60 + octave * 12 + scale[noteIndex];
      });
    }
    /**
     * Map walk to rhythmic durations
     */
    mapToRhythm(dimension = 0, durations = [0.25, 0.5, 1, 2]) {
      const projection = this.getProjection(dimension);
      if (projection.length === 0)
        return [];
      const minVal = Math.min(...projection);
      const maxVal = Math.max(...projection);
      const range = maxVal - minVal || 1;
      return projection.map((value) => {
        const normalized = (value - minVal) / range;
        const durationIndex = Math.floor(normalized * durations.length);
        const clampedIndex = Math.max(0, Math.min(durationIndex, durations.length - 1));
        return durations[clampedIndex];
      });
    }
    /**
     * Map walk to velocities
     */
    mapToVelocity(dimension = 0, minVel = 0.3, maxVel = 1) {
      const projection = this.getProjection(dimension);
      if (projection.length === 0)
        return [];
      const minVal = Math.min(...projection);
      const maxVal = Math.max(...projection);
      const range = maxVal - minVal || 1;
      return projection.map((value) => {
        const normalized = (value - minVal) / range;
        return minVel + normalized * (maxVel - minVel);
      });
    }
    /**
     * Generate correlated walk (walk that follows another walk with some correlation)
     */
    generateCorrelated(targetWalk, correlation = 0.5, dimension = 0) {
      if (targetWalk.length === 0)
        return [];
      const correlatedWalk = [];
      let position = 0;
      for (let i = 0; i < targetWalk.length; i++) {
        const randomStep = (Math.random() - 0.5) * 2 * this.options.stepSize;
        const correlatedStep = correlation * (targetWalk[i] - position);
        position += randomStep + correlatedStep;
        position = Math.max(this.options.bounds[0], Math.min(this.options.bounds[1], position));
        correlatedWalk.push(position);
      }
      return correlatedWalk;
    }
    /**
     * Analyze walk properties
     */
    analyze() {
      if (this.history.length < 2) {
        return {
          meanDisplacement: 0,
          meanSquaredDisplacement: 0,
          totalDistance: 0,
          fractalDimension: 0
        };
      }
      const projection = this.getProjection(0);
      const startPos = projection[0];
      const endPos = projection[projection.length - 1];
      const meanDisplacement = Math.abs(endPos - startPos);
      const squaredDisplacements = projection.map((pos) => Math.pow(pos - startPos, 2));
      const meanSquaredDisplacement = squaredDisplacements.reduce((sum, sq) => sum + sq, 0) / squaredDisplacements.length;
      let totalDistance = 0;
      for (let i = 1; i < projection.length; i++) {
        totalDistance += Math.abs(projection[i] - projection[i - 1]);
      }
      const fractalDimension = totalDistance > 0 ? Math.log(totalDistance) / Math.log(projection.length) : 0;
      return {
        meanDisplacement,
        meanSquaredDisplacement,
        totalDistance,
        fractalDimension
      };
    }
    /**
     * Get current walker states
     */
    getWalkerStates() {
      return this.walkers.map((walker) => ({ ...walker }));
    }
    /**
     * Reset the walk generator
     */
    reset() {
      this.walkers = [];
      this.history = [];
    }
    /**
     * Convert walk to JMON notes
     * @param {Array} durations - Duration sequence
     * @param {Object} options - Conversion options
     * @returns {Array} JMON note objects
     */
    toJmonNotes(durations = [1], options = {}) {
      const {
        useStringTime = false,
        timingConfig = DEFAULT_TIMING_CONFIG,
        dimension = 0,
        mapToScale = null,
        scaleRange = [60, 72]
      } = options;
      const projection = this.getProjection(dimension);
      const notes = [];
      let currentTime = 0;
      for (let i = 0; i < projection.length; i++) {
        const duration = durations[i % durations.length];
        let pitch = projection[i];
        if (mapToScale) {
          const minVal = Math.min(...projection);
          const maxVal = Math.max(...projection);
          const range = maxVal - minVal || 1;
          const normalized = (pitch - minVal) / range;
          const scaleIndex = Math.floor(normalized * mapToScale.length);
          const clampedIndex = Math.max(0, Math.min(scaleIndex, mapToScale.length - 1));
          pitch = mapToScale[clampedIndex];
        } else {
          const scaledWalk = this.mapToScale([projection], mapToScale || [60, 62, 64, 65, 67, 69, 71]);
          pitch = scaledWalk[0][i];
        }
        notes.push({
          pitch,
          duration,
          time: useStringTime ? offsetToBarsBeatsTicks(currentTime, timingConfig) : currentTime
        });
        currentTime += duration;
      }
      return notes;
    }
    /**
     * Generate JMON track directly from walk
     * @param {Array} startPosition - Starting position
     * @param {Array} durations - Duration sequence
     * @param {Object} options - Generation and conversion options
     * @param {Object} trackOptions - Track options
     * @returns {Object} JMON track
     */
    generateTrack(startPosition, durations = [1], options = {}, trackOptions = {}) {
      this.generate(startPosition);
      const notes = this.toJmonNotes(durations, options);
      return notesToTrack(notes, {
        label: "random-walk",
        midiChannel: 0,
        synth: { type: "Synth" },
        ...trackOptions
      });
    }
  };

  // src/algorithms/generative/walks/Chain.js
  var Chain = class {
    walkRange;
    walkStart;
    walkProbability;
    roundTo;
    branchingProbability;
    mergingProbability;
    timingConfig;
    constructor(options = {}) {
      this.walkRange = options.walkRange || null;
      this.walkStart = options.walkStart !== void 0 ? options.walkStart : this.walkRange ? Math.floor((this.walkRange[1] - this.walkRange[0]) / 2) + this.walkRange[0] : 0;
      this.walkProbability = options.walkProbability || [-1, 0, 1];
      this.roundTo = options.roundTo !== void 0 ? options.roundTo : null;
      this.branchingProbability = options.branchingProbability || 0;
      this.mergingProbability = options.mergingProbability || 0;
      this.timingConfig = options.timingConfig || DEFAULT_TIMING_CONFIG;
    }
    /**
     * Generate random walk sequence(s) with branching and merging
     * @param {number} length - Length of the walk
     * @param {number} seed - Random seed for reproducibility
     * @returns {Array<Array>} Array of walk sequences (branches)
     */
    generate(length, seed) {
      let randomFunc = Math.random;
      if (seed !== void 0) {
        randomFunc = this.createSeededRandom(seed);
      }
      const walks = [this.initializeWalk(length)];
      let currentPositions = [this.walkStart];
      for (let step = 1; step < length; step++) {
        const newPositions = [...currentPositions];
        const newWalks = [];
        for (let walkIndex = 0; walkIndex < currentPositions.length; walkIndex++) {
          const walk = walks[walkIndex];
          const currentPosition = currentPositions[walkIndex];
          if (currentPosition === null) {
            if (walk)
              walk[step] = null;
            continue;
          }
          const stepSize = this.generateStep(randomFunc);
          let nextPosition = currentPosition + stepSize;
          if (isNaN(nextPosition)) {
            nextPosition = currentPosition;
          }
          if (this.walkRange !== null) {
            if (nextPosition < this.walkRange[0]) {
              nextPosition = this.walkRange[0];
            } else if (nextPosition > this.walkRange[1]) {
              nextPosition = this.walkRange[1];
            }
          }
          if (isNaN(nextPosition)) {
            nextPosition = this.walkStart;
          }
          if (walk) {
            walk[step] = nextPosition;
          }
          newPositions[walkIndex] = nextPosition;
          if (randomFunc() < this.branchingProbability) {
            const newWalk = this.createBranch(walks[walkIndex], step);
            const branchStepSize = this.generateStep(randomFunc);
            let branchPosition = currentPosition + branchStepSize;
            if (isNaN(branchPosition)) {
              branchPosition = currentPosition;
            }
            if (this.walkRange !== null) {
              if (branchPosition < this.walkRange[0]) {
                branchPosition = this.walkRange[0];
              } else if (branchPosition > this.walkRange[1]) {
                branchPosition = this.walkRange[1];
              }
            }
            if (isNaN(branchPosition)) {
              branchPosition = this.walkStart;
            }
            newWalk[step] = branchPosition;
            newWalks.push(newWalk);
            newPositions.push(branchPosition);
          }
        }
        walks.push(...newWalks);
        currentPositions = newPositions;
        currentPositions = this.handleMerging(walks, currentPositions, step, randomFunc);
      }
      return walks;
    }
    /**
     * Generate a single step according to the probability distribution
     */
    generateStep(randomFunc = Math.random) {
      if (Array.isArray(this.walkProbability)) {
        return this.walkProbability[Math.floor(randomFunc() * this.walkProbability.length)];
      }
      if (typeof this.walkProbability === "object" && this.walkProbability.mean !== void 0 && this.walkProbability.std !== void 0) {
        let step = this.generateNormal(this.walkProbability.mean, this.walkProbability.std, randomFunc);
        if (this.roundTo !== null) {
          step = parseFloat(step.toFixed(this.roundTo));
        }
        return step;
      }
      return [-1, 0, 1][Math.floor(randomFunc() * 3)];
    }
    /**
     * Generate a sample from normal distribution
     */
    generateNormal(mean, std, randomFunc = Math.random) {
      let u1, u2;
      do {
        u1 = randomFunc();
      } while (u1 === 0);
      u2 = randomFunc();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const result = mean + std * z;
      if (isNaN(result)) {
        return mean;
      }
      return result;
    }
    /**
     * Initialize a new walk with null values
     */
    initializeWalk(length) {
      const walk = new Array(length);
      walk[0] = this.walkStart;
      for (let i = 1; i < length; i++) {
        walk[i] = null;
      }
      return walk;
    }
    /**
     * Create a branch from an existing walk
     */
    createBranch(parentWalk, branchStep) {
      const branch = new Array(parentWalk.length);
      for (let i = 0; i < branchStep; i++) {
        branch[i] = null;
      }
      for (let i = branchStep; i < branch.length; i++) {
        branch[i] = null;
      }
      return branch;
    }
    /**
     * Handle merging of walks that collide
     */
    handleMerging(walks, positions, step, randomFunc = Math.random) {
      const newPositions = [...positions];
      for (let i = 0; i < positions.length; i++) {
        if (positions[i] === null)
          continue;
        for (let j = i + 1; j < positions.length; j++) {
          if (positions[j] === null)
            continue;
          const tolerance = this.roundTo !== null ? this.roundTo : 1e-3;
          if (Math.abs(positions[i] - positions[j]) <= tolerance && randomFunc() < this.mergingProbability) {
            newPositions[j] = null;
            if (walks[j]) {
              for (let k = step; k < walks[j].length; k++) {
                walks[j][k] = null;
              }
            }
          }
        }
      }
      return newPositions;
    }
    /**
     * Convert walk sequences to JMON notes
     * @param {Array<Array>} walks - Walk sequences
     * @param {Array} durations - Duration sequence to map to
     * @param {Object} options - Conversion options
     * @returns {Array} JMON note objects
     */
    toJmonNotes(walks, durations = [1], options = {}) {
      const useStringTime = options.useStringTime || false;
      const notes = [];
      let currentTime = 0;
      let durationIndex = 0;
      const maxLength = Math.max(...walks.map((w) => w.length));
      for (let step = 0; step < maxLength; step++) {
        const activePitches = walks.map((walk) => walk[step]).filter((pitch) => pitch !== null);
        if (activePitches.length > 0) {
          const duration = durations[durationIndex % durations.length];
          const pitch = activePitches.length === 1 ? activePitches[0] : activePitches;
          notes.push({
            pitch,
            duration,
            time: useStringTime ? offsetToBarsBeatsTicks(currentTime, this.timingConfig) : currentTime
          });
          currentTime += duration;
          durationIndex++;
        }
      }
      return notes;
    }
    /**
     * Generate a JMON track directly from walk
     * @param {number} length - Walk length
     * @param {Array} durations - Duration sequence
     * @param {Object} trackOptions - Track options
     * @returns {Object} JMON track
     */
    generateTrack(length, durations = [1], trackOptions = {}) {
      const walks = this.generate(length, trackOptions.seed);
      const notes = this.toJmonNotes(walks, durations, trackOptions);
      return notesToTrack(notes, {
        label: "random-walk",
        midiChannel: 0,
        synth: { type: "Synth" },
        ...trackOptions
      });
    }
    /**
     * Map walk values to a musical scale
     * @param {Array<Array>} walks - Walk sequences  
     * @param {Array} scale - Scale to map to
     * @returns {Array<Array>} Walks mapped to scale
     */
    mapToScale(walks, scale = [60, 62, 64, 65, 67, 69, 71]) {
      return walks.map((walk) => {
        return walk.map((value) => {
          if (value === null)
            return null;
          const minVal = this.walkRange[0];
          const maxVal = this.walkRange[1];
          const range = maxVal - minVal;
          const normalized = (value - minVal) / range;
          const scaleIndex = Math.floor(normalized * scale.length);
          const clampedIndex = Math.max(0, Math.min(scaleIndex, scale.length - 1));
          return scale[clampedIndex];
        });
      });
    }
    /**
     * Create a seeded random number generator
     */
    createSeededRandom(seed) {
      let currentSeed = Math.abs(seed) || 1;
      return function() {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        const result = currentSeed / 233280;
        return Math.max(1e-7, Math.min(0.9999999, result));
      };
    }
  };

  // src/algorithms/generative/walks/PhasorWalk.js
  var Phasor = class {
    distance;
    frequency;
    phase;
    subPhasors;
    center;
    constructor(distance = 1, frequency = 1, phase = 0, subPhasors = []) {
      this.distance = distance;
      this.frequency = frequency;
      this.phase = phase;
      this.subPhasors = subPhasors || [];
      this.center = { x: 0, y: 0 };
    }
    /**
     * Add a sub-phasor to this phasor (like epicycles)
     */
    addSubPhasor(phasor) {
      this.subPhasors.push(phasor);
    }
    /**
     * Calculate position at given time
     */
    getPosition(time) {
      const angle = this.frequency * time + this.phase;
      const x = this.center.x + this.distance * Math.cos(angle);
      const y = this.center.y + this.distance * Math.sin(angle);
      return { x, y, angle, distance: this.distance };
    }
    /**
     * Calculate distance from origin
     */
    getDistanceFromOrigin(time) {
      const position = this.getPosition(time);
      return Math.sqrt(position.x * position.x + position.y * position.y);
    }
    /**
     * Calculate angle from origin in degrees
     */
    getAngleFromOrigin(time) {
      const position = this.getPosition(time);
      let angle = Math.atan2(position.y, position.x) * 180 / Math.PI;
      if (angle < 0)
        angle += 360;
      return angle;
    }
    /**
     * Simulate this phasor and all its sub-phasors
     */
    simulate(timeArray, centerPosition = { x: 0, y: 0 }) {
      this.center = centerPosition;
      const results = [];
      for (const time of timeArray) {
        const position = this.getPosition(time);
        const distance = this.getDistanceFromOrigin(time);
        const angle = this.getAngleFromOrigin(time);
        results.push({
          time,
          position,
          distance,
          angle,
          phasor: this
        });
        for (const subPhasor of this.subPhasors) {
          subPhasor.center = position;
          const subResults = subPhasor.simulate([time], position);
          results.push(...subResults);
        }
      }
      return results;
    }
  };
  var PhasorSystem = class _PhasorSystem {
    phasors;
    timingConfig;
    constructor(timingConfig = DEFAULT_TIMING_CONFIG) {
      this.phasors = [];
      this.timingConfig = timingConfig;
    }
    /**
     * Add a phasor to the system
     */
    addPhasor(phasor) {
      this.phasors.push(phasor);
    }
    /**
     * Simulate all phasors and sub-phasors in the system
     */
    simulate(timeArray) {
      const allResults = [];
      for (const phasor of this.phasors) {
        const phasorResults = phasor.simulate(timeArray);
        allResults.push(phasorResults);
      }
      return allResults;
    }
    /**
     * Get a flattened list of all phasors (primary + sub-phasors)
     */
    getAllPhasors() {
      const phasors = [];
      for (const phasor of this.phasors) {
        phasors.push(phasor);
        this.collectSubPhasors(phasor, phasors);
      }
      return phasors;
    }
    /**
     * Recursively collect all sub-phasors
     */
    collectSubPhasors(phasor, collection) {
      for (const subPhasor of phasor.subPhasors) {
        collection.push(subPhasor);
        this.collectSubPhasors(subPhasor, collection);
      }
    }
    /**
     * Map phasor motion to musical parameters
     */
    mapToMusic(timeArray, mappingOptions = {}) {
      const results = this.simulate(timeArray);
      const musicalTracks = [];
      for (let phasorIndex = 0; phasorIndex < results.length; phasorIndex++) {
        const phasorResults = results[phasorIndex];
        const track = this.createMusicalTrack(phasorResults, phasorIndex, mappingOptions);
        musicalTracks.push(track);
      }
      return musicalTracks;
    }
    /**
     * Create a musical track from phasor motion
     */
    createMusicalTrack(phasorResults, phasorIndex, options = {}) {
      const {
        pitchRange = [40, 80],
        durationRange = [0.25, 2],
        useDistance = true,
        useAngle = false,
        quantizeToScale = null,
        timingConfig = this.timingConfig,
        useStringTime = false
      } = options;
      const notes = [];
      for (const result of phasorResults) {
        let pitch, duration;
        if (useDistance) {
          const normalizedDistance = Math.max(0, Math.min(1, result.distance / 10));
          pitch = pitchRange[0] + normalizedDistance * (pitchRange[1] - pitchRange[0]);
        } else {
          pitch = pitchRange[0] + result.angle / 360 * (pitchRange[1] - pitchRange[0]);
        }
        if (useAngle) {
          duration = durationRange[0] + result.angle / 360 * (durationRange[1] - durationRange[0]);
        } else {
          const normalizedDistance = Math.max(0, Math.min(1, result.distance / 10));
          duration = durationRange[1] - normalizedDistance * (durationRange[1] - durationRange[0]);
        }
        if (quantizeToScale) {
          const scaleIndex = Math.floor((pitch - pitchRange[0]) / (pitchRange[1] - pitchRange[0]) * quantizeToScale.length);
          const clampedIndex = Math.max(0, Math.min(scaleIndex, quantizeToScale.length - 1));
          pitch = quantizeToScale[clampedIndex];
        } else {
          pitch = Math.round(pitch);
        }
        notes.push({
          pitch,
          duration,
          time: useStringTime ? offsetToBarsBeatsTicks(result.time, timingConfig) : result.time,
          phasorData: {
            distance: result.distance,
            angle: result.angle,
            position: result.position
          }
        });
      }
      return notes;
    }
    /**
     * Generate JMON tracks directly from phasor motion
     */
    generateTracks(timeArray, mappingOptions = {}, trackOptions = {}) {
      const musicalTracks = this.mapToMusic(timeArray, mappingOptions);
      const jmonTracks = [];
      musicalTracks.forEach((notes, index) => {
        const track = notesToTrack(notes, {
          label: `phasor-${index + 1}`,
          midiChannel: index % 16,
          synth: { type: "Synth" },
          ...trackOptions
        });
        jmonTracks.push(track);
      });
      return jmonTracks;
    }
    /**
     * Create complex harmonic patterns with sub-phasors (epicycles)
     */
    static createComplexSystem() {
      const system = new _PhasorSystem();
      const subPhasor1 = new Phasor(0.2, 5, 0);
      const subPhasor2 = new Phasor(0.3, 3, Math.PI / 2);
      const subSubPhasor = new Phasor(0.1, 8, Math.PI);
      subPhasor1.addSubPhasor(subSubPhasor);
      const phasor1 = new Phasor(2, 1, 0, [subPhasor1, subPhasor2]);
      const phasor2 = new Phasor(3.5, 0.6, Math.PI / 3);
      system.addPhasor(phasor1);
      system.addPhasor(phasor2);
      return system;
    }
    /**
     * Generate time array with linear spacing
     */
    static generateTimeArray(start = 0, end = 10, steps = 100) {
      const timeArray = [];
      const stepSize = (end - start) / (steps - 1);
      for (let i = 0; i < steps; i++) {
        timeArray.push(start + i * stepSize);
      }
      return timeArray;
    }
  };

  // src/algorithms/generative/fractals/Mandelbrot.js
  var Mandelbrot = class {
    /**
     * @param {MandelbrotOptions} [options={}] - Configuration options
     */
    constructor(options = {}) {
      this.width = options.width || 100;
      this.height = options.height || 100;
      this.maxIterations = options.maxIterations || 100;
      this.xMin = options.xMin || -2.5;
      this.xMax = options.xMax || 1.5;
      this.yMin = options.yMin || -2;
      this.yMax = options.yMax || 2;
    }
    /**
     * Generate Mandelbrot set data
     * @returns {number[][]} 2D array of iteration counts
     */
    generate() {
      const data = [];
      for (let y = 0; y < this.height; y++) {
        const row = [];
        for (let x = 0; x < this.width; x++) {
          const real = this.xMin + x / this.width * (this.xMax - this.xMin);
          const imaginary = this.yMin + y / this.height * (this.yMax - this.yMin);
          const iterations = this.mandelbrotIterations({ real, imaginary });
          row.push(iterations);
        }
        data.push(row);
      }
      return data;
    }
    /**
     * Extract sequence from Mandelbrot data using various methods
     * @param {'diagonal'|'border'|'spiral'|'column'|'row'} [method='diagonal'] - Extraction method
     * @param {number} [index=0] - Index for column/row extraction
     * @returns {number[]} Extracted sequence
     */
    extractSequence(method = "diagonal", index = 0) {
      const data = this.generate();
      switch (method) {
        case "diagonal":
          return this.extractDiagonal(data);
        case "border":
          return this.extractBorder(data);
        case "spiral":
          return this.extractSpiral(data);
        case "column":
          return this.extractColumn(data, index);
        case "row":
          return this.extractRow(data, index);
        default:
          return this.extractDiagonal(data);
      }
    }
    /**
     * Calculate Mandelbrot iterations for a complex point
     * @param {ComplexPoint} c - Complex point to test
     * @returns {number} Number of iterations before escape
     */
    mandelbrotIterations(c) {
      let z = { real: 0, imaginary: 0 };
      for (let i = 0; i < this.maxIterations; i++) {
        const zReal = z.real * z.real - z.imaginary * z.imaginary + c.real;
        const zImaginary = 2 * z.real * z.imaginary + c.imaginary;
        z.real = zReal;
        z.imaginary = zImaginary;
        if (z.real * z.real + z.imaginary * z.imaginary > 4) {
          return i;
        }
      }
      return this.maxIterations;
    }
    /**
     * Extract diagonal sequence
     * @param {number[][]} data - 2D fractal data
     * @returns {number[]} Diagonal sequence
     */
    extractDiagonal(data) {
      const sequence = [];
      const minDimension = Math.min(data.length, data[0]?.length || 0);
      for (let i = 0; i < minDimension; i++) {
        sequence.push(data[i][i]);
      }
      return sequence;
    }
    /**
     * Extract border sequence (clockwise)
     * @param {number[][]} data - 2D fractal data
     * @returns {number[]} Border sequence
     */
    extractBorder(data) {
      const sequence = [];
      const height = data.length;
      const width = data[0]?.length || 0;
      if (height === 0 || width === 0)
        return sequence;
      for (let x = 0; x < width; x++) {
        sequence.push(data[0][x]);
      }
      for (let y = 1; y < height; y++) {
        sequence.push(data[y][width - 1]);
      }
      if (height > 1) {
        for (let x = width - 2; x >= 0; x--) {
          sequence.push(data[height - 1][x]);
        }
      }
      if (width > 1) {
        for (let y = height - 2; y > 0; y--) {
          sequence.push(data[y][0]);
        }
      }
      return sequence;
    }
    /**
     * Extract spiral sequence (from outside to inside)
     * @param {number[][]} data - 2D fractal data
     * @returns {number[]} Spiral sequence
     */
    extractSpiral(data) {
      const sequence = [];
      const height = data.length;
      const width = data[0]?.length || 0;
      if (height === 0 || width === 0)
        return sequence;
      let top = 0, bottom = height - 1;
      let left = 0, right = width - 1;
      while (top <= bottom && left <= right) {
        for (let x = left; x <= right; x++) {
          sequence.push(data[top][x]);
        }
        top++;
        for (let y = top; y <= bottom; y++) {
          sequence.push(data[y][right]);
        }
        right--;
        if (top <= bottom) {
          for (let x = right; x >= left; x--) {
            sequence.push(data[bottom][x]);
          }
          bottom--;
        }
        if (left <= right) {
          for (let y = bottom; y >= top; y--) {
            sequence.push(data[y][left]);
          }
          left++;
        }
      }
      return sequence;
    }
    /**
     * Extract specific column
     * @param {number[][]} data - 2D fractal data
     * @param {number} columnIndex - Column index to extract
     * @returns {number[]} Column sequence
     */
    extractColumn(data, columnIndex) {
      const sequence = [];
      const width = data[0]?.length || 0;
      const clampedIndex = Math.max(0, Math.min(columnIndex, width - 1));
      for (const row of data) {
        if (row[clampedIndex] !== void 0) {
          sequence.push(row[clampedIndex]);
        }
      }
      return sequence;
    }
    /**
     * Extract specific row
     * @param {number[][]} data - 2D fractal data
     * @param {number} rowIndex - Row index to extract
     * @returns {number[]} Row sequence
     */
    extractRow(data, rowIndex) {
      const clampedIndex = Math.max(0, Math.min(rowIndex, data.length - 1));
      return data[clampedIndex] ? [...data[clampedIndex]] : [];
    }
    /**
     * Map fractal values to musical scale
     * @param {number[]} sequence - Fractal sequence
     * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Musical scale intervals
     * @param {number} [octaveRange=3] - Number of octaves to span
     * @returns {number[]} MIDI note sequence
     */
    mapToScale(sequence, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
      if (sequence.length === 0)
        return [];
      const minVal = Math.min(...sequence);
      const maxVal = Math.max(...sequence);
      const range = maxVal - minVal || 1;
      return sequence.map((value) => {
        const normalized = (value - minVal) / range;
        const scaleIndex = Math.floor(normalized * scale.length * octaveRange);
        const octave = Math.floor(scaleIndex / scale.length);
        const noteIndex = scaleIndex % scale.length;
        return 60 + octave * 12 + scale[noteIndex];
      });
    }
    /**
     * Generate rhythmic pattern from fractal data
     * @param {number[]} sequence - Fractal sequence
     * @param {number[]} [subdivisions=[1, 2, 4, 8, 16]] - Rhythmic subdivisions
     * @returns {number[]} Rhythmic durations
     */
    mapToRhythm(sequence, subdivisions = [1, 2, 4, 8, 16]) {
      if (sequence.length === 0)
        return [];
      const minVal = Math.min(...sequence);
      const maxVal = Math.max(...sequence);
      const range = maxVal - minVal || 1;
      return sequence.map((value) => {
        const normalized = (value - minVal) / range;
        const subdivisionIndex = Math.floor(normalized * subdivisions.length);
        const clampedIndex = Math.max(0, Math.min(subdivisionIndex, subdivisions.length - 1));
        return 1 / subdivisions[clampedIndex];
      });
    }
  };

  // src/algorithms/generative/fractals/LogisticMap.js
  var LogisticMap = class {
    /**
     * @param {LogisticMapOptions} [options={}] - Configuration options
     */
    constructor(options = {}) {
      this.r = options.r || 3.8;
      this.x0 = options.x0 || 0.5;
      this.iterations = options.iterations || 1e3;
      this.skipTransient = options.skipTransient || 100;
    }
    /**
     * Generate logistic map sequence
     * @returns {number[]} Generated sequence
     */
    generate() {
      const sequence = [];
      let x = this.x0;
      for (let i = 0; i < this.iterations + this.skipTransient; i++) {
        x = this.r * x * (1 - x);
        if (i >= this.skipTransient) {
          sequence.push(x);
        }
      }
      return sequence;
    }
    /**
     * Generate bifurcation data for different r values
     * @param {number} [rMin=2.5] - Minimum r value
     * @param {number} [rMax=4.0] - Maximum r value
     * @param {number} [rSteps=1000] - Number of r steps
     * @returns {Object} Bifurcation data with r and x arrays
     */
    bifurcationDiagram(rMin = 2.5, rMax = 4, rSteps = 1e3) {
      const rValues = [];
      const xValues = [];
      const rStep = (rMax - rMin) / rSteps;
      for (let i = 0; i < rSteps; i++) {
        const r = rMin + i * rStep;
        const originalR = this.r;
        this.r = r;
        const sequence = this.generate();
        this.r = originalR;
        const settledValues = sequence.slice(-50);
        for (const x of settledValues) {
          rValues.push(r);
          xValues.push(x);
        }
      }
      return { r: rValues, x: xValues };
    }
    /**
     * Map chaotic values to musical scale
     * @param {number[]} sequence - Chaotic sequence
     * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Musical scale intervals
     * @param {number} [octaveRange=3] - Number of octaves to span
     * @returns {number[]} MIDI note sequence
     */
    mapToScale(sequence, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
      if (sequence.length === 0)
        return [];
      return sequence.map((value) => {
        const scaleIndex = Math.floor(value * scale.length * octaveRange);
        const octave = Math.floor(scaleIndex / scale.length);
        const noteIndex = scaleIndex % scale.length;
        return 60 + octave * 12 + scale[noteIndex];
      });
    }
    /**
     * Map to rhythmic durations
     * @param {number[]} sequence - Chaotic sequence
     * @param {number[]} [durations=[0.25, 0.5, 1, 2]] - Duration values
     * @returns {number[]} Rhythm sequence
     */
    mapToRhythm(sequence, durations = [0.25, 0.5, 1, 2]) {
      if (sequence.length === 0)
        return [];
      return sequence.map((value) => {
        const durationIndex = Math.floor(value * durations.length);
        const clampedIndex = Math.max(0, Math.min(durationIndex, durations.length - 1));
        return durations[clampedIndex];
      });
    }
    /**
     * Map to velocities
     * @param {number[]} sequence - Chaotic sequence
     * @param {number} [minVel=0.3] - Minimum velocity
     * @param {number} [maxVel=1.0] - Maximum velocity
     * @returns {number[]} Velocity sequence
     */
    mapToVelocity(sequence, minVel = 0.3, maxVel = 1) {
      if (sequence.length === 0)
        return [];
      const range = maxVel - minVel;
      return sequence.map((value) => minVel + value * range);
    }
    /**
     * Detect periodic cycles in the sequence
     * @param {number[]} sequence - Sequence to analyze
     * @param {number} [tolerance=0.01] - Tolerance for cycle detection
     * @returns {number[]} Detected cycle periods
     */
    detectCycles(sequence, tolerance = 0.01) {
      const cycles = [];
      for (let period = 1; period <= Math.floor(sequence.length / 2); period++) {
        let isPeriodic = true;
        for (let i = period; i < Math.min(sequence.length, period * 3); i++) {
          if (Math.abs(sequence[i] - sequence[i - period]) > tolerance) {
            isPeriodic = false;
            break;
          }
        }
        if (isPeriodic) {
          cycles.push(period);
        }
      }
      return cycles;
    }
    /**
     * Calculate Lyapunov exponent (measure of chaos)
     * @param {number} [iterations=10000] - Number of iterations for calculation
     * @returns {number} Lyapunov exponent
     */
    lyapunovExponent(iterations = 1e4) {
      let x = this.x0;
      let sum = 0;
      for (let i = 0; i < iterations; i++) {
        const derivative = this.r * (1 - 2 * x);
        sum += Math.log(Math.abs(derivative));
        x = this.r * x * (1 - x);
      }
      return sum / iterations;
    }
    /**
     * Generate multiple correlated sequences
     * @param {number} [numSequences=2] - Number of sequences to generate
     * @param {number} [coupling=0.1] - Coupling strength between sequences
     * @returns {number[][]} Array of coupled sequences
     */
    generateCoupled(numSequences = 2, coupling = 0.1) {
      const sequences = Array(numSequences).fill(null).map(() => []);
      const states = Array(numSequences).fill(this.x0);
      for (let i = 0; i < this.iterations + this.skipTransient; i++) {
        const newStates = [...states];
        for (let j = 0; j < numSequences; j++) {
          let coupledTerm = 0;
          for (let k = 0; k < numSequences; k++) {
            if (k !== j) {
              coupledTerm += coupling * (states[k] - states[j]);
            }
          }
          newStates[j] = this.r * states[j] * (1 - states[j]) + coupledTerm;
          newStates[j] = Math.max(0, Math.min(1, newStates[j]));
        }
        states.splice(0, numSequences, ...newStates);
        if (i >= this.skipTransient) {
          for (let j = 0; j < numSequences; j++) {
            sequences[j].push(states[j]);
          }
        }
      }
      return sequences;
    }
    /**
     * Apply different chaotic regimes
     * @param {'periodic'|'chaotic'|'edge'|'custom'} regime - Regime type
     * @param {number} [customR] - Custom r value for 'custom' regime
     */
    setRegime(regime, customR) {
      switch (regime) {
        case "periodic":
          this.r = 3.2;
          break;
        case "chaotic":
          this.r = 3.9;
          break;
        case "edge":
          this.r = 3.57;
          break;
        case "custom":
          if (customR !== void 0) {
            this.r = Math.max(0, Math.min(4, customR));
          }
          break;
      }
    }
    /**
     * Get current parameters
     * @returns {LogisticMapOptions} Current configuration
     */
    getParameters() {
      return {
        r: this.r,
        x0: this.x0,
        iterations: this.iterations,
        skipTransient: this.skipTransient
      };
    }
  };

  // src/algorithms/generative/minimalism/MinimalismProcess.js
  var MinimalismProcess = class {
    operation;
    direction;
    repetition;
    timingConfig;
    sequence = [];
    constructor(options) {
      const { operation, direction, repetition, timingConfig = DEFAULT_TIMING_CONFIG } = options;
      if (!["additive", "subtractive"].includes(operation)) {
        throw new Error("Invalid operation. Choose 'additive' or 'subtractive'.");
      }
      if (!["forward", "backward", "inward", "outward"].includes(direction)) {
        throw new Error("Invalid direction. Choose 'forward', 'backward', 'inward' or 'outward'.");
      }
      if (repetition < 0 || !Number.isInteger(repetition)) {
        throw new Error("Invalid repetition value. Must be an integer greater than or equal to 0.");
      }
      this.operation = operation;
      this.direction = direction;
      this.repetition = repetition;
      this.timingConfig = timingConfig;
    }
    /**
     * Generate processed sequence based on operation and direction
     * Accepts either:
     * - JMON note objects: { pitch, duration, time }
     * - Legacy objects: { pitch, duration, offset }
     * - Legacy tuples: [pitch, duration, offset]
     * Returns: JMON note objects with numeric time (quarter notes)
     */
    generate(sequence) {
      this.sequence = this.normalizeInput(sequence);
      let processed;
      if (this.operation === "additive" && this.direction === "forward") {
        processed = this.additiveForward();
      } else if (this.operation === "additive" && this.direction === "backward") {
        processed = this.additiveBackward();
      } else if (this.operation === "additive" && this.direction === "inward") {
        processed = this.additiveInward();
      } else if (this.operation === "additive" && this.direction === "outward") {
        processed = this.additiveOutward();
      } else if (this.operation === "subtractive" && this.direction === "forward") {
        processed = this.subtractiveForward();
      } else if (this.operation === "subtractive" && this.direction === "backward") {
        processed = this.subtractiveBackward();
      } else if (this.operation === "subtractive" && this.direction === "inward") {
        processed = this.subtractiveInward();
      } else if (this.operation === "subtractive" && this.direction === "outward") {
        processed = this.subtractiveOutward();
      } else {
        throw new Error("Invalid operation/direction combination");
      }
      const withOffsets = this.adjustOffsets(processed);
      return this.toJmonNotes(withOffsets, false);
    }
    additiveForward() {
      const processed = [];
      for (let i = 0; i < this.sequence.length; i++) {
        const segment = this.sequence.slice(0, i + 1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
      return processed;
    }
    additiveBackward() {
      const processed = [];
      for (let i = this.sequence.length; i > 0; i--) {
        const segment = this.sequence.slice(i - 1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
      return processed;
    }
    additiveInward() {
      const processed = [];
      const n = this.sequence.length;
      for (let i = 0; i < Math.ceil(n / 2); i++) {
        let segment;
        if (i < n - i - 1) {
          const leftPart = this.sequence.slice(0, i + 1);
          const rightPart = this.sequence.slice(n - i - 1);
          segment = [...leftPart, ...rightPart];
        } else {
          segment = [...this.sequence];
        }
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
      return processed;
    }
    additiveOutward() {
      const processed = [];
      const n = this.sequence.length;
      if (n % 2 === 0) {
        const midLeft = Math.floor(n / 2) - 1;
        const midRight = Math.floor(n / 2);
        for (let i = 0; i < n / 2; i++) {
          const segment = this.sequence.slice(midLeft - i, midRight + i + 1);
          for (let rep = 0; rep <= this.repetition; rep++) {
            processed.push(...segment);
          }
        }
      } else {
        const mid = Math.floor(n / 2);
        for (let i = 0; i <= mid; i++) {
          const segment = this.sequence.slice(mid - i, mid + i + 1);
          for (let rep = 0; rep <= this.repetition; rep++) {
            processed.push(...segment);
          }
        }
      }
      return processed;
    }
    subtractiveForward() {
      const processed = [];
      for (let i = 0; i < this.sequence.length; i++) {
        const segment = this.sequence.slice(i);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
      return processed;
    }
    subtractiveBackward() {
      const processed = [];
      for (let i = this.sequence.length; i > 0; i--) {
        const segment = this.sequence.slice(0, i);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
      return processed;
    }
    subtractiveInward() {
      const processed = [];
      const n = this.sequence.length;
      const steps = Math.floor(n / 2);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...this.sequence);
      }
      for (let i = 1; i <= steps; i++) {
        const segment = this.sequence.slice(i, n - i);
        if (segment.length > 0) {
          for (let rep = 0; rep <= this.repetition; rep++) {
            processed.push(...segment);
          }
        }
      }
      return processed;
    }
    subtractiveOutward() {
      const processed = [];
      let segment = [...this.sequence];
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
      while (segment.length > 2) {
        segment = segment.slice(1, -1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
      return processed;
    }
    // Normalize heterogenous inputs into objects with pitch, duration, offset (beats)
    normalizeInput(sequence) {
      if (!Array.isArray(sequence))
        return [];
      if (Array.isArray(sequence[0])) {
        return sequence.map(([pitch, duration, offset = 0]) => ({ pitch, duration, offset }));
      }
      return sequence.map((n) => {
        const pitch = n.pitch;
        const duration = n.duration;
        let offset = 0;
        if (typeof n.offset === "number")
          offset = n.offset;
        else if (typeof n.time === "number")
          offset = n.time;
        else if (typeof n.time === "string")
          offset = this.timeToBeats(n.time);
        return { ...n, pitch, duration, offset };
      });
    }
    // Convert beats to bars:beats:ticks using centralized utility
    beatsToTime(beats) {
      return offsetToBarsBeatsTicks(beats, this.timingConfig);
    }
    // Convert bars:beats:ticks to beats using centralized utility
    timeToBeats(timeStr) {
      if (typeof timeStr !== "string")
        return Number(timeStr) || 0;
      return barsBeatsTicksToOffset(timeStr, this.timingConfig);
    }
    // After process, recalc offsets sequentially in beats
    adjustOffsets(processed) {
      let currentOffset = 0;
      return processed.map((note) => {
        const newNote = {
          ...note,
          offset: currentOffset
        };
        currentOffset += note.duration;
        return newNote;
      });
    }
    // Produce JMON notes: { pitch, duration, time }
    // Always use numeric time in quarter notes (like pitch: 60, time: 4.5)
    toJmonNotes(notesWithOffsets, useStringTime = false) {
      return notesWithOffsets.map(({ pitch, duration, offset, ...rest }) => {
        const { time: oldTime, ...cleanRest } = rest;
        return {
          pitch,
          duration,
          time: useStringTime ? this.beatsToTime(offset) : offset,
          ...cleanRest
        };
      });
    }
    /**
     * Generate and convert to JMON track format
     * @param {Array} sequence - Input sequence
     * @param {Object} trackOptions - Track configuration options
     * @param {boolean} trackOptions.useStringTime - Use bars:beats:ticks strings for display (default: numeric)
     * @returns {Object} JMON track object
     */
    generateTrack(sequence, trackOptions = {}) {
      const processedNotes = this.generate(sequence);
      return notesToTrack(processedNotes, {
        timingConfig: this.timingConfig,
        useStringTime: false,
        ...trackOptions
      });
    }
  };
  var Tintinnabuli = class {
    tChord;
    direction;
    rank;
    isAlternate;
    currentDirection;
    timingConfig;
    constructor(tChord, direction = "down", rank = 0, timingConfig = DEFAULT_TIMING_CONFIG) {
      if (!["up", "down", "any", "alternate"].includes(direction)) {
        throw new Error("Invalid direction. Choose 'up', 'down', 'any' or 'alternate'.");
      }
      this.tChord = tChord;
      this.isAlternate = direction === "alternate";
      this.currentDirection = this.isAlternate ? "up" : direction;
      this.direction = direction;
      this.timingConfig = timingConfig;
      if (!Number.isInteger(rank) || rank < 0) {
        throw new Error("Rank must be a non-negative integer.");
      }
      this.rank = Math.min(rank, tChord.length - 1);
      if (this.rank >= tChord.length) {
        console.warn("Rank exceeds the length of the t-chord. Using last note of the t-chord.");
      }
    }
    /**
     * Generate t-voice from m-voice sequence
     * Accepts: JMON notes, legacy objects, or tuples
     * Returns: JMON notes with numeric time (quarter notes)
     * @param {Array} sequence - Input sequence
     * @param {boolean} useStringTime - Whether to use bars:beats:ticks strings for display (default: false)
     */
    generate(sequence, useStringTime = false) {
      const normalizedSequence = this.normalizeInput(sequence);
      const tVoice = [];
      for (const note of normalizedSequence) {
        if (note.pitch === void 0) {
          const { offset: offset2, time: oldTime2, ...rest2 } = note;
          tVoice.push({
            ...rest2,
            pitch: void 0,
            time: useStringTime ? this.beatsToTime(offset2) : offset2
          });
          continue;
        }
        const mPitch = note.pitch;
        const differences = this.tChord.map((t) => t - mPitch);
        const sortedDifferences = differences.map((diff, index) => ({ index, value: diff })).sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
        let effectiveRank = this.rank;
        let tVoicePitch;
        if (this.currentDirection === "up" || this.currentDirection === "down") {
          const filteredDifferences = sortedDifferences.filter(
            ({ value }) => this.currentDirection === "up" ? value >= 0 : value <= 0
          );
          if (filteredDifferences.length === 0) {
            tVoicePitch = this.currentDirection === "up" ? Math.max(...this.tChord) : Math.min(...this.tChord);
          } else {
            if (effectiveRank >= filteredDifferences.length) {
              effectiveRank = filteredDifferences.length - 1;
            }
            const chosenIndex = filteredDifferences[effectiveRank].index;
            tVoicePitch = this.tChord[chosenIndex];
          }
        } else {
          if (effectiveRank >= sortedDifferences.length) {
            effectiveRank = sortedDifferences.length - 1;
          }
          const chosenIndex = sortedDifferences[effectiveRank].index;
          tVoicePitch = this.tChord[chosenIndex];
        }
        if (this.isAlternate) {
          this.currentDirection = this.currentDirection === "up" ? "down" : "up";
        }
        const { offset, time: oldTime, ...rest } = note;
        tVoice.push({
          ...rest,
          pitch: tVoicePitch,
          time: useStringTime ? this.beatsToTime(offset) : offset
        });
      }
      return tVoice;
    }
    // Normalize input like MinimalismProcess
    normalizeInput(sequence) {
      if (!Array.isArray(sequence))
        return [];
      if (Array.isArray(sequence[0])) {
        return sequence.map(([pitch, duration, offset = 0]) => ({ pitch, duration, offset }));
      }
      return sequence.map((n) => {
        const pitch = n.pitch;
        const duration = n.duration;
        let offset = 0;
        if (typeof n.offset === "number")
          offset = n.offset;
        else if (typeof n.time === "number")
          offset = n.time;
        else if (typeof n.time === "string")
          offset = this.timeToBeats(n.time);
        return { ...n, pitch, duration, offset };
      });
    }
    // Convert beats to bars:beats:ticks using centralized utility
    beatsToTime(beats) {
      return offsetToBarsBeatsTicks(beats, this.timingConfig);
    }
    // Convert bars:beats:ticks to beats using centralized utility
    timeToBeats(timeStr) {
      if (typeof timeStr !== "string")
        return Number(timeStr) || 0;
      return barsBeatsTicksToOffset(timeStr, this.timingConfig);
    }
  };

  // src/algorithms/analysis/index.js
  var analysis_exports = {};
  __export(analysis_exports, {
    MusicalAnalysis: () => MusicalAnalysis,
    MusicalIndex: () => MusicalIndex
  });

  // src/algorithms/analysis/MusicalAnalysis.js
  var MusicalAnalysis = class {
    /**
     * Calculate Gini coefficient for inequality measurement
     * @param {number[]} values - Values to analyze
     * @param {number[]} [weights] - Optional weights
     * @returns {number} Gini coefficient (0-1)
     */
    static gini(values, weights) {
      if (values.length === 0)
        return 0;
      const n = values.length;
      const w = weights || Array(n).fill(1);
      const pairs = values.map((v, i) => ({ value: v, weight: w[i] })).sort((a, b) => a.value - b.value);
      const sortedValues = pairs.map((p) => p.value);
      const sortedWeights = pairs.map((p) => p.weight);
      const totalWeight = sortedWeights.reduce((sum, w2) => sum + w2, 0);
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        const cumWeight = sortedWeights.slice(0, i + 1).reduce(
          (sum, w2) => sum + w2,
          0
        );
        numerator += sortedWeights[i] * (2 * cumWeight - sortedWeights[i] - totalWeight) * sortedValues[i];
        denominator += sortedWeights[i] * sortedValues[i] * totalWeight;
      }
      return denominator === 0 ? 0 : numerator / denominator;
    }
    /**
     * Calculate center of mass (balance point) of a sequence
     * @param {number[]} values - Values to analyze
     * @param {number[]} [weights] - Optional weights
     * @returns {number} Balance point
     */
    static balance(values, weights) {
      if (values.length === 0)
        return 0;
      const w = weights || Array(values.length).fill(1);
      const weightedSum = values.reduce((sum, val, i) => sum + val * w[i], 0);
      const totalWeight = w.reduce((sum, weight) => sum + weight, 0);
      return totalWeight === 0 ? 0 : weightedSum / totalWeight;
    }
    /**
     * Calculate autocorrelation for pattern detection
     * @param {number[]} values - Values to analyze
     * @param {number} [maxLag] - Maximum lag to calculate
     * @returns {number[]} Autocorrelation array
     */
    static autocorrelation(values, maxLag) {
      const n = values.length;
      const lag = maxLag || Math.floor(n / 2);
      const result = [];
      const mean = values.reduce((sum, val) => sum + val, 0) / n;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      for (let k = 0; k <= lag; k++) {
        let covariance = 0;
        for (let i = 0; i < n - k; i++) {
          covariance += (values[i] - mean) * (values[i + k] - mean);
        }
        covariance /= n - k;
        result.push(variance === 0 ? 0 : covariance / variance);
      }
      return result;
    }
    /**
     * Detect and score musical motifs
     * @param {number[]} values - Values to analyze
     * @param {number} [patternLength=3] - Length of patterns to detect
     * @returns {number} Motif score
     */
    static motif(values, patternLength = 3) {
      if (values.length < patternLength * 2)
        return 0;
      const patterns = /* @__PURE__ */ new Map();
      for (let i = 0; i <= values.length - patternLength; i++) {
        const pattern = values.slice(i, i + patternLength).join(",");
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
      const maxOccurrences = Math.max(...patterns.values());
      const totalPatterns = patterns.size;
      return totalPatterns === 0 ? 0 : maxOccurrences / totalPatterns;
    }
    /**
     * Calculate dissonance/scale conformity
     * @param {number[]} pitches - MIDI pitch values
     * @param {number[]} [scale=[0, 2, 4, 5, 7, 9, 11]] - Scale to check against
     * @returns {number} Dissonance score (0-1)
     */
    static dissonance(pitches, scale = [0, 2, 4, 5, 7, 9, 11]) {
      if (pitches.length === 0)
        return 0;
      let conformingNotes = 0;
      for (const pitch of pitches) {
        const pitchClass = (pitch % 12 + 12) % 12;
        if (scale.includes(pitchClass)) {
          conformingNotes++;
        }
      }
      return 1 - conformingNotes / pitches.length;
    }
    /**
     * Calculate rhythmic fit to a grid
     * @param {number[]} onsets - Onset times
     * @param {number} [gridDivision=16] - Grid division
     * @returns {number} Rhythmic alignment score
     */
    static rhythmic(onsets, gridDivision = 16) {
      if (onsets.length === 0)
        return 0;
      let gridAlignedCount = 0;
      const tolerance = 0.1;
      for (const onset of onsets) {
        const gridPosition = onset * gridDivision;
        const nearestGrid = Math.round(gridPosition);
        const deviation = Math.abs(gridPosition - nearestGrid);
        if (deviation <= tolerance) {
          gridAlignedCount++;
        }
      }
      return gridAlignedCount / onsets.length;
    }
    /**
     * Calculate Fibonacci/golden ratio index
     * @param {number[]} values - Values to analyze
     * @returns {number} Fibonacci index
     */
    static fibonacciIndex(values) {
      if (values.length < 2)
        return 0;
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      let fibonacciScore = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i - 1] !== 0) {
          const ratio = values[i] / values[i - 1];
          const deviation = Math.abs(ratio - goldenRatio);
          fibonacciScore += 1 / (1 + deviation);
        }
      }
      return fibonacciScore / (values.length - 1);
    }
    /**
     * Calculate syncopation (off-beat emphasis)
     * @param {number[]} onsets - Onset times
     * @param {number} [beatDivision=4] - Beat division
     * @returns {number} Syncopation score
     */
    static syncopation(onsets, beatDivision = 4) {
      if (onsets.length === 0)
        return 0;
      let syncopatedCount = 0;
      for (const onset of onsets) {
        const beatPosition = onset * beatDivision % 1;
        const isOffBeat = beatPosition > 0.2 && beatPosition < 0.8 && Math.abs(beatPosition - 0.5) > 0.2;
        if (isOffBeat) {
          syncopatedCount++;
        }
      }
      return syncopatedCount / onsets.length;
    }
    /**
     * Calculate contour entropy (melodic direction randomness)
     * @param {number[]} pitches - Pitch values
     * @returns {number} Contour entropy
     */
    static contourEntropy(pitches) {
      if (pitches.length < 2)
        return 0;
      const directions = [];
      for (let i = 1; i < pitches.length; i++) {
        const diff = pitches[i] - pitches[i - 1];
        if (diff > 0)
          directions.push(1);
        else if (diff < 0)
          directions.push(-1);
        else
          directions.push(0);
      }
      const counts = { up: 0, down: 0, same: 0 };
      for (const dir of directions) {
        if (dir > 0)
          counts.up++;
        else if (dir < 0)
          counts.down++;
        else
          counts.same++;
      }
      const total = directions.length;
      const probabilities = [
        counts.up / total,
        counts.down / total,
        counts.same / total
      ].filter((p) => p > 0);
      return -probabilities.reduce((entropy, p) => entropy + p * Math.log2(p), 0);
    }
    /**
     * Calculate interval variance (pitch stability)
     * @param {number[]} pitches - Pitch values
     * @returns {number} Interval variance
     */
    static intervalVariance(pitches) {
      if (pitches.length < 2)
        return 0;
      const intervals = [];
      for (let i = 1; i < pitches.length; i++) {
        intervals.push(Math.abs(pitches[i] - pitches[i - 1]));
      }
      const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce(
        (sum, interval) => sum + Math.pow(interval - mean, 2),
        0
      ) / intervals.length;
      return variance;
    }
    /**
     * Calculate note density (notes per unit time)
     * @param {JMonNote[]} notes - Array of notes
     * @param {number} [timeWindow=1] - Time window for density calculation
     * @returns {number} Note density
     */
    static density(notes, timeWindow = 1) {
      if (notes.length === 0)
        return 0;
      const numericTimes = notes.map((note) => {
        if (typeof note.time === "string") {
          return parseFloat(note.time) || 0;
        }
        return note.time || 0;
      });
      const minTime = Math.min(...numericTimes);
      const maxTime = Math.max(...numericTimes);
      const totalTime = maxTime - minTime || 1;
      return notes.length / (totalTime / timeWindow);
    }
    /**
     * Calculate gap variance (timing consistency)
     * @param {number[]} onsets - Onset times
     * @returns {number} Gap variance
     */
    static gapVariance(onsets) {
      if (onsets.length < 2)
        return 0;
      const gaps = [];
      for (let i = 1; i < onsets.length; i++) {
        gaps.push(onsets[i] - onsets[i - 1]);
      }
      const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - mean, 2), 0) / gaps.length;
      return variance;
    }
    /**
     * Comprehensive analysis of a musical sequence
     * @param {JMonNote[]} notes - Array of notes to analyze
     * @param {AnalysisOptions} [options={}] - Analysis options
     * @returns {AnalysisResult} Analysis results
     */
    static analyze(notes, options = {}) {
      const { scale = [0, 2, 4, 5, 7, 9, 11] } = options;
      const pitches = notes.map((note) => {
        if (typeof note.note === "number")
          return note.note;
        if (typeof note.note === "string") {
          return 60;
        }
        return Array.isArray(note.note) ? note.note[0] : 60;
      });
      const onsets = notes.map((note) => {
        if (typeof note.time === "number")
          return note.time;
        return parseFloat(note.time) || 0;
      });
      return {
        gini: this.gini(pitches),
        balance: this.balance(pitches),
        motif: this.motif(pitches),
        dissonance: this.dissonance(pitches, scale),
        rhythmic: this.rhythmic(onsets),
        fibonacciIndex: this.fibonacciIndex(pitches),
        syncopation: this.syncopation(onsets),
        contourEntropy: this.contourEntropy(pitches),
        intervalVariance: this.intervalVariance(pitches),
        density: this.density(notes),
        gapVariance: this.gapVariance(onsets)
      };
    }
  };

  // src/algorithms/index.js
  init_audio();
  var theory = {
    harmony: harmony_default,
    rhythm: rhythm_default,
    motifs: {
      MotifBank
    }
  };
  var constants = {
    theory: MusicTheoryConstants
  };
  var generative = {
    gaussian: {
      Regressor: GaussianProcessRegressor,
      Kernel: KernelGenerator
    },
    automata: {
      Cellular: CellularAutomata
    },
    loops: Loop,
    genetic: {
      Darwin
    },
    walks: {
      Random: RandomWalk,
      Chain,
      Phasor: {
        Vector: Phasor,
        System: PhasorSystem
      }
    },
    fractals: {
      Mandelbrot,
      LogisticMap
    },
    minimalism: {
      Process: MinimalismProcess,
      Tintinnabuli
    }
  };
  var analysis = {
    ...analysis_exports
  };
  var utils = {
    ...utils_exports
  };
  var audio = audio_default;
  var algorithms_default = {
    theory,
    constants,
    generative,
    analysis,
    audio,
    utils
  };

  // src/browser/music-player.js
  init_tonejs();
  init_gm_instruments();

  // src/constants/audio-effects.js
  var REVERB_EFFECTS = [
    "Reverb",
    "JCReverb",
    "Freeverb"
  ];
  var DELAY_EFFECTS = [
    "Delay",
    "FeedbackDelay",
    "PingPongDelay"
  ];
  var MODULATION_EFFECTS = [
    "Chorus",
    "Phaser",
    "Tremolo",
    "Vibrato",
    "AutoWah"
  ];
  var DISTORTION_EFFECTS = [
    "Distortion",
    "Chebyshev",
    "BitCrusher"
  ];
  var DYNAMICS_EFFECTS = [
    "Compressor",
    "Limiter",
    "Gate",
    "MidSideCompressor"
  ];
  var FILTER_EFFECTS = [
    "Filter",
    "AutoFilter"
  ];
  var ADVANCED_EFFECTS = [
    "FrequencyShifter",
    "PitchShift",
    "StereoWidener"
  ];
  var ALL_EFFECTS = [
    ...REVERB_EFFECTS,
    ...DELAY_EFFECTS,
    ...MODULATION_EFFECTS,
    ...DISTORTION_EFFECTS,
    ...DYNAMICS_EFFECTS,
    ...FILTER_EFFECTS,
    ...ADVANCED_EFFECTS
  ];
  var SYNTHESIZER_TYPES = [
    "Synth",
    "PolySynth",
    "MonoSynth",
    "AMSynth",
    "FMSynth",
    "DuoSynth",
    "PluckSynth",
    "NoiseSynth"
  ];
  var SPECIAL_NODE_TYPES = [
    "Sampler",
    "Destination"
  ];
  var ALL_AUDIO_GRAPH_TYPES = [
    ...SYNTHESIZER_TYPES,
    ...ALL_EFFECTS,
    ...SPECIAL_NODE_TYPES
  ];

  // src/constants/ui-constants.js
  var PLAYER_DIMENSIONS = {
    MAX_WIDTH: 800,
    MIN_WIDTH: 0,
    MOBILE_MAX_WIDTH: "100vw",
    PADDING: 16,
    MOBILE_PADDING: 8,
    BORDER_RADIUS: 12,
    MOBILE_BORDER_RADIUS: 8
  };
  var TIMELINE_CONFIG = {
    MARGIN: "8px 0",
    MOBILE_MARGIN: "6px 0",
    GAP: 12,
    MOBILE_GAP: 8,
    UPDATE_INTERVAL: 100
    // ms between timeline updates
  };
  var COLORS = {
    BACKGROUND: "#FFFFFF",
    PRIMARY: "#333",
    SECONDARY: "#F0F0F0",
    ACCENT: "#333",
    TEXT: "#000000",
    LIGHT_TEXT: "#666666",
    BORDER: "#CCCCCC"
  };

  // src/constants/player-constants.js
  var AUDIO_CONFIG = {
    DEFAULT_TEMPO: 120,
    MIN_TEMPO: 60,
    MAX_TEMPO: 240,
    DEFAULT_VELOCITY: 0.8,
    GLISSANDO_MIN_STEPS: 3
  };
  var ERROR_MESSAGES = {
    INVALID_COMPOSITION: "Composition must be a valid JMON object",
    NO_SEQUENCES_OR_TRACKS: "Composition must have sequences or tracks",
    TRACKS_MUST_BE_ARRAY: "Tracks/sequences must be an array",
    TONE_NOT_AVAILABLE: "Tone.js not available",
    AUDIO_CONTEXT_FAILED: "Failed to start audio context",
    iOS_AUDIO_HELP: "On iOS, please ensure your device isn't in silent mode and try again.",
    GENERAL_AUDIO_HELP: "Please check your audio settings and try again."
  };
  var LOG_PREFIXES = {
    PLAYER: "[PLAYER]",
    MULTIVOICE: "[MULTIVOICE]",
    AUDIO_GRAPH: "[AUDIO_GRAPH]"
  };

  // src/browser/music-player.js
  function createPlayer(composition, options = {}) {
    if (!composition || typeof composition !== "object") {
      console.error(`${LOG_PREFIXES.PLAYER} Invalid composition:`, composition);
      throw new Error(ERROR_MESSAGES.INVALID_COMPOSITION);
    }
    const {
      autoplay = false,
      showDebug = false,
      customInstruments = {},
      autoMultivoice = true,
      maxVoices = 4,
      Tone: externalTone = null,
      preloadTone = false
    } = options;
    if (!composition.sequences && !composition.tracks) {
      console.error(
        `${LOG_PREFIXES.PLAYER} No sequences or tracks found in composition:`,
        composition
      );
      throw new Error(ERROR_MESSAGES.NO_SEQUENCES_OR_TRACKS);
    }
    const tracks = composition.tracks || composition.sequences || [];
    if (!Array.isArray(tracks)) {
      console.error(
        `${LOG_PREFIXES.PLAYER} Tracks/sequences must be an array:`,
        tracks
      );
      throw new Error(ERROR_MESSAGES.TRACKS_MUST_BE_ARRAY);
    }
    const tempo = composition.tempo || composition.bpm || AUDIO_CONFIG.DEFAULT_TEMPO;
    const conversionOptions = { autoMultivoice, maxVoices, showDebug };
    const convertedData = tonejs(composition, conversionOptions);
    const { tracks: convertedTracks, metadata } = convertedData;
    let totalDuration = metadata.totalDuration;
    const colors = COLORS;
    const container = document.createElement("div");
    container.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        background-color: ${colors.background};
        color: ${colors.text};
        padding: 16px 16px 8px 16px;
        border-radius: 12px;
        width: 100%;
        max-width: ${PLAYER_DIMENSIONS.MAX_WIDTH}px;
        min-width: ${PLAYER_DIMENSIONS.MIN_WIDTH};
        border: 1px solid ${colors.border};
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    `;
    const styleTag = document.createElement("style");
    styleTag.textContent = `
        /* iOS audio improvements */
        .jmon-music-player-container {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }
        .jmon-music-player-play {
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        }

        /* Button hover effects */
        .jmon-music-player-btn-vertical:hover {
            background-color: #555555 !important;
            transform: translateY(-1px);
        }
        .jmon-music-player-btn-vertical:active {
            transform: translateY(0px);
        }

        /* Large screens: Show vertical downloads, hide horizontal ones, horizontal track layout */
        @media (min-width: 600px) {
            .jmon-music-player-downloads {
                display: none !important;
            }
            .jmon-music-player-vertical-downloads {
                display: flex !important;
            }
            .jmon-music-player-top {
                gap: 32px !important;
            }
            .jmon-music-player-right {
                min-width: 140px !important;
                max-width: 160px !important;
            }
            .jmon-track-selector {
                flex-direction: row !important;
                align-items: center !important;
                gap: 16px !important;
            }
            .jmon-track-selector label {
                min-width: 120px !important;
                margin-bottom: 0 !important;
                flex-shrink: 0 !important;
            }
            .jmon-track-selector select {
                flex: 1 !important;
            }
        }

        /* Medium screens: Compact layout with horizontal track selectors */
        @media (min-width: 481px) and (max-width: 799px) {
            .jmon-music-player-downloads {
                display: none !important;
            }
            .jmon-music-player-vertical-downloads {
                display: flex !important;
            }
            .jmon-music-player-top {
                gap: 20px !important;
            }
            .jmon-music-player-right {
                min-width: 120px !important;
                max-width: 140px !important;
            }
            .jmon-track-selector {
                flex-direction: row !important;
                align-items: center !important;
                gap: 12px !important;
            }
            .jmon-track-selector label {
                min-width: 100px !important;
                margin-bottom: 0 !important;
                flex-shrink: 0 !important;
                font-size: 14px !important;
            }
            .jmon-track-selector select {
                flex: 1 !important;
            }
        }

        /* Small screens: Mobile layout */
        @media (max-width: 480px) {
            .jmon-music-player-downloads {
                display: flex !important;
            }
            .jmon-music-player-vertical-downloads {
                display: none !important;
            }
            .jmon-music-player-container {
                padding: 8px !important;
                border-radius: 8px !important;
                max-width: 100vw !important;
                min-width: 0 !important;
                box-shadow: none !important;
            }
            .jmon-music-player-top {
                flex-direction: column !important;
                gap: 12px !important;
                align-items: stretch !important;
            }
            .jmon-music-player-left, .jmon-music-player-right {
                width: 100% !important;
                min-width: 0 !important;
                max-width: none !important;
                flex: none !important;
            }
            .jmon-music-player-right {
                gap: 12px !important;
            }
            .jmon-track-selector {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 8px !important;
            }
            .jmon-track-selector label {
                min-width: auto !important;
                margin-bottom: 0 !important;
            }
            .jmon-track-selector select {
                flex: none !important;
            }
            .jmon-music-player-timeline {
                gap: 8px !important;
                margin: 6px 0 !important;
            }
            .jmon-music-player-downloads {
                flex-direction: column !important;
                gap: 8px !important;
                margin-top: 6px !important;
            }
            .jmon-music-player-btn {
                min-height: 40px !important;
                font-size: 14px !important;
                padding: 10px 0 !important;
            }
            .jmon-music-player-play {
                width: 40px !important;
                height: 40px !important;
                min-width: 40px !important;
                max-width: 40px !important;
                padding: 8px !important;
                margin: 0 4px !important;
                border-radius: 50% !important;
                flex-shrink: 0 !important;
            }
            .jmon-music-player-stop {
                width: 40px !important;
                height: 40px !important;
                min-width: 40px !important;
                max-width: 40px !important;
                padding: 8px !important;
                margin: 0 4px !important;
                flex-shrink: 0 !important;
            }
        }
    `;
    document.head.appendChild(styleTag);
    container.classList.add("jmon-music-player-container");
    const mainLayout = document.createElement("div");
    mainLayout.style.cssText = `
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto;
        gap: 12px;
        margin-bottom: 0px;
        font-family: 'PT Sans', sans-serif;
    `;
    mainLayout.classList.add("jmon-music-player-main");
    const topContainer = document.createElement("div");
    topContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        font-family: 'PT Sans', sans-serif;
        gap: 24px;
        flex-wrap: wrap;
    `;
    topContainer.classList.add("jmon-music-player-top");
    const leftColumn = document.createElement("div");
    leftColumn.style.cssText = `
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
    `;
    leftColumn.classList.add("jmon-music-player-left");
    const instrumentsContainer = document.createElement("div");
    instrumentsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
    `;
    const gmInstruments = getPopularInstruments();
    const originalTracks = composition.tracks || [];
    const synthSelectors = [];
    originalTracks.forEach((track, index) => {
      const trackAnalysis = convertedTracks.find(
        (t) => t.originalTrackIndex === index
      )?.analysis;
      if (trackAnalysis?.hasGlissando) {
        console.warn(
          `Track ${track.label || track.name || index + 1} contient un glissando : la polyphonie sera d\xE9sactiv\xE9e pour cette piste.`
        );
      }
      const synthSelectorItem = document.createElement("div");
      synthSelectorItem.style.cssText = `
            margin-bottom: 8px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
      synthSelectorItem.classList.add("jmon-track-selector");
      const synthLabel = document.createElement("label");
      synthLabel.textContent = track.label || `Track ${index + 1}`;
      synthLabel.style.cssText = `
            font-family: 'PT Sans', sans-serif;
            font-size: 16px;
            color: ${colors.text};
            display: block;
            margin-bottom: 0;
            font-weight: normal;
            flex-shrink: 0;
        `;
      const synthSelect = document.createElement("select");
      synthSelect.style.cssText = `
            padding: 4px;
            border: 1px solid ${colors.secondary};
            border-radius: 4px;
            background-color: ${colors.background};
            color: ${colors.text};
            font-size: 12px;
            width: 100%;
            height: 28px;
            box-sizing: border-box;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            margin: 0;
            outline: none;
        `;
      const synthGroup = document.createElement("optgroup");
      synthGroup.label = "Synthesizers";
      const basicSynths = [
        "PolySynth",
        "Synth",
        "AMSynth",
        "DuoSynth",
        "FMSynth",
        "MembraneSynth",
        "MetalSynth",
        "MonoSynth",
        "PluckSynth"
      ];
      const audioGraphNodes = composition.audioGraph || [];
      if (Array.isArray(audioGraphNodes) && audioGraphNodes.length > 0) {
        const trackSynthRef = composition.tracks?.[index]?.synthRef;
        audioGraphNodes.forEach((node) => {
          if (node.id && node.type && node.type !== "Destination") {
            const option = document.createElement("option");
            option.value = `AudioGraph: ${node.id}`;
            option.textContent = node.id;
            if (trackSynthRef === node.id) {
              option.selected = true;
            }
            synthGroup.appendChild(option);
          }
        });
      }
      basicSynths.forEach((synthType) => {
        const option = document.createElement("option");
        option.value = synthType;
        option.textContent = synthType;
        if (trackAnalysis?.hasGlissando && synthType === "Synth") {
          option.selected = true;
        } else if (!trackAnalysis?.hasGlissando && !composition.tracks?.[index]?.synthRef && synthType === "PolySynth") {
          option.selected = true;
        }
        if (trackAnalysis?.hasGlissando && (synthType === "PolySynth" || synthType === "DuoSynth")) {
          option.disabled = true;
          option.textContent += " (mono only for glissando)";
        }
        synthGroup.appendChild(option);
      });
      synthSelect.appendChild(synthGroup);
      const gmGroup = document.createElement("optgroup");
      gmGroup.label = "Sampled Instruments";
      const instrumentsByCategory = {};
      gmInstruments.forEach((instrument) => {
        if (!instrumentsByCategory[instrument.category]) {
          instrumentsByCategory[instrument.category] = [];
        }
        instrumentsByCategory[instrument.category].push(instrument);
      });
      Object.keys(instrumentsByCategory).sort().forEach((category) => {
        const categoryGroup = document.createElement("optgroup");
        categoryGroup.label = category;
        instrumentsByCategory[category].forEach((instrument) => {
          const option = document.createElement("option");
          option.value = `GM: ${instrument.name}`;
          option.textContent = instrument.name;
          if (trackAnalysis?.hasGlissando) {
            option.disabled = true;
            option.textContent += " (not suitable for glissando)";
          }
          categoryGroup.appendChild(option);
        });
        synthSelect.appendChild(categoryGroup);
      });
      synthSelectors.push(synthSelect);
      synthSelectorItem.append(synthLabel, synthSelect);
      instrumentsContainer.appendChild(synthSelectorItem);
    });
    leftColumn.appendChild(instrumentsContainer);
    const rightColumn = document.createElement("div");
    rightColumn.style.cssText = `
        display: flex;
        flex-direction: column;
        min-width: 120px;
        max-width: 150px;
        box-sizing: border-box;
        gap: 16px;
    `;
    rightColumn.classList.add("jmon-music-player-right");
    const bpmContainer = document.createElement("div");
    bpmContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    `;
    const bpmLabel = document.createElement("label");
    bpmLabel.textContent = "Tempo";
    bpmLabel.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 16px;
        font-weight: normal;
        margin-bottom: 8px;
        color: ${colors.text};
    `;
    const bpmInput = document.createElement("input");
    bpmInput.type = "number";
    bpmInput.min = 60;
    bpmInput.max = 240;
    bpmInput.value = tempo;
    bpmInput.style.cssText = `
        padding: 4px;
        border: 1px solid ${colors.secondary};
        border-radius: 4px;
        background-color: ${colors.background};
        color: ${colors.text};
        font-size: 12px;
        text-align: center;
        width: 100%;
        height: 28px;
        box-sizing: border-box;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        margin: 0;
        outline: none;
    `;
    bpmContainer.append(bpmLabel, bpmInput);
    const verticalDownloads = document.createElement("div");
    verticalDownloads.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
    `;
    verticalDownloads.classList.add("jmon-music-player-vertical-downloads");
    const downloadMIDIButtonVertical = document.createElement("button");
    downloadMIDIButtonVertical.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-keyboard-music" style="margin-right: 8px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h4"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M2 12h20"/><path d="M6 12v4"/><path d="M10 12v4"/><path d="M14 12v4"/><path d="M18 12v4"/></svg><span>MIDI</span>`;
    downloadMIDIButtonVertical.style.cssText = `
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        box-sizing: border-box;
    `;
    downloadMIDIButtonVertical.classList.add("jmon-music-player-btn-vertical");
    const downloadWavButtonVertical = document.createElement("button");
    downloadWavButtonVertical.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-audio-lines" style="margin-right: 8px;"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg><span>WAV</span>`;
    downloadWavButtonVertical.style.cssText = `
        padding: 12px 16px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        box-sizing: border-box;
    `;
    downloadWavButtonVertical.classList.add("jmon-music-player-btn-vertical");
    verticalDownloads.append(
      downloadMIDIButtonVertical,
      downloadWavButtonVertical
    );
    verticalDownloads.style.display = "none";
    rightColumn.append(bpmContainer, verticalDownloads);
    const timelineContainer = document.createElement("div");
    timelineContainer.style.cssText = `
        position: relative;
        width: 100%;
        margin: ${TIMELINE_CONFIG.MARGIN};
        display: flex;
        align-items: center;
        gap: ${TIMELINE_CONFIG.GAP}px;
        min-width: 0;
        box-sizing: border-box;
    `;
    timelineContainer.classList.add("jmon-music-player-timeline");
    const currentTime = document.createElement("div");
    currentTime.textContent = "0:00";
    currentTime.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        color: ${colors.text};
        min-width: 40px;
        text-align: center;
    `;
    const totalTime = document.createElement("div");
    totalTime.textContent = "0:00";
    totalTime.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        color: ${colors.text};
        min-width: 40px;
        text-align: center;
    `;
    const timeline = document.createElement("input");
    timeline.type = "range";
    timeline.min = 0;
    timeline.max = 100;
    timeline.value = 0;
    timeline.style.cssText = `
        flex-grow: 1;
        -webkit-appearance: none;
        background: ${colors.secondary};
        outline: none;
        border-radius: 15px;
        overflow: visible;
        height: 8px;
    `;
    const timelineStyle = document.createElement("style");
    timelineStyle.textContent = `
        input[type="range"].jmon-timeline-slider {
            background: ${colors.secondary} !important;
            border: 1px solid ${colors.border} !important;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        input[type="range"].jmon-timeline-slider::-webkit-slider-track {
            background: ${colors.secondary} !important;
            height: 8px !important;
            border-radius: 15px !important;
            border: 1px solid ${colors.border} !important;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        input[type="range"].jmon-timeline-slider::-moz-range-track {
            background: ${colors.secondary} !important;
            height: 8px !important;
            border-radius: 15px !important;
            border: 1px solid ${colors.border} !important;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1) !important;
        }
        input[type="range"].jmon-timeline-slider::-webkit-slider-thumb {
            -webkit-appearance: none !important;
            appearance: none !important;
            height: 20px !important;
            width: 20px !important;
            border-radius: 50% !important;
            background: ${colors.primary} !important;
            cursor: pointer !important;
            border: 2px solid ${colors.background} !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
        input[type="range"].jmon-timeline-slider::-moz-range-thumb {
            height: 20px !important;
            width: 20px !important;
            border-radius: 50% !important;
            background: ${colors.primary} !important;
            cursor: pointer !important;
            border: 2px solid ${colors.background} !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
        }
    `;
    document.head.appendChild(timelineStyle);
    timeline.classList.add("jmon-timeline-slider");
    const playButton = document.createElement("button");
    playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
    playButton.style.cssText = `
        width: 40px;
        height: 40px;
        min-width: 40px;
        max-width: 40px;
        padding: 8px;
        border: none;
        border-radius: 50%;
        background-color: ${colors.primary};
        color: ${colors.background};
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px 5px 0px 10px;
        box-sizing: border-box;
        flex-shrink: 0;
    `;
    playButton.classList.add("jmon-music-player-play");
    const stopButton = document.createElement("button");
    stopButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
    stopButton.style.cssText = `
        width: 40px;
        height: 40px;
        min-width: 40px;
        max-width: 40px;
        padding: 8px;
        border: none;
        border-radius: 8px;
        background-color: ${colors.secondary};
        color: ${colors.text};
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px 5px 0px 0px;
        box-sizing: border-box;
        flex-shrink: 0;
    `;
    stopButton.classList.add("jmon-music-player-stop");
    const timeDisplay = document.createElement("div");
    timeDisplay.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: ${colors.lightText};
        margin: 0px 0px 0px 10px;
    `;
    const controlsContainer = document.createElement("div");
    controlsContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0px;
    `;
    controlsContainer.append(playButton, stopButton);
    timelineContainer.append(currentTime, timeline, totalTime, controlsContainer);
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        gap: 10px;
        min-width: 0;
        box-sizing: border-box;
    `;
    buttonContainer.classList.add("jmon-music-player-downloads");
    const downloadMIDIButton = document.createElement("button");
    downloadMIDIButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-keyboard-music" style="margin-right: 5px;"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h4"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M2 12h20"/><path d="M6 12v4"/><path d="M10 12v4"/><path d="M14 12v4"/><path d="M18 12v4"/></svg><span>MIDI</span>`;
    downloadMIDIButton.style.cssText = `
        padding: 15px 30px;
        margin: 0 5px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        min-width: 0;
        box-sizing: border-box;
    `;
    downloadMIDIButton.classList.add("jmon-music-player-btn");
    const downloadWavButton = document.createElement("button");
    downloadWavButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-audio-lines" style="margin-right: 5px;"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg><span>WAV</span>`;
    downloadWavButton.style.cssText = `
        padding: 15px 30px;
        margin: 0 5px;
        border: none;
        border-radius: 8px;
        background-color: #333333;
        color: white;
        font-family: 'PT Sans', sans-serif;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        min-width: 0;
        box-sizing: border-box;
    `;
    downloadWavButton.classList.add("jmon-music-player-btn");
    buttonContainer.append(downloadMIDIButton, downloadWavButton);
    topContainer.append(leftColumn, rightColumn);
    mainLayout.appendChild(topContainer);
    mainLayout.appendChild(timelineContainer);
    container.append(mainLayout, buttonContainer);
    let Tone2, isPlaying = false, synths = [], parts = [];
    let samplerLoadPromises = [];
    let graphInstruments = null;
    const originalTracksSource = composition.tracks || [];
    const buildAudioGraphInstruments = () => {
      if (!Tone2)
        return null;
      if (!composition.audioGraph || !Array.isArray(composition.audioGraph)) {
        return null;
      }
      const map = {};
      const normalizeUrlsToNoteNames = (urls) => {
        const out = {};
        Object.entries(urls || {}).forEach(([k, v]) => {
          let noteKey = k;
          if (typeof k === "number" || /^\d+$/.test(String(k))) {
            try {
              noteKey = Tone2.Frequency(parseInt(k, 10), "midi").toNote();
            } catch (e) {
            }
          }
          out[noteKey] = v;
        });
        return out;
      };
      try {
        composition.audioGraph.forEach((node) => {
          const { id, type, options: options2 = {}, target } = node;
          if (!id || !type)
            return;
          let instrument = null;
          if (type === "Sampler") {
            const normalizedUrls = normalizeUrlsToNoteNames(options2.urls);
            let resolveLoaded, rejectLoaded;
            const loadPromise = new Promise((res, rej) => {
              resolveLoaded = res;
              rejectLoaded = rej;
            });
            const samplerOpts = {
              urls: normalizedUrls,
              onload: () => resolveLoaded && resolveLoaded(),
              onerror: (e) => {
                console.error(`[PLAYER] Sampler load error for ${id}:`, e);
                rejectLoaded && rejectLoaded(e);
              }
            };
            if (options2.baseUrl)
              samplerOpts.baseUrl = options2.baseUrl;
            try {
              console.log(
                `[PLAYER] Building Sampler ${id} with urls:`,
                normalizedUrls,
                "baseUrl:",
                samplerOpts.baseUrl || "(none)"
              );
              instrument = new Tone2.Sampler(samplerOpts);
            } catch (e) {
              console.error("[PLAYER] Failed to create Sampler:", e);
              instrument = null;
            }
            samplerLoadPromises.push(loadPromise);
            if (instrument && options2.envelope && options2.envelope.enabled) {
              if (typeof options2.envelope.attack === "number") {
                instrument.attack = options2.envelope.attack;
              }
              if (typeof options2.envelope.release === "number") {
                instrument.release = options2.envelope.release;
              }
            }
          } else if (SYNTHESIZER_TYPES.includes(type)) {
            try {
              instrument = new Tone2[type](options2);
            } catch (e) {
              console.warn(
                `[PLAYER] Failed to create ${type} from audioGraph, using PolySynth:`,
                e
              );
              instrument = new Tone2.PolySynth();
            }
          } else if (ALL_EFFECTS.includes(type)) {
            try {
              instrument = new Tone2[type](options2);
              console.log(
                `[PLAYER] Created effect ${id} (${type}) with options:`,
                options2
              );
            } catch (e) {
              console.warn(`[PLAYER] Failed to create ${type} effect:`, e);
              instrument = null;
            }
          } else if (type === "Destination") {
            map[id] = Tone2.Destination;
          }
          if (instrument) {
            map[id] = instrument;
          }
        });
        if (Object.keys(map).length > 0) {
          composition.audioGraph.forEach((node) => {
            const { id, target } = node;
            if (!id || !map[id])
              return;
            const currentNode = map[id];
            if (currentNode === Tone2.Destination)
              return;
            if (target && map[target]) {
              try {
                if (map[target] === Tone2.Destination) {
                  currentNode.toDestination();
                  console.log(`[PLAYER] Connected ${id} -> Destination`);
                } else {
                  currentNode.connect(map[target]);
                  console.log(`[PLAYER] Connected ${id} -> ${target}`);
                }
              } catch (e) {
                console.warn(`[PLAYER] Failed to connect ${id} -> ${target}:`, e);
                currentNode.toDestination();
              }
            } else {
              currentNode.toDestination();
              console.log(
                `[PLAYER] Connected ${id} -> Destination (no target specified)`
              );
            }
          });
        }
        return map;
      } catch (e) {
        console.error("[PLAYER] Failed building audioGraph instruments:", e);
        return null;
      }
    };
    const isIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    };
    const formatTime = (seconds) => {
      return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
    };
    totalTime.textContent = formatTime(totalDuration);
    const initializeTone = async () => {
      if (typeof window !== "undefined") {
        const existingTone = externalTone || window.Tone || (typeof Tone2 !== "undefined" ? Tone2 : null);
        if (!existingTone) {
          try {
            if (typeof __require !== "undefined") {
              console.log("[PLAYER] Loading Tone.js via require()...");
              const ToneFromRequire = await __require("tone@14.8.49/build/Tone.js");
              window.Tone = ToneFromRequire.default || ToneFromRequire.Tone || ToneFromRequire;
            } else {
              console.log("[PLAYER] Loading Tone.js via import()...");
              const ToneModule = await import("https://esm.sh/tone@14.8.49");
              window.Tone = ToneModule.default || ToneModule.Tone || ToneModule;
            }
            if (!window.Tone || typeof window.Tone !== "object" || !window.Tone.PolySynth) {
              console.warn(
                "[PLAYER] First load attempt failed, trying alternative CDN..."
              );
              try {
                const ToneAlt = await import("https://cdn.skypack.dev/tone@14.8.49");
                window.Tone = ToneAlt.default || ToneAlt.Tone || ToneAlt;
                if (!window.Tone || !window.Tone.PolySynth) {
                  throw new Error("Alternative CDN also failed");
                }
              } catch (altError) {
                console.warn(
                  "[PLAYER] Alternative CDN failed, trying jsdelivr..."
                );
                try {
                  const ToneJsdelivr = await import("https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js");
                  window.Tone = ToneJsdelivr.default || ToneJsdelivr.Tone || ToneJsdelivr;
                  if (!window.Tone || !window.Tone.PolySynth) {
                    throw new Error("All CDN attempts failed");
                  }
                } catch (jsdelivrError) {
                  throw new Error(
                    "Loaded Tone.js but got invalid object from all CDNs"
                  );
                }
              }
            }
            console.log(
              "[PLAYER] Tone.js loaded successfully, version:",
              window.Tone.version || "unknown"
            );
          } catch (error) {
            console.warn("Could not auto-load Tone.js:", error.message);
            console.log(
              "To use the player, load Tone.js manually first using one of these methods:"
            );
            console.log(
              'Method 1: Tone = await require("tone@14.8.49/build/Tone.js")'
            );
            console.log(
              'Method 2: Tone = await import("https://esm.sh/tone@14.8.49").then(m => m.default)'
            );
            console.log(
              'Method 3: Tone = await import("https://cdn.skypack.dev/tone@14.8.49").then(m => m.default)'
            );
            return false;
          }
        } else {
          console.log(
            "[PLAYER] Using existing Tone.js, version:",
            existingTone.version || "unknown"
          );
          window.Tone = existingTone;
        }
        const toneInstance = window.Tone || existingTone;
        if (toneInstance) {
          Tone2 = toneInstance;
          console.log("[PLAYER] Available Tone constructors:", {
            PolySynth: typeof Tone2.PolySynth,
            Synth: typeof Tone2.Synth,
            Part: typeof Tone2.Part,
            Transport: typeof Tone2.Transport,
            start: typeof Tone2.start,
            context: !!Tone2.context
          });
          console.log(
            "[PLAYER] Tone.js initialized, context state:",
            Tone2.context ? Tone2.context.state : "no context"
          );
          if (isIOS()) {
            console.log(
              "[PLAYER] iOS device detected - audio context will start on user interaction"
            );
          }
          return true;
        }
      }
      console.warn("Tone.js not available");
      return false;
    };
    const setupAudio = () => {
      if (!Tone2) {
        console.warn("[PLAYER] Tone.js not available, cannot setup audio");
        return;
      }
      const missingConstructors = [];
      if (!Tone2.PolySynth)
        missingConstructors.push("PolySynth");
      if (!Tone2.Synth)
        missingConstructors.push("Synth");
      if (!Tone2.Part)
        missingConstructors.push("Part");
      if (!Tone2.Transport)
        missingConstructors.push("Transport");
      if (missingConstructors.length > 0) {
        console.error(
          "[PLAYER] Tone.js is missing required constructors:",
          missingConstructors
        );
        console.error(
          "[PLAYER] Available Tone properties:",
          Object.keys(Tone2).filter((k) => typeof Tone2[k] === "function").slice(0, 20)
        );
        console.error("[PLAYER] Tone object:", Tone2);
        console.error(
          "[PLAYER] This usually means Tone.js did not load correctly. Try refreshing the page or loading Tone.js manually."
        );
        return;
      }
      Tone2.Transport.bpm.value = metadata.tempo;
      console.log(
        `[PLAYER] Set Transport BPM to ${metadata.tempo} before building instruments`
      );
      if (!graphInstruments) {
        graphInstruments = buildAudioGraphInstruments();
        if (graphInstruments) {
          const samplerIds = Object.keys(graphInstruments).filter(
            (k) => graphInstruments[k] && graphInstruments[k].name === "Sampler"
          );
          if (samplerIds.length > 0) {
            console.log(
              "[PLAYER] Using audioGraph Samplers for tracks with synthRef:",
              samplerIds
            );
          }
        }
      }
      console.log("[PLAYER] Cleaning up existing audio...", {
        synths: synths.length,
        parts: parts.length
      });
      Tone2.Transport.stop();
      Tone2.Transport.position = 0;
      parts.forEach((p, index) => {
        try {
          p.stop();
        } catch (e) {
          console.warn(`[PLAYER] Failed to stop part ${index}:`, e);
        }
      });
      parts.forEach((p, index) => {
        try {
          p.dispose();
        } catch (e) {
          console.warn(`[PLAYER] Failed to dispose part ${index}:`, e);
        }
      });
      synths.forEach((s, index) => {
        if (!graphInstruments || !Object.values(graphInstruments).includes(s)) {
          try {
            if (s.disconnect && typeof s.disconnect === "function") {
              s.disconnect();
            }
            s.dispose();
          } catch (e) {
            console.warn(`[PLAYER] Failed to dispose synth ${index}:`, e);
          }
        }
      });
      synths = [];
      parts = [];
      console.log("[PLAYER] Audio cleanup completed");
      console.log("[PLAYER] Converted tracks:", convertedTracks.length);
      convertedTracks.forEach((trackConfig) => {
        const {
          originalTrackIndex,
          voiceIndex,
          totalVoices,
          trackInfo,
          synthConfig,
          partEvents
        } = trackConfig;
        const originalTrack = originalTracksSource[originalTrackIndex] || {};
        const synthRef = originalTrack.synthRef;
        const secPerBeat = 60 / metadata.tempo;
        const normalizedEvents = (partEvents || []).map((ev) => {
          const time = typeof ev.time === "number" ? ev.time * secPerBeat : ev.time;
          const duration = typeof ev.duration === "number" ? ev.duration * secPerBeat : ev.duration;
          return { ...ev, time, duration };
        });
        let synth = null;
        if (synthRef && graphInstruments && graphInstruments[synthRef]) {
          synth = graphInstruments[synthRef];
        } else {
          const selectedSynth = synthSelectors[originalTrackIndex] ? synthSelectors[originalTrackIndex].value : synthConfig.type;
          try {
            if (selectedSynth.startsWith("AudioGraph: ")) {
              const audioGraphId = selectedSynth.substring(12);
              if (graphInstruments && graphInstruments[audioGraphId]) {
                synth = graphInstruments[audioGraphId];
                console.log(
                  `[PLAYER] Using audioGraph instrument: ${audioGraphId}`
                );
              } else {
                throw new Error(
                  `AudioGraph instrument ${audioGraphId} not found`
                );
              }
            } else if (selectedSynth.startsWith("GM: ")) {
              const instrumentName = selectedSynth.substring(4);
              const gmInstrument = gmInstruments.find(
                (inst) => inst.name === instrumentName
              );
              if (gmInstrument) {
                console.log(`[PLAYER] Loading GM instrument: ${instrumentName}`);
                const samplerUrls = generateSamplerUrls(
                  gmInstrument.program,
                  CDN_SOURCES[0],
                  [36, 84],
                  "balanced"
                );
                console.log(
                  `[PLAYER] Loading GM instrument ${instrumentName} with ${Object.keys(samplerUrls).length} samples`
                );
                console.log(
                  `[PLAYER] Sample notes:`,
                  Object.keys(samplerUrls).sort()
                );
                synth = new Tone2.Sampler({
                  urls: samplerUrls,
                  onload: () => console.log(
                    `[PLAYER] GM instrument ${instrumentName} loaded successfully`
                  ),
                  onerror: (error) => {
                    console.error(
                      `[PLAYER] Failed to load GM instrument ${instrumentName}:`,
                      error
                    );
                  }
                }).toDestination();
              } else {
                throw new Error(`GM instrument ${instrumentName} not found`);
              }
            } else {
              const synthType = synthConfig.reason === "glissando_compatibility" ? synthConfig.type : selectedSynth;
              if (!Tone2[synthType] || typeof Tone2[synthType] !== "function") {
                throw new Error(`Tone.${synthType} is not a constructor`);
              }
              synth = new Tone2[synthType]().toDestination();
              if (synthConfig.reason === "glissando_compatibility" && voiceIndex === 0) {
                console.warn(
                  `[MULTIVOICE] Using ${synthType} instead of ${synthConfig.original} for glissando in ${trackInfo.label}`
                );
              }
            }
          } catch (error) {
            console.warn(
              `Failed to create ${selectedSynth}, using PolySynth:`,
              error
            );
            try {
              if (!Tone2.PolySynth || typeof Tone2.PolySynth !== "function") {
                throw new Error("Tone.PolySynth is not available");
              }
              synth = new Tone2.PolySynth().toDestination();
            } catch (fallbackError) {
              console.error(
                "Fatal: Cannot create any synth, Tone.js may not be properly loaded:",
                fallbackError
              );
              return;
            }
          }
        }
        synths.push(synth);
        if (totalVoices > 1) {
          console.log(
            `[MULTIVOICE] Track "${trackInfo.label}" voice ${voiceIndex + 1}: ${partEvents.length} notes`
          );
        }
        const part = new Tone2.Part((time, note) => {
          if (Array.isArray(note.pitch)) {
            note.pitch.forEach((n) => {
              let noteName = "C4";
              if (typeof n === "number") {
                noteName = Tone2.Frequency(n, "midi").toNote();
              } else if (typeof n === "string") {
                noteName = n;
              } else if (Array.isArray(n) && typeof n[0] === "string") {
                noteName = n[0];
              }
              synth.triggerAttackRelease(noteName, note.duration, time);
            });
          } else if (Array.isArray(note.modulations) && note.modulations.some(
            (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento") && (m.to !== void 0 || m.target !== void 0)
          )) {
            let noteName = typeof note.pitch === "number" ? Tone2.Frequency(note.pitch, "midi").toNote() : note.pitch;
            const gliss = note.modulations.find(
              (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento") && (m.to !== void 0 || m.target !== void 0)
            );
            const glissTarget = gliss && (gliss.to !== void 0 ? gliss.to : gliss.target);
            let targetName = typeof glissTarget === "number" ? Tone2.Frequency(glissTarget, "midi").toNote() : glissTarget;
            console.log("[PLAYER] Glissando", {
              fromNote: noteName,
              toNote: targetName,
              duration: note.duration,
              time
            });
            console.log(
              "[PLAYER] Glissando effect starting from",
              noteName,
              "to",
              targetName
            );
            synth.triggerAttack(noteName, time, note.velocity || 0.8);
            const startFreq = Tone2.Frequency(noteName).toFrequency();
            const endFreq = Tone2.Frequency(targetName).toFrequency();
            const totalCents = 1200 * Math.log2(endFreq / startFreq);
            if (synth.detune && synth.detune.setValueAtTime && synth.detune.linearRampToValueAtTime) {
              synth.detune.setValueAtTime(0, time);
              synth.detune.linearRampToValueAtTime(
                totalCents,
                time + note.duration
              );
              console.log(
                "[PLAYER] Applied detune glissando:",
                totalCents,
                "cents over",
                note.duration,
                "beats"
              );
            } else {
              const startMidi = Tone2.Frequency(noteName).toMidi();
              const endMidi = Tone2.Frequency(targetName).toMidi();
              const steps = Math.max(3, Math.abs(endMidi - startMidi));
              const stepDuration = note.duration / steps;
              for (let i = 1; i < steps; i++) {
                const ratio = i / (steps - 1);
                const currentFreq = startFreq * Math.pow(endFreq / startFreq, ratio);
                const currentNote = Tone2.Frequency(currentFreq).toNote();
                const currentTime2 = time + i * stepDuration;
                synth.triggerAttackRelease(
                  currentNote,
                  stepDuration * 0.8,
                  currentTime2,
                  (note.velocity || 0.8) * 0.7
                );
              }
              console.log(
                "[PLAYER] Applied chromatic glissando with",
                steps,
                "steps"
              );
            }
            synth.triggerRelease(time + note.duration);
          } else {
            let noteName = "C4";
            if (typeof note.pitch === "number") {
              noteName = Tone2.Frequency(note.pitch, "midi").toNote();
            } else if (typeof note.pitch === "string") {
              noteName = note.pitch;
            } else if (Array.isArray(note.pitch) && typeof note.pitch[0] === "string") {
              noteName = note.pitch[0];
            }
            let noteDuration = note.duration;
            let noteVelocity = note.velocity || 0.8;
            const mods = Array.isArray(note.modulations) ? note.modulations : [];
            const durScale = mods.find(
              (m) => m.type === "durationScale" && typeof m.factor === "number"
            );
            if (durScale) {
              noteDuration = note.duration * durScale.factor;
            }
            const velBoost = mods.find(
              (m) => m.type === "velocityBoost" && typeof m.amountBoost === "number"
            );
            if (velBoost) {
              noteVelocity = Math.min(noteVelocity + velBoost.amountBoost, 1);
            }
            synth.triggerAttackRelease(
              noteName,
              noteDuration,
              time,
              noteVelocity
            );
          }
        }, normalizedEvents);
        parts.push(part);
      });
      Tone2.Transport.loopEnd = totalDuration;
      Tone2.Transport.loop = true;
      Tone2.Transport.stop();
      Tone2.Transport.position = 0;
      totalTime.textContent = formatTime(totalDuration);
    };
    let lastTimelineUpdate = 0;
    const TIMELINE_UPDATE_INTERVAL = TIMELINE_CONFIG.UPDATE_INTERVAL;
    const updateTimeline = () => {
      const now = performance.now();
      const shouldUpdate = now - lastTimelineUpdate >= TIMELINE_UPDATE_INTERVAL;
      if (Tone2 && isPlaying) {
        const loopSeconds = typeof Tone2.Transport.loopEnd === "number" ? Tone2.Transport.loopEnd : Tone2.Time(Tone2.Transport.loopEnd).toSeconds();
        if (shouldUpdate) {
          const elapsed = Tone2.Transport.seconds % loopSeconds;
          const progress = elapsed / loopSeconds * 100;
          timeline.value = Math.min(progress, 100);
          currentTime.textContent = formatTime(elapsed);
          totalTime.textContent = formatTime(loopSeconds);
          lastTimelineUpdate = now;
        }
        if (Tone2.Transport.state === "started" && isPlaying) {
          requestAnimationFrame(updateTimeline);
        } else if (Tone2.Transport.state === "stopped" || Tone2.Transport.state === "paused") {
          if (shouldUpdate) {
            const elapsed = Tone2.Transport.seconds % loopSeconds;
            const progress = elapsed / loopSeconds * 100;
            timeline.value = Math.min(progress, 100);
            currentTime.textContent = formatTime(elapsed);
            lastTimelineUpdate = now;
          }
          if (Tone2.Transport.state === "stopped") {
            Tone2.Transport.seconds = 0;
            timeline.value = 0;
            currentTime.textContent = formatTime(0);
            isPlaying = false;
            playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
          }
        }
      }
    };
    playButton.addEventListener("click", async () => {
      if (!Tone2) {
        if (await initializeTone()) {
          setupAudio();
        } else {
          console.error("[PLAYER] Failed to initialize Tone.js");
          return;
        }
      }
      if (isPlaying) {
        console.log("[PLAYER] Pausing playback...");
        Tone2.Transport.pause();
        isPlaying = false;
        playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
        console.log("[PLAYER] Playback paused");
      } else {
        if (!Tone2.context || Tone2.context.state !== "running") {
          try {
            await Tone2.start();
            console.log(
              "[PLAYER] Audio context started:",
              Tone2.context ? Tone2.context.state : "unknown"
            );
            if (Tone2.context && typeof Tone2.context.resume === "function") {
              await Tone2.context.resume();
              console.log("[PLAYER] Audio context resumed for iOS compatibility");
            }
          } catch (error) {
            console.error("[PLAYER] Failed to start audio context:", error);
            let errorMsg = "Failed to start audio. ";
            if (isIOS()) {
              errorMsg += "On iOS, please ensure your device isn't in silent mode and try again.";
            } else {
              errorMsg += "Please check your audio settings and try again.";
            }
            alert(errorMsg);
            return;
          }
        }
        if (synths.length === 0) {
          console.log("[PLAYER] No synths found, setting up audio...");
          setupAudio();
        }
        if (Tone2.Transport.state !== "paused") {
          Tone2.Transport.stop();
          Tone2.Transport.position = 0;
          console.log("[PLAYER] Starting from beginning");
        } else {
          console.log("[PLAYER] Resuming from paused position");
        }
        console.log(
          "[PLAYER] Transport state before start:",
          Tone2.Transport.state
        );
        console.log(
          "[PLAYER] Transport position reset to:",
          Tone2.Transport.position
        );
        console.log(
          "[PLAYER] Audio context state:",
          Tone2.context ? Tone2.context.state : "unknown"
        );
        console.log("[PLAYER] Parts count:", parts.length);
        console.log("[PLAYER] Synths count:", synths.length);
        if (graphInstruments) {
          const samplers = Object.values(graphInstruments).filter(
            (inst) => inst && inst.name === "Sampler"
          );
          if (samplers.length > 0 && samplerLoadPromises.length > 0) {
            console.log(
              `[PLAYER] Waiting for ${samplers.length} sampler(s) to load...`
            );
            try {
              await Promise.all(samplerLoadPromises);
              console.log("[PLAYER] All samplers loaded.");
            } catch (e) {
              console.warn("[PLAYER] Sampler load wait error:", e);
              return;
            }
          }
        }
        if (parts.length === 0) {
          console.error(
            "[PLAYER] No parts available to start. This usually means setupAudio() failed."
          );
          console.error(
            "[PLAYER] Try refreshing the page or check if Tone.js is properly loaded."
          );
          return;
        }
        if (Tone2.Transport.state !== "paused") {
          parts.forEach((part, index) => {
            if (!part || typeof part.start !== "function") {
              console.error(`[PLAYER] Part ${index} is invalid:`, part);
              return;
            }
            try {
              part.start(0);
            } catch (error) {
              console.error(`[PLAYER] Failed to start part ${index}:`, error);
            }
          });
        }
        Tone2.Transport.start();
        isPlaying = true;
        playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-pause"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>`;
        updateTimeline();
      }
    });
    stopButton.addEventListener("click", async () => {
      if (!Tone2) {
        return;
      }
      console.log("[PLAYER] Stopping playback completely...");
      Tone2.Transport.stop();
      Tone2.Transport.cancel();
      Tone2.Transport.position = 0;
      parts.forEach((part, index) => {
        try {
          part.stop();
        } catch (e) {
          console.warn(
            `[PLAYER] Failed to stop part ${index} during complete stop:`,
            e
          );
        }
      });
      isPlaying = false;
      timeline.value = 0;
      currentTime.textContent = formatTime(0);
      playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
      console.log("[PLAYER] Playback stopped completely");
    });
    timeline.addEventListener("input", () => {
      if (Tone2 && totalDuration > 0) {
        const time = timeline.value / 100 * totalDuration;
        const wasPlaying = isPlaying;
        if (wasPlaying) {
          Tone2.Transport.pause();
        }
        Tone2.Transport.seconds = time;
        currentTime.textContent = formatTime(time);
        if (wasPlaying) {
          setTimeout(() => {
            Tone2.Transport.start();
          }, 50);
        }
      }
    });
    bpmInput.addEventListener("change", () => {
      const newTempo = parseInt(bpmInput.value);
      if (Tone2 && newTempo >= 60 && newTempo <= 240) {
        console.log(`[PLAYER] Tempo changed to ${newTempo} BPM`);
        Tone2.Transport.bpm.value = newTempo;
        console.log(`[PLAYER] Tempo changed to ${newTempo} BPM`);
      } else {
        bpmInput.value = Tone2 ? Tone2.Transport.bpm.value : tempo;
      }
    });
    synthSelectors.forEach((select) => {
      select.addEventListener("change", () => {
        if (Tone2 && synths.length > 0) {
          console.log(
            "[PLAYER] Synthesizer selection changed, reinitializing audio..."
          );
          const wasPlaying = isPlaying;
          if (isPlaying) {
            Tone2.Transport.stop();
            isPlaying = false;
          }
          setupAudio();
          if (wasPlaying) {
            setTimeout(() => {
              Tone2.Transport.start();
              isPlaying = true;
              playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-pause"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>`;
            }, 100);
          } else {
            playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
          }
        }
      });
    });
    const handleMIDIDownload = async () => {
      try {
        const { midi: midi2 } = await Promise.resolve().then(() => (init_converters(), converters_exports));
        const midiData = midi2(composition);
        let ToneMidi;
        if (typeof __require !== "undefined") {
          ToneMidi = await __require("https://esm.sh/@tonejs/midi@2.0.28");
        } else {
          const module = await import("https://esm.sh/@tonejs/midi@2.0.28");
          ToneMidi = module.default || module;
        }
        const midiFile = new ToneMidi.Midi();
        midiFile.header.setTempo(midiData.header.bpm);
        midiData.tracks.forEach((trackData) => {
          const track = midiFile.addTrack();
          track.name = trackData.label || "Track";
          trackData.notes.forEach((note) => {
            track.addNote({
              midi: typeof note.pitch === "number" ? note.pitch : 60,
              time: note.time || 0,
              duration: note.duration || 0.5,
              velocity: note.velocity || 0.8
            });
          });
        });
        const blob = new Blob([midiFile.toArray()], { type: "audio/midi" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${composition.metadata?.title || "composition"}.mid`;
        a.click();
        URL.revokeObjectURL(url);
        console.log("\u2713 MIDI download complete");
      } catch (error) {
        console.error("MIDI download error:", error);
        alert("Failed to download MIDI: " + error.message);
      }
    };
    const handleWavDownload = async () => {
      try {
        const ToneLib = window.Tone;
        if (!ToneLib || !ToneLib.Offline) {
          alert(
            "Tone.js not loaded - cannot generate WAV. Try playing the composition first."
          );
          return;
        }
        console.log("Rendering WAV offline...");
        const buffer = await ToneLib.Offline(async ({ transport }) => {
          transport.bpm.value = metadata.tempo;
          const offlineSynths = [];
          convertedTracks.forEach((trackConfig) => {
            const { originalTrackIndex, partEvents } = trackConfig;
            const originalTrack = originalTracksSource[originalTrackIndex] || {};
            const synthRef = originalTrack.synthRef;
            let synth = null;
            if (synthRef && graphInstruments && graphInstruments[synthRef]) {
              synth = graphInstruments[synthRef];
            } else {
              const selectedSynth = synthSelectors[originalTrackIndex]?.value || "PolySynth";
              if (selectedSynth.startsWith("GM: ")) {
                synth = new ToneLib.PolySynth().toDestination();
              } else {
                try {
                  synth = new ToneLib[selectedSynth]().toDestination();
                } catch {
                  synth = new ToneLib.PolySynth().toDestination();
                }
              }
            }
            offlineSynths.push(synth);
            partEvents.forEach((note) => {
              const time = typeof note.time === "number" ? note.time * (60 / metadata.tempo) : note.time;
              const duration = typeof note.duration === "number" ? note.duration * (60 / metadata.tempo) : note.duration;
              if (Array.isArray(note.pitch)) {
                const notes = note.pitch.map(
                  (p) => typeof p === "number" ? ToneLib.Frequency(p, "midi").toNote() : p
                );
                synth.triggerAttackRelease(
                  notes,
                  duration,
                  time,
                  note.velocity || 0.8
                );
              } else {
                const noteName = typeof note.pitch === "number" ? ToneLib.Frequency(note.pitch, "midi").toNote() : note.pitch;
                synth.triggerAttackRelease(
                  noteName,
                  duration,
                  time,
                  note.velocity || 0.8
                );
              }
            });
          });
          transport.start(0);
        }, totalDuration + 1);
        const wavBlob = await audioBufferToWav(buffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${composition.metadata?.title || "composition"}.wav`;
        a.click();
        URL.revokeObjectURL(url);
        console.log("\u2713 WAV download complete");
      } catch (error) {
        console.error("WAV download error:", error);
        alert("Failed to download WAV: " + error.message);
      }
    };
    function audioBufferToWav(buffer) {
      const numberOfChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const length = buffer.length * numberOfChannels * 2;
      const arrayBuffer = new ArrayBuffer(44 + length);
      const view = new DataView(arrayBuffer);
      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + length, true);
      writeString(view, 8, "WAVE");
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, "data");
      view.setUint32(40, length, true);
      let offset = 44;
      for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(
            -1,
            Math.min(1, buffer.getChannelData(channel)[i])
          );
          view.setInt16(offset, sample * 32767, true);
          offset += 2;
        }
      }
      return new Blob([arrayBuffer], { type: "audio/wav" });
    }
    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
    downloadMIDIButton.addEventListener("click", handleMIDIDownload);
    downloadWavButton.addEventListener("click", handleWavDownload);
    downloadMIDIButtonVertical.addEventListener("click", handleMIDIDownload);
    downloadWavButtonVertical.addEventListener("click", handleWavDownload);
    const initialTone = typeof window !== "undefined" && window.Tone || (typeof Tone2 !== "undefined" ? Tone2 : null);
    if (initialTone || preloadTone) {
      initializeTone().then(() => {
        setupAudio();
        if (autoplay) {
          setTimeout(() => {
            playButton.click();
          }, 500);
        }
      });
    }
    if (autoplay && !initialTone && !preloadTone) {
      const autoplayInterval = setInterval(() => {
        const currentTone = typeof window !== "undefined" && window.Tone || (typeof Tone2 !== "undefined" ? Tone2 : null);
        if (currentTone) {
          clearInterval(autoplayInterval);
          setTimeout(() => {
            playButton.click();
          }, 500);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(autoplayInterval);
      }, 1e4);
    }
    return container;
  }

  // src/index.js
  init_converters();
  var GM_INSTRUMENTS2;
  var createGMInstrumentNode2;
  var findGMProgramByName2;
  var generateSamplerUrls2;
  var getPopularInstruments2;
  async function __loadGmInstruments() {
    if (!GM_INSTRUMENTS2 && !createGMInstrumentNode2) {
      const gm = await Promise.resolve().then(() => (init_gm_instruments(), gm_instruments_exports));
      GM_INSTRUMENTS2 = gm.GM_INSTRUMENTS;
      createGMInstrumentNode2 = gm.createGMInstrumentNode;
      findGMProgramByName2 = gm.findGMProgramByName;
      generateSamplerUrls2 = gm.generateSamplerUrls;
      getPopularInstruments2 = gm.getPopularInstruments;
    }
    return {
      GM_INSTRUMENTS: GM_INSTRUMENTS2,
      createGMInstrumentNode: createGMInstrumentNode2,
      findGMProgramByName: findGMProgramByName2,
      generateSamplerUrls: generateSamplerUrls2,
      getPopularInstruments: getPopularInstruments2
    };
  }
  function validateJmon(obj) {
    const validator = new JmonValidator();
    return validator.validateAndNormalize(obj);
  }
  function render(jmonObj, options = {}) {
    if (!jmonObj || typeof jmonObj !== "object") {
      throw new Error("render() requires a valid JMON object");
    }
    return createPlayer(jmonObj, options);
  }
  function play(jmonObj, options = {}) {
    const playOptions = { autoplay: false, ...options };
    return createPlayer(jmonObj, playOptions);
  }
  function score(jmonObj, renderingEngine = {}, options = {}) {
    let engineType = "unknown";
    let engineInstance = null;
    if (renderingEngine && typeof renderingEngine === "string") {
      engineType = renderingEngine.toLowerCase();
    } else if (renderingEngine && (typeof renderingEngine === "object" || typeof renderingEngine === "function")) {
      if (renderingEngine.Renderer || renderingEngine.Flow || renderingEngine.VF || renderingEngine.Factory || renderingEngine.Stave || renderingEngine.StaveNote || renderingEngine.Voice || renderingEngine.Formatter || renderingEngine.Vex && (renderingEngine.Vex.Flow || renderingEngine.Vex) || // Check for common VexFlow object patterns
      renderingEngine.default && (renderingEngine.default.Renderer || renderingEngine.default.Stave || renderingEngine.default.VF)) {
        engineType = "vexflow";
        engineInstance = renderingEngine;
      }
    } else if (typeof window !== "undefined") {
      if (window.VF || window.VexFlow || window.Vex && (window.Vex.Flow || window.Vex) || window.Flow && window.Flow.Factory) {
        engineType = "vexflow";
        engineInstance = window.VF || window.VexFlow || window.Vex && (window.Vex.Flow || window.Vex) || window;
      }
    }
    if (engineType === "vexflow") {
      console.log("VexFlow engine detected, proceeding with rendering");
      const hasDocument = typeof document !== "undefined";
      let container;
      if (hasDocument) {
        container = document.createElement("div");
        const elementId = `vexflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        container.id = elementId;
        container.style.display = "block";
        container.style.position = "static";
        container.style.visibility = "visible";
        container.style.width = "fit-content";
        container.style.height = "fit-content";
        try {
          try {
            const width2 = options.width || 800;
            const height2 = options.height || 200;
            const instructions = convertToVexFlow(jmonObj, { elementId, width: width2, height: height2 });
            if (instructions && instructions.type === "vexflow" && typeof instructions.render === "function") {
              if (instructions.config) {
                instructions.config.element = container;
              }
              instructions.render(engineInstance);
              if (options.outputType) {
                const svg = container.querySelector("svg");
                if (!svg)
                  return container;
                if (options.outputType === "svg") {
                  return svg;
                } else if (options.outputType === "clonedSvg") {
                  const clonedSvg = svg.cloneNode(true);
                  clonedSvg.style.display = "block";
                  clonedSvg.style.maxWidth = "100%";
                  clonedSvg.style.height = "auto";
                  return clonedSvg;
                } else if (options.outputType === "div") {
                  return container;
                }
              }
              return container;
            }
          } catch (e) {
          }
          const VF = engineInstance || typeof window !== "undefined" && (window.VF || window.VexFlow || window.Vex && (window.Vex.Flow || window.Vex));
          if (!VF || !VF.Renderer) {
            throw new Error("VexFlow not properly loaded");
          }
          const width = options.width || 800;
          const height = options.height || 200;
          const renderer = new VF.Renderer(container, VF.Renderer.Backends.SVG);
          renderer.resize(width, height);
          const context = renderer.getContext();
          const stave = new VF.Stave(10, 40, width - 50);
          stave.addClef("treble");
          if (jmonObj.timeSignature) {
            stave.addTimeSignature(jmonObj.timeSignature);
          }
          if (jmonObj.keySignature && jmonObj.keySignature !== "C") {
            stave.addKeySignature(jmonObj.keySignature);
          }
          stave.setContext(context).draw();
          const notes = (jmonObj.notes || []).map((note) => {
            if (!note.pitch)
              return null;
            const midiToVF = (midi2) => {
              const noteNames = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
              const octave = Math.floor(midi2 / 12) - 1;
              const noteIndex = midi2 % 12;
              return noteNames[noteIndex].replace("#", "#") + "/" + octave;
            };
            const durationToVF = (duration) => {
              if (duration >= 4)
                return "w";
              if (duration >= 2)
                return "h";
              if (duration >= 1)
                return "q";
              if (duration >= 0.5)
                return "8";
              return "16";
            };
            const keys = Array.isArray(note.pitch) ? note.pitch.map(midiToVF) : [midiToVF(note.pitch)];
            return new VF.StaveNote({
              keys,
              duration: durationToVF(note.duration || 1)
            });
          }).filter(Boolean);
          if (notes.length > 0) {
            try {
              const voice = new VF.Voice({
                num_beats: 4,
                beat_value: 4
              });
              if (typeof voice.setMode === "function" && VF.Voice && VF.Voice.Mode && VF.Voice.Mode.SOFT !== void 0) {
                voice.setMode(VF.Voice.Mode.SOFT);
              } else if (typeof voice.setStrict === "function") {
                voice.setStrict(false);
              }
              if (typeof voice.addTickables === "function") {
                voice.addTickables(notes);
              }
              const formatter = new VF.Formatter();
              if (typeof formatter.joinVoices === "function" && typeof formatter.format === "function") {
                formatter.joinVoices([voice]).format([voice], width - 80);
              }
              if (typeof voice.draw === "function") {
                voice.draw(context, stave);
              }
            } catch (voiceError) {
              console.warn("VexFlow voice/formatter error:", voiceError);
              try {
                let x = 60;
                notes.forEach((n) => {
                  if (typeof n.setStave === "function")
                    n.setStave(stave);
                  if (typeof n.setContext === "function")
                    n.setContext(context);
                  if (typeof n.preFormat === "function")
                    n.preFormat();
                  if (typeof n.setX === "function")
                    n.setX(x);
                  if (typeof n.draw === "function")
                    n.draw();
                  x += 40;
                });
              } catch (manualError) {
                console.warn("Manual note drawing failed:", manualError);
              }
            }
          }
          if (options.outputType) {
            const svg = container.querySelector("svg");
            if (!svg)
              return container;
            if (options.outputType === "svg") {
              return svg;
            } else if (options.outputType === "clonedSvg") {
              const clonedSvg = svg.cloneNode(true);
              clonedSvg.style.display = "block";
              clonedSvg.style.maxWidth = "100%";
              clonedSvg.style.height = "auto";
              return clonedSvg;
            } else if (options.outputType === "div") {
              return container;
            }
          }
          return container;
        } catch (error) {
          throw new Error(`VexFlow rendering failed: ${error.message}. Please check your VexFlow instance.`);
        }
      } else {
        throw new Error("VexFlow rendering requires a DOM environment. Use jm.converters.vexflow() for data conversion.");
      }
    }
    throw new Error("Score rendering requires VexFlow. Please provide a VexFlow instance as the second parameter: jm.score(piece, vexflow)");
  }
  var jm = {
    // Core
    render,
    play,
    score,
    validate: validateJmon,
    // Converters
    converters: {
      midi,
      midiToJmon,
      tonejs,
      wav,
      supercollider,
      vexflow: convertToVexFlow
    },
    // Namespaces from algorithms
    theory: algorithms_default.theory,
    generative: algorithms_default.generative,
    analysis: algorithms_default.analysis,
    constants: algorithms_default.constants,
    audio: algorithms_default.audio,
    // Utils
    utils: {
      ...algorithms_default.utils,
      JmonValidator,
      jmon: jmon_utils_exports
    },
    // Instruments (optional; may be undefined in non-browser builds)
    instruments: {
      // Lazy loader to initialize GM instrument helpers on demand
      // Usage: await jm.instruments.load()
      load: __loadGmInstruments,
      // These remain undefined until load() is called in environments where
      // gm-instruments are not preloaded.
      GM_INSTRUMENTS: GM_INSTRUMENTS2,
      generateSamplerUrls: generateSamplerUrls2,
      createGMInstrumentNode: createGMInstrumentNode2,
      findGMProgramByName: findGMProgramByName2,
      getPopularInstruments: getPopularInstruments2
    },
    VERSION: "1.0.0"
  };
  var audio2 = algorithms_default.audio;
  var src_default = jm;
  return __toCommonJS(src_exports);
})();
