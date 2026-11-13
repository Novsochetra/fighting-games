import { afterEach, describe, expect, it } from 'vitest';

import { createPen } from '../../../../../../src/render/duel/pen.js';
import {
  baked,
  canBake,
  rebaked,
  rgbOf,
  setBakeCanvas,
  stamp,
} from '../../../../../../dev/camera-lab/src/naga-shot/draw/bake.js';
import { createPixelCanvas } from '../../../../../support/pixel-canvas.js';

const pixelAt = (canvas, x, y) => [
  ...canvas.data.subarray((y * canvas.width + x) * 4, (y * canvas.width + x) * 4 + 4),
];

afterEach(() => setBakeCanvas(null));

describe("the Naga Shot's baked layers", () => {
  it('bakes nothing with no canvas to bake on', () => {
    expect(canBake()).toBe(false);
    expect(baked('none', { width: 2, height: 2, paint: () => {} })).toBeNull();
  });

  it('paints a layer once and keeps it by its key', () => {
    let paints = 0;
    const paint = (pen) => {
      paints += 1;
      pen.rect([1, 0, 2, 1], '#ff0000');
    };

    setBakeCanvas(createPixelCanvas);

    const first = baked('once', { width: 4, height: 2, paint });

    expect(baked('once', { width: 4, height: 2, paint })).toBe(first);
    expect(paints).toBe(1);
    expect(pixelAt(first, 1, 0)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(first, 0, 0)[3]).toBe(0);
  });

  it('changes a baked layer pixel by pixel', () => {
    setBakeCanvas(createPixelCanvas);

    const source = baked('red', { width: 2, height: 1, paint: (pen) => pen.dot(0, 0, '#ff0000') });
    const green = rebaked('red:green', source, (rgba) => (rgba[3] > 0 ? [0, 255, 0, 255] : null));

    expect(pixelAt(green, 0, 0)).toEqual([0, 255, 0, 255]);
    expect(pixelAt(green, 1, 0)[3]).toBe(0);
    expect(pixelAt(source, 0, 0)).toEqual([255, 0, 0, 255]);
  });

  it('lays a layer on the pen an art pixel to a pixel of it, mirrored when asked', () => {
    setBakeCanvas(createPixelCanvas);

    const layer = baked('dot', { width: 3, height: 1, paint: (pen) => pen.dot(0, 0, '#0000ff') });
    const canvas = createPixelCanvas(40, 10);
    const pen = createPen(canvas.getContext('2d'), { unit: 4, x: 2, y: 1 });

    stamp(pen, layer, { left: 1, top: 0 });
    stamp(pen, layer, { left: 5, top: 1, flip: true });

    expect(pixelAt(canvas, 6, 1)).toEqual([0, 0, 255, 255]);
    expect(pixelAt(canvas, 9, 4)).toEqual([0, 0, 255, 255]);
    expect(pixelAt(canvas, 10, 1)[3]).toBe(0);
    expect(pixelAt(canvas, 30, 5)).toEqual([0, 0, 255, 255]);
  });

  it('reads a palette colour as its channels', () => {
    expect(rgbOf('#10ff80')).toEqual([16, 255, 128]);
  });
});
