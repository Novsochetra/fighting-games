import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../../src/config.js';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const stack = (x, extra = {}) => ({
  kind: 'plume',
  plane: 'back',
  emitters: [{ x, y: 120 }],
  tileWidth: 1000,
  drift: 1,
  rise: 0.25,
  wind: 0.1,
  size: 26,
  ...extra,
});

const bodies = (rects) => rects.filter((rect) => rect.color === ALL_COLORS.plume[0]);

describe('ambient plume', () => {
  const frames = ticksUpTo(720, 6).map((tick) => bodies(rectsOf(stack(150), { tick })));
  const all = frames.flat();

  it('rises from the stack and swells as it climbs', () => {
    expect(all.every((rect) => rect.y < 120 + 4)).toBe(true);
    const low = all.filter((rect) => rect.y > 100);
    const high = all.filter((rect) => rect.y < 60);
    const widest = (rects) => Math.max(...rects.map((rect) => rect.width));
    expect(high.length).toBeGreaterThan(0);
    expect(widest(high)).toBeGreaterThan(widest(low) + 6);
  });

  it('bends downwind the higher it climbs', () => {
    const meanX = (rects) => rects.reduce((sum, rect) => sum + rect.x, 0) / rects.length;
    const low = all.filter((rect) => rect.y > 100);
    const high = all.filter((rect) => rect.y < 50);
    expect(meanX(high)).toBeGreaterThan(meanX(low) + 8);
  });

  it('catches the sun on the upper left of each billow, more faintly than its body', () => {
    const rects = rectsOf(stack(150), { tick: 300 });
    const lit = rects.filter((rect) => rect.color === ALL_COLORS.plume[1]);
    expect(lit.length).toBeGreaterThan(0);
    expect(Math.max(...lit.map((rect) => rect.alpha))).toBeLessThan(
      Math.max(...bodies(rects).map((rect) => rect.alpha)),
    );
  });

  it('cuts its widest billows at the edges of the view', () => {
    for (const tick of ticksUpTo(720, 12)) {
      for (const rect of rectsOf(stack(-4), { tick }).concat(
        rectsOf(stack(VIEW_WIDTH), { tick }),
      )) {
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(VIEW_WIDTH);
      }
    }
  });
});
