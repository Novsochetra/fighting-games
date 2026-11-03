import { grainOf, toneIndex } from '../ground/grass.js';
import { grain2, hash2 } from '../kit/hash.js';

// beyond the fence: a dusty track, then rice paddies in fields of their own, some flooded and
// shining with the sky, some green with young rice in rows, each walled by an earth dike
const TRACK = { near: -24, far: -42 };
const BANDS = [-42, -88, -132, -190];
const DIKE = 4;

function fieldOf(x, y) {
  const band = BANDS.findIndex((edge, i) => i > 0 && y > edge) - 1;
  const width = 170 + Math.round(hash2(band, 0, 3) * 60);
  const shift = hash2(band, 1, 3) * width;
  const cell = Math.floor((x + shift) / width);
  const along = x + shift - cell * width;

  return {
    band,
    cell,
    nearDike: along < DIKE || y > BANDS[band] - DIKE,
    kind: hash2(band, cell, 5),
  };
}

function trackAt(y, column, row, art) {
  const rut =
    Math.abs(y - (TRACK.near + TRACK.far) / 2) > 5 &&
    Math.abs(y - (TRACK.near + TRACK.far) / 2) < 7;

  return art.dirt[toneIndex(rut ? 3 : 4.4 + grainOf(column, row) * 0.6, column, row, art.dirt)];
}

// still water holding the sky, paler toward its far bank, with seedlings planted in neat rows and
// a glint where the breeze catches it
function waterAt(y, column, row, art) {
  const seedling = column % 5 === 0 && row % 3 === 0 && grain2(column, row, 9) < 0.8;
  const glint = grain2(column >> 3, row, 10) < 0.05 ? 1.2 : 0;
  const bank = ((y % 50) + 50) % 50;

  if (seedling) {
    return art.rice[3];
  }

  return art.water[toneIndex(2.2 + (1 - bank / 50) * 1.4 + glint, column, row, art.water)];
}

function riceAt(y, column, row, art) {
  const furrow = Math.floor(y / 2.5) % 2 === 0;

  return art.rice[toneIndex((furrow ? 1.6 : 2.6) + grainOf(column, row), column, row, art.rice)];
}

export const paddiesOf = (art) => (x, y, column, row) => {
  if (y > TRACK.far) {
    return trackAt(y, column, row, art);
  }

  const field = fieldOf(x, y);

  if (field.nearDike) {
    return field.kind < 0.5
      ? art.grass[toneIndex(3 + grainOf(column, row), column, row, art.grass)]
      : art.dirt[toneIndex(3.2, column, row, art.dirt)];
  }

  return field.kind < 0.45 ? waterAt(y, column, row, art) : riceAt(y, column, row, art);
};
