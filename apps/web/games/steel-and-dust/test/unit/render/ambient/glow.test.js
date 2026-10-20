import { describe, expect, it } from 'vitest';
import { heatAt } from '../../../../src/render/scene/ambient/glow.js';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const furnace = {
  kind: 'glow',
  plane: 'back',
  emitters: [{ x: 200, y: 150 }],
  tileWidth: 1000,
  drift: 1,
  width: 60,
  height: 40,
};

const centerOf = (rect) => [rect.x + rect.width / 2, rect.y + rect.height / 2];

describe('ambient furnace glow', () => {
  it('stacks a pool of light, widest first, its small core in the hot color, on the furnace', () => {
    const [outer, middle, core] = rectsOf(furnace, { tick: 40 });
    expect(outer.width).toBeGreaterThan(middle.width);
    expect(middle.width).toBeGreaterThan(core.width);
    expect([outer.color, middle.color]).toEqual([ALL_COLORS.furnace[0], ALL_COLORS.furnace[0]]);
    expect(core.color).toBe(ALL_COLORS.furnace[1]);
    for (const rect of [outer, middle, core]) {
      const [x, y] = centerOf(rect);
      expect(Math.abs(x - 200)).toBeLessThanOrEqual(1);
      expect(Math.abs(y - 150)).toBeLessThanOrEqual(1);
    }
  });

  it('breathes: its light swells and fades as the heat rises and falls', () => {
    const cores = ticksUpTo(600, 5).map((tick) => rectsOf(furnace, { tick })[2]);
    const alphas = cores.map((rect) => rect.alpha);
    expect(Math.max(...alphas) - Math.min(...alphas)).toBeGreaterThan(0.1);
    expect(new Set(cores.map((rect) => rect.width)).size).toBeGreaterThan(1);
  });

  it('keeps the heat between cold and full, with two furnaces out of step', () => {
    const heats = ticksUpTo(1200, 3).map((tick) => [heatAt(tick, 0), heatAt(tick, 1)]);
    for (const [first, second] of heats) {
      expect(first).toBeGreaterThanOrEqual(0);
      expect(first).toBeLessThanOrEqual(1);
      expect(second).toBeGreaterThanOrEqual(0);
    }
    const apart = heats.filter(([first, second]) => Math.abs(first - second) > 0.3);
    expect(apart.length).toBeGreaterThan(heats.length / 5);
  });
});
