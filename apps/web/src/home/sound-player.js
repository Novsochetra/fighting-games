import { CUES } from './sound-cues.js';
import { createNoiseBuffer, scheduleVoice } from './sound-synth.js';

export const MASTER_VOLUME = 0.7;
// Scheduling a hair ahead keeps the first voice of a cue from being clipped by the audio thread.
const LOOKAHEAD = 0.01;

function buildGraph(context) {
  const master = context.createGain();
  master.gain.value = MASTER_VOLUME;
  // A gentle limiter, so cues fired close together never clip.
  const limiter = context.createDynamicsCompressor();
  master.connect(limiter);
  limiter.connect(context.destination);
  return { context, destination: master, noiseBuffer: createNoiseBuffer(context) };
}

function wake(context) {
  if (context.state === 'suspended') {
    context.resume?.().catch(() => {});
  }
}

// Browsers only let audio start after a tap, click or key press, so the context is made on the
// first cue, which always follows one.
export function createSoundPlayer({ createContext, isEnabled }) {
  let graph = null;

  function ensureGraph() {
    if (!graph) {
      const context = createContext();
      graph = context ? buildGraph(context) : null;
    }
    if (graph) {
      wake(graph.context);
    }
    return graph;
  }

  function play(name) {
    const cue = CUES[name];
    if (!cue || !isEnabled()) {
      return false;
    }
    const ready = ensureGraph();
    if (!ready) {
      return false;
    }
    const startTime = ready.context.currentTime + LOOKAHEAD;
    cue.forEach((voice) => scheduleVoice(ready.context, ready, voice, startTime));
    return true;
  }

  return { play };
}

export function browserAudioContext(window) {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  try {
    return new AudioContextClass({ latencyHint: 'interactive' });
  } catch {
    return null;
  }
}
