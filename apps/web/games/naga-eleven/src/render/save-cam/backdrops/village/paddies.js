import { grainOf } from '../../../venues/ground/grass.js';
import { mix } from '../../../venues/kit/colour.js';
import { grain2, hash2 } from '../../../venues/kit/hash.js';
import { toneOf } from '../tone.js';

// past the dike the paddies run off to the village, field after field walled by earth dikes, some
// flooded and holding the sky, some green with young rice in rows, a few bare and muddy. Seen
// from a keeper's height they crowd toward the horizon, so each band of fields lies further off
// than the one before by more, and the dikes between them stay a pixel wide
export const PADDY_FROM = 15.4;
const BANDS = [PADDY_FROM, 18.6, 23, 29, 38.5, 54, 82, 135, 230, 420];
// how many metres a pixel spans across, and a row spans in depth, for each metre off
const PIXEL = 1 / 300;
const ROW = 1 / 210;

function fieldOf({ across, depth }) {
  const next = BANDS.findIndex((edge) => edge > depth);
  const band = next < 0 ? BANDS.length - 1 : Math.max(0, next - 1);
  const width = 11 + band * 5 + hash2(band, 0, 31) * 8;
  const shift = hash2(band, 1, 31) * width;
  const cell = Math.floor((across + shift) / width);
  const along = across + shift - cell * width;

  return {
    band,
    kind: hash2(band, cell, 33),
    dike: along < depth * PIXEL * 1.4 || depth - BANDS[band] < depth * depth * ROW * 0.9,
  };
}

// still water holding the morning sky, bluer near and paler far off, seedlings planted in rows
// in the nearest and a glint where the breeze catches it
function waterAt(spot, column, row, art) {
  const seedling = spot.depth < 24 && column % 3 === row % 2 && grain2(column, row, 34) < 0.8;
  const glint = grain2(column >> 2, row, 35) < 0.05 ? 1 : 0;
  const far = Math.min(1, (spot.depth - PADDY_FROM) / 110);

  if (seedling) {
    return art.rice[2];
  }

  return toneOf(art.water, 3 + far * 1.8 + glint, column, row);
}

// young rice in rows, a furrow of shade between, lighter as the fields go off into the haze
function riceAt(spot, column, row, art) {
  const furrow = spot.depth < 30 && row % 2 === 0;
  const far = Math.min(1, (spot.depth - PADDY_FROM) / 90);

  return toneOf(art.rice, (furrow ? 2.2 : 3) + far + grainOf(column, row) * 0.6, column, row);
}

// a dike's grassy top, worn to the red earth here and there
function dikeOf(field, column, row, art) {
  return grain2(column >> 2, row, 36) < 0.92
    ? toneOf(art.grass, 4.6 + grainOf(column, row), column, row)
    : toneOf(art.dirt, 4, column, row);
}

function fieldColour(spot, column, row, art) {
  const field = fieldOf(spot);

  if (field.dike) {
    return dikeOf(field, column, row, art);
  }

  if (field.kind < 0.52) {
    return waterAt(spot, column, row, art);
  }

  return field.kind < 0.9
    ? riceAt(spot, column, row, art)
    : toneOf(art.dirt, 3 + grainOf(column, row) * 0.6, column, row);
}

// the far fields fade into the morning haze
export function paddyAt(spot, column, row, art) {
  const colour = fieldColour(spot, column, row, art);
  const haze = Math.min(0.55, Math.max(0, (spot.depth - 60) / 260));

  return haze > 0 ? mix(colour, art.far[3], haze) : colour;
}
