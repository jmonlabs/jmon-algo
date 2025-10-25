// Constants
import { MusicTheoryConstants } from './constants/MusicTheoryConstants.js';

// Theory imports
import harmony from './theory/harmony/index.js';
import rhythm from './theory/rhythm/index.js';
import { MotifBank } from './theory/motifs/index.js';

// Generative algorithm imports
import { GaussianProcessRegressor } from './generative/gaussian-processes/index.js';
import { CellularAutomata } from './generative/cellular-automata/index.js';
import { Loop } from './generative/loops/index.js';
import { Darwin } from './generative/genetic/index.js';
import { RandomWalk, Chain, Phasor, PhasorSystem } from './generative/walks/index.js';
import { KernelGenerator } from './generative/gaussian-processes/index.js';
import { Mandelbrot, LogisticMap } from './generative/fractals/index.js';
import { MinimalismProcess, Tintinnabuli } from './generative/minimalism/index.js';

// Analysis imports
import * as analysisModule from './analysis/index.js';

// Visualization imports
import { CAVisualizer } from './visualization/cellular-automata/CAVisualizer.js';
import { FractalVisualizer } from './visualization/fractals/FractalVisualizer.js';
import { PlotRenderer } from './visualization/plots/PlotRenderer.js';

// Utils imports
import * as Utils from './utils.js';
import audioNS from './audio/index.js';

// Export namespaces
export const theory = {
    harmony,
    rhythm,
    motifs: {
        MotifBank
    }
};

export const constants = {
    theory: MusicTheoryConstants
};

export const generative = {
    gaussian: {
        Regressor: GaussianProcessRegressor,
        Kernel: KernelGenerator
    },
    automata: {
        Cellular: CellularAutomata
    },
    loops: Loop,
    genetic: {
        Darwin: Darwin
    },
    walks: {
        Random: RandomWalk,
        Chain: Chain,
        Phasor: {
            Vector: Phasor,
            System: PhasorSystem
        }
    },
    fractals: {
        Mandelbrot,
        LogisticMap
    },
    minimalism: {
        Process: MinimalismProcess,
        Tintinnabuli
    }
};

export const analysis = {
    ...analysisModule
};

export const visualization = {
    CAVisualizer,
    FractalVisualizer,
    PlotRenderer
};

export const utils = {
    ...Utils
};
export const audio = audioNS;

// Export everything as default
export default {
    theory,
    constants,
    generative,
    analysis,
    visualization,
    audio,
    utils
};
