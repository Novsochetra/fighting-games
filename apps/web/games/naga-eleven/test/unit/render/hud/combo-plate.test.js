import { describe, expect, it } from 'vitest';
import { HUD } from '../../../../src/art/hud.js';
import { KITS } from '../../../../src/art/kits.js';
import { contrastRatio, luminanceOf } from '../../../../src/render/actors/number-colours.js';
import { plateRect, PLATE_PAD, readableRamp } from '../../../../src/render/hud/combo-plate.js';

const SHIRTS = Object.values(KITS).flatMap((kit) => [kit.home.shirt, kit.away.shirt]);

describe("a combo counter's plate", () => {
  it('reads in every shirt there is: its middle shade stands off the plate', () => {
    for (const shirt of SHIRTS) {
      expect(contrastRatio(readableRamp(shirt)[2], HUD.panel[1])).toBeGreaterThanOrEqual(3.5);
    }
  });

  it('keeps a shirt that reads as it is, and lifts a dark one, deep to light still', () => {
    const white = KITS['chrey-school'].away.shirt;
    const black = KITS['phnom-penh-elite'].home.shirt;
    const lifted = readableRamp(black);

    expect(readableRamp(white)).toBe(white);
    expect(lifted).not.toEqual(black);

    for (let i = 1; i < lifted.length; i += 1) {
      expect(luminanceOf(lifted[i])).toBeGreaterThan(luminanceOf(lifted[i - 1]));
    }
  });

  it('keeps a lifted shirt its own hue: a navy one stays bluer than it is red', () => {
    const [red, , blue] = [1, 3, 5].map((at) =>
      parseInt(readableRamp(KITS.japan.home.shirt)[2].slice(at, at + 2), 16),
    );

    expect(blue).toBeGreaterThan(red);
  });

  it('stands the steered side’s from the left of its box and the other’s flush right', () => {
    const drawn = { width: 50, height: 38 };
    const left = plateRect({ x: 10, y: 70, width: 96, height: 42, side: 'left' }, drawn);
    const right = plateRect({ x: 606, y: 9, width: 96, height: 42, side: 'right' }, drawn);

    expect(left).toEqual({
      x: 10,
      y: 70,
      width: 50 + PLATE_PAD.x * 2,
      height: 38 + PLATE_PAD.y * 2,
    });
    expect(right.x + right.width + 2).toBe(702);
    expect(right.y).toBe(9);
  });
});
