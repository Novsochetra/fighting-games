import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { ring } from '../synth/struck.js';
import { crackle } from '../synth/texture.js';
import { BLADE_STRIKE, BODY_STRIKE, HEAVY_BODY_STRIKE } from './strikes.js';

const RINGING_BLADE = {
  strike: BLADE_STRIKE,
  modes: [
    [2730, 0.32, 0.4],
    [4150, 0.22, 0.28],
    [6020, 0.16, 0.17],
    [7310, 0.12, 0.11],
  ],
  start: 0.004,
};
const BODY = {
  strike: BODY_STRIKE,
  modes: [
    [130, 0.14, 0.45],
    [210, 0.11, 0.65],
    [330, 0.08, 0.7],
    [500, 0.06, 0.45],
  ],
};
const BIG_RINGING_BLADE = {
  strike: BLADE_STRIKE,
  modes: [
    [2480, 0.45, 0.4],
    [3770, 0.32, 0.28],
    [5470, 0.22, 0.17],
    [6650, 0.16, 0.11],
  ],
  start: 0.004,
};
const BIG_BODY = {
  strike: HEAVY_BODY_STRIKE,
  modes: [
    [80, 0.3, 0.45],
    [130, 0.24, 0.6],
    [205, 0.18, 0.8],
    [320, 0.13, 0.7],
    [480, 0.09, 0.45],
  ],
};

// the edge bites, the slice ("tsshk"), flesh ("chk"), the meat of it, then the blade rings
function buildBlade(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 3500, attack: 0.0003, decay: 0.008, level: 0.6 });
  const slice = glide(7000 * pitch, 0.07, 2200);
  layer(track, {
    filter: 'bandpass',
    resonance: 2,
    cutoff: slice,
    attack: 0.0008,
    decay: 0.08,
    level: 2.2,
  });
  const flesh = glide(1300 * pitch, 0.05, 700);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.5,
    cutoff: flesh,
    attack: 0.0006,
    decay: 0.055,
    level: 4,
    drive: 2.5,
  });
  const meat = glide(450 * pitch, 0.06, 300);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.6,
    cutoff: meat,
    attack: 0.0005,
    decay: 0.07,
    level: 4,
    drive: 2,
  });
  crackle(track, { start: 0.002, length: 0.03, count: 5, cutoff: 2600, level: 0.35 });
  ring(track, RINGING_BLADE, pitch);
  ring(track, BODY, pitch);
  return { drive: 2.4 };
}

function buildBladeBig(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 3200, attack: 0.0003, decay: 0.012, level: 0.6 });
  const slice = glide(6500 * pitch, 0.11, 1800);
  layer(track, {
    filter: 'bandpass',
    resonance: 2,
    cutoff: slice,
    attack: 0.0008,
    decay: 0.12,
    level: 2.4,
  });
  const flesh = glide(1200 * pitch, 0.07, 620);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.4,
    cutoff: flesh,
    attack: 0.0006,
    decay: 0.075,
    level: 4,
    drive: 2.6,
  });
  const meat = glide(420 * pitch, 0.09, 250);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.5,
    cutoff: meat,
    attack: 0.0005,
    decay: 0.1,
    level: 4.5,
    drive: 2.2,
  });
  crackle(track, { start: 0.002, length: 0.04, count: 7, cutoff: 2400, level: 0.35 });
  ring(track, BIG_RINGING_BLADE, pitch);
  ring(track, BIG_BODY, pitch);
  const drop = glide(120 * pitch, 0.12, 40);
  layer(track, { wave: 'sine', frequency: drop, attack: 0.0005, decay: 0.22, level: 0.35 });
  return { drive: 2.7 };
}

export const BLADE_SOUNDS = {
  blade: { group: 'hit', level: 0.9, takes: 4, seconds: 0.42, priority: 2, build: buildBlade },
  bladeBig: {
    group: 'hit',
    level: 0.85,
    takes: 4,
    seconds: 0.56,
    priority: 2,
    build: buildBladeBig,
  },
};
