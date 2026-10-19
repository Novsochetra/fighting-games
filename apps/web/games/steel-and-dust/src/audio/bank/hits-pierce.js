import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { ring } from '../synth/struck.js';
import { BODY_STRIKE, HEAVY_BODY_STRIKE, SHAFT_STRIKE } from './strikes.js';

const SHAFT = {
  strike: SHAFT_STRIKE,
  modes: [
    [340, 0.1, 0.8],
    [760, 0.06, 0.6],
    [1180, 0.04, 0.4],
  ],
  start: 0.002,
};
const BODY = {
  strike: BODY_STRIKE,
  modes: [
    [130, 0.13, 0.45],
    [210, 0.1, 0.6],
    [320, 0.07, 0.5],
  ],
};
const BIG_SHAFT = {
  strike: SHAFT_STRIKE,
  modes: [
    [310, 0.14, 0.8],
    [700, 0.09, 0.6],
    [1090, 0.06, 0.4],
  ],
  start: 0.002,
};
const BIG_BODY = {
  strike: HEAVY_BODY_STRIKE,
  modes: [
    [78, 0.3, 0.45],
    [125, 0.24, 0.6],
    [200, 0.17, 0.75],
    [310, 0.12, 0.6],
  ],
};

// the point, a "tsk", flesh, then the spear's wooden shaft knocks against the body
function buildPierce(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 4000, attack: 0.0002, decay: 0.006, level: 0.7 });
  const tsk = glide(4800 * pitch, 0.04, 1500);
  layer(track, {
    filter: 'bandpass',
    resonance: 3,
    cutoff: tsk,
    attack: 0.0005,
    decay: 0.045,
    level: 3,
  });
  const flesh = glide(1000 * pitch, 0.04, 550);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.5,
    cutoff: flesh,
    attack: 0.0005,
    decay: 0.05,
    level: 4,
    drive: 2,
  });
  ring(track, SHAFT, pitch);
  ring(track, BODY, pitch);
  return { drive: 2.5 };
}

function buildPierceBig(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 3800, attack: 0.0002, decay: 0.008, level: 0.7 });
  const tsk = glide(4500 * pitch, 0.06, 1300);
  layer(track, {
    filter: 'bandpass',
    resonance: 3,
    cutoff: tsk,
    attack: 0.0005,
    decay: 0.06,
    level: 3,
  });
  const flesh = glide(950 * pitch, 0.06, 500);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.4,
    cutoff: flesh,
    attack: 0.0005,
    decay: 0.07,
    level: 4,
    drive: 2.2,
  });
  const meat = glide(420 * pitch, 0.09, 250);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.5,
    cutoff: meat,
    attack: 0.0005,
    decay: 0.1,
    level: 4,
    drive: 2,
  });
  ring(track, BIG_SHAFT, pitch);
  ring(track, BIG_BODY, pitch);
  const rumble = glide(2000, 0.18, 220);
  layer(track, { filter: 'lowpass', cutoff: rumble, attack: 0.002, decay: 0.18, level: 2 });
  return { drive: 2.8 };
}

export const PIERCE_SOUNDS = {
  pierce: { group: 'hit', level: 1, takes: 4, seconds: 0.32, priority: 2, build: buildPierce },
  pierceBig: {
    group: 'hit',
    level: 1.1,
    takes: 4,
    seconds: 0.46,
    priority: 2,
    build: buildPierceBig,
  },
};
