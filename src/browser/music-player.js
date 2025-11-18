import { tonejs } from "../converters/tonejs.js";
import { compileEvents } from "../algorithms/audio/index.js";

/**
 * Simplified Music Player - Just playback with articulations
 * No synth selectors, no downloads - focus on playing JMON compositions
 */
export function createPlayer(composition, options = {}) {
  if (!composition || typeof composition !== "object") {
    throw new Error("Invalid composition");
  }

  const { Tone: externalTone = null, autoplay = false } = options;

  // Normalize composition structure
  const tracks = composition.tracks || composition.sequences || [];
  if (!Array.isArray(tracks)) {
    throw new Error("Tracks must be an array");
  }

  const tempo = composition.tempo || composition.bpm || 120;

  // Convert JMON to Tone.js format
  const convertedData = tonejs(composition, {});
  const { tracks: convertedTracks, metadata } = convertedData;
  const totalDuration = metadata.totalDuration;

  // Keep reference to original tracks for compiling articulations
  const originalTracksSource = tracks;

  // Audio state
  let isPlaying = false;
  let currentTime = 0;
  let animationId = null;
  let scheduledEvents = []; // Track all scheduled events for cleanup
  let activeSynths = []; // Track synths that need disposal

  // Create UI container
  const container = document.createElement("div");
  container.style.cssText = `
    font-family: Arial, sans-serif;
    background: #2a2a2a;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 800px;
    margin: 0 auto;
  `;

  // Controls row: [Play] [Stop] [Current Time] [========Timeline========] [Total Time]
  const controlsRow = document.createElement("div");
  controlsRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  const buttonStyle = `
    background: #4CAF50;
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
  `;

  const playButton = document.createElement("button");
  playButton.textContent = "▶ Play";
  playButton.style.cssText = buttonStyle;

  const stopButton = document.createElement("button");
  stopButton.textContent = "⏹ Stop";
  stopButton.style.cssText = buttonStyle;
  stopButton.disabled = true;

  const currentTimeDisplay = document.createElement("div");
  currentTimeDisplay.textContent = "0:00";
  currentTimeDisplay.style.cssText = `
    font-size: 14px;
    color: #aaa;
    min-width: 40px;
  `;

  // Timeline progress bar
  const timeline = document.createElement("div");
  timeline.style.cssText = `
    flex: 1;
    height: 8px;
    background: #444;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  `;

  const timelineProgress = document.createElement("div");
  timelineProgress.style.cssText = `
    height: 100%;
    background: #4CAF50;
    border-radius: 4px;
    width: 0%;
    transition: width 0.1s linear;
  `;
  timeline.appendChild(timelineProgress);

  const totalTimeDisplay = document.createElement("div");
  totalTimeDisplay.textContent = "0:00";
  totalTimeDisplay.style.cssText = `
    font-size: 14px;
    color: #aaa;
    min-width: 40px;
    text-align: right;
  `;

  controlsRow.appendChild(playButton);
  controlsRow.appendChild(stopButton);
  controlsRow.appendChild(currentTimeDisplay);
  controlsRow.appendChild(timeline);
  controlsRow.appendChild(totalTimeDisplay);
  container.appendChild(controlsRow);

  // Format time helper
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Update display
  totalTimeDisplay.textContent = formatTime(totalDuration);

  // Update timeline display
  function updateTimeline() {
    if (!window.Tone?.Transport) return;

    currentTime = window.Tone.Transport.seconds;
    const progress = (currentTime / totalDuration) * 100;
    timelineProgress.style.width = `${Math.min(progress, 100)}%`;
    currentTimeDisplay.textContent = formatTime(currentTime);

    if (isPlaying && currentTime < totalDuration) {
      animationId = requestAnimationFrame(updateTimeline);
    } else if (currentTime >= totalDuration) {
      stop();
    }
  }

  // Setup audio
  async function setupAudio() {
    let ToneLib = externalTone || window.Tone;

    if (!ToneLib) {
      // Load Tone.js from CDN
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js";
        script.onload = () => {
          ToneLib = window.Tone;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    if (!ToneLib) {
      throw new Error("Failed to load Tone.js");
    }

    window.Tone = ToneLib;

    // Start audio context
    await ToneLib.start();
    ToneLib.Transport.bpm.value = tempo;

    // Clean up previous synths
    activeSynths.forEach(s => {
      try {
        s.dispose();
      } catch (e) {
        console.warn('Error disposing synth:', e);
      }
    });
    activeSynths = [];
    scheduledEvents = [];

    // Create synths and schedule notes
    convertedTracks.forEach((trackConfig) => {
      const { originalTrackIndex, partEvents } = trackConfig;
      const originalTrack = originalTracksSource[originalTrackIndex] || {};

      // Determine synth type from JMON or use default
      const requestedSynthType = originalTrack.synth || "PolySynth";

      // Create polyphonic synth for normal notes (chords, non-articulated notes)
      let polySynth;
      try {
        polySynth = new ToneLib[requestedSynthType]().toDestination();
      } catch {
        polySynth = new ToneLib.PolySynth().toDestination();
      }
      activeSynths.push(polySynth);

      // Determine mono synth type for articulated notes
      // PolySynth doesn't expose frequency/volume, so use underlying synth type
      let monoSynthType = "MonoSynth"; // default
      if (requestedSynthType === "PolySynth") {
        // PolySynth uses Synth voices by default
        monoSynthType = "Synth";
      } else if (requestedSynthType.includes("Poly")) {
        // Strip "Poly" prefix: PolySynth -> Synth, PolyFM -> FMSynth
        monoSynthType = requestedSynthType.replace("Poly", "");
        if (!ToneLib[monoSynthType]) {
          monoSynthType = "MonoSynth";
        }
      } else {
        // Already a mono synth type, use it
        monoSynthType = requestedSynthType;
      }

      // Compile articulations to modulations
      let modulations = [];
      try {
        const compiled = compileEvents(originalTrack);
        modulations = compiled.modulations || [];
      } catch (e) {
        console.warn("Failed to compile articulations:", e);
      }

      // Create modulation lookup by note index
      const modsByNote = {};
      modulations.forEach((mod) => {
        if (!modsByNote[mod.index]) modsByNote[mod.index] = [];
        modsByNote[mod.index].push(mod);
      });

      // Schedule all notes
      partEvents.forEach((note, noteIndex) => {
        const time = typeof note.time === "number"
          ? note.time * (60 / tempo)
          : note.time;
        const duration = typeof note.duration === "number"
          ? note.duration * (60 / tempo)
          : note.duration;
        const velocity = note.velocity || 0.8;
        const mods = modsByNote[noteIndex] || [];

        // Handle chords
        if (Array.isArray(note.pitch)) {
          const noteNames = note.pitch.map((p) =>
            typeof p === "number" ? ToneLib.Frequency(p, "midi").toNote() : p
          );

          // Check if chord has articulations
          const vibrato = mods.find((m) => m.type === "pitch" && m.subtype === "vibrato");
          const tremolo = mods.find((m) => m.type === "amplitude" && m.subtype === "tremolo");
          const glissando = mods.find(
            (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
          );

          if (vibrato || tremolo || glissando) {
            // Apply articulations to each note in the chord individually
            const eventId = ToneLib.Transport.schedule((schedTime) => {
              noteNames.forEach((noteName) => {
                // Create dedicated mono synth for each note in chord
                const monoSynth = new ToneLib[monoSynthType]().toDestination();

                monoSynth.triggerAttack(noteName, schedTime, velocity);

                // Apply glissando
                if (glissando && glissando.to !== undefined) {
                  const toNote = typeof glissando.to === "number"
                    ? ToneLib.Frequency(glissando.to, "midi").toNote()
                    : glissando.to;
                  const startFreq = ToneLib.Frequency(noteName).toFrequency();
                  const endFreq = ToneLib.Frequency(toNote).toFrequency();
                  const cents = 1200 * Math.log2(endFreq / startFreq);
                  if (monoSynth.detune) {
                    monoSynth.detune.setValueAtTime(0, schedTime);
                    monoSynth.detune.linearRampToValueAtTime(cents, schedTime + duration);
                  }
                }

                // Apply vibrato
                if (vibrato && monoSynth.frequency) {
                  const rate = vibrato.rate || 5;
                  const depth = vibrato.depth || 50;
                  const depthRatio = Math.pow(2, depth / 1200);
                  const baseFreq = ToneLib.Frequency(noteName).toFrequency();
                  const numSteps = Math.ceil(duration * rate * 10);
                  const values = [];
                  for (let i = 0; i < numSteps; i++) {
                    const phase = (i / numSteps) * duration * rate * Math.PI * 2;
                    const offset = Math.sin(phase) * (depthRatio - 1);
                    values.push(baseFreq * (1 + offset));
                  }
                  monoSynth.frequency.setValueCurveAtTime(values, schedTime, duration);
                }

                // Apply tremolo
                if (tremolo && monoSynth.volume) {
                  const rate = tremolo.rate || 8;
                  const depth = tremolo.depth || 0.3;
                  const numSteps = Math.ceil(duration * rate * 10);
                  const values = [];
                  for (let i = 0; i < numSteps; i++) {
                    const phase = (i / numSteps) * duration * rate * Math.PI * 2;
                    const offset = Math.sin(phase) * depth;
                    values.push(offset * -20);
                  }
                  monoSynth.volume.setValueCurveAtTime(values, schedTime, duration);
                }

                monoSynth.triggerRelease(schedTime + duration);

                // Dispose synth after note ends
                ToneLib.Transport.schedule(() => {
                  monoSynth.dispose();
                }, schedTime + duration + 0.5);
              });
            }, time);
            scheduledEvents.push(eventId);
          } else {
            // Normal chord without articulations
            const eventId = ToneLib.Transport.schedule(() => {
              polySynth.triggerAttackRelease(noteNames, duration, "+0", velocity);
            }, time);
            scheduledEvents.push(eventId);
          }
          return;
        }

        // Convert pitch to note name
        const noteName = typeof note.pitch === "number"
          ? ToneLib.Frequency(note.pitch, "midi").toNote()
          : note.pitch;

        // Check for articulations that need special handling
        const vibrato = mods.find((m) => m.type === "pitch" && m.subtype === "vibrato");
        const tremolo = mods.find((m) => m.type === "amplitude" && m.subtype === "tremolo");
        const glissando = mods.find(
          (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
        );

        // Notes with articulations need mono synth (PolySynth doesn't expose frequency/volume)
        if (vibrato || tremolo || glissando) {
          const eventId = ToneLib.Transport.schedule((schedTime) => {
            // Create a dedicated mono synth for this articulated note using the track's synth type
            const monoSynth = new ToneLib[monoSynthType]().toDestination();

            monoSynth.triggerAttack(noteName, schedTime, velocity);

            // Apply glissando
            if (glissando && glissando.to !== undefined && monoSynth.detune) {
              const toNote = typeof glissando.to === "number"
                ? ToneLib.Frequency(glissando.to, "midi").toNote()
                : glissando.to;

              const startFreq = ToneLib.Frequency(noteName).toFrequency();
              const endFreq = ToneLib.Frequency(toNote).toFrequency();
              const cents = 1200 * Math.log2(endFreq / startFreq);

              monoSynth.detune.setValueAtTime(0, schedTime);
              monoSynth.detune.linearRampToValueAtTime(cents, schedTime + duration);
            }

            // Apply vibrato (frequency modulation)
            if (vibrato && monoSynth.frequency) {
              const rate = vibrato.rate || 5;
              const depth = vibrato.depth || 50;
              const depthRatio = Math.pow(2, depth / 1200);
              const baseFreq = ToneLib.Frequency(noteName).toFrequency();

              const numSteps = Math.ceil(duration * rate * 10);
              const values = [];
              for (let i = 0; i < numSteps; i++) {
                const phase = (i / numSteps) * duration * rate * Math.PI * 2;
                const offset = Math.sin(phase) * (depthRatio - 1);
                values.push(baseFreq * (1 + offset));
              }
              monoSynth.frequency.setValueCurveAtTime(values, schedTime, duration);
            }

            // Apply tremolo (volume modulation)
            if (tremolo && monoSynth.volume) {
              const rate = tremolo.rate || 8;
              const depth = tremolo.depth || 0.3;

              const numSteps = Math.ceil(duration * rate * 10);
              const values = [];
              for (let i = 0; i < numSteps; i++) {
                const phase = (i / numSteps) * duration * rate * Math.PI * 2;
                const offset = Math.sin(phase) * depth;
                values.push(offset * -20); // Convert to dB
              }
              monoSynth.volume.setValueCurveAtTime(values, schedTime, duration);
            }

            // Schedule note release and cleanup
            monoSynth.triggerRelease(schedTime + duration);

            // Dispose synth after note ends
            const disposeId = ToneLib.Transport.schedule(() => {
              monoSynth.dispose();
            }, schedTime + duration + 0.5);
            scheduledEvents.push(disposeId);
          }, time);
          scheduledEvents.push(eventId);
        } else {
          // Normal note without articulations - use PolySynth
          const eventId = ToneLib.Transport.schedule((schedTime) => {
            polySynth.triggerAttackRelease(noteName, duration, schedTime, velocity);
          }, time);
          scheduledEvents.push(eventId);
        }
      });
    });
  }

  // Play/Pause
  async function play() {
    if (isPlaying) {
      // Pause
      window.Tone.Transport.pause();
      isPlaying = false;
      playButton.textContent = "▶ Play";
      cancelAnimationFrame(animationId);
    } else {
      // Ensure audio is setup
      if (!window.Tone || scheduledEvents.length === 0) {
        await setupAudio();
      }

      // Resume or start
      if (window.Tone.Transport.state === "paused") {
        window.Tone.Transport.start();
      } else {
        window.Tone.Transport.start("+0", currentTime);
      }

      isPlaying = true;
      playButton.textContent = "⏸ Pause";
      stopButton.disabled = false;
      updateTimeline();
    }
  }

  // Stop
  function stop() {
    if (window.Tone) {
      window.Tone.Transport.stop();
      window.Tone.Transport.cancel(0);

      // Clean up all scheduled events
      scheduledEvents.forEach(eventId => {
        window.Tone.Transport.clear(eventId);
      });
      scheduledEvents = [];

      // Re-setup audio to reschedule notes
      setupAudio().catch(console.error);
    }

    isPlaying = false;
    currentTime = 0;
    playButton.textContent = "▶ Play";
    stopButton.disabled = true;
    timelineProgress.style.width = "0%";
    currentTimeDisplay.textContent = "0:00";
    cancelAnimationFrame(animationId);
  }

  // Timeline seek
  timeline.addEventListener("click", (e) => {
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * totalDuration;

    if (window.Tone) {
      const wasPlaying = isPlaying;
      stop();
      currentTime = newTime;

      if (wasPlaying) {
        play();
      } else {
        timelineProgress.style.width = `${percent * 100}%`;
        currentTimeDisplay.textContent = formatTime(newTime);
      }
    }
  });

  // Button event listeners
  playButton.addEventListener("click", play);
  stopButton.addEventListener("click", stop);

  // Autoplay if requested
  if (autoplay) {
    play().catch(console.error);
  }

  return container;
}
