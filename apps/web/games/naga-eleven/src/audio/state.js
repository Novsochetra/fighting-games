import { CROWD } from '../data/audio.js';
import { createEar } from './hear/ear.js';
import { createTrainingEar } from './hear/training-cues.js';
import { createMusic } from './music/player.js';

// `AudioContext` is the browser's class, or nothing where it has none: then the game is silent
export function createAudioState({ AudioContext = null, navigator = null, timers = globalThis }) {
  return {
    AudioContext,
    navigator,
    timers,
    context: null,
    chain: null,
    pump: null,
    volumes: { sound: 1, music: 1 },
    crowdLevel: CROWD.defaultLevel,
    excitement: 0,
    bed: null,
    voices: [],
    lastStarts: {},
    duck: { until: 0, depth: 1 },
    music: createMusic(),
    ear: createEar(),
    trainingEar: createTrainingEar(),
  };
}

export const isRunning = (audio) => audio.context?.state === 'running';

export const nowOf = (audio) => audio.context.currentTime;
