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

  it('puts the view on the top half of a phone folded on a table, the controls under it', () => {
    const top = { x: 0, y: 0, width: 1104, height: 442 };
    const { rect, controlsBelow } = arrangeView(
      screen(1104, 884, { hinge: { stacked: true, game: top } }),
    );

    expect(controlsBelow).toBe(true);
    expect(rect).toEqual({ x: 257, y: 0, width: 589, height: 442 });
  });
});
