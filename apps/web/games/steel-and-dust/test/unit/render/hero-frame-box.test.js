import { describe, expect, it } from 'vitest';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { frameBox } from '../../../src/render/fighters/hero-sprites.js';

const sheetWith = (ultHeight) => ({
  images: { ult: { height: ultHeight }, idle: { height: 320 } },
});

describe('the box a hero frame is cut from', () => {
  it('keeps the shared frame for every strip with a row per weapon', () => {
    expect(frameBox(sheetWith(112), 'idle')).toEqual({
      frameHeight: HERO_SPRITES.frameHeight,
      feetY: HERO_SPRITES.feetY,
    });
  });

  it('lets the ultimate strip stand taller, its feet the same gap above its bottom', () => {
    expect(frameBox(sheetWith(112), 'ult')).toEqual({ frameHeight: 112, feetY: 108 });
    expect(frameBox(sheetWith(80), 'ult')).toEqual({ frameHeight: 80, feetY: 76 });
  });

  it('falls back to the shared frame while the strip has no size yet', () => {
    expect(frameBox(sheetWith(0), 'ult').frameHeight).toBe(HERO_SPRITES.frameHeight);
  });
});
