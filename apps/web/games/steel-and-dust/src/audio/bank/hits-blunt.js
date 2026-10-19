import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { ring } from '../synth/struck.js';
import { crackle } from '../synth/texture.js';
import { BODY_STRIKE, HEAVY_BODY_STRIKE } from './strikes.js';

const KNUCKLES = {
  strike: { milliseconds: 3, lowpass: 7000, click: 1 },
  modes: [
    [2900, 0.014, 0.5],
    [4100, 0.01, 0.35],
    [1800, 0.022, 0.5],
  ],
};
const BODY = {
  strike: BODY_STRIKE,
  modes: [
    [110, 0.2, 0.45],
    [170, 0.17, 0.6],
    [260, 0.13, 0.85],
    [390, 0.1, 0.8],
    [580, 0.075, 0.5],
    [870, 0.05, 0.3],
  ],
};
const BIG_KNUCKLES = {
  strike: { milliseconds: 3, lowpass: 6000, click: 1 },
  modes: [
    [2600, 0.018, 0.5],
    [3700, 0.014, 0.35],
    [1600, 0.03, 0.5],
  ],
};
const BIG_BODY = {
  strike: HEAVY_BODY_STRIKE,
  modes: [
    [75, 0.34, 0.5],
    [120, 0.28, 0.6],
    [190, 0.22, 0.8],
    [290, 0.16, 0.85],
    [430, 0.12, 0.6],
    [650, 0.08, 0.4],
  ],
};

// knuckles crack, a "pak" near 1.2 kHz and a "thwack" near 400 Hz (phone speakers can play both),
// then the body
function buildBlunt(track, pitch) {
  ring(track, KNUCKLES, pitch);
  layer(track, { filter: 'highpass', cutoff: 2500, attack: 0.0003, decay: 0.012, level: 0.5 });
  const pak = glide(1500 * pitch, 0.05, 800);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.3,
    cutoff: pak,
    attack: 0.0005,
    decay: 0.05,
    level: 4,
    drive: 2,
  });
  const thwack = glide(480 * pitch, 0.06, 300);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.6,
    cutoff: thwack,
    attack: 0.0005,
    decay: 0.08,
    level: 5,
    drive: 2,
  });
  ring(track, BODY, pitch);
  const drop = glide(150 * pitch, 0.05, 60);
  layer(track, { wave: 'sine', frequency: drop, attack: 0.0005, decay: 0.1, level: 0.3 });
  return { drive: 3 };
}

function buildBluntBig(track, pitch) {
  ring(track, BIG_KNUCKLES, pitch);
  layer(track, { filter: 'highpass', cutoff: 2200, attack: 0.0003, decay: 0.016, level: 0.5 });
  const pak = glide(1300 * pitch, 0.07, 700);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.2,
    cutoff: pak,
    attack: 0.0005,
    decay: 0.07,
    level: 4,
    drive: 2.2,
  });
  const thwack = glide(420 * pitch, 0.09, 250);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.5,
    cutoff: thwack,
    attack: 0.0005,
    decay: 0.11,
    level: 5,
    drive: 2.2,
  });
  crackle(track, { start: 0.002, length: 0.03, count: 4, cutoff: 2000, level: 0.3 });
  ring(track, BIG_BODY, pitch);
  const drop = glide(130 * pitch, 0.12, 40);
  layer(track, { wave: 'sine', frequency: drop, attack: 0.0005, decay: 0.25, level: 0.45 });
  const rumble = glide(1800, 0.25, 200);
  layer(track, { filter: 'lowpass', cutoff: rumble, attack: 0.002, decay: 0.22, level: 2.4 });
  return { drive: 3.2 };
}

export const BLUNT_SOUNDS = {
  blunt: { group: 'hit', level: 0.95, takes: 4, seconds: 0.3, priority: 2, build: buildBlunt },
  bluntBig: {
    group: 'hit',
    level: 0.95,
    takes: 4,
    seconds: 0.45,
    priority: 2,
    build: buildBluntBig,
  },
};
