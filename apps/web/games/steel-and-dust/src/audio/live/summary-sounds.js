import { blip, hiss, metal } from './layers.js';

const TAKE_CHORD = [1047, 1319, 1568, 2093];

// the loot summary opening: a soft breath of air rising under a glassy two-note chime
function tallyOpen(live, start) {
  const rise = { type: 'bandpass', from: 900, to: 4200, resonance: 1.4 };
  hiss(live, { start, ...rise, attack: 0.12, duration: 0.18, volume: 0.06 });
  blip(live, { start: start + 0.06, frequency: 1319, duration: 0.35, volume: 0.05, wave: 'sine' });
  blip(live, { start: start + 0.12, frequency: 1976, duration: 0.3, volume: 0.03, wave: 'sine' });
}

// the purse's take landing: the clear's chord rolled up an octave higher over a bell and a shimmer
function tallyTotal(live, start) {
  TAKE_CHORD.forEach((frequency, i) => {
    blip(live, { start: start + i * 0.03, frequency, duration: 0.7, volume: 0.07 });
  });
  metal(live, { start: start + 0.1, frequencies: [3136, 4699], duration: 0.9, volume: 0.03 });
  const shimmer = { type: 'highpass', from: 6000, to: 9000, resonance: 0.7 };
  hiss(live, { start, ...shimmer, attack: 0.02, duration: 0.5, volume: 0.04 });
}

export const SUMMARY_SOUNDS = { tallyOpen, tallyTotal };
