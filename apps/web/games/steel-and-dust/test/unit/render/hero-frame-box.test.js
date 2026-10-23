import { describe, expect, it } from 'vitest';
import { HERO_ATLAS } from '../../../src/data/hero-atlas/index.js';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { frameBox } from '../../../src/render/fighters/hero-sprites.js';

// a strip's pieces start with the height of its frames
const sheetOf = (frameHeight) => ({ pieces: { ult: [frameHeight, []], idle: [frameHeight, []] } });

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

  it('is known before the strip has loaded, from the packed strips', () => {
    expect(frameBox({ pieces: HERO_ATLAS.bokator }, 'idle').frameHeight).toBe(112);
    expect(frameBox({ pieces: HERO_ATLAS.moss }, 'idle').frameHeight).toBe(
      HERO_SPRITES.frameHeight,
    );
  });
});
