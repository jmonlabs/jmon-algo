#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

import { dirname, join } from "https://deno.land/std@0.208.0/path/mod.ts";

// Use absolute path based on this file's location
const __dirname = dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = join(__dirname, "..", "..");
const RESULTS_FILE = join(PROJECT_ROOT, ".results.json");

// Read results from file
const loadResults = () => {
  try {
    const data = Deno.readTextFileSync(RESULTS_FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Save results to file
const saveResults = (results) => {
  Deno.writeTextFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
};

// Simple helper - just store it
export const show = (obj) => {
  const results = loadResults();
  results.push({ type: "data", content: obj });
  saveResults(results);
  console.log(`Result ${results.length} saved`);
  return obj;
};

export const showScore = (composition) => {
  const results = loadResults();
  results.push({ type: "score", content: composition });
  saveResults(results);
  console.log(`Score ${results.length} saved`);
  return composition;
};

export const showPlayer = (composition) => {
  const results = loadResults();
  results.push({ type: "player", content: composition });
  saveResults(results);
  console.log(`Player ${results.length} saved`);
  return composition;
};

export const clear = () => {
  saveResults([]);
  console.log("Results cleared");
};

// Auto-serve on import
if (import.meta.main) {
  console.log(`Results file: ${RESULTS_FILE}`);

  const handler = (req) => {
    const url = new URL(req.url);

    // Serve static files
    if (url.pathname !== "/") {
      try {
        const filePath = join(PROJECT_ROOT, url.pathname);
        const file = Deno.readFileSync(filePath);
        const ext = filePath.split(".").pop();
        const types = {
          js: "application/javascript; charset=utf-8",
          css: "text/css; charset=utf-8",
          html: "text/html; charset=utf-8",
          json: "application/json; charset=utf-8",
        };
        return new Response(file, {
          headers: {
            "content-type": types[ext] || "text/plain; charset=utf-8",
          },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }

    const results = loadResults();

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js"></script>
  <style>
    button {
      margin: 10px 0;
      padding: 10px 20px;
      background: #777;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover { background: #aaa; }
  </style>
</head>
<body style="margin:20px;font-family:'PT Sans',sans-serif;background:#eee;color:#333">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h1>jmon-viewer (${results.length})</h1>
    <button onclick="location.reload()">Refresh</button>
  </div>
  ${results.length === 0 ? '<p style="color:#666">No results yet. Use show(), showScore(), or showPlayer() in your code.</p>' : ""}
  ${results
    .map((r, i) => {
      if (r.type === "score") {
        return `
        <div style="margin:20px 0;padding:20px;background:#fff;border-radius:8px">
          <h3>Score ${i + 1}</h3>
          <div id="score-${i}"></div>
        </div>
        <script type="module">
          import { score } from '../src/browser/score-renderer.js';
          const comp = ${JSON.stringify(r.content)};
          try {
            const el = score(comp, { width: 700, height: 200 });
            document.getElementById('score-${i}').appendChild(el);
          } catch(e) {
            document.getElementById('score-${i}').innerHTML = '<p style="color:red">Error rendering score: ' + e.message + '</p>';
            console.error('Score error:', e);
          }
        </script>
      `;
      } else if (r.type === "player") {
        return `
        <div style="margin:20px 0;padding:20px;background:#fff;border-radius:8px">
          <h3>Player ${i + 1}</h3>
          <div id="player-${i}"></div>
        </div>
        <script type="module">
          import { createPlayer } from '../src/browser/music-player.js';
          const comp = ${JSON.stringify(r.content)};
          try {
            const el = createPlayer(comp, { autoplay: false });
            document.getElementById('player-${i}').appendChild(el);
          } catch(e) {
            document.getElementById('player-${i}').innerHTML = '<p style="color:red">Error creating player: ' + e.message + '</p>';
            console.error('Player error:', e);
          }
        </script>
      `;
      } else {
        return `
        <div style="margin:20px 0;padding:20px;background:#fff;border-radius:8px">
          <h3>Result ${i + 1}</h3>
          ${typeof r.content === "string" ? r.content : `<pre>${JSON.stringify(r.content, null, 2)}</pre>`}
        </div>
      `;
      }
    })
    .join("")}
</body>
</html>`;
    return new Response(html, { headers: { "content-type": "text/html" } });
  };

  console.log("http://localhost:8000");
  Deno.serve({ port: 8000 }, handler);
}
