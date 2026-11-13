import { SHOT_ART } from '../../colors.js';
import { bakedLook, bakeKey } from './bakes.js';
import { thresholdAt } from './dither.js';
import { mapPixels, packed } from './pixels.js';
import { derivedRaster, MARGIN, rasterOf } from './raster.js';

function touches(rings, { width, height }, { at, ring }) {
  const [x, y] = [at % width, Math.floor(at / width)];
  const before = ring - 1;

  return (
    (x > 0 && rings[at - 1] === before) ||
    (x + 1 < width && rings[at + 1] === before) ||
    (y > 0 && rings[at - width] === before) ||
    (y + 1 < height && rings[at + width] === before)
  );
}

function grown(rings, size, ring) {
  for (let at = 0; at < rings.length; at += 1) {
    if (rings[at] === 255 && touches(rings, size, { at, ring })) {
      rings[at] = ring;
    }
  }
}

function ringsOf(raster) {
  const rings = raster.pixels.map((word) => (word === 0 ? 255 : 0));

  for (let ring = 1; ring <= MARGIN; ring += 1) {
    grown(rings, raster, ring);
  }

  return rings;
}

// each ring out a thinner dither, as pixel art fakes a glow without a blur
const STEPS = [
  null,
  { share: 1, color: packed(SHOT_ART.emerald[1]) },
  { share: 0.5, color: packed(SHOT_ART.emerald[2]) },
  { share: 0.5, color: packed(SHOT_ART.emerald[1]) },
  { share: 0.25, color: packed(SHOT_ART.emerald[1]) },
];

export function auraBake(look, phase) {
  const figure = rasterOf('figure', look);
  const rings = derivedRaster(`rings/${look.size}/${look.gape}`, () => ringsOf(figure));

  return bakedLook(bakeKey('aura', look.size, look.gape, phase), figure, (raster) =>
    mapPixels(raster, (word, x, y) => {
      const step = STEPS[rings[y * raster.width + x]];

      return step && thresholdAt(x + phase, y + phase) < step.share ? step.color : 0;
    }),
  );
}
