import { VILLAGE_DAWN_ART } from '../../../art/backdrops/village.js';
import { hash } from '../hash.js';
import { drawMist } from '../parts/drift.js';
import { HORIZON, paintVillage } from './village.js';
import { villageMistMask } from './village-mist.js';

const MIST = [
  { y: HORIZON - 2, spread: 5, count: 5, speed: 0.05 },
  { y: HORIZON + 8, spread: 10, count: 6, speed: -0.03 },
];

// the sugar palms nod a pixel now and then in the morning air
export const swayOf = (tick) => (hash(Math.floor(tick / 48)) > 0.6 ? 1 : 0);

export const VILLAGE_DAWN = {
  frameOf: swayOf,
  paint: (raster, frame) => paintVillage(raster, { art: VILLAGE_DAWN_ART, frame, dawn: true }),
  overlay: (context, tick) =>
    drawMist(context, {
      bands: MIST,
      colors: VILLAGE_DAWN_ART.mist,
      tick,
      mask: villageMistMask(),
    }),
};
