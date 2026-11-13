import { SHOT_ART } from '../../colors.js';
import { bakedLook, bakeKey } from './bakes.js';
import { LEVELS, thresholdAt } from './dither.js';
import { eyeMiddle } from './figure.js';
import { clearAt, edgeAt, lightnessOf, mapPixels, packed } from './pixels.js';
import { derivedRaster, rasterOf } from './raster.js';

const SHADE = {
  ink: packed(SHOT_ART.ink),
  deep: packed(SHOT_ART.purple[0]),
  lit: packed(SHOT_ART.purple[1]),
  rim: packed(SHOT_ART.emerald[3]),
  corner: packed(SHOT_ART.emerald[4]),
};

const WHITE = packed(SHOT_ART.white);

// its lit parts barely show through the dark, as a checker of a step lighter
function shadeOf(word, x, y) {
  const light = lightnessOf(word);

  if (light < 40) {
    return SHADE.ink;
  }

  return light > 150 && (x + y) % 2 === 0 ? SHADE.lit : SHADE.deep;
}

// lit only along the edges that face the light at the top left, as the figures of a clash are,
// a step of emerald and a step of violet in from the edge
function silhouettePixels(raster) {
  return mapPixels(raster, (word, x, y) => {
    const open = (dx, dy) => clearAt(raster, x - dx, y - dy);

    if (word === 0) {
      return 0;
    }

    if (open(0, 1) || open(1, 0)) {
      return open(0, 1) && open(1, 0) ? SHADE.corner : SHADE.rim;
    }

    return open(0, 2) || open(2, 0) ? SHADE.lit : shadeOf(word, x, y);
  });
}

function silhouetteRaster(look) {
  const figure = rasterOf('figure', look);

  return derivedRaster(`silhouette/${look.size}/${look.gape}`, () => ({
    ...figure,
    pixels: silhouettePixels(figure),
  }));
}

export const silhouetteBake = (look) =>
  bakedLook(bakeKey('silhouette', look.size, look.gape), silhouetteRaster(look));

const keptBelow = (raster, kept) => mapPixels(raster, (word, x, y) => (kept(x, y) ? word : 0));

export function fadeInBake(look, level) {
  const kept = (x, y) => thresholdAt(x, y) < level / LEVELS;

  return bakedLook(bakeKey('fade', look.size, look.gape, level), silhouetteRaster(look), (raster) =>
    keptBelow(raster, kept),
  );
}

// the colour floods out from the eye, so the head is lit before the body
export function revealBake(look, level) {
  const figure = rasterOf('figure', look);
  const eye = eyeMiddle(look.size);
  const reach = look.size * 34;
  const kept = (x, y) => {
    const near = Math.min(1, Math.hypot(x + figure.left - eye.x, y + figure.top - eye.y) / reach);

    return near * 0.7 + thresholdAt(x, y) * 0.3 < level / LEVELS;
  };

  return bakedLook(bakeKey('reveal', look.size, look.gape, level), figure, (raster) =>
    keptBelow(raster, kept),
  );
}

export const rimBake = (look) =>
  bakedLook(bakeKey('rim', look.size, look.gape), rasterOf('figure', look), (raster) =>
    mapPixels(raster, (word, x, y) => (word !== 0 && edgeAt(raster, x, y) ? WHITE : 0)),
  );
