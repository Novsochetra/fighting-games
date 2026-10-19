import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { bell, woodKnock } from '../synth/struck.js';

// a crate: a crunch and three wooden knocks
function buildBreak(track, pitch) {
  const crunch = glide(1200 * pitch, 0.12, 600);
  layer(track, {
    filter: 'bandpass',
    resonance: 1,
    cutoff: crunch,
    attack: 0.001,
    decay: 0.12,
    level: 0.8,
    drive: 4,
  });
  woodKnock(track, 430 * pitch, 0);
  woodKnock(track, 310 * pitch, 0.028);
  woodKnock(track, 520 * pitch, 0.056);
  const thud = glide(150, 0.08, 80);
  layer(track, { wave: 'sine', frequency: thud, attack: 0.001, decay: 0.08, level: 0.7 });
  return { drive: 1.8 };
}

// a weapon breaking
function buildShatter(track) {
  bell(track, { base: 2380, ratios: [1, 1.5, 2.15, 2.65], decay: 0.45, level: 0.45 });
  layer(track, { filter: 'highpass', cutoff: 4500, attack: 0.001, decay: 0.25, level: 0.35 });
  const thud = glide(140, 0.08, 70);
  layer(track, { wave: 'sine', frequency: thud, attack: 0.001, decay: 0.08, level: 0.5 });
  layer(track, {
    filter: 'bandpass',
    resonance: 1,
    cutoff: 1800,
    attack: 0.001,
    decay: 0.1,
    level: 0.6,
    drive: 3,
  });
  return { drive: 1.5 };
}

function buildKo(track, pitch) {
  const fall = glide(125 * pitch, 0.2, 36);
  layer(track, { wave: 'sine', frequency: fall, attack: 0.001, decay: 0.36, level: 1.1 });
  const crunch = glide(700 * pitch, 0.2, 350);
  layer(track, {
    filter: 'bandpass',
    resonance: 1,
    cutoff: crunch,
    attack: 0.001,
    decay: 0.2,
    level: 0.7,
    drive: 3,
  });
  const rumble = glide(1600, 0.4, 90);
  layer(track, { filter: 'lowpass', cutoff: rumble, attack: 0.002, decay: 0.4, level: 2.5 });
  return { drive: 2.4 };
}

function buildBoom(track, pitch) {
  const fall = glide(82 * pitch, 0.4, 27);
  layer(track, { wave: 'sine', frequency: fall, attack: 0.002, decay: 0.6, level: 1.1 });
  const rumble = glide(900, 0.55, 60);
  layer(track, { filter: 'lowpass', cutoff: rumble, attack: 0.004, decay: 0.55, level: 3 });
  layer(track, {
    filter: 'bandpass',
    resonance: 1,
    cutoff: 500,
    attack: 0.002,
    decay: 0.25,
    level: 0.5,
    drive: 3,
  });
  return { drive: 2.2 };
}

export const CRASH_SOUNDS = {
  break: { group: 'crash', level: 0.5, takes: 2, seconds: 0.32, priority: 2, build: buildBreak },
  shatter: { group: 'crash', level: 0.5, takes: 1, seconds: 0.6, priority: 2, build: buildShatter },
  ko: { group: 'crash', level: 0.6, takes: 3, seconds: 0.55, priority: 2, build: buildKo },
  boom: { group: 'crash', level: 0.7, takes: 2, seconds: 0.85, priority: 2, build: buildBoom },
};
