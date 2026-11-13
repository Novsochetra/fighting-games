import { headPoint } from '../../../../../../src/render/duel/looks/naga-head.js';
import { NAGA_ART, SHOT_ART } from '../../colors.js';
import { bakedLook, bakeKey } from './bakes.js';
import { mapPixels, packed } from './pixels.js';
import { crestRaster, rasterOf } from './raster.js';

export const FLICKER_PHASES = 4;

const BAND = 4;

// the hood its flames fan from, as looks/naga-crest.js lays it: its middle, its radius and how much
// taller than wide it is, in head sizes; its rim is left still, as it would pulse all at once
const HOOD = { hub: [-3.2, -3.2], radius: 7.4, tall: 1.12 };

const GOLDS = [NAGA_ART.accent[3], NAGA_ART.accent[2]].map(packed);

const HOT = [SHOT_ART.flash, NAGA_ART.accent[3]].map(packed);

const COOL = [NAGA_ART.accent[2], SHOT_ART.ember[2]].map(packed);

// a band of heat runs out along every flame and a band of ember after it, the way a 16-bit fire
// cycles its palette, on the crest's gold alone (where the head drew nothing over it)
function flamePixels(figure, { crest, hub, phase, size }) {
  return mapPixels(figure, (word, x, y) => {
    const gold = GOLDS.indexOf(word);
    const reach = Math.hypot(x - hub.x, (y - hub.y) / HOOD.tall);

    if (gold < 0 || reach < HOOD.radius * size || crest.pixels[y * crest.width + x] !== word) {
      return word;
    }

    const band = Math.floor(reach / BAND - phase) & 3;

    if (band === 0) {
      return HOT[gold];
    }

    return band === 2 ? COOL[gold] : word;
  });
}

export function flickerBake(look, phase) {
  const figure = rasterOf('figure', look);
  const middle = headPoint({ size: look.size }, HOOD.hub);
  const hub = { x: middle.x - figure.left, y: middle.y - figure.top };

  return bakedLook(bakeKey('flicker', look.size, look.gape, phase), figure, (raster) =>
    flamePixels(raster, { crest: crestRaster(look), hub, phase, size: look.size }),
  );
}
