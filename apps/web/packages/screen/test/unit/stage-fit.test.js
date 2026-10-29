import { describe, expect, it } from 'vitest';
import { arrangeView, fitView, isPortrait } from '../../src/stage-fit.js';

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };
// a game drawn 4 to 3, unlike Steel & Dust's 16 to 9
const RETRO = { width: 320, height: 240 };
const screen = (width, height, more = {}) => ({
  width,
  height,
  safe: noInsets,
  hinge: null,
  view: RETRO,
  controlsHeight: 200,
  ...more,
});

describe('fitting a game’s view to the screen', () => {
  it('keeps the view’s shape, centred in its area', () => {
    expect(fitView({ x: 0, y: 0, width: 1000, height: 600 }, RETRO)).toEqual({
      x: 100,
      y: 0,
      width: 800,
      height: 600,
    });
  });

  it('tells an upright screen apart from a square one', () => {
    expect(isPortrait(390, 844)).toBe(true);
    expect(isPortrait(800, 820)).toBe(false);
  });

  it('stands the view over the touch controls on an upright phone, in its own shape', () => {
    const { rect, controlsBelow } = arrangeView(
      screen(390, 844, { safe: { ...noInsets, top: 47 } }),
    );

    expect(controlsBelow).toBe(true);
    expect(rect).toEqual({ x: 0, y: 47, width: 390, height: 293 });
  });

  it('leaves the controls over the view on a phone held sideways, and without controls', () => {
    expect(arrangeView(screen(844, 390)).controlsBelow).toBe(false);
    expect(arrangeView(screen(390, 844, { controlsHeight: null }))).toEqual({
      rect: fitView({ x: 0, y: 0, width: 390, height: 844 }, RETRO),
      controlsBelow: false,
    });
  });

  it('keeps the view inside a skin’s frame, between the panels of a handheld held sideways', () => {
    const { rect, controlsBelow, framed } = arrangeView(
      screen(844, 390, {
        view: { width: 768, height: 432 },
        frame: { left: 170, right: 170, top: 12, bottom: 12 },
        safe: { ...noInsets, left: 47 },
      }),
    );

    expect([controlsBelow, framed]).toEqual([false, true]);
    expect(rect.x).toBeGreaterThanOrEqual(47 + 170);
    expect(rect.x + rect.width).toBeLessThanOrEqual(844 - 170);
    expect(rect).toEqual({ x: 217, y: 66, width: 457, height: 257 });
  });

  it('stands the view at the top of a skin’s frame on an upright phone', () => {
    const { rect } = arrangeView(
      screen(390, 844, {
        view: { width: 768, height: 432 },
        frame: { left: 10, right: 10, top: 10, align: 'top' },
        safe: { ...noInsets, top: 47 },
      }),
    );

    expect(rect).toEqual({ x: 10, y: 57, width: 370, height: 208 });
  });

  it('lets a fold, or no touch controls, overrule a skin’s frame', () => {
    const frame = { left: 170, right: 170 };
    const top = { x: 0, y: 0, width: 1104, height: 442 };

    expect(arrangeView(screen(844, 390, { frame, controlsHeight: null })).framed).toBeUndefined();
    expect(
      arrangeView(screen(1104, 884, { frame, hinge: { stacked: true, game: top } })).rect,
    ).toEqual(arrangeView(screen(1104, 884, { hinge: { stacked: true, game: top } })).rect);
  });

  it('puts the view on the top half of a phone folded on a table, the controls under it', () => {
    const top = { x: 0, y: 0, width: 1104, height: 442 };
    const { rect, controlsBelow } = arrangeView(
      screen(1104, 884, { hinge: { stacked: true, game: top } }),
    );

    expect(controlsBelow).toBe(true);
    expect(rect).toEqual({ x: 257, y: 0, width: 589, height: 442 });
  });
});
