import { mix } from '../../../venues/kit/colour.js';
import { rect } from '../../../venues/kit/raster.js';

// the village a long way off, past the paddies: Khmer houses on stilts under steep roofs of thatch
// or tin, and the wat's spire over the trees, all a little lost in the morning haze
const hazed = (ramp, haze, share) => ramp.map((colour) => mix(colour, haze, share));

function paintRoof(raster, { x, bottom, width, height }, ramp) {
  for (let row = 0; row < height; row += 1) {
    const inset = Math.round((row / height) * height * 0.8);

    rect(
      raster,
      { x: x - 1 + inset, y: bottom - row, width: width + 2 - inset * 2, height: 1 },
      ramp[1 + (row % 2)],
    );
    rect(raster, { x: x - 1 + inset, y: bottom - row, width: 1, height: 1 }, ramp[3]);
  }

  rect(raster, { x: x - 1, y: bottom, width: width + 2, height: 1 }, ramp[0]);
}

// `x` is the house's left wall; the space under it dark, its posts and its plank walls in the light
export function paintFarHouse(raster, { x, base, width, roof }, art) {
  const wood = hazed(art.wood, art.far[2], 0.35);
  const ramp = hazed(roof === 'tin' ? art.tin : art.thatch, art.far[3], 0.25);

  rect(raster, { x, y: base - 3, width, height: 3 }, wood[0]);

  for (let post = x; post < x + width; post += 4) {
    rect(raster, { x: post, y: base - 3, width: 1, height: 3 }, wood[2]);
  }

  rect(raster, { x, y: base - 7, width, height: 4 }, wood[3]);
  rect(raster, { x, y: base - 7, width, height: 1 }, wood[1]);

  for (let shutter = x + 2; shutter + 2 < x + width; shutter += 5) {
    rect(raster, { x: shutter, y: base - 6, width: 2, height: 2 }, wood[1]);
  }

  paintRoof(
    raster,
    { x, bottom: base - 8, width, height: Math.max(4, Math.round(width / 3)) },
    ramp,
  );
}

// a pagoda far off over the trees: a pale hall under tiers of red roof edged in gold, a gold spire
export function paintFarWat(raster, { x, base }, art) {
  const wall = hazed(art.wat.wall, art.far[3], 0.3);
  const roof = hazed(art.wat.roof, art.far[3], 0.35);
  const gold = hazed(art.wat.gold, art.far[3], 0.2);

  rect(raster, { x: x - 5, y: base - 3, width: 11, height: 3 }, wall[1]);
  rect(raster, { x: x - 5, y: base - 3, width: 11, height: 1 }, wall[0]);

  for (let tier = 0; tier < 3; tier += 1) {
    const width = 15 - tier * 4;
    const bottom = base - 4 - tier * 3;

    rect(raster, { x: x - Math.floor(width / 2), y: bottom, width, height: 1 }, gold[1]);
    rect(
      raster,
      { x: x - Math.floor(width / 2) + 1, y: bottom - 1, width: width - 2, height: 1 },
      roof[1],
    );
    rect(
      raster,
      { x: x - Math.floor(width / 2) + 2, y: bottom - 2, width: width - 4, height: 1 },
      roof[2],
    );
  }

  rect(raster, { x, y: base - 18, width: 1, height: 5 }, gold[2]);
  rect(raster, { x: x - 1, y: base - 14, width: 3, height: 1 }, gold[1]);
}
