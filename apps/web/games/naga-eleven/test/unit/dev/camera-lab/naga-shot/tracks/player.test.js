import { describe, expect, it } from 'vitest';

import { NAGA_TIMINGS } from '../../../../../../dev/camera-lab/src/naga-shot/sequence.js';
import { playerAt } from '../../../../../../dev/camera-lab/src/naga-shot/tracks/player.js';
import { KICK_SPOT } from '../../../../../../dev/camera-lab/src/naga-shot/world.js';
import { everyClock, firstOf, lastOf } from '../every-clock.js';

const FULL = { camera: 'full' };

describe("the Naga Shot's striker", () => {
  it('runs in with the ball and plants on the spot', () => {
    const start = playerAt(firstOf(FULL, 'awakening'), 'goal');
    const planted = playerAt(lastOf(FULL, 'awakening'), 'goal');

    expect(start).toMatchObject({ animation: 'run', direction: 'east' });
    expect(start.x).toBeLessThan(KICK_SPOT.x - 40);
    expect(planted).toMatchObject({ x: KICK_SPOT.x, animation: 'idle' });
  });

  it('winds up through the charge and the rising, strikes at the contact, follows through', () => {
    const impact = everyClock(FULL).filter((clock) => clock.stage === 'impact');
    const frameAt = (ticks) => playerAt(impact[ticks], 'goal').frame;

    expect(playerAt(lastOf(FULL, 'manifest'), 'goal')).toMatchObject({
      animation: 'kick',
      frame: 0,
    });
    expect(frameAt(NAGA_TIMINGS.contact)).toBe(1);
    expect(frameAt(NAGA_TIMINGS.contact + NAGA_TIMINGS.hitStop)).toBe(1);
    expect(frameAt(impact.length - 1)).toBe(2);
  });

  it('celebrates a goal, and only a goal', () => {
    expect(playerAt(lastOf(FULL, 'aftermath'), 'goal').animation).toBe('celebrate');
    expect(playerAt(lastOf(FULL, 'aftermath'), 'catch').animation).toBe('idle');
  });
});
