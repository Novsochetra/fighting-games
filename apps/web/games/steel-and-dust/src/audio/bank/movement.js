import { glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { whoosh } from '../synth/air.js';

function buildJump(track, pitch) {
  const rise = glide(450 * pitch, 0.08, 1600 * pitch);
  layer(track, {
    filter: 'bandpass',
    resonance: 1.2,
    cutoff: rise,
    attack: 0.015,
    decay: 0.07,
    level: 2.5,
  });
  const chirp = glide(250, 0.06, 420);
  layer(track, { wave: 'sine', frequency: chirp, attack: 0.005, decay: 0.06, level: 0.35 });
  return { drive: 1.2 };
}

function buildLand(track, pitch) {
  const thud = glide(120 * pitch, 0.07, 55);
  layer(track, { wave: 'sine', frequency: thud, attack: 0.001, decay: 0.08, level: 1 });
  const dust = glide(1000, 0.07, 250);
  layer(track, { filter: 'lowpass', cutoff: dust, attack: 0.001, decay: 0.07, level: 3 });
  const knock = glide(260 * pitch, 0.04, 130);
  layer(track, { wave: 'triangle', frequency: knock, attack: 0.001, decay: 0.04, level: 0.3 });
  return { drive: 1.6 };
}

function buildWarp(track, pitch) {
  const fall = glide(2300 * pitch, 0.07, 350);
  layer(track, { wave: 'sine', frequency: fall, attack: 0.001, decay: 0.08, level: 0.6 });
  const shimmer = glide(3500, 0.06, 8000);
  layer(track, { filter: 'highpass', cutoff: shimmer, attack: 0.001, decay: 0.06, level: 0.5 });
  return { drive: 1.5 };
}

function buildRelease(track, pitch) {
  whoosh(track, {
    length: 0.32,
    peak: 0.05,
    cutoffFrom: 450 * pitch,
    cutoffPeak: 3200 * pitch,
    cutoffTo: 1200 * pitch,
    resonance: 1.2,
    level: 1,
  });
  const drop = glide(130, 0.12, 55);
  layer(track, { wave: 'sine', frequency: drop, attack: 0.002, decay: 0.12, level: 0.5 });
  return { drive: 1.6 };
}

export const MOVEMENT_SOUNDS = {
  jump: { group: 'movement', level: 0.2, takes: 2, seconds: 0.13, priority: 1, build: buildJump },
  land: { group: 'movement', level: 0.32, takes: 3, seconds: 0.16, priority: 1, build: buildLand },
  warp: { group: 'movement', level: 0.32, takes: 2, seconds: 0.13, priority: 1, build: buildWarp },
  release: {
    group: 'movement',
    level: 0.45,
    takes: 2,
    seconds: 0.32,
    priority: 2,
    build: buildRelease,
  },
};
