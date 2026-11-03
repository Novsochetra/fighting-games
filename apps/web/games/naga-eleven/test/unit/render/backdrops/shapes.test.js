import { describe, expect, it } from 'vitest';
import { hash, patchNoise, smoothNoise } from '../../../../src/render/backdrops/hash.js';
import { createRaster } from '../../../../src/render/backdrops/raster.js';
import { disc, polygon } from '../../../../src/render/backdrops/shapes.js';

const painted = (raster) => raster.data.filter((_, i) => i % 4 === 3 && raster.data[i] > 0).length;

describe('the shapes a backdrop is built from', () => {
  it('fills a polygon given as a flat list of corners, edge to edge', () => {
    const raster = createRaster(10, 10);

    polygon(raster, [0, 0, 10, 0, 10, 10, 0, 10], '#ffffff');

    expect(painted(raster)).toBe(100);
  });

  it('fills a disc symmetric about its middle', () => {
    const raster = createRaster(11, 11);

    disc(raster, { x: 5, y: 5, radius: 4 }, '#ffffff');

    expect(painted(raster)).toBeGreaterThan(40);
    expect(raster.data[(5 * 11 + 1) * 4 + 3]).toBe(raster.data[(5 * 11 + 9) * 4 + 3]);
  });
});

describe('the hash that places scenery and twinkles', () => {
  it('gives the same value for the same numbers, in [0, 1)', () => {
    const values = Array.from({ length: 200 }, (_, i) => hash(7, i));

    expect(hash(7, 3)).toBe(hash(7, 3));
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(new Set(values).size).toBeGreaterThan(190);
  });

  it('wanders smoothly between its turns', () => {
    const steps = Array.from({ length: 40 }, (_, x) => smoothNoise(3, x, 10));
    const jumps = steps.slice(1).map((value, i) => Math.abs(value - steps[i]));

    expect(Math.max(...jumps)).toBeLessThan(0.2);
    expect(patchNoise(3, { x: 5, y: 5 }, 10)).toBe(patchNoise(3, { x: 5, y: 5 }, 10));
  });
});
