import { tonejs } from "../converters/tonejs.js";
import { compileEvents } from "../algorithms/audio/index.js";
import { generateSamplerUrls } from "../utils/gm-instruments.js";

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
  let activeSynths = []; // Track synths and effects that need disposal

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

    // Clean up previous synths and effects
    activeSynths.forEach(s => {
      try {
        s.dispose();
      } catch (e) {
        console.warn('Error disposing synth/effect:', e);
      }
    });
    activeSynths = [];
    scheduledEvents = [];

    // Create synths and schedule notes
    convertedTracks.forEach((trackConfig) => {
      const { originalTrackIndex, partEvents } = trackConfig;
      const originalTrack = originalTracksSource[originalTrackIndex] || {};

      // Compile articulations to modulations FIRST (to check for glissando)
      let modulations = [];
      try {
        const compiled = compileEvents(originalTrack);
        modulations = compiled.modulations || [];
        console.log(`[ARTICULATIONS] Track ${originalTrackIndex}: Found ${modulations.length} modulations`, modulations);
      } catch (e) {
        console.warn("Failed to compile articulations:", e);
      }

      // Check if track has glissando (needs MonoSynth for detune support)
      const hasGlissando = modulations.some(
        (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
      );

      // Create synth or sampler based on track configuration
      let synth;

      // Check if track specifies a GM instrument number
      if (originalTrack.instrument !== undefined && !originalTrack.synth) {
        // Create Sampler for GM instrument
        const urls = generateSamplerUrls(originalTrack.instrument);
        synth = new ToneLib.Sampler({
          urls,
          baseUrl: "", // URLs are already complete
          onload: () => console.log(`Loaded GM instrument ${originalTrack.instrument}`)
        }).toDestination();
        console.log(`Creating Sampler for GM instrument ${originalTrack.instrument}`);
      } else {
        // Create synth from specified type or default
        let requestedSynthType = originalTrack.synth || "PolySynth";

        // If track has glissando and no specific synth type requested, use MonoSynth
        // (PolySynth doesn't expose detune parameter directly)
        if (hasGlissando && !originalTrack.synth) {
          requestedSynthType = "MonoSynth";
          console.log(`[GLISSANDO] Using MonoSynth for track ${originalTrackIndex} (has glissando)`);
        }

        try {
          synth = new ToneLib[requestedSynthType]().toDestination();
        } catch {
          synth = new ToneLib.PolySynth().toDestination();
        }
      }

      activeSynths.push(synth);

      // Check for vibrato/tremolo modulations (track-level effects)
      const vibratoMods = modulations.filter(
        (m) => m.type === "pitch" && m.subtype === "vibrato"
      );
      const tremoloMods = modulations.filter(
        (m) => m.type === "amplitude" && m.subtype === "tremolo"
      );
      console.log(`[EFFECTS] Track ${originalTrackIndex}: ${vibratoMods.length} vibrato, ${tremoloMods.length} tremolo`);

      // Create effect chain if needed
      let vibratoEffect = null;
      let tremoloEffect = null;

      if (vibratoMods.length > 0 || tremoloMods.length > 0) {
        // Disconnect synth from destination first
        synth.disconnect();

        // Create effects
        if (vibratoMods.length > 0) {
          const defaultVibrato = vibratoMods[0];
          vibratoEffect = new ToneLib.Vibrato({
            frequency: defaultVibrato.rate || 5,
            depth: (defaultVibrato.depth || 50) / 100,
          });
          vibratoEffect.wet.value = 0; // Start disabled
          activeSynths.push(vibratoEffect);
        }

        if (tremoloMods.length > 0) {
          const defaultTremolo = tremoloMods[0];
          tremoloEffect = new ToneLib.Tremolo({
            frequency: defaultTremolo.rate || 8,
            depth: defaultTremolo.depth || 0.3,
          }).start();
          tremoloEffect.wet.value = 0; // Start disabled
          activeSynths.push(tremoloEffect);
        }

        // Connect effect chain
        if (vibratoEffect && tremoloEffect) {
          synth.connect(vibratoEffect);
          vibratoEffect.connect(tremoloEffect);
          tremoloEffect.toDestination();
        } else if (vibratoEffect) {
          synth.connect(vibratoEffect);
          vibratoEffect.toDestination();
        } else if (tremoloEffect) {
          synth.connect(tremoloEffect);
          tremoloEffect.toDestination();
        }

        // Schedule effect enable/disable based on modulations
        const secondsPerQuarterNote = 60 / tempo;
        modulations.forEach((mod) => {
          const startTime = mod.start * secondsPerQuarterNote;
          const endTime = mod.end * secondsPerQuarterNote;

          if (mod.type === "pitch" && mod.subtype === "vibrato" && vibratoEffect) {
            const vibratoFreq = mod.rate || 5;
            const vibratoDepth = (mod.depth || 50) / 100;

            // Schedule enable
            const enableId = ToneLib.Transport.schedule((time) => {
              vibratoEffect.frequency.value = vibratoFreq;
              vibratoEffect.depth.value = vibratoDepth;
              vibratoEffect.wet.value = 1;
            }, startTime);
            scheduledEvents.push(enableId);

            // Schedule disable
            const disableId = ToneLib.Transport.schedule((time) => {
              vibratoEffect.wet.value = 0;
            }, endTime);
            scheduledEvents.push(disableId);
          }

          if (mod.type === "amplitude" && mod.subtype === "tremolo" && tremoloEffect) {
            const tremoloFreq = mod.rate || 8;
            const tremoloDepth = mod.depth || 0.3;

            // Schedule enable
            const enableId = ToneLib.Transport.schedule((time) => {
              tremoloEffect.frequency.value = tremoloFreq;
              tremoloEffect.depth.value = tremoloDepth;
              tremoloEffect.wet.value = 1;
            }, startTime);
            scheduledEvents.push(enableId);

            // Schedule disable
            const disableId = ToneLib.Transport.schedule((time) => {
              tremoloEffect.wet.value = 0;
            }, endTime);
            scheduledEvents.push(disableId);
          }
        });
      }

      // Create modulation lookup by note index for glissando
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

        // Check for glissando
        const glissando = mods.find(
          (m) => m.type === "pitch" && (m.subtype === "glissando" || m.subtype === "portamento")
        );

        // Handle chords
        if (Array.isArray(note.pitch)) {
          const noteNames = note.pitch.map((p) =>
            typeof p === "number" ? ToneLib.Frequency(p, "midi").toNote() : p
          );
          const eventId = ToneLib.Transport.schedule((schedTime) => {
            synth.triggerAttackRelease(noteNames, duration, schedTime, velocity);
          }, time);
          scheduledEvents.push(eventId);
          return;
        }

        // Convert pitch to note name
        const noteName = typeof note.pitch === "number"
          ? ToneLib.Frequency(note.pitch, "midi").toNote()
          : note.pitch;

        // Handle glissando using detune parameter or playbackRate
        if (glissando && glissando.to !== undefined) {
          const toNote = typeof glissando.to === "number"
            ? ToneLib.Frequency(glissando.to, "midi").toNote()
            : glissando.to;

          const startFreq = ToneLib.Frequency(noteName).toFrequency();
          const endFreq = ToneLib.Frequency(toNote).toFrequency();

          console.log(`[GLISSANDO] ${noteName} -> ${toNote}, detune:`, !!synth.detune, `playbackRate:`, !!synth.playbackRate);

          if (synth.detune) {
            // Synths: Use detune parameter (in cents)
            const cents = 1200 * Math.log2(endFreq / startFreq);
            console.log(`[GLISSANDO] Using detune: ${cents} cents`);

            const eventId = ToneLib.Transport.schedule((schedTime) => {
              synth.triggerAttack(noteName, schedTime, velocity);
              synth.detune.setValueAtTime(0, schedTime);
              synth.detune.linearRampToValueAtTime(cents, schedTime + duration);
              synth.triggerRelease(schedTime + duration);
            }, time);
            scheduledEvents.push(eventId);
          } else if (synth.playbackRate) {
            // Samplers: Use playbackRate parameter
            const startRate = 1.0;
            const endRate = endFreq / startFreq;
            console.log(`[GLISSANDO] Using playbackRate: ${startRate} -> ${endRate}`);

            const eventId = ToneLib.Transport.schedule((schedTime) => {
              synth.triggerAttack(noteName, schedTime, velocity);
              synth.playbackRate = startRate;

              // Schedule playback rate ramp
              if (synth.playbackRate.linearRampToValueAtTime) {
                synth.playbackRate.linearRampToValueAtTime(endRate, schedTime + duration);
              }

              synth.triggerRelease(schedTime + duration);
            }, time);
            scheduledEvents.push(eventId);
          } else {
            console.warn(`[GLISSANDO] Synth doesn't support detune or playbackRate - falling back to normal note`);
            const eventId = ToneLib.Transport.schedule((schedTime) => {
              synth.triggerAttackRelease(noteName, duration, schedTime, velocity);
            }, time);
            scheduledEvents.push(eventId);
          }
        } else {
          // Normal note
          const eventId = ToneLib.Transport.schedule((schedTime) => {
            synth.triggerAttackRelease(noteName, duration, schedTime, velocity);
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

        // Wait for all samplers to load
        console.log("Waiting for samples to load...");
        await window.Tone.loaded();
        console.log("Samples loaded, starting playback");
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
      // Stop and cancel all transport events FIRST
      window.Tone.Transport.stop();
      window.Tone.Transport.cancel(0);

      // Clean up all scheduled events
      scheduledEvents.forEach(eventId => {
        try {
          window.Tone.Transport.clear(eventId);
        } catch (e) {
          // Event may already be cleared
        }
      });
      scheduledEvents = [];

      // Clear synths only (don't recreate yet - wait for next play)
      activeSynths.forEach(s => {
        try {
          if (!s.disposed) {
            s.dispose();
          }
        } catch (e) {
          console.warn('Error disposing synth/effect:', e);
        }
      });
      activeSynths = [];
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
