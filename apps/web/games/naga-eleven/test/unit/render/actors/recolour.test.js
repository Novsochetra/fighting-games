import { describe, expect, it } from 'vitest';
import { KITS } from '../../../../src/art/kits.js';
import {
  colourMap,
  recolourImage,
  recolourPixels,
} from '../../../../src/render/actors/recolour.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { FAKE_KIT, fakeSheet, MARK } from '../../../support/fake-sprites.js';

const hexOf = (data, at) =>
  `#${[0, 1, 2].map((i) => data[at + i].toString(16).padStart(2, '0')).join('')}`;

function coloursIn(canvas) {
  const found = new Set();

  for (let at = 0; at < canvas.data.length; at += 4) {
    if (canvas.data[at + 3] > 0) {
      found.add(hexOf(canvas.data, at));
    }
  }

  return found;
}

const LOOK = { ...KITS.cambodia.home, skin: ['#111111', '#222222', '#333333', '#444444'] };

describe('recolouring a sheet to a look', () => {
  it('sends each source shade to the shade at the same place along the look ramp', () => {
    const map = colourMap(FAKE_KIT, LOOK);
    const hex = (packed) => `#${packed.toString(16).padStart(6, '0')}`;

    expect(hex(map.get(0x300000))).toBe(LOOK.shirt[0]);
    expect(hex(map.get(0x900000))).toBe(LOOK.shirt[3]);
    expect(hex(map.get(0x003000))).toBe(LOOK.shorts[0]);
    expect(hex(map.get(0x007000))).toBe(LOOK.shorts[3]);
    expect(hex(map.get(0x503020))).toBe(LOOK.skin[2]);
  });

  it('leaves a part with no ramp in the look, and every colour not in a ramp, as drawn', () => {
    const map = colourMap(FAKE_KIT, { shirt: LOOK.shirt });
    const pixels = new Uint8ClampedArray([0xff, 0x00, 0xff, 255, 0x00, 0x30, 0x00, 255]);

    recolourPixels(pixels, map);

    expect([...pixels]).toEqual([0xff, 0x00, 0xff, 255, 0x00, 0x30, 0x00, 255]);
  });

  it('paints a fake sheet shirt in the kit shades, on a canvas of its own', () => {
    const sheet = fakeSheet('run');
    const recoloured = recolourImage(sheet, colourMap(FAKE_KIT, LOOK), createPixelCanvas);
    const colours = coloursIn(recoloured);

    expect(recoloured).not.toBe(sheet);
    expect(LOOK.shirt.every((shade) => colours.has(shade))).toBe(true);
    expect(FAKE_KIT.shirt.some((shade) => colours.has(shade))).toBe(false);
    expect(colours.has(MARK)).toBe(true);
    expect(coloursIn(sheet).has(FAKE_KIT.shirt[0])).toBe(true);
  });
});
