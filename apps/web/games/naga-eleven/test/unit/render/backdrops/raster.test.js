import { describe, expect, it } from 'vitest';
import {
  colorOf,
  copyPixel,
  createRaster,
  fillRect,
  pixelAt,
  plot,
  stampRaster,
} from '../../../../src/render/backdrops/raster.js';

const rgba = (raster, x, y) => [...pixelAt(raster, x, y)];

describe('the art-pixel buffer', () => {
  it('reads a colour as red, green, blue and alpha', () => {
    expect(colorOf('#ff8000')).toEqual([255, 128, 0, 255]);
    expect(colorOf('#10203040')).toEqual([16, 32, 48, 64]);
  });

  it('is 384 by 216 art pixels unless told otherwise, and starts clear', () => {
    const raster = createRaster();

    expect([raster.width, raster.height]).toEqual([384, 216]);
    expect(raster.data.every((value) => value === 0)).toBe(true);
  });

  it('plots whole pixels, rounding, and ignores what falls outside', () => {
    const raster = createRaster(4, 4);

    plot(raster, 1.4, 2.6, '#ffffff');
    plot(raster, -1, 9, '#ffffff');

    expect(rgba(raster, 1, 3)).toEqual([255, 255, 255, 255]);
    expect(raster.data.filter((value) => value > 0)).toHaveLength(4);
  });

  it('lays a see-through colour over what is there', () => {
    const raster = createRaster(1, 1);

    plot(raster, 0, 0, '#000000');
    plot(raster, 0, 0, '#ffffff80');

    expect(rgba(raster, 0, 0)[0]).toBeCloseTo(128, -1);
  });

  it('fills a rect clipped to the buffer', () => {
    const raster = createRaster(4, 4);

    fillRect(raster, { x: 2, y: -2, width: 9, height: 4 }, '#102030');

    expect(rgba(raster, 3, 1)).toEqual([16, 32, 48, 255]);
    expect(rgba(raster, 1, 1)).toEqual([0, 0, 0, 0]);
    expect(rgba(raster, 3, 2)).toEqual([0, 0, 0, 0]);
  });

  it('copies one pixel to another', () => {
    const raster = createRaster(2, 1);

    plot(raster, 0, 0, '#abcdef');
    copyPixel(raster, { x: 0, y: 0 }, { x: 1, y: 0 });

    expect(rgba(raster, 1, 0)).toEqual(rgba(raster, 0, 0));
  });

  it('stamps a buffer mirrored, leaving its clear pixels out', () => {
    const target = createRaster(3, 1);
    const prop = createRaster(2, 1);

    fillRect(target, { x: 0, y: 0, width: 3, height: 1 }, '#000000');
    plot(prop, 0, 0, '#ff0000');
    stampRaster(target, prop, { x: 1, y: 0, flipX: true });

    expect(rgba(target, 2, 0)).toEqual([255, 0, 0, 255]);
    expect(rgba(target, 1, 0)).toEqual([0, 0, 0, 255]);
  });
});
