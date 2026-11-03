import { bayer } from '../../venues/kit/hash.js';

// A colour of a ramp for a tone along it. An art pixel of the save cam is six of the screen's, so
// the venue's full ordered dither would show as a chequer: here a tone keeps to its nearest shade,
// and only one close to halfway between two is dithered across
const DITHER = 0.45;

export const toneOf = (ramp, tone, column, row) =>
  ramp[
    Math.max(
      0,
      Math.min(ramp.length - 1, Math.floor(tone + 0.5 + (bayer(column, row) - 0.5) * DITHER)),
    )
  ];
