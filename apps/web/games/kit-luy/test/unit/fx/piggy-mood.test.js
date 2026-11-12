import { describe, expect, it } from 'vitest';
import {
  cheer,
  createPiggy,
  gulp,
  piggyPose,
  stepPiggy,
  upset,
} from '../../../src/fx/piggy-mood.js';

describe('the piggy bank', () => {
  it('sits idle on the ground until something happens', () => {
    const piggy = createPiggy();

    stepPiggy(piggy, 1);
    expect(piggyPose(piggy)).toEqual({ mood: 'idle', lift: 0 });
  });

  it('blinks now and then while idle', () => {
    const piggy = createPiggy();
    const moods = new Set();

    for (let frame = 0; frame < 600; frame++) {
      stepPiggy(piggy, 1 / 60);
      moods.add(piggyPose(piggy).mood);
    }

    expect(moods).toEqual(new Set(['idle', 'blink']));
  });

  it('hops and beams at a right answer, then settles', () => {
    const piggy = createPiggy();

    cheer(piggy);
    stepPiggy(piggy, 0.14);
    expect(piggyPose(piggy)).toMatchObject({ mood: 'happy' });
    expect(piggyPose(piggy).lift).toBeGreaterThan(0);

    stepPiggy(piggy, 1);
    expect(piggyPose(piggy).lift).toBe(0);
    expect(['idle', 'blink']).toContain(piggyPose(piggy).mood);
  });

  it('sulks at a wrong answer without a hop', () => {
    const piggy = createPiggy();

    upset(piggy);
    stepPiggy(piggy, 0.1);
    expect(piggyPose(piggy)).toEqual({ mood: 'sad', lift: 0 });
  });

  it('hops for a coin landing, and a second coin does not cut the hop short', () => {
    const piggy = createPiggy();

    gulp(piggy);
    stepPiggy(piggy, 0.1);

    const left = piggy.hopLeft;

    gulp(piggy);
    expect(piggy.hopLeft).toBe(left);
  });
});
