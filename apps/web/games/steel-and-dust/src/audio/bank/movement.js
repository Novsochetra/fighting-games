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

// weight coming down on the ground: a thud, the dust it raises and a knock; `fall` is how long the
// thud and the dust take to settle
function footfall(track, pitch, { fall, thudDecay, dustDecay }) {
  const thud = glide(120 * pitch, fall, 55);
  layer(track, { wave: 'sine', frequency: thud, attack: 0.001, decay: thudDecay, level: 1 });
  const dust = glide(1000, fall, 250);
  layer(track, { filter: 'lowpass', cutoff: dust, attack: 0.001, decay: dustDecay, level: 3 });
  const knock = glide(260 * pitch, 0.04, 130);
  layer(track, { wave: 'triangle', frequency: knock, attack: 0.001, decay: 0.04, level: 0.3 });
}

function buildLand(track, pitch) {
  footfall(track, pitch, { fall: 0.07, thudDecay: 0.08, dustDecay: 0.07 });
  return { drive: 1.6 };
}

// a foot at a run comes down like a landing, only lighter: the same thud, dust and knock settling
// in two thirds of the time, so one is gone before the next, about four a second
function buildStep(track, pitch) {
  footfall(track, pitch, { fall: 0.045, thudDecay: 0.05, dustDecay: 0.045 });
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
  // the lowest priority of all: a footstep never takes a voice from another sound
  step: { group: 'movement', level: 0.22, takes: 4, seconds: 0.1, priority: 0, build: buildStep },
  release: {
    group: 'movement',
    level: 0.45,
    takes: 2,
    seconds: 0.32,
    priority: 2,
    build: buildRelease,
  },
};
