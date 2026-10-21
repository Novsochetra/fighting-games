import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { lionFrame } from '../../../src/render/fx/lion.js';

describe("the lion's frames", () => {
  it('rises through the first three once while it appears, then loops the leap', () => {
    const lion = { appear: 21 };
    expect([1, 7, 14, 21].map((time) => lionFrame(lion, time))).toEqual([0, 1, 2, 2]);
    const { ticks } = FX_SPRITES.lion;
    expect([0, 1, 2, 3].map((step) => lionFrame(lion, 22 + step * ticks))).toEqual([3, 4, 5, 3]);
  });

  it('leaps from its first tick when it does not appear first', () => {
    expect(lionFrame({ appear: 0 }, 1)).toBe(3);
  });
});
