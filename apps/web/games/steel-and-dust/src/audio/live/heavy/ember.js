import { chargeSweep } from './shared.js';

export const EMBER_HEAVY_SOUNDS = {
  heavyEmberCharge: (live, start) => chargeSweep(live, start, { from: 220, to: 660 }),
};
