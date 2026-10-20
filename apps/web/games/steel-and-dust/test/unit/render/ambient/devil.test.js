import { describe, expect, it } from 'vitest';
import { SAMPLE_EFFECTS, rectsOf, recordEffect } from './ambient-recorder.js';

const devil = SAMPLE_EFFECTS.devil;
const life = devil.period * 0.6;

describe('ambient dust devil', () => {
  it('spins up and dies away once a period, then leaves the sky clear', () => {
    expect(rectsOf(devil, { tick: 10 }).length).toBeGreaterThan(0);
    expect(rectsOf(devil, { tick: life / 2 }).length).toBeGreaterThan(0);
    expect(recordEffect(devil, { tick: life + 5 }).log).toEqual([]);
    expect(recordEffect(devil, { tick: devil.period - 1 }).log).toEqual([]);
    expect(rectsOf(devil, { tick: devil.period + 10 }).length).toBeGreaterThan(0);
  });

  it('fades in, peaks halfway through its life and fades out', () => {
    const peak = (tick) => Math.max(...rectsOf(devil, { tick }).map((rect) => rect.alpha));
    expect(peak(life / 2)).toBeGreaterThan(peak(20));
    expect(peak(life / 2)).toBeGreaterThan(peak(life - 20));
  });

  it('is a funnel: a thread at the ground widening toward the top', () => {
    const rows = rectsOf({ ...devil, x: 190, drift: 0 }, { tick: life / 2 }).filter(
      (rect) => rect.height === 2 && rect.y < devil.y - 2,
    );
    const lowest = rows.reduce((low, rect) => (rect.y > low.y ? rect : low));
    const highest = rows.reduce((high, rect) => (rect.y < high.y ? rect : high));
    expect(lowest.width).toBeLessThanOrEqual(3);
    expect(highest.width).toBeGreaterThan(lowest.width * 3);
    expect(lowest.y - highest.y).toBeGreaterThanOrEqual(devil.height - 4);
  });
});
