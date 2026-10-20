import { describe, expect, it } from 'vitest';
import { FOREST_THEMES } from '../../../../src/art/forest-themes.js';
import { VIEW_HEIGHT } from '../../../../src/config.js';
import { SAMPLE_EFFECTS, rectsOf, recordEffect, ticksUpTo } from './ambient-recorder.js';

const leaves = SAMPLE_EFFECTS.leaves;
const oneLeaf = { kind: 'leaves', plane: 'front', count: 1, drift: 0, wind: 0 };

describe('ambient leaves', () => {
  it('fall, then wrap from the bottom of the view back to the top', () => {
    const heights = ticksUpTo(1500, 5)
      .map((tick) => rectsOf(oneLeaf, { tick })[0])
      .filter(Boolean)
      .map((rect) => rect.y);
    const steps = heights.slice(1).map((y, i) => y - heights[i]);
    expect(Math.max(...heights)).toBeGreaterThan(VIEW_HEIGHT - 8);
    expect(Math.min(...heights)).toBeLessThan(4);
    expect(steps.filter((step) => step < 0).length).toBeGreaterThan(0);
    expect(steps.filter((step) => step > 0).length).toBeGreaterThan(steps.length * 0.8);
  });

  it('are carried sideways by the wind, which a camera moving along with it cancels', () => {
    const calm = { ...leaves, wind: 0, drift: 1 };
    const windy = { ...leaves, wind: 0.25, drift: 1 };
    expect(recordEffect(windy, { tick: 100, cameraX: 25 }).log).toEqual(
      recordEffect(calm, { tick: 100 }).log,
    );
    expect(recordEffect(windy, { tick: 100 }).log).not.toEqual(
      recordEffect(calm, { tick: 100 }).log,
    );
  });

  it('tumble between a flat and an upright shape, each with a 1px highlight', () => {
    const shapes = new Set();
    for (const tick of ticksUpTo(120, 4)) {
      const rects = rectsOf(leaves, { tick });
      for (let i = 0; i < rects.length; i += 2) {
        shapes.add(`${rects[i].width}x${rects[i].height}`);
        expect([rects[i + 1].width, rects[i + 1].height]).toEqual([1, 1]);
        expect(rects[i + 1].color).not.toBe(rects[i].color);
      }
    }
    expect([...shapes].sort()).toEqual(['1x2', '2x1']);
  });

  it('cycle through the forest leaf colors', () => {
    const emberWoods = FOREST_THEMES.emberWoods.ambient;
    const bodies = new Set();
    for (const tick of ticksUpTo(600, 30)) {
      const rects = rectsOf(leaves, { tick, colors: emberWoods });
      rects.filter((_, i) => i % 2 === 0).forEach((rect) => bodies.add(rect.color));
    }
    expect([...bodies].sort()).toEqual([...emberWoods.leaves].sort());
  });
});
