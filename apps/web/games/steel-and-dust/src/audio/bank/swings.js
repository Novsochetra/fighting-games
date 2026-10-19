import { SWING_LEAD_SECONDS } from '../../data/swing-leads.js';
import { expCurve, linearCurve } from '../synth/curves.js';
import { layer } from '../synth/layer.js';
import { swoosh } from '../synth/air.js';
import { flap } from '../synth/texture.js';

// air plus a whistle, peaking on contact: the sim starts each swing SWING_LEAD_SECONDS early. Fists
// also flap a sleeve, the sword glints, the spear whistles thin, the axe goes "vwoom". Big = heavy,
// charged and launching moves. Cutoffs, sleeve and glints scale with the take's pitch; the hum does not
const SWINGS = {
  swingFists: {
    level: 0.3,
    seconds: 0.14,
    cutoffs: [380, 1300, 600],
    resonance: 1.1,
    whistle: { resonance: 5, ratio: 1, level: 0.35 },
    sleeve: { start: 0.01, length: 0.12, cutoff: 700, rate: 38, level: 2 },
    drive: 1.2,
  },
  swingFistsBig: {
    level: 0.36,
    seconds: 0.21,
    cutoffs: [300, 1000, 420],
    resonance: 1,
    whistle: { resonance: 4, ratio: 0.9, level: 0.3 },
    sleeve: { start: 0.02, length: 0.18, cutoff: 600, rate: 30, level: 2.2 },
    hum: { from: 95, to: 60, level: 0.2 },
    drive: 1.3,
  },
  swingSword: {
    level: 0.3,
    seconds: 0.16,
    cutoffs: [650, 2300, 1000],
    resonance: 1.3,
    whistle: { resonance: 8, ratio: 1.35, level: 0.5 },
    glints: [5600, 7900],
    drive: 1.15,
  },
  swingSwordBig: {
    level: 0.3,
    seconds: 0.23,
    cutoffs: [450, 1800, 750],
    resonance: 1.2,
    whistle: { resonance: 7, ratio: 1.35, level: 0.45 },
    glints: [4700, 6900],
    hum: { from: 90, to: 60, level: 0.15 },
    drive: 1.3,
  },
  swingSpear: {
    level: 0.28,
    seconds: 0.13,
    cutoffs: [1000, 3000, 1500],
    resonance: 1.6,
    whistle: { resonance: 9, ratio: 1.3, level: 0.55 },
    drive: 1.15,
  },
  swingSpearBig: {
    level: 0.34,
    seconds: 0.21,
    cutoffs: [700, 2400, 1000],
    resonance: 1.5,
    whistle: { resonance: 8, ratio: 1.3, level: 0.5 },
    drive: 1.3,
  },
  swingAxe: {
    level: 0.3,
    seconds: 0.26,
    cutoffs: [220, 800, 330],
    resonance: 1,
    whistle: { resonance: 3, ratio: 0.8, level: 0.3 },
    hum: { from: 80, to: 55, level: 0.25 },
    drive: 1.4,
  },
  swingAxeBig: {
    level: 0.36,
    seconds: 0.34,
    cutoffs: [170, 650, 260],
    resonance: 1,
    whistle: { resonance: 3, ratio: 0.8, level: 0.3 },
    hum: { from: 70, to: 45, level: 0.3 },
    drive: 1.5,
  },
};

function buildSwing(track, spec, pitch) {
  const { seconds: length, peak, cutoffs, sleeve, hum } = spec;
  swoosh(track, {
    length,
    peak,
    cutoffFrom: cutoffs[0] * pitch,
    cutoffPeak: cutoffs[1] * pitch,
    cutoffTo: cutoffs[2] * pitch,
    resonance: spec.resonance,
    whistle: spec.whistle,
    level: 1,
  });
  if (sleeve) {
    flap(track, { ...sleeve, cutoff: sleeve.cutoff * pitch });
  }
  for (const frequency of spec.glints || []) {
    const envelope = linearCurve([0, 0, peak, 1, length, 0]);
    layer(track, { wave: 'sine', frequency: frequency * pitch, envelope, length, level: 0.02 });
  }
  if (hum) {
    const frequency = expCurve([0, hum.from, length, hum.to]);
    const envelope = linearCurve([0, 0, peak, 1, length, 0]);
    layer(track, { wave: 'sine', frequency, envelope, length, level: hum.level });
  }
  return { drive: spec.drive };
}

function swingSound(key, spec) {
  const shaped = { ...spec, peak: SWING_LEAD_SECONDS[key] };
  return {
    group: 'swing',
    level: spec.level,
    takes: 4,
    seconds: spec.seconds,
    priority: 0,
    build: (track, pitch) => buildSwing(track, shaped, pitch),
  };
}

export const SWING_SOUNDS = Object.fromEntries(
  Object.entries(SWINGS).map(([key, spec]) => [key, swingSound(key, spec)]),
);
