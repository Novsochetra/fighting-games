import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { ring } from '../synth/struck.js';
import { crackle } from '../synth/texture.js';
import { HEAVY_BODY_STRIKE } from './strikes.js';

const BODY = {
  strike: HEAVY_BODY_STRIKE,
  modes: [
    [80, 0.28, 0.5],
    [125, 0.22, 0.65],
    [195, 0.17, 0.85],
    [300, 0.12, 0.75],
    [450, 0.08, 0.5],
    [680, 0.05, 0.3],
  ],
};
const BIG_BODY = {
  strike: { milliseconds: 12, lowpass: 1000, click: 0.7 },
  modes: [
    [58, 0.45, 0.5],
    [92, 0.36, 0.6],
    [145, 0.28, 0.8],
    [225, 0.2, 0.85],
    [345, 0.14, 0.65],
    [520, 0.1, 0.4],
  ],
};

// an axe: the edge bites, bone and wood splinter, a crunch, a chunk and a heavy body
function buildHeavy(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 1800, attack: 0.0004, decay: 0.016, level: 0.6 });
  crackle(track, { start: 0, length: 0.045, count: 10, cutoff: 2200, level: 0.6 });
  const crunch = glide(1100 * pitch, 0.12, 450);
  layer(track, {
    filter: 'bandpass',
    resonance: 1,
    cutoff: crunch,
    attack: 0.001,
    decay: 0.13,
    level: 1,
    drive: 4,
  });
  const chunk = glide(380 * pitch, 0.1, 220);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.4,
    cutoff: chunk,
    attack: 0.0005,
    decay: 0.11,
    level: 5,
    drive: 2.5,
  });
  ring(track, BODY, pitch);
  const drop = glide(130 * pitch, 0.12, 40);
  layer(track, { wave: 'sine', frequency: drop, attack: 0.0005, decay: 0.2, level: 0.4 });
  return { drive: 3.2 };
}

function buildHeavyBig(track, pitch) {
  layer(track, { filter: 'highpass', cutoff: 1600, attack: 0.0004, decay: 0.02, level: 0.65 });
  crackle(track, { start: 0, length: 0.07, count: 15, cutoff: 2000, level: 0.6 });
  const crunch = glide(1000 * pitch, 0.18, 380);
  layer(track, {
    filter: 'bandpass',
    resonance: 1,
    cutoff: crunch,
    attack: 0.001,
    decay: 0.2,
    level: 1,
    drive: 4,
  });
  const chunk = glide(340 * pitch, 0.14, 190);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.3,
    cutoff: chunk,
    attack: 0.0005,
    decay: 0.16,
    level: 5,
    drive: 2.5,
  });
  ring(track, BIG_BODY, pitch);
  const drop = glide(110 * pitch, 0.18, 30);
  layer(track, { wave: 'sine', frequency: drop, attack: 0.0005, decay: 0.35, level: 0.5 });
  const rumble = glide(1500, 0.35, 140);
  layer(track, { filter: 'lowpass', cutoff: rumble, attack: 0.002, decay: 0.32, level: 2.4 });
  return { drive: 3.4 };
}

export const HEAVY_SOUNDS = {
  heavy: { group: 'hit', level: 0.85, takes: 4, seconds: 0.44, priority: 2, build: buildHeavy },
  heavyBig: {
    group: 'hit',
    level: 0.85,
    takes: 4,
    seconds: 0.62,
    priority: 2,
    build: buildHeavyBig,
  },
};
