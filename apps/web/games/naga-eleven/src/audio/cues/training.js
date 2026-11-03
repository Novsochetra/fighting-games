import { midiToFrequency } from '../music/notes.js';
import { hiss, ring, run, thud } from './parts.js';

// the plastic thock of a cone brushed
function cone(voice, { start }) {
  hiss(voice, { start, from: 1400, resonance: 4, peak: 0.45, decay: 0.06 });
  thud(voice, { start, wave: 'triangle', from: 520, to: 380, peak: 0.3, decay: 0.05 });
}

function coneClean(voice, { start }) {
  run(voice, { start, frequencies: [midiToFrequency(88)], gap: 0.05, peak: 0.16, decay: 0.12 });
}

function target(voice, { start }) {
  ring(voice, { start, frequency: 1568, ratios: [1, 2.01], peak: 0.14, decay: 0.6 });
  thud(voice, { start, from: 140, to: 70, peak: 0.25, decay: 0.08 });
}

// the spirit-focus drill's beat: a skor heartbeat with a tick of the chhing
function focusBeat(voice, { start }) {
  thud(voice, { start, from: 75, to: 45, peak: 0.45, decay: 0.18 });
  hiss(voice, { start, type: 'highpass', from: 6500, peak: 0.05, decay: 0.03 });
}

function focusGood(voice, { start }) {
  run(voice, { start, frequencies: [midiToFrequency(88)], gap: 0.05, peak: 0.2, decay: 0.3 });
}

function perfect(voice, { start }) {
  run(voice, {
    start,
    frequencies: [88, 95, 100].map(midiToFrequency),
    gap: 0.03,
    peak: 0.22,
    decay: 0.8,
  });
  ring(voice, {
    start: start + 0.06,
    frequency: midiToFrequency(100),
    ratios: [1, 2.01],
    peak: 0.1,
    decay: 1,
  });
}

function miss(voice, { start }) {
  run(voice, {
    start,
    frequencies: [62, 57].map(midiToFrequency),
    gap: 0.08,
    peak: 0.1,
    decay: 0.2,
    wave: 'square',
  });
}

export const TRAINING_CUES = { cone, coneClean, target, focusBeat, focusGood, perfect, miss };
