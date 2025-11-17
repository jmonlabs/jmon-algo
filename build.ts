#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

// Deno bundler for algo using esbuild
import * as esbuild from "npm:esbuild@0.20.2";

const entryPoint = "./src/index.js";
const outDir = "./dist";

// Ensure dist directory exists
try {
  await Deno.mkdir(outDir, { recursive: true });
} catch {
  // Directory already exists
}

console.log("🔨 Building algo with Deno + esbuild...");

// Build ESM bundle
console.log("📦 Building ESM bundle...");
await esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  format: "esm",
  outfile: `${outDir}/jmon.esm.js`,
  external: ["plotly.js", "tone", "vexflow"],
  platform: "browser",
});

console.log("✅ ESM bundle created: dist/jmon.esm.js");

esbuild.stop();
console.log("✨ Build complete!");
