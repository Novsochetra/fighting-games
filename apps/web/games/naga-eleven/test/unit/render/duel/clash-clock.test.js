import { describe, expect, it } from 'vitest';

import { clashClock, clashLength } from '../../../../src/render/duel/clash-clock.js';
import { IMPACT_TICK, STAGE_TICKS } from '../../../../src/render/duel/stages.js';

const clashAt = (stageTicks, freeze) => ({ stage: 'clash', stageTicks, freeze });

describe("the clash's clock", () => {
  it('runs with the stage where nothing freezes', () => {
    expect(clashClock(clashAt(70, 0))).toBe(70);
    expect(clashLength(clashAt(0, 0))).toBe(STAGE_TICKS.clash);
  });

  it('holds on the impact for the freeze, then runs on as far as it would have', () => {
    expect(clashClock(clashAt(IMPACT_TICK - 1, 6))).toBe(IMPACT_TICK - 1);
    expect(clashClock(clashAt(IMPACT_TICK + 3, 6))).toBe(IMPACT_TICK);
    expect(clashClock(clashAt(IMPACT_TICK + 6, 6))).toBe(IMPACT_TICK);
    expect(clashClock(clashAt(IMPACT_TICK + 7, 6))).toBe(IMPACT_TICK + 1);
    expect(clashClock(clashAt(clashLength(clashAt(0, 6)), 6))).toBe(STAGE_TICKS.clash);
  });

  it('runs on past the clash into the result', () => {
    expect(clashClock({ stage: 'result', stageTicks: 4, freeze: 6 })).toBe(STAGE_TICKS.clash + 4);
  });
});
