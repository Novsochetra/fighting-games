import { describe, expect, it } from 'vitest';
import { SAMPLE_EFFECTS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const plumes = SAMPLE_EFFECTS.plumes;
const onePlume = { ...plumes, count: 1, drift: 0 };

describe('ambient plumes', () => {
  it('roll dust along the ground, their puffs sitting on it', () => {
    for (const tick of ticksUpTo(1500, 37)) {
      for (const rect of rectsOf(plumes, { tick })) {
        expect(rect.y + rect.height).toBeLessThanOrEqual(plumes.y + 2);
        expect(rect.y).toBeGreaterThan(plumes.y - 30);
      }
    }
  });

  it('roll with the wind, right to left', () => {
    const leads = ticksUpTo(100, 10)
      .map((tick) => rectsOf(onePlume, { tick: 200 + tick })[0]?.x)
      .filter((x) => x !== undefined);
    expect(leads.length).toBeGreaterThan(3);
    expect(leads.at(-1)).toBeLessThan(leads[0]);
  });

  it('swell into view and fade away over each life', () => {
    const alphas = ticksUpTo(600, 3).map((tick) => rectsOf(onePlume, { tick })[0]?.alpha ?? 0);
    expect(Math.max(...alphas)).toBeGreaterThan(0.15);
    expect(Math.min(...alphas)).toBeLessThan(0.03);
  });
});
