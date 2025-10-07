# JMON Interactive Viewer

Interactive workflow for music composition with Zed + Deno.

## Quick Start

### Install Zed (Linux)

Last time I checked on zed.dev,

```bash
curl -f https://zed.dev/install.sh | sh
```

### Install Deno and Jupyter

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
deno jupyter --install
```

### Config Zed for Deno

Open the global settings file (last time I tried, local config didn't work).

```
zed ~/.config/zed/settings.json
```

Add the following code to the file.

```
{
  "jupyter": {
    "kernel_selections": {
      "typescript": "deno",
      "javascript": "deno"
    }
  }
}
```

Restart Zed. Back in Zed, run command (Ctrl+Shift+P): repl: refresh kernelspecs

In js and ts files, delimit cells with `// %% My cell`, and run cells with `Ctrl+Shift+Enter`.

### Jam coding

**1. Start the viewer server (from project root):**
```bash
cd /path/to/jmon-algo
deno run --allow-net --allow-read --allow-write examples/viewer/viewer.js
```

**2. Open browser:**
Navigate to http://localhost:8000

**3. Create a working file anywhere in the project:**
```javascript
// my-work.js (anywhere in jmon-algo/)
import { show, showScore, showPlayer, clear } from "./examples/viewer/viewer.js";

// %% Execute this cell
const composition = {
  tempo: 120,
  tracks: [{
    notes: [
      { pitch: 60, duration: 1, time: 0 },
      { pitch: 62, duration: 1, time: 1 }
    ]
**4.Click "🔄 Refresh" in browser to see results**##ImportantNotes-**Runfromproject root**: The viewer must be run from `jmon-algo/` directory
- **Import path**: Adjust `./examples/viewer/viewer.js` based on your file location
- Results stored in `.results.json` at project root (gitignored)## Example Workflow

```bash
cd jmon-algo/
deno run --allow-net --allow-read --allow-write examples/viewer/viewer.js
# Opens http://localhost:8000

# In another terminal or Zed:
# Edit your-file.js
# Execute cells with Zed inline execution
# Refresh browser to see results
```

## Available Functions

- `show(data)` - Display any data as JSON
- `showScore(composition)` - Render musical notation
- `showPlayer(composition)` - Create interactive player
- `clear()` - Clear all results


## How the viewer works

```
jam01.js → execute in Zed → save to .results.json
                                         ↓
           browser at :8000 → reads .results.json → shows results
``
