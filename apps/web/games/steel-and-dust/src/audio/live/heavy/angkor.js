import { crunch, hiss, metal, thump } from '../layers.js';

// a small temple bell struck once on the soft beat of a skor drum, then sandstone grinding and sand
// pouring, both swelling into the strike; the grind and drum are those of his `relief`
function heavyAngkorCharge(live, start) {
  metal(live, { start, frequencies: [740, 1776, 2220], duration: 0.22, volume: 0.045 });
  thump(live, { start, from: 110, to: 62, duration: 0.12, volume: 0.06 });
  crunch(live, { start: start + 0.015, duration: 0.08, volume: 0.04, frequency: 320 });
  const grind = { type: 'bandpass', from: 220, to: 520, resonance: 2.5 };
  hiss(live, { start, ...grind, attack: 0.14, duration: 0.08, volume: 0.1 });
  const pour = { type: 'bandpass', from: 900, to: 3000, resonance: 1.3 };
  hiss(live, { start, ...pour, attack: 0.13, duration: 0.06, volume: 0.045 });
}

// the gold blade rings faintly as it leaves, a far echo of `sever`; the swing itself is loud enough
function heavyAngkorRelease(live, start) {
  metal(live, { start, frequencies: [2093, 3136], duration: 0.16, volume: 0.02 });
}

export const ANGKOR_HEAVY_SOUNDS = { heavyAngkorCharge, heavyAngkorRelease };
