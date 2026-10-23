import { chargeSweep } from './shared.js';

export const MOSS_HEAVY_SOUNDS = {
  heavyMossCharge: (live, start) => chargeSweep(live, start, { from: 240, to: 720 }),
};
