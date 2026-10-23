import { chargeSweep } from './shared.js';

export const ANGKOR_HEAVY_SOUNDS = {
  heavyAngkorCharge: (live, start) => chargeSweep(live, start, { from: 200, to: 600 }),
};
