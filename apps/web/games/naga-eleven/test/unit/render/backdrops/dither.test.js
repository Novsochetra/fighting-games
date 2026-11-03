import { describe, expect, it } from 'vitest';
import {
  bandAt,
  glow,
  gradient,
  mixes,
  threshold,
} from '../../../../src/render/backdrops/dither.js';
import { createRaster, pixelAt } from '../../../../src/render/backdrops/raster.js';

const hexAt = (raster, x, y) =>
  `#${[...pixelAt(raster, x, y)]
    .slice(0, 3)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;

describe('ordered dither', () => {
  it('spreads the sixteen thresholds of a 4 by 4 tile evenly through 0..1', () => {
    const values = [];

    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        values.push(threshold(x, y));
      }
    }

    expect(new Set(values).size).toBe(16);
    expect(Math.min(...values)).toBeGreaterThan(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  it('mixes in a share of pixels that follows the level', () => {
    let mixed = 0;

    for (let i = 0; i < 16; i += 1) {
      mixed += Number(mixes(i % 4, Math.floor(i / 4), 0.25));
    }

    expect(mixed).toBe(4);
  });

  it('keeps most of a band flat and dithers only its edge', () => {
    expect(bandAt(0.3, 4, 0.4)).toEqual({ band: 0, level: 0 });
    expect(bandAt(0.8, 4, 0.4).level).toBeCloseTo(0.5);
    expect(bandAt(9, 4, 0.4)).toEqual({ band: 2, level: 1 });
  });
});

describe('a dithered gradient', () => {
  it('runs from its first colour at the top to its last at the bottom', () => {
    const raster = createRaster(8, 20);

    gradient(raster, { top: 0, bottom: 20, colors: ['#000000', '#808080', '#ffffff'] });

    expect(hexAt(raster, 3, 0)).toBe('#000000');
    expect(hexAt(raster, 3, 19)).toBe('#ffffff');
  });

  it('rings light round a point, brightest at its heart, and leaves the rest alone', () => {
    const raster = createRaster(41, 41);

    glow(raster, { x: 20, y: 20, radius: 18, colors: ['#330000', '#990000', '#ff0000'] });

    expect(hexAt(raster, 20, 20)).toBe('#ff0000');
    expect(pixelAt(raster, 0, 0)[3]).toBe(0);
  });
});
