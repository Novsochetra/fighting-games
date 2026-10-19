import { expCurve, glide } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { swoosh } from '../synth/air.js';
import { ring } from '../synth/struck.js';
import { crackle, flap } from '../synth/texture.js';

const WHISTLE = { resonance: 4, ratio: 1.6, level: 0.25 };

function pushOff(track, pitch) {
  const scuff = glide(2500, 0.04, 500);
  layer(track, {
    filter: 'lowpass',
    cutoff: scuff,
    attack: 0.0005,
    decay: 0.045,
    level: 2.5,
    drive: 1.5,
  });
  crackle(track, { start: 0, length: 0.04, count: 6, cutoff: 1500, level: 0.35 });
  const stamp = {
    strike: { milliseconds: 4, lowpass: 600, click: 0.6 },
    modes: [
      [85, 0.09, 1],
      [140, 0.06, 0.6],
    ],
  };
  ring(track, stamp, pitch);
}

// the feet push off (a gritty scuff and a thump), a fast whoomp of air, a resonant "shhunn" that
// falls away, and the cloak snapping behind
function buildDash(track, pitch) {
  pushOff(track, pitch);
  swoosh(track, {
    length: 0.26,
    peak: 0.05,
    cutoffFrom: 500 * pitch,
    cutoffPeak: 1600 * pitch,
    cutoffTo: 600 * pitch,
    resonance: 1,
    whistle: WHISTLE,
    level: 0.9,
  });
  const air = expCurve([0, 5000 * pitch, 0.08, 2200 * pitch, 0.3, 800]);
  layer(track, { filter: 'lowpass', cutoff: air, attack: 0.004, decay: 0.2, level: 0.5 });
  const shhunn = glide(2600 * pitch, 0.18, 900 * pitch);
  layer(track, {
    filter: 'bandpass',
    resonance: 4,
    cutoff: shhunn,
    attack: 0.006,
    decay: 0.16,
    level: 2,
  });
  flap(track, { start: 0.01, length: 0.16, cutoff: 750 * pitch, rate: 36, level: 2.5 });
  return { drive: 1.5 };
}

// the air dash has no feet in it
function buildDashAir(track, pitch) {
  swoosh(track, {
    length: 0.26,
    peak: 0.05,
    cutoffFrom: 550 * pitch,
    cutoffPeak: 1700 * pitch,
    cutoffTo: 650 * pitch,
    resonance: 1,
    whistle: WHISTLE,
    level: 1,
  });
  const air = expCurve([0, 5500 * pitch, 0.08, 2400 * pitch, 0.28, 900]);
  layer(track, { filter: 'lowpass', cutoff: air, attack: 0.003, decay: 0.2, level: 0.55 });
  const shhunn = glide(2800 * pitch, 0.18, 1000 * pitch);
  layer(track, {
    filter: 'bandpass',
    resonance: 4,
    cutoff: shhunn,
    attack: 0.005,
    decay: 0.16,
    level: 2,
  });
  const body = { strike: { milliseconds: 3, lowpass: 900, click: 0.4 }, modes: [[120, 0.06, 0.6]] };
  ring(track, body, pitch);
  flap(track, { start: 0.01, length: 0.18, cutoff: 800 * pitch, rate: 34, level: 2.8 });
  return { drive: 1.4 };
}

export const DASH_SOUNDS = {
  dash: { group: 'movement', level: 0.55, takes: 4, seconds: 0.32, priority: 1, build: buildDash },
  dashAir: {
    group: 'movement',
    level: 0.36,
    takes: 4,
    seconds: 0.3,
    priority: 1,
    build: buildDashAir,
  },
};
