import { hiss } from '../layers.js';
import { biquad, envelopeGain, oscillator } from '../nodes.js';

const RUSTLES = [
  { at: 0, band: 2800, volume: 0.1 },
  { at: 0.045, band: 3800, volume: 0.085 },
  { at: 0.095, band: 3200, volume: 0.065 },
  { at: 0.14, band: 4200, volume: 0.04 },
];

// a bough bending: slow saws are trains of clicks, two a little apart so they catch unevenly, and a
// narrow band over them rings like wood; the band keeps only their faint upper harmonics, hence the
// big gain
function creak(live, start) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: 0.04,
    peak: 0.38,
    decay: 0.13,
  });
  const body = { type: 'bandpass', from: 650, to: 1000, resonance: 5, start, duration: 0.17 };
  const wood = biquad(live, { ...body, destination: envelope });
  const clicks = { wave: 'sawtooth', start, duration: 0.17, destination: wood };
  oscillator(live, { ...clicks, from: 34, to: 64 });
  oscillator(live, { ...clicks, from: 41, to: 55 });
}

// the grove's power swelling: a hum and its octave rising a fifth under a closing lowpass
function hum(live, start) {
  const envelope = envelopeGain(live, {
    destination: live.chain.effectsBus,
    start,
    attack: 0.07,
    peak: 0.035,
    decay: 0.13,
  });
  const lowpass = { type: 'lowpass', from: 900, to: 600, resonance: 1, start, duration: 0.2 };
  const warm = biquad(live, { ...lowpass, destination: envelope });
  oscillator(live, { wave: 'sine', from: 131, to: 196, start, duration: 0.2, destination: warm });
  oscillator(live, {
    wave: 'triangle',
    from: 262,
    to: 392,
    start,
    duration: 0.2,
    destination: warm,
  });
}

// leaves stirring: short bursts of bright noise, each a little apart
function rustle(live, start) {
  for (const { at, band, volume } of RUSTLES) {
    const leaves = { type: 'bandpass', from: band, to: band * 1.25, resonance: 1.2 };
    hiss(live, { start: start + at, ...leaves, attack: 0.005, duration: 0.045, volume });
  }
}

// the Moss Shade gathers a heavy: leaves rustle, a bough creaks as it bends, a green hum swells
function heavyMossCharge(live, start) {
  rustle(live, start);
  creak(live, start);
  hum(live, start);
}

// as it strikes, a gust scatters leaves: a soft rising whisk, kept under the swing and the hit
function heavyMossRelease(live, start) {
  const gust = { type: 'bandpass', from: 2200, to: 5200, resonance: 1.4 };
  hiss(live, { start, ...gust, attack: 0.01, duration: 0.07, volume: 0.09 });
  const flutter = { type: 'bandpass', from: 4200, to: 3600, resonance: 2 };
  hiss(live, { start: start + 0.04, ...flutter, attack: 0.004, duration: 0.04, volume: 0.06 });
}

export const MOSS_HEAVY_SOUNDS = { heavyMossCharge, heavyMossRelease };
