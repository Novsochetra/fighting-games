import { describe, expect, it } from 'vitest';
import { rectsOf, ticksUpTo } from './ambient-recorder.js';

const oneMote = { kind: 'motes', plane: 'back', count: 1, drift: 0, top: 60, bottom: 180 };

describe('ambient motes', () => {
  const seen = ticksUpTo(2400, 3)
    .map((tick) => rectsOf(oneMote, { tick })[0])
    .filter(Boolean);

  it('are 1px specks that stay inside their band', () => {
    expect(seen.length).toBeGreaterThan(100);
    for (const rect of seen) {
      expect([rect.width, rect.height]).toEqual([1, 1]);
      expect(rect.y).toBeGreaterThanOrEqual(oneMote.top);
      expect(rect.y).toBeLessThanOrEqual(oneMote.bottom);
    }
  });

  it('drift upward', () => {
    const steps = seen.slice(1).map((rect, i) => rect.y - seen[i].y);
    expect(steps.filter((step) => step < 0).length).toBeGreaterThan(
      steps.filter((step) => step > 0).length * 5,
    );
  });

  it('twinkle with an alpha that rises and falls', () => {
    const alphas = seen.map((rect) => rect.alpha);
    expect(Math.min(...alphas)).toBeLessThan(0.4);
    expect(Math.max(...alphas)).toBeGreaterThan(0.75);
  });
});
