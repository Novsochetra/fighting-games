import { chargeSweep } from './shared.js';

export const BLUE_HEAVY_SOUNDS = {
  heavyBlueCharge: (live, start) => chargeSweep(live, start, { from: 400, to: 1200 }),
};
