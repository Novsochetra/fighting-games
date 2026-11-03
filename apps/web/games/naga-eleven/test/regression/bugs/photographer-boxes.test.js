import { describe, expect, it } from 'vitest';
import { PHOTOGRAPHER_COLOURS } from '../../../src/art/venues/photographer.js';
import { packed } from '../../../src/render/venues/kit/colour.js';
import { createRaster } from '../../../src/render/venues/kit/raster.js';
import {
  paintPhotographer,
  PHOTOGRAPHER_SIZE,
} from '../../../src/render/venues/scenery/photographer.js';

// The photographers behind the goals were an orange box with a black lens on it: a block of vest
// with a square head, no outline, no legs. Each is a small kneeling person now.

function painted(index) {
  const raster = createRaster(PHOTOGRAPHER_SIZE.width, PHOTOGRAPHER_SIZE.height);

  paintPhotographer(raster, index);

  return raster;
}

const at = (raster, x, y) =>
  x < 0 || y < 0 || x >= raster.width || y >= raster.height
    ? 0
    : raster.pixels[y * raster.width + x];

function pixelsOf(raster) {
  const found = [];

  for (let y = 0; y < raster.height; y += 1) {
    for (let x = 0; x < raster.width; x += 1) {
      if (at(raster, x, y)) {
        found.push({ x, y, colour: at(raster, x, y) });
      }
    }
  }

  return found;
}

const OUTLINE = packed(PHOTOGRAPHER_COLOURS.o);
// the monopod is a single pixel wide, so it stands without an outline
const BARE = new Set([PHOTOGRAPHER_COLOURS.d, PHOTOGRAPHER_COLOURS.n].map(packed));

describe('a photographer by the goal', () => {
  it('is drawn in a dozen colours or more, no one of them a quarter of him inside his outline', () => {
    const pixels = pixelsOf(painted(0)).filter(({ colour }) => colour !== OUTLINE);
    const counts = new Map();

    for (const { colour } of pixels) {
      counts.set(colour, (counts.get(colour) ?? 0) + 1);
    }

    const most = Math.max(...counts.values());

    expect(counts.size).toBeGreaterThanOrEqual(12);
    expect(most / pixels.length).toBeLessThan(0.25);
  });

  it('is outlined in ink wherever he meets the grass', () => {
    const raster = painted(0);
    const bareEdges = pixelsOf(raster).filter(
      ({ x, y, colour }) =>
        colour !== OUTLINE &&
        !BARE.has(colour) &&
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => at(raster, x + dx, y + dy) === 0),
    );

    expect(bareEdges.map(({ x, y }) => [x, y])).toEqual([]);
  });

  it('kneels on the ground with his lens out ahead of him', () => {
    const pixels = pixelsOf(painted(0));
    const lens = pixels.filter(({ colour }) => colour === packed(PHOTOGRAPHER_COLOURS.L));
    const skin = pixels.filter(({ colour }) => colour === packed(PHOTOGRAPHER_COLOURS.s));
    const shoes = pixels.filter(({ colour }) => colour === packed(PHOTOGRAPHER_COLOURS.b));

    expect(Math.min(...lens.map(({ x }) => x))).toBeGreaterThan(
      Math.max(...skin.map(({ x }) => x)) - 4,
    );
    expect(Math.max(...lens.map(({ x }) => x))).toBeGreaterThan(PHOTOGRAPHER_SIZE.width * 0.8);
    expect(Math.max(...shoes.map(({ y }) => y))).toBeGreaterThanOrEqual(
      PHOTOGRAPHER_SIZE.height - 3,
    );
  });

  it('fires a flash in his second drawing, and only there', () => {
    const flash = packed(PHOTOGRAPHER_COLOURS.F);
    const lit = (raster) => pixelsOf(raster).filter(({ colour }) => colour === flash).length;

    expect(lit(painted(0))).toBe(0);
    expect(lit(painted(1))).toBeGreaterThan(8);
  });
});
