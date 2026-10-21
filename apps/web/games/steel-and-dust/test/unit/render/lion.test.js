import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { leapFrame, lionFrame } from '../../../src/render/fx/lion.js';

const LEAP_FRAMES = FX_SPRITES.lion.frames - 3;

describe("the lion's frames", () => {
  it('rises through the first three once while it appears', () => {
    const lion = { appear: 21, stride: 0 };
    expect([1, 7, 14, 21].map((time) => lionFrame(lion, time))).toEqual([0, 1, 2, 2]);
  });

  it('holds its crouch once risen, however long it waits to bound off', () => {
    const lion = { appear: 40, stride: 0 };
    expect([18, 30, 40].map((time) => lionFrame(lion, time))).toEqual([2, 2, 2]);
    expect(lionFrame(lion, 41)).toBe(leapFrame(0));
  });

  it('plays its leap once over every bound, from push-off to reaching for the ground', () => {
    const strides = [0, 0.99 / LEAP_FRAMES, 1 / LEAP_FRAMES, 0.5, 0.99, 1];
    const frames = strides.map(leapFrame);
    expect(frames[0]).toBe(3);
    expect(frames[1]).toBe(3);
    expect(frames[2]).toBe(4);
    expect(frames.at(-2)).toBe(FX_SPRITES.lion.frames - 1);
    expect(frames.at(-1)).toBe(FX_SPRITES.lion.frames - 1);
    expect(frames).toEqual([...frames].sort((first, second) => first - second));
  });

  it('leaps from its first tick when it does not appear first', () => {
    expect(lionFrame({ appear: 0, stride: 0 }, 1)).toBe(3);
    expect(lionFrame({ appear: 0, stride: 0.5 }, 9)).toBe(leapFrame(0.5));
  });
});
