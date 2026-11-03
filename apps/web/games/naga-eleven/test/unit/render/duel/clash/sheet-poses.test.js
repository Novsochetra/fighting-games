import { describe, expect, it } from 'vitest';

import { SPRITES } from '../../../../../src/data/sprites.js';
import { POSES } from '../../../../../src/render/duel/poses.js';
import {
  frameIn,
  SHEET_POSES,
  sheetShotOf,
  TICKS_PER_STEP,
} from '../../../../../src/render/duel/clash/sheet-poses.js';

describe('the sheet frame of a clash pose', () => {
  it('has a frame of the sheets for every pose the shadow knows', () => {
    for (const pose of Object.keys(POSES)) {
      expect(SHEET_POSES, pose).toContain(pose);
    }
  });

  it('names only animations, ways and frames the sheets draw', () => {
    for (const pose of SHEET_POSES) {
      const shot = sheetShotOf({ pose });
      const animation = SPRITES.animations[shot.animation];

      expect(animation, pose).toBeDefined();
      expect(animation.rows[shot.direction], pose).toBeDefined();
      expect(frameIn(shot, animation.frames), pose).toBeLessThan(animation.frames);
    }
  });

  it('turns the way and the offset round for a player facing left', () => {
    const right = sheetShotOf({ pose: 'slide', facing: 1 });
    const left = sheetShotOf({ pose: 'slide', facing: -1 });

    expect(right.direction).toBe('east');
    expect(left.direction).toBe('west');
    expect(left.dx).toBe(-right.dx);
    expect(sheetShotOf({ pose: 'run', facing: -1 }).direction).toBe('south-west');
    expect(sheetShotOf({ pose: 'block', facing: -1 }).direction).toBe('south');
  });

  it('takes the choreography frame, else the pose frame, else steps on with the clock', () => {
    expect(sheetShotOf({ pose: 'kick', frame: 2 }).frame).toBe(2);
    expect(sheetShotOf({ pose: 'kick' }).frame).toBe(1);

    const steps = [0, 1, 2, 6].map((step) =>
      frameIn(sheetShotOf({ pose: 'run' }, step * TICKS_PER_STEP), 6),
    );

    expect(steps).toEqual([0, 1, 2, 0]);
  });

  it('draws a shot of its own where the figure names one', () => {
    expect(sheetShotOf({ pose: 'stand', sheet: 'guard' }).animation).toBe('fall');
    expect(sheetShotOf({ pose: 'stand' }).animation).toBe('idle');
    expect(sheetShotOf({ pose: 'nothing-known' }).animation).toBe('idle');
  });

  it('keeps a frame inside an animation of fewer frames', () => {
    expect(frameIn({ frame: 5, step: 0 }, 3)).toBe(2);
    expect(frameIn({ frame: -1, step: 0 }, 3)).toBe(0);
  });
});
