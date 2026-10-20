import { describe, expect, it } from 'vitest';
import { SAMPLE_EFFECTS, rectsOf, recordEffect, ticksUpTo } from './ambient-recorder.js';

const bats = SAMPLE_EFFECTS.bats;

function meanX(rects) {
  return rects.reduce((sum, rect) => sum + rect.x, 0) / rects.length;
}

describe('ambient bats', () => {
  it('draw nothing between crossings', () => {
    for (const tick of [640, 700, 899, 1540, 1799]) {
      expect(recordEffect(bats, { tick }).log).toEqual([]);
    }
  });

  it('cross the sky one way or the other, a different way some evenings', () => {
    const headings = new Set();
    for (let crossing = 0; crossing < 10; crossing++) {
      const start = crossing * bats.period;
      const early = rectsOf(bats, { tick: start + 200 });
      const late = rectsOf(bats, { tick: start + 450 });
      if (early.length && late.length) {
        headings.add(Math.sign(meanX(late) - meanX(early)));
      }
    }
    expect(headings).toEqual(new Set([-1, 1]));
  });

  it('flap quickly between wings up and wings down', () => {
    const counts = new Set(
      ticksUpTo(16, 1).map((tick) => rectsOf(bats, { tick: 300 + tick }).length),
    );
    expect(counts.size).toBeGreaterThan(1);
  });

  it('flit up and down instead of flying level', () => {
    const tops = ticksUpTo(120, 4).map((tick) =>
      Math.min(...rectsOf(bats, { tick: 200 + tick }).map((rect) => rect.y)),
    );
    expect(Math.max(...tops) - Math.min(...tops)).toBeGreaterThan(4);
  });
});
