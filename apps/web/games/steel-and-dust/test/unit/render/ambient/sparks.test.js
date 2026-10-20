import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const spout = {
  kind: 'sparks',
  plane: 'back',
  emitters: [{ x: 200, y: 90 }],
  tileWidth: 1000,
  drift: 1,
  period: 200,
  burst: 50,
  count: 20,
  floor: 160,
};

const sparksOf = (rects) => rects.filter((rect) => rect.width === 1);
const meanY = (rects) => rects.reduce((sum, rect) => sum + rect.y, 0) / rects.length;

describe('ambient sparks', () => {
  const showers = ticksUpTo(199, 1).map((tick) => sparksOf(rectsOf(spout, { tick })));

  it('come in showers, with a quiet spell before the next', () => {
    expect(Math.max(...showers.map((sparks) => sparks.length))).toBeGreaterThan(8);
    expect(showers.slice(120).every((sparks) => sparks.length === 0)).toBe(true);
    expect(sparksOf(rectsOf(spout, { tick: 200 + 30 })).length).toBeGreaterThan(0);
  });

  it('arc down under their weight, cooling as they fall, and die before the floor', () => {
    const all = showers.flat();
    const [hot, warm, cool] = ALL_COLORS.sparks.map((color) =>
      all.filter((rect) => rect.color === color),
    );
    expect(meanY(cool)).toBeGreaterThan(meanY(warm));
    expect(meanY(warm)).toBeGreaterThan(meanY(hot));
    expect(all.every((rect) => rect.y < spout.floor)).toBe(true);
  });

  it('streak when they fall fast and carry a faint halo while fresh', () => {
    const all = showers.flat();
    expect(new Set(all.map((rect) => rect.height))).toEqual(new Set([1, 3]));
    const halos = ticksUpTo(60, 1)
      .flatMap((tick) => rectsOf(spout, { tick }))
      .filter((rect) => rect.width === 3);
    expect(halos.length).toBeGreaterThan(0);
    expect(halos.every((rect) => rect.alpha < 0.5)).toBe(true);
  });

  it('spray to both sides of the spout', () => {
    const xs = showers.flat().map((rect) => rect.x);
    expect(Math.min(...xs)).toBeLessThan(spout.emitters[0].x - 8);
    expect(Math.max(...xs)).toBeGreaterThan(spout.emitters[0].x + 8);
  });
});
