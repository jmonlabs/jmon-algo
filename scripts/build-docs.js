#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * Dynamic Documentation Builder for jmon-algo
 *
 * Automatically generates API documentation from source code JSDoc comments
 * and creates comprehensive markdown files.
 */

import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";
import { parse } from "https://deno.land/std@0.208.0/path/mod.ts";

const SRC_DIR = "./src";
const DOCS_DIR = "./docs";
const API_DOC_FILE = `${DOCS_DIR}/API.md`;
const FEATURES_DOC_FILE = `${DOCS_DIR}/FEATURES.md`;

// Ensure docs directory exists
await Deno.mkdir(DOCS_DIR, { recursive: true });

/**
 * Extract JSDoc comments from source code
 */
function extractJSDoc(content) {
  const jsdocPattern = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
  const docs = [];
  let match;

  while ((match = jsdocPattern.exec(content)) !== null) {
    const comment = match[1];
    const lines = comment.split('\n').map(line =>
      line.trim().replace(/^\*\s?/, '')
    ).filter(line => line.length > 0);

    docs.push({
      raw: match[0],
      lines,
      text: lines.join('\n')
    });
  }

  return docs;
}

/**
 * Extract class information from source code
 */
function extractClasses(content, filePath) {
  const classPattern = /export\s+class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{/g;
  const classes = [];
  let match;

  while ((match = classPattern.exec(content)) !== null) {
    const className = match[1];
    const extendsClass = match[2] || null;

    // Find the JSDoc comment before this class
    const beforeClass = content.substring(0, match.index);
    const jsdocs = extractJSDoc(beforeClass);
    const relevantDoc = jsdocs[jsdocs.length - 1];

    classes.push({
      name: className,
      extends: extendsClass,
      doc: relevantDoc?.text || '',
      file: filePath
    });
  }

  return classes;
}

/**
 * Extract function information from source code
 */
function extractFunctions(content, filePath) {
  const functionPattern = /export\s+(?:async\s+)?function\s+(\w+)\s*\(/g;
  const functions = [];
  let match;

  while ((match = functionPattern.exec(content)) !== null) {
    const functionName = match[1];

    // Find the JSDoc comment before this function
    const beforeFunction = content.substring(0, match.index);
    const jsdocs = extractJSDoc(beforeFunction);
    const relevantDoc = jsdocs[jsdocs.length - 1];

    // Extract parameters from the function signature
    const afterMatch = content.substring(match.index);
    const paramMatch = afterMatch.match(/\(([^)]*)\)/);
    const params = paramMatch ? paramMatch[1].split(',').map(p => p.trim()).filter(p => p) : [];

    functions.push({
      name: functionName,
      params,
      doc: relevantDoc?.text || '',
      file: filePath
    });
  }

  return functions;
}

/**
 * Scan source directory and extract documentation
 */
async function scanSourceCode() {
  const classes = [];
  const functions = [];

  for await (const entry of walk(SRC_DIR, { exts: [".js"] })) {
    if (entry.isFile && !entry.path.includes("__tests__")) {
      const content = await Deno.readTextFile(entry.path);
      const relativePath = entry.path.replace(SRC_DIR + "/", "");

      classes.push(...extractClasses(content, relativePath));
      functions.push(...extractFunctions(content, relativePath));
    }
  }

  return { classes, functions };
}

/**
 * Generate API documentation markdown
 */
function generateAPIDoc(classes, functions) {
  let md = `# jmon-algo API Documentation

*Auto-generated on ${new Date().toISOString().split('T')[0]}*

## Table of Contents

- [Classes](#classes)
- [Functions](#functions)

---

## Classes

`;

  // Group classes by module
  const classByModule = {};
  for (const cls of classes) {
    const module = cls.file.split('/')[0];
    if (!classByModule[module]) classByModule[module] = [];
    classByModule[module].push(cls);
  }

  // Generate class documentation
  for (const [module, moduleClasses] of Object.entries(classByModule)) {
    md += `\n### ${module.charAt(0).toUpperCase() + module.slice(1)}\n\n`;

    for (const cls of moduleClasses) {
      md += `#### \`${cls.name}\`\n\n`;
      if (cls.extends) {
        md += `*Extends: ${cls.extends}*\n\n`;
      }
      md += `**File:** \`${cls.file}\`\n\n`;
      if (cls.doc) {
        md += `${cls.doc}\n\n`;
      }
      md += `---\n\n`;
    }
  }

  md += `\n## Functions\n\n`;

  // Group functions by module
  const funcByModule = {};
  for (const func of functions) {
    const module = func.file.split('/')[0];
    if (!funcByModule[module]) funcByModule[module] = [];
    funcByModule[module].push(func);
  }

  // Generate function documentation
  for (const [module, moduleFuncs] of Object.entries(funcByModule)) {
    md += `\n### ${module.charAt(0).toUpperCase() + module.slice(1)}\n\n`;

    for (const func of moduleFuncs) {
      md += `#### \`${func.name}(${func.params.join(', ')})\`\n\n`;
      md += `**File:** \`${func.file}\`\n\n`;
      if (func.doc) {
        md += `${func.doc}\n\n`;
      }
      md += `---\n\n`;
    }
  }

  return md;
}

/**
 * Generate feature documentation
 */
function generateFeaturesDoc(classes) {
  let md = `# jmon-algo Features

*Auto-generated on ${new Date().toISOString().split('T')[0]}*

## Overview

jmon-algo is a comprehensive JavaScript library for algorithmic music composition. This document provides an overview of all available features organized by category.

---

## Generative Algorithms

`;

  // Find generative algorithm classes
  const generativeClasses = classes.filter(c =>
    c.file.includes('generative/')
  );

  const generativeCategories = {};
  for (const cls of generativeClasses) {
    const category = cls.file.split('/')[1];
    if (!generativeCategories[category]) {
      generativeCategories[category] = [];
    }
    generativeCategories[category].push(cls);
  }

  for (const [category, items] of Object.entries(generativeCategories)) {
    md += `\n### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}\n\n`;
    for (const cls of items) {
      md += `- **${cls.name}**: ${cls.doc.split('\n')[0] || 'No description'}\n`;
    }
  }

  md += `\n---\n\n## Music Theory\n\n`;

  // Find music theory classes
  const theoryClasses = classes.filter(c =>
    c.file.includes('theory/')
  );

  const theoryCategories = {};
  for (const cls of theoryClasses) {
    const category = cls.file.split('/')[1];
    if (!theoryCategories[category]) {
      theoryCategories[category] = [];
    }
    theoryCategories[category].push(cls);
  }

  for (const [category, items] of Object.entries(theoryCategories)) {
    md += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    for (const cls of items) {
      md += `- **${cls.name}**: ${cls.doc.split('\n')[0] || 'No description'}\n`;
    }
  }

  md += `\n---\n\n## Analysis\n\n`;

  // Find analysis classes
  const analysisClasses = classes.filter(c =>
    c.file.includes('analysis/')
  );

  for (const cls of analysisClasses) {
    md += `- **${cls.name}**: ${cls.doc.split('\n')[0] || 'No description'}\n`;
  }

  md += `\n---\n\n## Visualization\n\n`;

  // Find visualization classes
  const vizClasses = classes.filter(c =>
    c.file.includes('visualization/')
  );

  const vizCategories = {};
  for (const cls of vizClasses) {
    const category = cls.file.split('/')[1];
    if (!vizCategories[category]) {
      vizCategories[category] = [];
    }
    vizCategories[category].push(cls);
  }

  for (const [category, items] of Object.entries(vizCategories)) {
    md += `\n### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}\n\n`;
    for (const cls of items) {
      md += `- **${cls.name}**: ${cls.doc.split('\n')[0] || 'No description'}\n`;
    }
  }

  md += `\n---\n\n## Converters\n\n`;

  // Find converter classes
  const converterClasses = classes.filter(c =>
    c.file.includes('converters/')
  );

  for (const cls of converterClasses) {
    md += `- **${cls.name}**: ${cls.doc.split('\n')[0] || 'No description'}\n`;
  }

  md += `\n---\n\n## Browser Integration\n\n`;

  // Find browser classes
  const browserClasses = classes.filter(c =>
    c.file.includes('browser/')
  );

  for (const cls of browserClasses) {
    md += `- **${cls.name}**: ${cls.doc.split('\n')[0] || 'No description'}\n`;
  }

  md += `\n---\n\n## Additional Information\n\n`;
  md += `For detailed API documentation, see [API.md](./API.md)\n\n`;
  md += `For tutorials and examples, see the [examples/tutorials](../examples/tutorials) directory.\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log("🔨 Building documentation...");

  console.log("📖 Scanning source code...");
  const { classes, functions } = await scanSourceCode();

  console.log(`✓ Found ${classes.length} classes and ${functions.length} functions`);

  console.log("📝 Generating API documentation...");
  const apiDoc = generateAPIDoc(classes, functions);
  await Deno.writeTextFile(API_DOC_FILE, apiDoc);
  console.log(`✓ Created ${API_DOC_FILE}`);

  console.log("📝 Generating features documentation...");
  const featuresDoc = generateFeaturesDoc(classes);
  await Deno.writeTextFile(FEATURES_DOC_FILE, featuresDoc);
  console.log(`✓ Created ${FEATURES_DOC_FILE}`);

  console.log("\n✨ Documentation build complete!");
  console.log(`\nGenerated files:`);
  console.log(`  - ${API_DOC_FILE}`);
  console.log(`  - ${FEATURES_DOC_FILE}`);
}

if (import.meta.main) {
  await main();
}
