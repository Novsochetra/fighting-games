import { mix } from '../../../venues/kit/colour.js';
import { paintTreeLine } from '../../../venues/scenery/tree.js';
import { paintFarHouse, paintFarWat } from './homes.js';
import { paintLeafyTree, paintPalm } from './trees.js';

// The land behind the bamboo goal, set out by hand so the keeper in the middle stands against open
// sky and the far haze: the village's houses and trees along the far edge of the paddies, its
// palms over them, two tall palms on the dikes nearer, outside the posts, framing the goal
const FAR_BASE = 86;

const HOUSES = [
  { x: 14, width: 13, roof: 'thatch' },
  { x: 58, width: 11, roof: 'tin' },
  { x: 146, width: 15, roof: 'thatch' },
  { x: 199, width: 11, roof: 'tin' },
  { x: 240, width: 13, roof: 'thatch' },
];

const TREES = [
  [6, 12, 9],
  [34, 15, 11],
  [48, 10, 7],
  [80, 16, 10],
  [97, 11, 8],
  [118, 14, 9],
  [136, 10, 7],
  [168, 16, 11],
  [186, 12, 8],
  [220, 15, 10],
  [233, 10, 8],
];

const FAR_PALMS = [
  [28, 22, 4],
  [72, 27, 5],
  [108, 17, 3],
  [161, 24, 4],
  [193, 29, 5],
  [229, 20, 4],
];

const NEAR_PALMS = [
  { x: 13, base: 89, height: 52, crown: 10 },
  { x: 47, base: 87, height: 33, crown: 7 },
  { x: 212, base: 87, height: 37, crown: 7 },
  { x: 245, base: 89, height: 56, crown: 11 },
];

const hazed = (ramps, haze, share) =>
  Object.fromEntries(
    Object.entries(ramps).map(([name, ramp]) => [
      name,
      ramp.map((colour) => mix(colour, haze, share)),
    ]),
  );

// on the horizon, a hazy line of more trees and the wat's spire over them
export function paintHorizon(raster, art) {
  paintTreeLine(raster, { bottom: FAR_BASE, height: 6, salt: 2 }, art.haze);
  paintFarWat(raster, { x: 176, base: FAR_BASE - 3 }, art);
}

export function paintVillageRow(raster, art) {
  const farTree = { trunk: art.far, leaf: art.far.slice(0, 4) };
  const farPalm = hazed(art.palm, art.far[3], 0.4);

  TREES.forEach(([x, width, height]) =>
    paintLeafyTree(raster, { x, base: FAR_BASE, width, height }, farTree),
  );
  HOUSES.forEach((house) => paintFarHouse(raster, { ...house, base: FAR_BASE + 1 }, art));
  FAR_PALMS.forEach(([x, height, crown]) =>
    paintPalm(raster, { x, base: FAR_BASE, height, crown }, farPalm),
  );
}

export function paintNearPalms(raster, art) {
  const near = hazed(art.palm, art.far[3], 0.12);

  NEAR_PALMS.forEach((palm) => paintPalm(raster, palm, near));
}
