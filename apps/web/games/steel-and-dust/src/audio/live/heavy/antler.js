import { chargeSweep } from './shared.js';

export const ANTLER_HEAVY_SOUNDS = {
  heavyAntlerCharge: (live, start) => chargeSweep(live, start, { from: 200, to: 600 }),
};
