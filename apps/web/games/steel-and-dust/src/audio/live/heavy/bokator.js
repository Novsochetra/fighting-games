import { chargeSweep } from './shared.js';

export const BOKATOR_HEAVY_SOUNDS = {
  heavyBokatorCharge: (live, start) => chargeSweep(live, start, { from: 180, to: 540 }),
};
