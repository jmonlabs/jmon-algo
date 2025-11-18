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
  let scheduledNotes = [];

  // Create UI container
  const container = document.createElement("div");
  container.style.cssText = `
    font-family: Arial, sans-serif;
    background: #2a2a2a;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
  `;

  // Title
  const title = document.createElement("div");
  title.textContent = composition.metadata?.title || "JMON Composition";
  title.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    text-align: center;
  `;
  container.appendChild(title);

  // Timeline container
  const timelineContainer = document.createElement("div");
  timelineContainer.style.cssText = `
    margin: 15px 0;
  `;

  // Time display
  const timeDisplay = document.createElement("div");
  timeDisplay.textContent = "0:00 / 0:00";
  timeDisplay.style.cssText = `
    text-align: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #aaa;
  `;
  timelineContainer.appendChild(timeDisplay);

  // Timeline progress bar
  const timeline = document.createElement("div");
  timeline.style.cssText = `
    width: 100%;
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
  timelineContainer.appendChild(timeline);
  container.appendChild(timelineContainer);

  // Controls
  const controls = document.createElement("div");
  controls.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  `;

  const buttonStyle = `
    background: #4CAF50;
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;

  const playButton = document.createElement("button");
  playButton.textContent = "▶ Play";
  playButton.style.cssText = buttonStyle;

  const stopButton = document.createElement("button");
  stopButton.textContent = "⏹ Stop";
  stopButton.style.cssText = buttonStyle;
  stopButton.disabled = true;

  controls.appendChild(playButton);
  controls.appendChild(stopButton);
  container.appendChild(controls);

  // Format time helper
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Update timeline display
  function updateTimeline() {
    if (!window.Tone?.Transport) return;

    currentTime = window.Tone.Transport.seconds;
    const progress = (currentTime / totalDuration) * 100;
    timelineProgress.style.width = `${Math.min(progress, 100)}%`;
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(totalDuration)}`;

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

    // Create synths and schedule notes with articulations
    convertedTracks.forEach((trackConfig) => {
      const { originalTrackIndex, partEvents } = trackConfig;
      const originalTrack = originalTracksSource[originalTrackIndex] || {};

      // Use PolySynth by default, or specified synth from track
      const synthType = originalTrack.synth || "PolySynth";
      let synth;
      try {
        synth = new ToneLib[synthType]().toDestination();
      } catch {
        synth = new ToneLib.PolySynth().toDestination();
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
          const scheduledNote = ToneLib.Transport.schedule(() => {
            synth.triggerAttackRelease(noteNames, duration, "+0", velocity);
          }, time);
          scheduledNotes.push(scheduledNote);
          return;
        }

        // Convert pitch to note name
        const noteName = typeof note.pitch === "number"
          ? ToneLib.Frequency(note.pitch, "midi").toNote()
          : note.pitch;

        // Check for glissando
        const glissando = mods.find(
          (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
        );

        if (glissando && glissando.to !== undefined) {
          // Handle glissando with detune automation
          const scheduledNote = ToneLib.Transport.schedule((schedTime) => {
            const fromNote = noteName;
            const toNote = typeof glissando.to === "number"
              ? ToneLib.Frequency(glissando.to, "midi").toNote()
              : glissando.to;

            synth.triggerAttack(fromNote, schedTime, velocity);

            // Calculate pitch bend in cents
            const startFreq = ToneLib.Frequency(fromNote).toFrequency();
            const endFreq = ToneLib.Frequency(toNote).toFrequency();
            const cents = 1200 * Math.log2(endFreq / startFreq);

            // Apply glissando
            if (synth.detune) {
              synth.detune.setValueAtTime(0, schedTime);
              synth.detune.linearRampToValueAtTime(cents, schedTime + duration);
            }

            synth.triggerRelease(schedTime + duration);
          }, time);
          scheduledNotes.push(scheduledNote);
          return;
        }

        // Check for vibrato/tremolo
        const vibrato = mods.find((m) => m.type === "pitch" && m.subtype === "vibrato");
        const tremolo = mods.find((m) => m.type === "amplitude" && m.subtype === "tremolo");

        if (vibrato || tremolo) {
          // Use per-note parameter automation
          const scheduledNote = ToneLib.Transport.schedule((schedTime) => {
            synth.triggerAttack(noteName, schedTime, velocity);

            // Vibrato: modulate frequency
            if (vibrato && synth.frequency) {
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
              synth.frequency.setValueCurveAtTime(values, schedTime, duration);
            }

            // Tremolo: modulate volume
            if (tremolo && synth.volume) {
              const rate = tremolo.rate || 8;
              const depth = tremolo.depth || 0.3;

              const numSteps = Math.ceil(duration * rate * 10);
              const values = [];
              for (let i = 0; i < numSteps; i++) {
                const phase = (i / numSteps) * duration * rate * Math.PI * 2;
                const offset = Math.sin(phase) * depth;
                values.push(offset * -20); // Convert to dB
              }
              synth.volume.setValueCurveAtTime(values, schedTime, duration);
            }

            synth.triggerRelease(schedTime + duration);
          }, time);
          scheduledNotes.push(scheduledNote);
        } else {
          // Normal note without articulations
          const scheduledNote = ToneLib.Transport.schedule((schedTime) => {
            synth.triggerAttackRelease(noteName, duration, schedTime, velocity);
          }, time);
          scheduledNotes.push(scheduledNote);
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
      if (!window.Tone) {
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

      // Re-setup audio to reschedule notes
      scheduledNotes = [];
      setupAudio().catch(console.error);
    }

    isPlaying = false;
    currentTime = 0;
    playButton.textContent = "▶ Play";
    stopButton.disabled = true;
    timelineProgress.style.width = "0%";
    timeDisplay.textContent = `0:00 / ${formatTime(totalDuration)}`;
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
        timeDisplay.textContent = `${formatTime(newTime)} / ${formatTime(totalDuration)}`;
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
