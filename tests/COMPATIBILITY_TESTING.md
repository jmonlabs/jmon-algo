# Runtime Compatibility Testing

This directory contains tests to verify @jmon/jmon-algo works across different JavaScript runtimes.

## Browser Testing

### Option 1: Local Server
```bash
# Start a local server
python3 -m http.server 8000
# or
npx serve .

# Open in browser:
# http://localhost:8000/tests/browser-compatibility.html
```

### Option 2: Online (after publishing v1.0.1)
Upload `tests/browser-compatibility.html` to any static host, or use:
- https://jsfiddle.net
- https://codepen.io
- Observable notebook
- Tangent notebook

### Expected Results:
- ✅ Import from esm.sh succeeds
- ✅ All theory, generative, analysis features work
- ✅ No errors about Deno globals
- ⚠️  `render()` and `play()` are not available (npm package only)

## Bun Testing

```bash
# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Run the test
bun run tests/bun-compatibility.test.js
```

### Expected Results:
- ✅ Import from JSR (or npm: as fallback)
- ✅ All core functionality works
- ✅ 9/9 tests pass

## Deno Testing (Native)

```bash
# Already tested in CI/CD
deno test -A
```

## Node.js Testing

```bash
# After npm package is published
node -e "import('@jmon/jmon-algo').then(jm => console.log(jm.default.theory.scale.generate('C', 'major')))"
```

## Runtime Compatibility Summary

| Runtime | Status | Notes |
|---------|--------|-------|
| **Deno** | ✅ Native | Primary target, fully supported |
| **Browser** | ✅ Compatible | Via esm.sh, subset of features (no audio playback) |
| **Bun** | 🧪 Test needed | Should work via JSR or npm: prefix |
| **Node.js** | 🧪 Test needed | Via npm: imports, may need --experimental-network-imports |

## What Works Everywhere (JSR package):
- Music theory (scales, chords, progressions)
- Generative algorithms (melodies, walks, fractals)
- Analysis tools
- Format converters (MIDI, ToneJS, WAV, SuperCollider)
- Constants and utilities

## What's Browser/npm Only:
- `jm.render()` - Score rendering with VexFlow
- `jm.play()` - Audio playback with Tone.js
- Full DOM integration

## Testing for tangent-notebooks / Observable

Create a new notebook cell:
```javascript
jm = import("https://esm.sh/jsr/@jmon/jmon-algo@1.0.1")
```

Then use:
```javascript
{
  const api = await jm.default;
  return api.theory.scale.generate('C', 'major');
}
```
