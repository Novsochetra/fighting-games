import { clamp01 } from '../../tracks/ease.js';

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const LEVELS = 8;

// the order the pixels of a 4x4 cell light in, so any share of them lit reads as an even tone
export const thresholdAt = (x, y) => (BAYER[y & 3][x & 3] + 0.5) / 16;

export const levelOf = (share) => Math.round(clamp01(share) * LEVELS);
