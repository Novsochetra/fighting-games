import { describe, expect, it } from 'vitest';
import { ALL_COLORS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const flag = {
  kind: 'pennants',
  plane: 'back',
  length: 40,
  height: 12,
  flutter: 3,
  droop: 4,
  emitters: [{ x: 200, y: 60 }],
  tileWidth: 1000,
  drift: 1,
};
const [outline, ...cloth] = ALL_COLORS.pennant;

// the cloth rects of each two-pixel column, keyed by the column's x
function columnsOf(rects) {
  const columns = new Map();
  for (const rect of rects.filter((item) => item.color !== outline)) {
    columns.set(rect.x, [...(columns.get(rect.x) ?? []), rect]);
  }
  return columns;
}

describe('ambient pennants', () => {
  it('fly out from the pole at the left of their emitter, as long as asked', () => {
    const xs = [...columnsOf(rectsOf(flag, { tick: 0 })).keys()];
    expect(Math.min(...xs)).toBe(180);
    expect(Math.max(...xs)).toBe(218);
    expect(xs).toHaveLength(20);
  });

  it('hang from a still hoist and flutter most at the tail', () => {
    const spread = (x) =>
      new Set(ticksUpTo(120, 5).map((tick) => columnsOf(rectsOf(flag, { tick })).get(x)[0].y)).size;
    expect(spread(180)).toBe(1);
    expect(spread(216)).toBeGreaterThan(3);
  });

  it('split the tail into a swallowtail, the cloth whole at the hoist', () => {
    const columns = columnsOf(rectsOf(flag, { tick: 30 }));
    expect(columns.get(180)).toHaveLength(1);
    expect(columns.get(218)).toHaveLength(2);
  });

  it('shade the cloth by how the wave turns it, edged in the outline color', () => {
    const rects = ticksUpTo(60, 4).flatMap((tick) => rectsOf(flag, { tick }));
    const colors = new Set(rects.map((rect) => rect.color));
    expect([...colors].sort()).toEqual([outline, ...cloth].sort());
  });
});
