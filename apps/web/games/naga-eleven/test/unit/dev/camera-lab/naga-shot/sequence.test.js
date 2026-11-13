import { describe, expect, it } from 'vitest';

import {
  clockAt,
  movingTicks,
  NAGA_TIMINGS,
  planFor,
  STAGE_IDS,
} from '../../../../../dev/camera-lab/src/naga-shot/sequence.js';

const sum = (values) => values.reduce((total, value) => total + value, 0);

const lengths = (plan) => Object.fromEntries(plan.stages.map((stage) => [stage.id, stage.length]));

describe('the Naga Shot as eight timed beats', () => {
  it('plays every stage in order, one after the other, at full length on a full camera', () => {
    const plan = planFor({ camera: 'full', repeat: false });

    expect(plan.stages.map((stage) => stage.id)).toEqual(STAGE_IDS);
    plan.stages.slice(1).forEach((stage, i) => {
      expect(stage.from).toBe(plan.stages[i].from + plan.stages[i].length);
    });
    expect(plan.total).toBe(sum(Object.values(NAGA_TIMINGS.stages)));
    expect(plan.holds).toEqual({ hit: NAGA_TIMINGS.hitStop, crash: NAGA_TIMINGS.crashStop });
  });

  it.each(['short', 'off'])('drops the beats that only add time on a %s camera', (camera) => {
    const full = lengths(planFor({ camera: 'full' }));
    const cut = planFor({ camera });

    expect(cut.holds).toEqual({ hit: 0, crash: 0 });
    expect(lengths(cut).impact).toBe(full.impact - NAGA_TIMINGS.hitStop);
    expect(lengths(cut).collision).toBe(full.collision - NAGA_TIMINGS.crashStop);
    expect(lengths(cut).keeper).toBe(full.keeper / 2);
    expect(lengths(cut).flight).toBe(full.flight);
  });

  it('plays the build-up short once seen, and the rest as before', () => {
    const full = lengths(planFor({ camera: 'full' }));
    const seen = lengths(planFor({ camera: 'full', repeat: true }));

    for (const stage of ['awakening', 'charge', 'manifest']) {
      expect(seen[stage]).toBe(Math.round(full[stage] * NAGA_TIMINGS.repeatShare));
    }

    expect(seen.impact).toBe(full.impact);
    expect(seen.aftermath).toBe(full.aftermath);
  });

  it('tells where a frame falls, and how far it would be at full length', () => {
    const plan = planFor({ camera: 'short', repeat: false });
    const keeper = plan.stages.find((stage) => stage.id === 'keeper');
    const clock = clockAt(plan, keeper.from + 10);

    expect(clock).toMatchObject({ stage: 'keeper', ticks: 10, length: keeper.length });
    expect(clock.share).toBeCloseTo(10 / keeper.length);
    expect(clock.full).toBeCloseTo(20);
    expect(clock.lengths.keeper).toBe(keeper.length);
  });

  it('holds on the last frame past the end, and the first before the start', () => {
    const plan = planFor({ camera: 'full' });

    expect(clockAt(plan, plan.total + 50)).toMatchObject({
      stage: 'aftermath',
      frame: plan.total - 1,
    });
    expect(clockAt(plan, -5)).toMatchObject({ stage: 'awakening', ticks: 0 });
  });

  it('stands the world still through a hold', () => {
    expect(movingTicks(4, { at: 8, hold: 10 })).toBe(4);
    expect(movingTicks(12, { at: 8, hold: 10 })).toBe(8);
    expect(movingTicks(20, { at: 8, hold: 10 })).toBe(10);
    expect(movingTicks(20, { at: 8, hold: 0 })).toBe(20);
  });
});
