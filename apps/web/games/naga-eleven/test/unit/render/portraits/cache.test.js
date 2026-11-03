import { afterEach, describe, expect, it } from 'vitest';
import { cachedCanvas, setPortraitCanvasFactory } from '../../../../src/render/portraits/cache.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

describe('the portrait canvas cache', () => {
  afterEach(() => setPortraitCanvasFactory(null));

  it('has no canvas to give without a factory, so the caller draws straight', () => {
    setPortraitCanvasFactory(null);

    expect(cachedCanvas('a', 64, () => {})).toBeNull();
  });

  it('paints a portrait once and hands the same canvas back after', () => {
    let paints = 0;

    setPortraitCanvasFactory(createPixelCanvas);

    const first = cachedCanvas('a', 64, () => {
      paints += 1;
    });
    const again = cachedCanvas('a', 64, () => {
      paints += 1;
    });

    expect(again).toBe(first);
    expect(first.width).toBe(64);
    expect(paints).toBe(1);
  });
});
