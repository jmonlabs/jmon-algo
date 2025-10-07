// import { JmonValidator } from '../utils/jmon-validator.js';
import { tonejs } from "../converters/tonejs.js";
import {
  CDN_SOURCES,
  createGMInstrumentNode,
  generateSamplerUrls,
  getPopularInstruments,
  GM_INSTRUMENTS,
} from "../utils/gm-instruments.js";
import { SYNTHESIZER_TYPES, ALL_EFFECTS } from "../constants/audio-effects.js";
import {
  COLORS,
  PLAYER_DIMENSIONS,
  TIMELINE_CONFIG,
  LAYOUT,
} from "../constants/ui-constants.js";
import {
  AUDIO_CONFIG,
  ERROR_MESSAGES,
  LOG_PREFIXES,
} from "../constants/player-constants.js";
/**
 * Music Player
 * Comprehensive music player inspired by djalgo player.py
 */

export function createPlayer(composition, options = {}) {
  // Defensive validation
  if (!composition || typeof composition !== "object") {
    console.error(`${LOG_PREFIXES.PLAYER} Invalid composition:`, composition);
    throw new Error(ERROR_MESSAGES.INVALID_COMPOSITION);
  }

  // Extract options
  const {
    autoplay = false,
    showDebug = false,
    customInstruments = {},
    autoMultivoice = true,
    maxVoices = 4,
    Tone: externalTone = null,
  } = options;

  // Ensure composition has the expected structure
  if (!composition.sequences && !composition.tracks) {
    console.error(
      `${LOG_PREFIXES.PLAYER} No sequences or tracks found in composition:`,
      composition,
    );
    throw new Error(ERROR_MESSAGES.NO_SEQUENCES_OR_TRACKS);
  }

  // Normalize sequences/tracks to ensure forEach works
  const tracks = composition.tracks || composition.sequences || [];
  if (!Array.isArray(tracks)) {
    console.error(
      `${LOG_PREFIXES.PLAYER} Tracks/sequences must be an array:`,
      tracks,
    );
    throw new Error(ERROR_MESSAGES.TRACKS_MUST_BE_ARRAY);
  }

  const tempo =
    composition.tempo || composition.bpm || AUDIO_CONFIG.DEFAULT_TEMPO;

  // Convert JMON to Tone.js format with multivoice support
  const conversionOptions = { autoMultivoice, maxVoices, showDebug };
  const convertedData = tonejs(composition, conversionOptions);

  // Use converted track data
  const { tracks: convertedTracks, metadata } = convertedData;
  let totalDuration = metadata.totalDuration;

  const colors = COLORS;

  // Create player UI container
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

  // Responsive: add a style block for mobile
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

  // Main layout container - responsive grid
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

  // Top container with track selector and tempo
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

  // Left column for track selector - now flexible
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

  // Get GM instruments for organized dropdown
  const gmInstruments = getPopularInstruments();

  // Get tracks from composition for UI (using JMON standard)
  const originalTracks = composition.tracks || [];
  const synthSelectors = [];

  originalTracks.forEach((track, index) => {
    // Find analysis for this track from converted data
    const trackAnalysis = convertedTracks.find(
      (t) => t.originalTrackIndex === index,
    )?.analysis;
    if (trackAnalysis?.hasGlissando) {
      console.warn(
        `Track ${
          track.label || track.name || index + 1
        } contient un glissando : la polyphonie sera désactivée pour cette piste.`,
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

    // Add Synthesizers optgroup
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
      "PluckSynth",
    ];

    // Add custom audioGraph instruments first if present (using JMON standard)
    const audioGraphNodes = composition.audioGraph || [];
    if (Array.isArray(audioGraphNodes) && audioGraphNodes.length > 0) {
      // Find the synthRef for this track
      const trackSynthRef = composition.tracks?.[index]?.synthRef;

      audioGraphNodes.forEach((node) => {
        if (node.id && node.type && node.type !== "Destination") {
          const option = document.createElement("option");
          option.value = `AudioGraph: ${node.id}`;
          option.textContent = node.id; // Use the node ID as display name (e.g., "Synth 1", "Synth 2")

          // Select this option if it matches the track's synthRef
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

      // Default selection priority for basic synths
      if (trackAnalysis?.hasGlissando && synthType === "Synth") {
        option.selected = true;
      } else if (
        !trackAnalysis?.hasGlissando &&
        !composition.tracks?.[index]?.synthRef &&
        synthType === "PolySynth"
      ) {
        option.selected = true;
      }

      // Disable polyphonic synths for glissando
      if (
        trackAnalysis?.hasGlissando &&
        (synthType === "PolySynth" || synthType === "DuoSynth")
      ) {
        option.disabled = true;
        option.textContent += " (mono only for glissando)";
      }
      synthGroup.appendChild(option);
    });

    synthSelect.appendChild(synthGroup);

    // Add GM Instruments optgroup
    const gmGroup = document.createElement("optgroup");
    gmGroup.label = "Sampled Instruments";

    // Group GM instruments by category
    const instrumentsByCategory = {};
    gmInstruments.forEach((instrument) => {
      if (!instrumentsByCategory[instrument.category]) {
        instrumentsByCategory[instrument.category] = [];
      }
      instrumentsByCategory[instrument.category].push(instrument);
    });

    // Add instruments organized by category
    Object.keys(instrumentsByCategory)
      .sort()
      .forEach((category) => {
        const categoryGroup = document.createElement("optgroup");
        categoryGroup.label = category;

        instrumentsByCategory[category].forEach((instrument) => {
          const option = document.createElement("option");
          option.value = `GM: ${instrument.name}`;
          option.textContent = instrument.name;

          // Disable GM instruments for glissando (samplers don't support smooth pitch bending well)
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

  // Right column for tempo and downloads
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

  // Vertical download buttons for large screens
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
    downloadWavButtonVertical,
  );

  // Hide vertical downloads by default - CSS will show them on larger screens
  verticalDownloads.style.display = "none";

  rightColumn.append(bpmContainer, verticalDownloads);

  // Timeline container
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

  // Current time display
  const currentTime = document.createElement("div");
  currentTime.textContent = "0:00";
  currentTime.style.cssText = `
        font-family: 'PT Sans', sans-serif;
        font-size: 14px;
        color: ${colors.text};
        min-width: 40px;
        text-align: center;
    `;

  // Total time display
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

  // Add timeline track styling to ensure visibility across browsers
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

  // Play/Pause button
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

  // Stop button
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

  // Control buttons container
  const controlsContainer = document.createElement("div");
  controlsContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0px;
    `;
  controlsContainer.append(playButton, stopButton);

  timelineContainer.append(currentTime, timeline, totalTime, controlsContainer);

  // Download buttons container
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

  // Assemble main layout
  mainLayout.appendChild(topContainer);
  mainLayout.appendChild(timelineContainer);

  // Keep original horizontal buttons for mobile
  container.append(mainLayout, buttonContainer);

  // Initialize Tone.js functionality
  let Tone,
    isPlaying = false,
    synths = [],
    parts = [];

  // Track sampler loading promises so we can await before starting
  let samplerLoadPromises = [];

  // Optional: AudioGraph support (Sampler nodes)
  let graphInstruments = null; // { [id]: Tone.Instrument }
  const originalTracksSource = composition.tracks || [];

  const buildAudioGraphInstruments = () => {
    if (!Tone) return null;
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
            noteKey = Tone.Frequency(parseInt(k, 10), "midi").toNote();
          } catch (e) {
            // keep original key if conversion fails
          }
        }
        out[noteKey] = v;
      });
      return out;
    };

    try {
      composition.audioGraph.forEach((node) => {
        const { id, type, options = {}, target } = node;
        if (!id || !type) return;
        let instrument = null;
        if (type === "Sampler") {
          // Normalize urls: use scientific note names for maximum compatibility
          const normalizedUrls = normalizeUrlsToNoteNames(options.urls);
          // Always use options signature so we can provide onload reliably
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
            },
          };
          if (options.baseUrl) samplerOpts.baseUrl = options.baseUrl;
          try {
            console.log(
              `[PLAYER] Building Sampler ${id} with urls:`,
              normalizedUrls,
              "baseUrl:",
              samplerOpts.baseUrl || "(none)",
            );
            instrument = new Tone.Sampler(samplerOpts);
          } catch (e) {
            console.error("[PLAYER] Failed to create Sampler:", e);
            instrument = null;
          }
          samplerLoadPromises.push(loadPromise);
          // Apply simple envelope if provided
          if (instrument && options.envelope && options.envelope.enabled) {
            if (typeof options.envelope.attack === "number") {
              instrument.attack = options.envelope.attack;
            }
            if (typeof options.envelope.release === "number") {
              instrument.release = options.envelope.release;
            }
          }
        } else if (SYNTHESIZER_TYPES.includes(type)) {
          // Basic synth support - do not connect to destination yet (effects chain will handle routing)
          try {
            instrument = new Tone[type](options);
          } catch (e) {
            console.warn(
              `[PLAYER] Failed to create ${type} from audioGraph, using PolySynth:`,
              e,
            );
            instrument = new Tone.PolySynth();
          }
        } else if (ALL_EFFECTS.includes(type)) {
          // Effect support - create the effect but don't connect yet
          try {
            instrument = new Tone[type](options);
            console.log(
              `[PLAYER] Created effect ${id} (${type}) with options:`,
              options,
            );
          } catch (e) {
            console.warn(`[PLAYER] Failed to create ${type} effect:`, e);
            instrument = null;
          }
        } else if (type === "Destination") {
          map[id] = Tone.Destination; // marker
        }
        if (instrument) {
          map[id] = instrument;
        }
      });

      // Second pass: Connect the audio graph routing
      if (Object.keys(map).length > 0) {
        composition.audioGraph.forEach((node) => {
          const { id, target } = node;
          if (!id || !map[id]) return;

          const currentNode = map[id];

          // Skip Destination nodes (they're the final output)
          if (currentNode === Tone.Destination) return;

          // Connect to target if specified, otherwise connect to destination
          if (target && map[target]) {
            try {
              if (map[target] === Tone.Destination) {
                currentNode.toDestination();
                console.log(`[PLAYER] Connected ${id} -> Destination`);
              } else {
                currentNode.connect(map[target]);
                console.log(`[PLAYER] Connected ${id} -> ${target}`);
              }
            } catch (e) {
              console.warn(`[PLAYER] Failed to connect ${id} -> ${target}:`, e);
              // Fallback to destination
              currentNode.toDestination();
            }
          } else {
            // No target specified, connect directly to destination
            currentNode.toDestination();
            console.log(
              `[PLAYER] Connected ${id} -> Destination (no target specified)`,
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

  // iOS detection utility
  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")}`;
  };

  // Set initial total time display
  totalTime.textContent = formatTime(totalDuration);

  const initializeTone = async () => {
    if (typeof window !== "undefined") {
      // Check for Tone.js as parameter, in window, or as global variable
      const existingTone =
        externalTone ||
        window.Tone ||
        (typeof Tone !== "undefined" ? Tone : null);
      if (!existingTone) {
        try {
          // Use Observable-compatible loading (no CSP violations)
          if (typeof require !== "undefined") {
            // Try Observable's require first with ES modules version
            console.log("[PLAYER] Loading Tone.js via require()...");
            const ToneFromRequire = await require("tone@14.8.49/build/Tone.js");
            // Handle different export formats
            window.Tone =
              ToneFromRequire.default ||
              ToneFromRequire.Tone ||
              ToneFromRequire;
          } else {
            // Fallback to ES6 import with correct module path
            console.log("[PLAYER] Loading Tone.js via import()...");
            const ToneModule = await import("https://esm.sh/tone@14.8.49");
            window.Tone = ToneModule.default || ToneModule.Tone || ToneModule;
          }

          // Validate that we got a proper Tone object with essential constructors
          if (
            !window.Tone ||
            typeof window.Tone !== "object" ||
            !window.Tone.PolySynth
          ) {
            console.warn(
              "[PLAYER] First load attempt failed, trying alternative CDN...",
            );

            // Try alternative CDN
            try {
              const ToneAlt = await import(
                "https://cdn.skypack.dev/tone@14.8.49"
              );
              window.Tone = ToneAlt.default || ToneAlt.Tone || ToneAlt;

              if (!window.Tone || !window.Tone.PolySynth) {
                throw new Error("Alternative CDN also failed");
              }
            } catch (altError) {
              console.warn(
                "[PLAYER] Alternative CDN failed, trying jsdelivr...",
              );

              // Last resort: jsdelivr
              try {
                const ToneJsdelivr = await import(
                  "https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js"
                );
                window.Tone =
                  ToneJsdelivr.default || ToneJsdelivr.Tone || ToneJsdelivr;

                if (!window.Tone || !window.Tone.PolySynth) {
                  throw new Error("All CDN attempts failed");
                }
              } catch (jsdelivrError) {
                throw new Error(
                  "Loaded Tone.js but got invalid object from all CDNs",
                );
              }
            }
          }

          console.log(
            "[PLAYER] Tone.js loaded successfully, version:",
            window.Tone.version || "unknown",
          );
        } catch (error) {
          console.warn("Could not auto-load Tone.js:", error.message);
          console.log(
            "To use the player, load Tone.js manually first using one of these methods:",
          );
          console.log(
            'Method 1: Tone = await require("tone@14.8.49/build/Tone.js")',
          );
          console.log(
            'Method 2: Tone = await import("https://esm.sh/tone@14.8.49").then(m => m.default)',
          );
          console.log(
            'Method 3: Tone = await import("https://cdn.skypack.dev/tone@14.8.49").then(m => m.default)',
          );
          return false;
        }
      } else {
        console.log(
          "[PLAYER] Using existing Tone.js, version:",
          existingTone.version || "unknown",
        );
        // Make sure window.Tone is set for consistency
        window.Tone = existingTone;
      }

      const toneInstance = window.Tone || existingTone;
      if (toneInstance) {
        Tone = toneInstance;

        // Debug: Log all available Tone constructors
        console.log("[PLAYER] Available Tone constructors:", {
          PolySynth: typeof Tone.PolySynth,
          Synth: typeof Tone.Synth,
          Part: typeof Tone.Part,
          Transport: typeof Tone.Transport,
          start: typeof Tone.start,
          context: !!Tone.context,
        });

        // Don't start audio context here - must wait for user gesture
        // Just validate that Tone.js is properly loaded
        console.log(
          "[PLAYER] Tone.js initialized, context state:",
          Tone.context ? Tone.context.state : "no context",
        );

        // iOS-specific logging
        if (isIOS()) {
          console.log(
            "[PLAYER] iOS device detected - audio context will start on user interaction",
          );
        }

        return true;
      }
    }
    console.warn("Tone.js not available");
    return false;
  };

  const setupAudio = () => {
    if (!Tone) {
      console.warn("[PLAYER] Tone.js not available, cannot setup audio");
      return;
    }

    // Validate that Tone.js has the required constructors
    const missingConstructors = [];
    if (!Tone.PolySynth) missingConstructors.push("PolySynth");
    if (!Tone.Synth) missingConstructors.push("Synth");
    if (!Tone.Part) missingConstructors.push("Part");
    if (!Tone.Transport) missingConstructors.push("Transport");

    if (missingConstructors.length > 0) {
      console.error(
        "[PLAYER] Tone.js is missing required constructors:",
        missingConstructors,
      );
      console.error(
        "[PLAYER] Available Tone properties:",
        Object.keys(Tone)
          .filter((k) => typeof Tone[k] === "function")
          .slice(0, 20),
      );
      console.error("[PLAYER] Tone object:", Tone);
      console.error(
        "[PLAYER] This usually means Tone.js did not load correctly. Try refreshing the page or loading Tone.js manually.",
      );
      return;
    }

    // Set up Transport timing FIRST to ensure correct BPM for all instruments
    Tone.Transport.bpm.value = metadata.tempo;
    console.log(
      `[PLAYER] Set Transport BPM to ${metadata.tempo} before building instruments`,
    );

    // Build audioGraph instruments (once) - now with correct BPM context
    if (!graphInstruments) {
      graphInstruments = buildAudioGraphInstruments();
      if (graphInstruments) {
        const samplerIds = Object.keys(graphInstruments).filter(
          (k) => graphInstruments[k] && graphInstruments[k].name === "Sampler",
        );
        if (samplerIds.length > 0) {
          console.log(
            "[PLAYER] Using audioGraph Samplers for tracks with synthRef:",
            samplerIds,
          );
        }
      }
    }

    // Clean up existing synths and parts (but do not dispose graph instruments)
    console.log("[PLAYER] Cleaning up existing audio...", {
      synths: synths.length,
      parts: parts.length,
    });

    // Stop Transport first to prevent overlapping
    Tone.Transport.stop();
    // Note: NOT using Tone.Transport.cancel() here as it might interfere with loop timing
    Tone.Transport.position = 0;

    // Stop all parts first
    parts.forEach((p, index) => {
      try {
        p.stop();
      } catch (e) {
        console.warn(`[PLAYER] Failed to stop part ${index}:`, e);
      }
    });

    // Dispose all parts
    parts.forEach((p, index) => {
      try {
        p.dispose();
      } catch (e) {
        console.warn(`[PLAYER] Failed to dispose part ${index}:`, e);
      }
    });

    // Dispose synths (except graph instruments)
    synths.forEach((s, index) => {
      // Avoid disposing shared graph instruments
      if (!graphInstruments || !Object.values(graphInstruments).includes(s)) {
        try {
          // Disconnect from destination first
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

    // Create synths and parts from converted track data
    convertedTracks.forEach((trackConfig) => {
      const {
        originalTrackIndex,
        voiceIndex,
        totalVoices,
        trackInfo,
        synthConfig,
        partEvents,
      } = trackConfig;

      // Prefer audioGraph instrument if synthRef is set
      const originalTrack = originalTracksSource[originalTrackIndex] || {};
      const synthRef = originalTrack.synthRef;

      // Normalize event times: treat numeric times/durations as beats and convert to seconds
      const secPerBeat = 60 / metadata.tempo;
      const normalizedEvents = (partEvents || []).map((ev) => {
        const time =
          typeof ev.time === "number" ? ev.time * secPerBeat : ev.time;
        const duration =
          typeof ev.duration === "number"
            ? ev.duration * secPerBeat
            : ev.duration;
        return { ...ev, time, duration };
      });

      let synth = null;
      if (synthRef && graphInstruments && graphInstruments[synthRef]) {
        synth = graphInstruments[synthRef];
      } else {
        // Use selected synthesizer from UI or converted config
        const selectedSynth = synthSelectors[originalTrackIndex]
          ? synthSelectors[originalTrackIndex].value
          : synthConfig.type;

        try {
          // Check if this is an AudioGraph instrument selection
          if (selectedSynth.startsWith("AudioGraph: ")) {
            const audioGraphId = selectedSynth.substring(12); // Remove 'AudioGraph: ' prefix
            if (graphInstruments && graphInstruments[audioGraphId]) {
              synth = graphInstruments[audioGraphId];
              console.log(
                `[PLAYER] Using audioGraph instrument: ${audioGraphId}`,
              );
            } else {
              throw new Error(
                `AudioGraph instrument ${audioGraphId} not found`,
              );
            }
          } else if (selectedSynth.startsWith("GM: ")) {
            const instrumentName = selectedSynth.substring(4); // Remove 'GM: ' prefix
            const gmInstrument = gmInstruments.find(
              (inst) => inst.name === instrumentName,
            );

            if (gmInstrument) {
              console.log(`[PLAYER] Loading GM instrument: ${instrumentName}`);

              // Generate sampler URLs for the selected GM instrument using balanced strategy
              const samplerUrls = generateSamplerUrls(
                gmInstrument.program,
                CDN_SOURCES[0],
                [36, 84],
                "balanced",
              );

              console.log(
                `[PLAYER] Loading GM instrument ${instrumentName} with ${
                  Object.keys(samplerUrls).length
                } samples`,
              );
              console.log(
                `[PLAYER] Sample notes:`,
                Object.keys(samplerUrls).sort(),
              );

              // Create Tone.js Sampler with GM instrument samples
              synth = new Tone.Sampler({
                urls: samplerUrls,
                onload: () =>
                  console.log(
                    `[PLAYER] GM instrument ${instrumentName} loaded successfully`,
                  ),
                onerror: (error) => {
                  console.error(
                    `[PLAYER] Failed to load GM instrument ${instrumentName}:`,
                    error,
                  );
                  // Still continue with the sampler, it may have loaded enough samples to be usable
                },
              }).toDestination();
            } else {
              throw new Error(`GM instrument ${instrumentName} not found`);
            }
          } else {
            // Use synth type from converter (handles glissando compatibility)
            const synthType =
              synthConfig.reason === "glissando_compatibility"
                ? synthConfig.type
                : selectedSynth;

            // Validate that the synth constructor exists
            if (!Tone[synthType] || typeof Tone[synthType] !== "function") {
              throw new Error(`Tone.${synthType} is not a constructor`);
            }

            synth = new Tone[synthType]().toDestination();
            if (
              synthConfig.reason === "glissando_compatibility" &&
              voiceIndex === 0
            ) {
              console.warn(
                `[MULTIVOICE] Using ${synthType} instead of ${synthConfig.original} for glissando in ${trackInfo.label}`,
              );
            }
          }
        } catch (error) {
          console.warn(
            `Failed to create ${selectedSynth}, using PolySynth:`,
            error,
          );
          try {
            if (!Tone.PolySynth || typeof Tone.PolySynth !== "function") {
              throw new Error("Tone.PolySynth is not available");
            }
            synth = new Tone.PolySynth().toDestination();
          } catch (fallbackError) {
            console.error(
              "Fatal: Cannot create any synth, Tone.js may not be properly loaded:",
              fallbackError,
            );
            return; // Skip this track if we can't create any synth
          }
        }
      }

      synths.push(synth);

      // Log voice info
      if (totalVoices > 1) {
        console.log(
          `[MULTIVOICE] Track "${trackInfo.label}" voice ${
            voiceIndex + 1
          }: ${partEvents.length} notes`,
        );
      }

      const part = new Tone.Part((time, note) => {
        // Log chaque note jouée
        if (Array.isArray(note.pitch)) {
          // Chord (no glissando for chords)
          note.pitch.forEach((n) => {
            let noteName = "C4";
            if (typeof n === "number") {
              noteName = Tone.Frequency(n, "midi").toNote();
            } else if (typeof n === "string") {
              noteName = n;
            } else if (Array.isArray(n) && typeof n[0] === "string") {
              noteName = n[0];
            }
            synth.triggerAttackRelease(noteName, note.duration, time);
          });
        } else if (
          Array.isArray(note.modulations) &&
          note.modulations.some(
            (m) =>
              m.type === "pitch" &&
              (m.subtype === "glissando" || m.subtype === "portamento") &&
              (m.to !== undefined || m.target !== undefined),
          )
        ) {
          // Glissando: play both notes with slight overlap to simulate slide
          let noteName =
            typeof note.pitch === "number"
              ? Tone.Frequency(note.pitch, "midi").toNote()
              : note.pitch;
          const gliss = note.modulations.find(
            (m) =>
              m.type === "pitch" &&
              (m.subtype === "glissando" || m.subtype === "portamento") &&
              (m.to !== undefined || m.target !== undefined),
          );
          const glissTarget =
            gliss && (gliss.to !== undefined ? gliss.to : gliss.target);
          let targetName =
            typeof glissTarget === "number"
              ? Tone.Frequency(glissTarget, "midi").toNote()
              : glissTarget;

          console.log("[PLAYER] Glissando", {
            fromNote: noteName,
            toNote: targetName,
            duration: note.duration,
            time,
          });

          console.log(
            "[PLAYER] Glissando effect starting from",
            noteName,
            "to",
            targetName,
          );

          // Use triggerAttack/Release with pitch bend for smooth glissando
          synth.triggerAttack(noteName, time, note.velocity || 0.8);

          // Calculate pitch bend in cents
          const startFreq = Tone.Frequency(noteName).toFrequency();
          const endFreq = Tone.Frequency(targetName).toFrequency();
          const totalCents = 1200 * Math.log2(endFreq / startFreq);

          // Create pitch slide using detune if available
          if (
            synth.detune &&
            synth.detune.setValueAtTime &&
            synth.detune.linearRampToValueAtTime
          ) {
            synth.detune.setValueAtTime(0, time);
            synth.detune.linearRampToValueAtTime(
              totalCents,
              time + note.duration,
            );
            console.log(
              "[PLAYER] Applied detune glissando:",
              totalCents,
              "cents over",
              note.duration,
              "beats",
            );
          } else {
            // Fallback: Quick chromatic notes
            const startMidi = Tone.Frequency(noteName).toMidi();
            const endMidi = Tone.Frequency(targetName).toMidi();
            const steps = Math.max(3, Math.abs(endMidi - startMidi));
            const stepDuration = note.duration / steps;

            for (let i = 1; i < steps; i++) {
              const ratio = i / (steps - 1);
              const currentFreq =
                startFreq * Math.pow(endFreq / startFreq, ratio);
              const currentNote = Tone.Frequency(currentFreq).toNote();
              const currentTime = time + i * stepDuration;
              synth.triggerAttackRelease(
                currentNote,
                stepDuration * 0.8,
                currentTime,
                (note.velocity || 0.8) * 0.7,
              );
            }
            console.log(
              "[PLAYER] Applied chromatic glissando with",
              steps,
              "steps",
            );
          }

          synth.triggerRelease(time + note.duration);
        } else {
          // Single note with articulation
          let noteName = "C4";
          if (typeof note.pitch === "number") {
            noteName = Tone.Frequency(note.pitch, "midi").toNote();
          } else if (typeof note.pitch === "string") {
            noteName = note.pitch;
          } else if (
            Array.isArray(note.pitch) &&
            typeof note.pitch[0] === "string"
          ) {
            noteName = note.pitch[0];
          }
          let noteDuration = note.duration;
          let noteVelocity = note.velocity || 0.8;

          const mods = Array.isArray(note.modulations) ? note.modulations : [];

          // Apply duration scaling if present
          const durScale = mods.find(
            (m) => m.type === "durationScale" && typeof m.factor === "number",
          );
          if (durScale) {
            noteDuration = note.duration * durScale.factor;
          }

          // Apply velocity boost if present
          const velBoost = mods.find(
            (m) =>
              m.type === "velocityBoost" && typeof m.amountBoost === "number",
          );
          if (velBoost) {
            noteVelocity = Math.min(noteVelocity + velBoost.amountBoost, 1.0);
          }
          synth.triggerAttackRelease(
            noteName,
            noteDuration,
            time,
            noteVelocity,
          );
        }
      }, normalizedEvents);

      // Don't start the part yet - wait for user to click play
      // part.start(0) will be called in the play button handler

      parts.push(part);
    });

    // Use duration from converter

    // Set Transport loop end in seconds to match event scheduling (BPM already set above)
    Tone.Transport.loopEnd = totalDuration; // seconds
    Tone.Transport.loop = true;

    // Reset transport completely but keep our new Parts
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    totalTime.textContent = formatTime(totalDuration);
  };

  // Throttle timeline updates for better performance
  let lastTimelineUpdate = 0;
  const TIMELINE_UPDATE_INTERVAL = TIMELINE_CONFIG.UPDATE_INTERVAL; // Update every 100ms instead of every frame

  const updateTimeline = () => {
    const now = performance.now();
    const shouldUpdate = now - lastTimelineUpdate >= TIMELINE_UPDATE_INTERVAL;

    if (Tone && isPlaying) {
      // Compute loop length in seconds (loopEnd is set in seconds)
      const loopSeconds =
        typeof Tone.Transport.loopEnd === "number"
          ? Tone.Transport.loopEnd
          : Tone.Time(Tone.Transport.loopEnd).toSeconds();

      if (shouldUpdate) {
        const elapsed = Tone.Transport.seconds % loopSeconds;
        const progress = (elapsed / loopSeconds) * 100;
        timeline.value = Math.min(progress, 100);
        currentTime.textContent = formatTime(elapsed);
        totalTime.textContent = formatTime(loopSeconds);
        lastTimelineUpdate = now;
      }

      // Check if we should continue updating
      if (Tone.Transport.state === "started" && isPlaying) {
        requestAnimationFrame(updateTimeline);
      } else if (
        Tone.Transport.state === "stopped" ||
        Tone.Transport.state === "paused"
      ) {
        // Keep updating display even when paused
        if (shouldUpdate) {
          const elapsed = Tone.Transport.seconds % loopSeconds;
          const progress = (elapsed / loopSeconds) * 100;
          timeline.value = Math.min(progress, 100);
          currentTime.textContent = formatTime(elapsed);
          lastTimelineUpdate = now;
        }

        if (Tone.Transport.state === "stopped") {
          // Only reset to beginning when actually stopped
          Tone.Transport.seconds = 0;
          timeline.value = 0;
          currentTime.textContent = formatTime(0);
          isPlaying = false;
          playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
        }
      }
    }
  };

  // Event handlers - using addEventListener to avoid CSP violations
  playButton.addEventListener("click", async () => {
    if (!Tone) {
      if (await initializeTone()) {
        setupAudio();
      } else {
        console.error("[PLAYER] Failed to initialize Tone.js");
        return;
      }
    }

    if (isPlaying) {
      // Pause transport instead of stopping - this preserves the current position
      console.log("[PLAYER] Pausing playback...");
      Tone.Transport.pause();

      isPlaying = false;
      playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
      console.log("[PLAYER] Playback paused");
    } else {
      // Ensure audio context is started first - critical for iOS
      if (!Tone.context || Tone.context.state !== "running") {
        try {
          await Tone.start();
          console.log(
            "[PLAYER] Audio context started:",
            Tone.context ? Tone.context.state : "unknown",
          );

          // Additional iOS-specific setup
          if (Tone.context && typeof Tone.context.resume === "function") {
            await Tone.context.resume();
            console.log("[PLAYER] Audio context resumed for iOS compatibility");
          }
        } catch (error) {
          console.error("[PLAYER] Failed to start audio context:", error);

          // More helpful error messages
          let errorMsg = "Failed to start audio. ";
          if (isIOS()) {
            errorMsg +=
              "On iOS, please ensure your device isn't in silent mode and try again.";
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

      // Only reset position if we're not in a paused state
      if (Tone.Transport.state !== "paused") {
        Tone.Transport.stop();
        Tone.Transport.position = 0;
        console.log("[PLAYER] Starting from beginning");
      } else {
        console.log("[PLAYER] Resuming from paused position");
      }
      // Note: NOT using cancel() here to preserve loop timing accuracy

      console.log(
        "[PLAYER] Transport state before start:",
        Tone.Transport.state,
      );
      console.log(
        "[PLAYER] Transport position reset to:",
        Tone.Transport.position,
      );
      console.log(
        "[PLAYER] Audio context state:",
        Tone.context ? Tone.context.state : "unknown",
      );
      console.log("[PLAYER] Parts count:", parts.length);
      console.log("[PLAYER] Synths count:", synths.length);
      // Wait for samplers to load if present
      if (graphInstruments) {
        const samplers = Object.values(graphInstruments).filter(
          (inst) => inst && inst.name === "Sampler",
        );
        if (samplers.length > 0 && samplerLoadPromises.length > 0) {
          console.log(
            `[PLAYER] Waiting for ${samplers.length} sampler(s) to load...`,
          );
          try {
            await Promise.all(samplerLoadPromises);
            console.log("[PLAYER] All samplers loaded.");
          } catch (e) {
            console.warn("[PLAYER] Sampler load wait error:", e);
            // Abort start if samples failed to load
            return;
          }
        }
      }

      // Start all parts at position 0 (only when user clicks play)
      if (parts.length === 0) {
        console.error(
          "[PLAYER] No parts available to start. This usually means setupAudio() failed.",
        );
        console.error(
          "[PLAYER] Try refreshing the page or check if Tone.js is properly loaded.",
        );
        return;
      }

      // Only restart parts if transport was not in paused state
      if (Tone.Transport.state !== "paused") {
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

      // Start transport at position 0
      Tone.Transport.start();
      isPlaying = true;
      playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-pause"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>`;
      updateTimeline();
    }
  });

  // Stop button handler
  stopButton.addEventListener("click", async () => {
    if (!Tone) {
      return;
    }

    console.log("[PLAYER] Stopping playback completely...");

    // Stop transport and all parts with proper cleanup
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear all scheduled events
    Tone.Transport.position = 0; // Reset to beginning

    parts.forEach((part, index) => {
      try {
        part.stop();
      } catch (e) {
        console.warn(
          `[PLAYER] Failed to stop part ${index} during complete stop:`,
          e,
        );
      }
    });

    // Reset UI
    isPlaying = false;
    timeline.value = 0;
    currentTime.textContent = formatTime(0);
    playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;

    console.log("[PLAYER] Playback stopped completely");
  });

  timeline.addEventListener("input", () => {
    if (Tone && totalDuration > 0) {
      const time = (timeline.value / 100) * totalDuration;
      const wasPlaying = isPlaying;

      // If playing, pause temporarily for seeking
      if (wasPlaying) {
        Tone.Transport.pause();
      }

      // Set the new position
      Tone.Transport.seconds = time;
      currentTime.textContent = formatTime(time);

      // Resume if it was playing before
      if (wasPlaying) {
        setTimeout(() => {
          Tone.Transport.start();
        }, 50); // Small delay to ensure position is set
      }
    }
  });

  bpmInput.addEventListener("change", () => {
    const newTempo = parseInt(bpmInput.value);
    if (Tone && newTempo >= 60 && newTempo <= 240) {
      console.log(`[PLAYER] Tempo changed to ${newTempo} BPM`);

      // Apply tempo change immediately - Tone.js handles this gracefully
      Tone.Transport.bpm.value = newTempo;
      console.log(`[PLAYER] Tempo changed to ${newTempo} BPM`);

      // If playing, the tempo change takes effect immediately
      // No need to stop/restart for tempo changes
    } else {
      bpmInput.value = Tone ? Tone.Transport.bpm.value : tempo;
    }
  });

  // Add event handlers for synthesizer selection changes
  synthSelectors.forEach((select) => {
    select.addEventListener("change", () => {
      if (Tone && synths.length > 0) {
        console.log(
          "[PLAYER] Synthesizer selection changed, reinitializing audio...",
        );
        // Stop playing temporarily to reinitialize with new synths
        const wasPlaying = isPlaying;
        if (isPlaying) {
          Tone.Transport.stop();
          isPlaying = false;
        }

        setupAudio(); // Reinitialize audio with new synthesizers

        // Restart if it was playing before
        if (wasPlaying) {
          setTimeout(() => {
            Tone.Transport.start();
            isPlaying = true;
            playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-pause"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>`;
          }, 100);
        } else {
          playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-play"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
        }
      }
    });
  });

  // Download button handlers
  const handleMIDIDownload = async () => {
    try {
      // Dynamic import of MIDI converter
      const { midi } = await import("../converters/index.js");

      // Convert composition to MIDI
      const midiData = midi(composition);

      // Create MIDI file using @tonejs/midi
      let ToneMidi;
      if (typeof require !== "undefined") {
        ToneMidi = await require("https://esm.sh/@tonejs/midi@2.0.28");
      } else {
        const module = await import("https://esm.sh/@tonejs/midi@2.0.28");
        ToneMidi = module.default || module;
      }

      const midiFile = new ToneMidi.Midi();
      midiFile.header.setTempo(midiData.header.bpm);

      // Add tracks
      midiData.tracks.forEach((trackData) => {
        const track = midiFile.addTrack();
        track.name = trackData.label || "Track";

        trackData.notes.forEach((note) => {
          track.addNote({
            midi: typeof note.pitch === "number" ? note.pitch : 60,
            time: note.time || 0,
            duration: note.duration || 0.5,
            velocity: note.velocity || 0.8,
          });
        });
      });

      // Create blob and download
      const blob = new Blob([midiFile.toArray()], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${composition.metadata?.title || "composition"}.mid`;
      a.click();
      URL.revokeObjectURL(url);

      console.log("✓ MIDI download complete");
    } catch (error) {
      console.error("MIDI download error:", error);
      alert("Failed to download MIDI: " + error.message);
    }
  };

  const handleWavDownload = async () => {
    try {
      if (!Tone || !Tone.Offline) {
        alert("Tone.js not loaded - cannot generate WAV");
        return;
      }

      console.log("Rendering WAV offline...");

      // Calculate total duration
      const buffer = await Tone.Offline(async ({ transport }) => {
        transport.bpm.value = metadata.tempo;

        // Recreate synths for offline rendering
        const offlineSynths = [];

        convertedTracks.forEach((trackConfig) => {
          const { originalTrackIndex, partEvents } = trackConfig;
          const originalTrack = originalTracksSource[originalTrackIndex] || {};
          const synthRef = originalTrack.synthRef;

          let synth = null;
          if (synthRef && graphInstruments && graphInstruments[synthRef]) {
            synth = graphInstruments[synthRef];
          } else {
            const selectedSynth =
              synthSelectors[originalTrackIndex]?.value || "PolySynth";

            if (selectedSynth.startsWith("GM: ")) {
              // Use simple synth for offline rendering (samplers are complex)
              synth = new Tone.PolySynth().toDestination();
            } else {
              try {
                synth = new Tone[selectedSynth]().toDestination();
              } catch {
                synth = new Tone.PolySynth().toDestination();
              }
            }
          }

          offlineSynths.push(synth);

          // Schedule notes
          partEvents.forEach((note) => {
            const time =
              typeof note.time === "number"
                ? note.time * (60 / metadata.tempo)
                : note.time;
            const duration =
              typeof note.duration === "number"
                ? note.duration * (60 / metadata.tempo)
                : note.duration;

            if (Array.isArray(note.pitch)) {
              const notes = note.pitch.map((p) =>
                typeof p === "number" ? Tone.Frequency(p, "midi").toNote() : p,
              );
              synth.triggerAttackRelease(
                notes,
                duration,
                time,
                note.velocity || 0.8,
              );
            } else {
              const noteName =
                typeof note.pitch === "number"
                  ? Tone.Frequency(note.pitch, "midi").toNote()
                  : note.pitch;
              synth.triggerAttackRelease(
                noteName,
                duration,
                time,
                note.velocity || 0.8,
              );
            }
          });
        });

        transport.start(0);
      }, totalDuration + 1);

      // Convert to WAV
      const wavBlob = await audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${composition.metadata?.title || "composition"}.wav`;
      a.click();
      URL.revokeObjectURL(url);

      console.log("✓ WAV download complete");
    } catch (error) {
      console.error("WAV download error:", error);
      alert("Failed to download WAV: " + error.message);
    }
  };

  // Helper: Convert AudioBuffer to WAV blob
  function audioBufferToWav(buffer) {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV header
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

    // Interleave channels
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i]),
        );
        view.setInt16(offset, sample * 0x7fff, true);
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

  // Horizontal buttons (mobile)
  downloadMIDIButton.addEventListener("click", handleMIDIDownload);
  downloadWavButton.addEventListener("click", handleWavDownload);

  // Vertical buttons (desktop)
  downloadMIDIButtonVertical.addEventListener("click", handleMIDIDownload);
  downloadWavButtonVertical.addEventListener("click", handleWavDownload);

  // Initialize if Tone.js is already available
  const initialTone =
    (typeof window !== "undefined" && window.Tone) ||
    (typeof Tone !== "undefined" ? Tone : null);
  if (initialTone) {
    initializeTone().then(() => {
      setupAudio();
      // Auto-start playback if autoplay is enabled
      if (autoplay) {
        setTimeout(() => {
          playButton.click();
        }, 500); // Small delay to ensure audio is fully initialized
      }
    });
  }

  // If autoplay is enabled but Tone.js isn't available yet, try later
  if (autoplay && !initialTone) {
    const autoplayInterval = setInterval(() => {
      const currentTone =
        (typeof window !== "undefined" && window.Tone) ||
        (typeof Tone !== "undefined" ? Tone : null);
      if (currentTone) {
        clearInterval(autoplayInterval);
        setTimeout(() => {
          playButton.click();
        }, 500);
      }
    }, 100); // Check every 100ms for Tone.js availability

    // Clear interval after 10 seconds to avoid infinite checking
    setTimeout(() => {
      clearInterval(autoplayInterval);
    }, 10000);
  }

  return container;
}
