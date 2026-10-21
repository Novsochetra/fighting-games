import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { frameBox } from '../../../src/render/fighters/hero-sprites.js';

const sheetOf = (frameHeight) => ({
  images: { ult: { height: frameHeight }, idle: { height: frameHeight * 4 } },
});

describe('the box a hero frame is cut from', () => {
  it("is the Shades' frame for a strip with a row per weapon, or the one row of the ultimate", () => {
    const shared = { frameHeight: HERO_SPRITES.frameHeight, feetY: HERO_SPRITES.feetY };
    expect(frameBox(sheetOf(80), 'idle')).toEqual(shared);
    expect(frameBox(sheetOf(80), 'ult')).toEqual(shared);
  });

  it('stands taller for a hero whose strips are taller, its feet the same gap above its bottom', () => {
    expect(frameBox(sheetOf(112), 'idle')).toEqual({ frameHeight: 112, feetY: 108 });
    expect(frameBox(sheetOf(112), 'ult')).toEqual({ frameHeight: 112, feetY: 108 });
  });

  it('falls back to the shared frame while the strip has no size yet', () => {
    expect(frameBox(sheetOf(0), 'idle').frameHeight).toBe(HERO_SPRITES.frameHeight);
  });
});
