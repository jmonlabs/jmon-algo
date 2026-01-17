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
    background: #434F43;
    color: #fff;
    padding: 12px;
    border-radius: 8px;
    max-width: 800px;
    margin: 16px 0;
  `;

  // Controls row: [Play] [Stop] [Current Time] [========Timeline========] [Total Time]
  const controlsRow = document.createElement("div");
  controlsRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  const buttonStyle = `
    background: #2D3931;
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
    background: #F0C0C0;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  `;

  const timelineProgress = document.createElement("div");
  timelineProgress.style.cssText = `
    height: 100%;
    background: #AD8B8B;
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

    // Create a master limiter to prevent clipping when multiple tracks play
    const masterLimiter = new ToneLib.Limiter(-3).toDestination();
    const masterGain = new ToneLib.Gain(0.7).connect(masterLimiter); // Reduce overall volume
    activeSynths.push(masterLimiter);
    activeSynths.push(masterGain);

    // Helper to connect synth to master chain
    const connectToMaster = (node) => {
      node.disconnect();
      node.connect(masterGain);
    };

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

      // Create synth or sampler based on track configuration
      let synth;
      const synthSpec = originalTrack.synth;

      if (typeof synthSpec === 'number') {
        // GM instrument number (0-127)
        const urls = generateSamplerUrls(synthSpec);
        synth = new ToneLib.Sampler({
          urls,
          baseUrl: "", // URLs are already complete
          onload: () => console.log(`Loaded GM instrument ${synthSpec}`)
        });
        synth.connect(masterGain);
        console.log(`Creating Sampler for GM instrument ${synthSpec}`);
      } else if (typeof synthSpec === 'string') {
        // Synth type name or audioGraph reference
        try {
          synth = new ToneLib[synthSpec]();
          synth.connect(masterGain);
        } catch {
          synth = new ToneLib.PolySynth();
          synth.connect(masterGain);
        }
      } else if (typeof synthSpec === 'object' && synthSpec !== null) {
        // Inline synth definition { type, options }
        const synthType = synthSpec.type || 'PolySynth';
        try {
          const options = synthSpec.options || {};
          if (synthType === 'Sampler') {
            // Sampler needs special handling for loading
            synth = new ToneLib.Sampler({
              ...options,
              onload: () => console.log(`[SAMPLER] Loaded custom sampler for track ${originalTrackIndex}`),
              onerror: (error) => console.error(`[SAMPLER] Failed to load sample:`, error)
            });
            synth.connect(masterGain);
            console.log(`[SAMPLER] Creating custom Sampler with URLs:`, options.urls);
          } else {
            synth = new ToneLib[synthType](options);
            synth.connect(masterGain);
            console.log(`[SYNTH] Creating ${synthType} for track ${originalTrackIndex}`);
          }
        } catch (e) {
          console.error(`[SYNTH] Failed to create ${synthType}:`, e);
          synth = new ToneLib.PolySynth();
          synth.connect(masterGain);
        }
      } else {
        // Default to PolySynth
        synth = new ToneLib.PolySynth();
        synth.connect(masterGain);
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

        // Connect effect chain to master
        if (vibratoEffect && tremoloEffect) {
          synth.connect(vibratoEffect);
          vibratoEffect.connect(tremoloEffect);
          tremoloEffect.connect(masterGain);
        } else if (vibratoEffect) {
          synth.connect(vibratoEffect);
          vibratoEffect.connect(masterGain);
        } else if (tremoloEffect) {
          synth.connect(tremoloEffect);
          tremoloEffect.connect(masterGain);
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

        // Handle glissando using detune parameter
        if (glissando && glissando.to !== undefined) {
          const toNote = typeof glissando.to === "number"
            ? ToneLib.Frequency(glissando.to, "midi").toNote()
            : glissando.to;

          const startFreq = ToneLib.Frequency(noteName).toFrequency();
          const endFreq = ToneLib.Frequency(toNote).toFrequency();
          const cents = 1200 * Math.log2(endFreq / startFreq);

          // Account for microtuning offset if present
          const microtuningCents = (note.microtuning || 0) * 100;
          const startDetune = microtuningCents;
          const endDetune = microtuningCents + cents;

          // Check if main synth supports detune
          if (synth.detune) {
            // Main synth supports detune (e.g., MonoSynth, Synth)
            console.log(`[GLISSANDO] Using main synth detune: ${noteName} -> ${toNote} (${cents} cents)`);

            const eventId = ToneLib.Transport.schedule((schedTime) => {
              synth.triggerAttack(noteName, schedTime, velocity);
              synth.detune.setValueAtTime(startDetune, schedTime);
              synth.detune.linearRampToValueAtTime(endDetune, schedTime + duration);
              synth.triggerRelease(schedTime + duration);
            }, time);
            scheduledEvents.push(eventId);
          } else {
            // Create temporary MonoSynth for this glissando note
            // (PolySynth and Sampler don't expose detune for automation)
            console.log(`[GLISSANDO] Creating temporary MonoSynth: ${noteName} -> ${toNote} (${cents} cents)`);

            const glissSynth = new ToneLib.MonoSynth();
            glissSynth.connect(masterGain);
            activeSynths.push(glissSynth);

            const eventId = ToneLib.Transport.schedule((schedTime) => {
              glissSynth.triggerAttack(noteName, schedTime, velocity);
              glissSynth.detune.setValueAtTime(startDetune, schedTime);
              glissSynth.detune.linearRampToValueAtTime(endDetune, schedTime + duration);
              glissSynth.triggerRelease(schedTime + duration);
            }, time);
            scheduledEvents.push(eventId);
          }
        } else {
          // Normal note
          const eventId = ToneLib.Transport.schedule((schedTime) => {
            // Apply microtuning if present (microtuning is in semitones, detune expects cents)
            if (note.microtuning && synth.detune) {
              const cents = note.microtuning * 100; // Convert semitones to cents
              synth.triggerAttack(noteName, schedTime, velocity);
              synth.detune.setValueAtTime(cents, schedTime);
              synth.triggerRelease(schedTime + duration);
            } else {
              synth.triggerAttackRelease(noteName, duration, schedTime, velocity);
            }
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
