// Lazy plotly.js import - will be handled gracefully if not available
let Plotly = null;
let plotlyLoadAttempted = false;

async function getPlotly() {
  if (plotlyLoadAttempted) return Plotly;
  plotlyLoadAttempted = true;
  
  try {
    if (typeof window !== 'undefined' && window.Plotly) {
      Plotly = window.Plotly;
      return Plotly;
    }
    
    if (typeof window === 'undefined') {
      const plotlyPackage = 'plot' + 'ly.js'; // Avoid rollup detection
      const plotlyModule = await import(plotlyPackage);
      Plotly = plotlyModule.default || plotlyModule;
      return Plotly;
    }
    
    return null;
  } catch (error) {
    console.warn('Plotly.js not available. Visualization methods will return placeholder data.');
    return null;
  }
}

export class LoopVisualizer {
  /**
   * Plot loops using polar coordinate system, matching Python implementation
   * Works with JMON-compliant loop data
   */
  static async plotLoops(
    loops,
    measureLength = 4,
    pulse = 1/4,
    colors = null,
    options = {}
  ) {
    const {
      container = 'loop-plot',
      title = 'Loop Visualization',
      showDurationArcs = true,
      showMarkers = true,
      showShapes = true,
      colorScheme = 'colorblind' // 'colorblind', 'viridis', 'classic'
    } = options;

    // Convert loops object to array of tracks
    const tracks = Object.values(loops);
    
    // Generate colors if not provided
    const layerColors = colors || this.generateColors(tracks.length, colorScheme);
    
    const traces = [];

    // Create traces for each loop track
    tracks.forEach((track, trackIndex) => {
      if (!track.notes || track.notes.length === 0) return;
      
      // Convert JMON notes to polar coordinates
      const activeNotes = track.notes.filter(note => note.pitch !== null);
      
      if (activeNotes.length === 0) return;

      // Create duration arcs for each note
      if (showDurationArcs || showMarkers) {
        activeNotes.forEach(note => {
          const startTheta = (note.time / measureLength) * 360;
          const durationTheta = (note.duration / measureLength) * 360;
          
          // Duration arc trace
          if (showDurationArcs && durationTheta > 1) { // Only show arcs for durations > 1 degree
            const arcPoints = this.generateArcPoints(startTheta, durationTheta, 50);
            const radius = Array(50).fill(tracks.length - trackIndex - 1);

            traces.push({
              type: 'scatterpolar',
              r: radius,
              theta: arcPoints,
              mode: 'lines',
              line: {
                color: 'rgba(60, 60, 60, 0.65)',
                width: 8
              },
              name: `${track.label} Duration`,
              showlegend: false
            });
          }

          // Start and end markers
          if (showMarkers) {
            [startTheta, (startTheta + durationTheta) % 360].forEach(theta => {
              traces.push({
                type: 'scatterpolar',
                r: [tracks.length - trackIndex - 0.9, tracks.length - trackIndex - 1.1],
                theta: [theta, theta],
                mode: 'lines',
                line: {
                  color: 'Black',
                  width: 3
                },
                name: `${track.label} Markers`,
                showlegend: false
              });
            });
          }
        });
      }

      // Main track shape
      if (showShapes) {
        const noteAngles = activeNotes.map(note => (note.time / measureLength) * 360);
        if (noteAngles.length > 1) {
          noteAngles.push(noteAngles[0]); // Close the loop

          traces.push({
            type: 'scatterpolar',
            r: Array(noteAngles.length).fill(tracks.length - trackIndex - 1),
            theta: noteAngles,
            mode: 'lines',
            line: {
              color: 'rgba(0, 0, 0, 0.65)',
              width: 1
            },
            fill: 'toself',
            fillcolor: layerColors[trackIndex % layerColors.length],
            name: track.label,
            showlegend: false
          });
        }
      }
    });

    // Generate tick values and labels
    const tickvals = this.generateTickValues(measureLength, pulse);
    const ticktext = this.generateTickLabels(measureLength, pulse);
    // Radial layers are plotted from outside (index 0) to inside (index N-1)
    // Reverse labels to align outer ring with the first track
    const trackNames = tracks.map(track => track.label).reverse();

    const layout = {
      title: { text: title },
      polar: {
        radialaxis: {
          visible: true,
          range: [tracks.length, -0.1],
          tickvals: Array.from({length: tracks.length}, (_, i) => i),
          ticktext: trackNames
        },
        angularaxis: {
          tickvals: tickvals,
          ticktext: ticktext,
          direction: 'clockwise',
          rotation: 90
        }
      },
      template: 'none',
      showlegend: false
    };

    const config = {
      responsive: true,
      displayModeBar: true
    };

    const plotly = await getPlotly();
    if (!plotly) {
      throw new Error('Plotly.js not available for visualization');
    }
    
    return plotly.newPlot(container, traces, layout, config);
  }

  /**
   * Generate colors using different schemes, optimized for accessibility
   */
  static generateColors(count, scheme = 'colorblind') {
    const colors = [];
    
    switch (scheme) {
      case 'colorblind':
        // Wong's colorblind-friendly palette
        const cbPalette = [
          'rgba(230, 159, 0, 0.65)',    // Orange
          'rgba(86, 180, 233, 0.65)',   // Sky blue  
          'rgba(0, 158, 115, 0.65)',    // Bluish green
          'rgba(240, 228, 66, 0.65)',   // Yellow
          'rgba(0, 114, 178, 0.65)',    // Blue
          'rgba(213, 94, 0, 0.65)',     // Vermillion
          'rgba(204, 121, 167, 0.65)'   // Reddish purple
        ];
        
        for (let i = 0; i < count; i++) {
          colors.push(cbPalette[i % cbPalette.length]);
        }
        break;
        
      case 'viridis':
        // Viridis-inspired colorblind-friendly gradient
        const viridisColors = [
          'rgba(68, 1, 84, 0.65)',      // Purple
          'rgba(59, 82, 139, 0.65)',    // Blue-purple
          'rgba(33, 144, 140, 0.65)',   // Teal
          'rgba(94, 201, 98, 0.65)',    // Green
          'rgba(253, 231, 37, 0.65)'    // Yellow
        ];
        
        for (let i = 0; i < count; i++) {
          if (count <= viridisColors.length) {
            colors.push(viridisColors[i]);
          } else {
            // Interpolate for more colors
            const ratio = i / (count - 1);
            const scaledIndex = ratio * (viridisColors.length - 1);
            const lowerIndex = Math.floor(scaledIndex);
            const upperIndex = Math.min(lowerIndex + 1, viridisColors.length - 1);
            colors.push(viridisColors[lowerIndex]); // Simplified - could add interpolation
          }
        }
        break;
        
      case 'classic':
      default:
        // Original HSV-based generation (less accessible)
        for (let i = 0; i < count; i++) {
          const hue = i / count;
          const rgb = this.hsvToRgb(hue, 1, 1);
          colors.push(`rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, 0.5)`);
        }
        break;
    }
    
    return colors;
  }

  /**
   * Convert HSV to RGB color space
   */
  static hsvToRgb(h, s, v) {
    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = g = b = 0;
    }

    return { r, g, b };
  }

  /**
   * Generate arc points for smooth curves
   */
  static generateArcPoints(startTheta, durationTheta, numPoints) {
    const points = [];
    const endTheta = startTheta + durationTheta;
    
    for (let i = 0; i < numPoints; i++) {
      const theta = startTheta + (i / (numPoints - 1)) * durationTheta;
      points.push(theta % 360);
    }
    
    return points;
  }


  /**
   * Generate tick values for angular axis
   */
  static generateTickValues(measureLength, pulse) {
    const tickvals = [];
    const numTicks = Math.floor(measureLength / pulse);
    
    for (let i = 0; i < numTicks; i++) {
      tickvals.push((i * 360) / numTicks);
    }
    
    return tickvals;
  }

  /**
   * Generate tick labels for angular axis
   */
  static generateTickLabels(measureLength, pulse) {
    const ticktext = [];
    const numTicks = Math.floor(measureLength / pulse);
    
    for (let i = 0; i < numTicks; i++) {
      const beat = (i * pulse) % measureLength;
      ticktext.push(beat.toString());
    }
    
    return ticktext;
  }

}