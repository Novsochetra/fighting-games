import { describe, expect, it } from 'vitest';
import { stormStrength } from '../../../../src/render/scene/ambient/storm.js';
import { ticksUpTo } from './ambient-recorder.js';

const strengths = ticksUpTo(6000, 5).map(stormStrength);

describe('the storm strength', () => {
  it('stays between calm and full', () => {
    expect(Math.min(...strengths)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...strengths)).toBeLessThanOrEqual(1);
  });

  it('swings from nearly clear to nearly full within a couple of minutes', () => {
    expect(Math.min(...strengths)).toBeLessThan(0.15);
    expect(Math.max(...strengths)).toBeGreaterThan(0.85);
  });

  it('changes slowly from one tick to the next, so the air never flickers', () => {
    for (let tick = 0; tick < 3000; tick++) {
      expect(Math.abs(stormStrength(tick + 1) - stormStrength(tick))).toBeLessThan(0.01);
    }
  });

  it('does not repeat on the beat of its main swell', () => {
    const swell = Math.round((Math.PI * 2) / 0.0045);
    const drift = ticksUpTo(1000, 50).map((tick) =>
      Math.abs(stormStrength(tick + swell) - stormStrength(tick)),
    );
    expect(Math.max(...drift)).toBeGreaterThan(0.1);
  });
});
