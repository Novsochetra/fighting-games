import { click, hiss, thump } from '../layers.js';
import { biquad, envelopeGain, oscillator } from '../nodes.js';

// a low hum of the spirit rising a fifth under a muffled filter, with a pair of near tones beating
// against each other high above it for the ghostly shimmer
function spiritDrone(live, start) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: 0.05,
    peak: 0.04,
    decay: 0.17,
  });
  const muffle = { type: 'lowpass', from: 500, to: 1600, resonance: 3 };
  const lowpass = biquad(live, { ...muffle, start, duration: 0.22, destination: envelope });
  const hum = { start, duration: 0.22, destination: lowpass };
  oscillator(live, { ...hum, wave: 'triangle', from: 98, to: 147 });
  oscillator(live, { ...hum, wave: 'sawtooth', from: 99.5, to: 149 });
  const shimmer = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: 0.08,
    peak: 0.012,
    decay: 0.12,
  });
  const high = { start, duration: 0.2, destination: shimmer, wave: 'sine' };
  oscillator(live, { ...high, from: 1318, to: 1568 });
  oscillator(live, { ...high, from: 1325, to: 1576 });
}

// a hoof striking packed sand: a dull knock with a gritty tick on top
function hoof(live, { start, from, volume }) {
  thump(live, { start, from, to: from * 0.5, duration: 0.055, volume });
  click(live, { start, volume: volume * 0.4, frequency: 1800 });
}

// the stag lowers its head: two hooves paw the dunes, a ghostly breath is drawn in and the spirit
// hums up through it, short enough to sit under a chain of heavies
function heavyAntlerCharge(live, start) {
  hoof(live, { start, from: 140, volume: 0.075 });
  hoof(live, { start: start + 0.085, from: 118, volume: 0.07 });
  const breath = { type: 'bandpass', from: 420, to: 1300, resonance: 2.6 };
  hiss(live, { start, ...breath, attack: 0.09, duration: 0.11, volume: 0.05 });
  spiritDrone(live, start);
}

// a soft snort of ghost breath as it charges, under the swing
function heavyAntlerRelease(live, start) {
  const snort = { type: 'bandpass', from: 1100, to: 380, resonance: 1.4 };
  hiss(live, { start, ...snort, attack: 0.006, duration: 0.08, volume: 0.12 });
  thump(live, { start, from: 90, to: 50, duration: 0.06, volume: 0.03 });
}

export const ANTLER_HEAVY_SOUNDS = { heavyAntlerCharge, heavyAntlerRelease };
