import { describe, expect, it } from 'vitest';
import { PAINTED_THEMES } from '../../../../src/art/painted-themes/index.js';
import { rectsOf, ticksUpTo } from './ambient-recorder.js';

const ironWorks = PAINTED_THEMES.ironWorks.ambient;
const oneFlake = { kind: 'ash', plane: 'front', count: 1, drift: 0, wind: 0 };
const flurry = { kind: 'ash', plane: 'front', count: 30, drift: 1, wind: 0.1 };

describe('ambient ash', () => {
  it('sifts down slowly, slower than a falling leaf', () => {
    const heights = ticksUpTo(600, 6)
      .map((tick) => rectsOf(oneFlake, { tick, colors: ironWorks })[0])
      .filter(Boolean)
      .map((rect) => rect.y);
    const steps = heights.slice(1).map((y, i) => y - heights[i]);
    const falling = steps.filter((step) => step > 0 && step < 50);
    expect(falling.length).toBeGreaterThan(steps.length * 0.6);
    expect(Math.max(...falling)).toBeLessThanOrEqual(2);
  });

  it('tumbles between a speck and a flake, in the soot and ash colors', () => {
    const rects = ticksUpTo(300, 10).flatMap((tick) =>
      rectsOf(flurry, { tick, colors: ironWorks }),
    );
    const flakes = rects.filter((rect) => rect.color !== ironWorks.ash.at(-1));
    expect(new Set(flakes.map((rect) => `${rect.width}x${rect.height}`))).toEqual(
      new Set(['1x1', '2x1']),
    );
    expect(new Set(flakes.map((rect) => rect.color))).toEqual(new Set(ironWorks.ash.slice(0, -1)));
  });

  it('carries now and then a cinder still alight, flickering', () => {
    const cinders = ticksUpTo(300, 5)
      .flatMap((tick) => rectsOf(flurry, { tick, colors: ironWorks }))
      .filter((rect) => rect.color === ironWorks.ash.at(-1));
    expect(cinders.length).toBeGreaterThan(0);
    expect(new Set(cinders.map((rect) => rect.alpha)).size).toBeGreaterThan(3);
  });
});
