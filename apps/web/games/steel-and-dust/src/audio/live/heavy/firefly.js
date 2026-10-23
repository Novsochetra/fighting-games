import { chargeSweep } from './shared.js';

export const FIREFLY_HEAVY_SOUNDS = {
  heavyFireflyCharge: (live, start) => chargeSweep(live, start, { from: 330, to: 990 }),
};
