import { describe, expect, it } from 'vitest';
import { SAMPLE_EFFECTS, rectsOf, recordEffect, ticksUpTo } from './ambient-recorder.js';

const birds = SAMPLE_EFFECTS.birds;

function meanX(rects) {
  return rects.reduce((sum, rect) => sum + rect.x, 0) / rects.length;
}

describe('ambient birds', () => {
  it('draw nothing while the flock is off-screen in its cycle', () => {
    for (const tick of [0, 1, 2, 720, 800, 899, 900, 1620, 1799]) {
      expect(recordEffect(birds, { tick }).log).toEqual([]);
    }
  });

  it('cross from right to left once per period', () => {
    const early = meanX(rectsOf(birds, { tick: 150 }));
    const late = meanX(rectsOf(birds, { tick: 500 }));
    expect(early).toBeGreaterThan(late);
    expect(rectsOf(birds, { tick: 900 + 150 }).length).toBeGreaterThan(0);
  });

  it('fly as a flock of 3 to 5 birds made of three rects each', () => {
    const flockSizes = new Set();
    for (let crossing = 0; crossing < 12; crossing++) {
      const rects = rectsOf(birds, { tick: crossing * birds.period + 300 });
      expect(rects.length % 3).toBe(0);
      flockSizes.add(rects.length / 3);
    }
    expect([...flockSizes].every((size) => size >= 3 && size <= 5)).toBe(true);
    expect(flockSizes.size).toBeGreaterThan(1);
  });

  it('flap their wings between two frames', () => {
    const wingPoses = new Set();
    for (const tick of ticksUpTo(40, 1).map((offset) => 300 + offset)) {
      const [first, second, third] = rectsOf(birds, { tick });
      const body = [first, second, third].find((rect) => rect.width === 3);
      const wingTip = [first, second, third].find((rect) => rect.width === 1);
      wingPoses.add(body.y - wingTip.y);
    }
    expect([...wingPoses].sort()).toEqual([-1, 1]);
  });

  it('use the forest bird color', () => {
    const colors = new Set(rectsOf(birds, { tick: 300 }).map((rect) => rect.color));
    expect(colors.size).toBe(1);
  });
});
