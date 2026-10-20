import { describe, expect, it } from 'vitest';
import { ALL_COLORS, SAMPLE_EFFECTS, rectsOf, ticksUpTo } from './ambient-recorder.js';

const drift = SAMPLE_EFFECTS.sandDrift;

describe('ambient sand drift', () => {
  const frames = ticksUpTo(1200, 10).map((tick) => rectsOf(drift, { tick }));

  it('skates thin streaks low along the ground', () => {
    for (const rect of frames.flat()) {
      expect(rect.height).toBe(1);
      expect(rect.width).toBeGreaterThanOrEqual(1);
      expect(rect.width).toBeLessThanOrEqual(12);
      expect(rect.y).toBeGreaterThanOrEqual(drift.top - 2);
      expect(rect.y).toBeLessThanOrEqual(drift.bottom + 2);
    }
  });

  it('blows downwind', () => {
    const first = rectsOf(drift, { tick: 500 });
    const later = rectsOf(drift, { tick: 520 });
    const moved = first
      .map((rect, i) => later[i] && later[i].x - rect.x)
      .filter((step) => step !== undefined && Math.abs(step) < 40);
    expect(moved.filter((step) => step > 0).length).toBeGreaterThan(moved.length / 2);
  });

  it('comes and goes in gusts, never fully opaque', () => {
    const alphas = frames.flat().map((rect) => rect.alpha);
    expect(Math.max(...alphas)).toBeLessThan(0.6);
    expect(Math.min(...alphas)).toBeLessThan(0.1);
    expect(new Set(frames.flat().map((rect) => rect.color))).toEqual(new Set(ALL_COLORS.sandDrift));
  });
});
