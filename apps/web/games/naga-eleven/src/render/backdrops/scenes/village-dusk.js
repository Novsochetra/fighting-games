import { DUSK_MIST } from '../../../art/backdrops/mist.js';
import { VILLAGE_DUSK_ART } from '../../../art/backdrops/village.js';
import { drawFireflies, drawMist, drawTwinkles } from '../parts/drift.js';
import { houseWindows } from '../parts/stilt-house.js';
import { HOUSE, HORIZON, paintVillage } from './village.js';
import { swayOf } from './village-dawn.js';
import { villageMistMask } from './village-mist.js';

const art = VILLAGE_DUSK_ART;
// the evening's mist gathers low on the far paddies and lies thinner over the near ones
const MIST = [
  { y: HORIZON - 1, spread: 4, count: 5, speed: 0.03 },
  { y: HORIZON + 12, spread: 14, count: 4, speed: -0.02 },
];
const LAMPS = houseWindows({ ...HOUSE, windows: [{ at: 0.28 }, { at: 0.7 }] }).map((pane) => ({
  x: pane.x + 1,
  y: pane.y + 1,
  width: pane.width - 2,
  height: pane.height - 2,
}));

export const VILLAGE_DUSK = {
  frameOf: swayOf,
  paint: (raster, frame) => paintVillage(raster, { art, frame, dawn: false }),
  overlay: (context, tick) => {
    drawMist(context, { bands: MIST, colors: DUSK_MIST, tick, mask: villageMistMask() });
    drawTwinkles(context, { points: LAMPS, colors: art.flame, tick, period: 7 });
    drawFireflies(context, {
      area: { x: 20, y: 96, width: 340, height: 50 },
      count: 22,
      colors: art.firefly,
      tick,
    });
  },
};
