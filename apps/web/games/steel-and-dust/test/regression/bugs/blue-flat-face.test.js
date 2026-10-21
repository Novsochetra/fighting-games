import { describe, expect, it } from 'vitest';
import { HERO_SPRITES, ONE_ROW_STRIPS } from '../../../src/data/hero-sprites.js';
import { heroById } from '../../../src/data/heroes.js';
import { WEAPON_IDS } from '../../../src/data/weapons/index.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: in his slashes, spin and ultimate the Blue Shade's face under the hood was a flat plate of
// light blue, where his design has a black face lit only along the mask's edge. A run of strong blue
// at the top of him, a pixel thick or more both ways and wrapped in the hood's black, is that plate
const GAME = new URL('../../../', import.meta.url);
const BLUE = heroById('blue');
const { frameWidth } = HERO_SPRITES;
const STRIPS = Object.keys(HERO_SPRITES.frames);
const HOOD_DEPTH = 12;
const WRAPPED = 0.6;
const NEIGHBOURS = [-1, 0, 1].flatMap((dx) => [-1, 0, 1].map((dy) => [dx, dy]));

function swordRow(strip) {
  const path = ONE_ROW_STRIPS.has(strip) ? BLUE.ultStrip : `${BLUE.directory}hero_${strip}.png`;
  const image = readPngAlpha(new URL(path, GAME));
  const rows = ONE_ROW_STRIPS.has(strip) ? 1 : WEAPON_IDS.length;
  return { image, height: image.height / rows };
}

function frameOf({ image, height }, index) {
  const left = index * frameWidth;
  const inside = (x, y) => x >= 0 && y >= 0 && x < frameWidth && y < height;
  const pixel = (x, y) => ({ alpha: image.alpha(left + x, y), rgb: image.rgb(left + x, y) });
  const blue = (x, y) => {
    if (!inside(x, y)) {
      return false;
    }
    const { alpha, rgb } = pixel(x, y);
    return alpha > 0 && rgb[2] >= 200 && rgb[2] - rgb[0] >= 150 && Math.min(...rgb) < 190;
  };
  const black = (x, y) =>
    inside(x, y) && pixel(x, y).alpha > 0 && Math.max(...pixel(x, y).rgb) < 16;
  return { height, blue, black, solid: (x, y) => inside(x, y) && pixel(x, y).alpha > 0 };
}

function topOf(frame) {
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (frame.solid(x, y)) {
        return y;
      }
    }
  }
  return frame.height;
}

function blobFrom(frame, start, seen) {
  const blob = [];
  const stack = [start];
  while (stack.length) {
    const [x, y] = stack.pop();
    const key = `${x},${y}`;
    if (seen.has(key) || !frame.blue(x, y)) {
      continue;
    }
    seen.add(key);
    blob.push([x, y]);
    stack.push(...NEIGHBOURS.map(([dx, dy]) => [x + dx, y + dy]));
  }
  return blob;
}

// a blob is a plate where some pixel has blue all round it, and the hood's black wraps it
function isPlate(frame, blob) {
  const inBlob = new Set(blob.map(([x, y]) => `${x},${y}`));
  const cores = blob.filter(([x, y]) =>
    NEIGHBOURS.every(([dx, dy]) => inBlob.has(`${x + dx},${y + dy}`)),
  );
  const ring = new Set();
  for (const [x, y] of blob) {
    for (const [dx, dy] of NEIGHBOURS) {
      if (!inBlob.has(`${x + dx},${y + dy}`)) {
        ring.add(`${x + dx},${y + dy}`);
      }
    }
  }
  const wrapped = [...ring].filter((key) => frame.black(...key.split(',').map(Number))).length;
  return cores.length >= 2 && wrapped >= WRAPPED * ring.size;
}

function hasFlatFace(frame) {
  const top = topOf(frame);
  const seen = new Set();
  for (let y = top; y <= top + HOOD_DEPTH; y++) {
    for (let x = 0; x < frameWidth; x++) {
      if (
        frame.blue(x, y) &&
        !seen.has(`${x},${y}`) &&
        isPlate(frame, blobFrom(frame, [x, y], seen))
      ) {
        return true;
      }
    }
  }
  return false;
}

describe("the Blue Shade's face", () => {
  it.each(STRIPS)(
    'is a dark mask lit at its edge in every %s frame, never a flat plate',
    (strip) => {
      const row = swordRow(strip);
      const flat = Array.from({ length: HERO_SPRITES.frames[strip] }, (_, index) => index).filter(
        (index) => hasFlatFace(frameOf(row, index)),
      );
      expect(flat).toEqual([]);
    },
  );
});
