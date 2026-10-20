import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const vent = (toward) => ({
  kind: 'steam',
  plane: 'back',
  emitters: [{ x: 200, y: 150 }],
  tileWidth: 1000,
  drift: 1,
  period: 240,
  burst: 30,
  toward,
});

const meanOf = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

describe('ambient steam', () => {
  const sideways = vent([1, 0]);

  it('blows in bursts and then goes quiet until the next', () => {
    const counts = ticksUpTo(239, 1).map((tick) => rectsOf(sideways, { tick }).length);
    expect(counts.slice(0, 60).every((count) => count > 0)).toBe(true);
    expect(counts.slice(100).every((count) => count === 0)).toBe(true);
    expect(rectsOf(sideways, { tick: 245 }).length).toBeGreaterThan(0);
  });

  it('shoots the way its vent points, swelling and thinning as it goes', () => {
    const puffs = ticksUpTo(90, 3).flatMap((tick) => rectsOf(sideways, { tick }));
    expect(meanOf(puffs.map((rect) => rect.x))).toBeGreaterThan(200 + 8);
    const wide = puffs.filter((rect) => rect.width >= 10);
    const narrow = puffs.filter((rect) => rect.width <= 4);
    expect(meanOf(wide.map((rect) => rect.x))).toBeGreaterThan(
      meanOf(narrow.map((rect) => rect.x)),
    );
    expect(Math.max(...wide.map((rect) => rect.alpha))).toBeLessThan(
      Math.max(...narrow.map((rect) => rect.alpha)),
    );
    expect(puffs.every((rect) => rect.color === ALL_COLORS.steam)).toBe(true);
  });

  it('rises from a vent that points up', () => {
    const puffs = ticksUpTo(90, 3).flatMap((tick) => rectsOf(vent([0, -1]), { tick }));
    expect(meanOf(puffs.map((rect) => rect.y))).toBeLessThan(150 - 10);
  });
});
