import { describe, expect, it } from 'vitest';
import { TEAM_LOOKS } from '../../../../../src/art/actors.js';
import { PORTRAIT_BASE } from '../../../../../src/art/portraits/base.js';
import { SKINS } from '../../../../../src/art/portraits/skin.js';
import { colouringOf } from '../../../../../src/render/portraits/cast/footballer-colouring.js';

const SHADES = ['skinLight', 'skin', 'skinShade', 'skinDeep', 'hairLight', 'hair', 'hairShade'];

const rgbOf = (hex) => hex.match(/\w\w/g).map((pair) => parseInt(pair, 16));

const lightOf = (hex) => rgbOf(hex).reduce((sum, value) => sum + value, 0);

const colourGap = (one, other) =>
  Math.hypot(...rgbOf(one).map((value, channel) => value - rgbOf(other)[channel]));

describe('a footballer’s skin and hair', () => {
  it('are the ones his sprite has on the pitch, picked by his place', () => {
    for (const [kit, pool] of Object.entries(TEAM_LOOKS)) {
      for (let place = 0; place < 11; place += 1) {
        const { skin, hair } = colouringOf(kit, place);

        expect(skin, `${kit} ${place}`).toBe(pool.skins[place % pool.skins.length]);
        expect(hair, `${kit} ${place}`).toBe(pool.hairs[(place * 2 + 1) % pool.hairs.length]);
      }
    }
  });

  it('come as full ramps for every side and place', () => {
    for (const kit of [...Object.keys(TEAM_LOOKS), 'chrey-school', 'plain-0']) {
      for (let place = 0; place < 11; place += 1) {
        const { palette } = colouringOf(kit, place);

        for (const shade of SHADES) {
          expect(palette[shade], `${kit} ${place} ${shade}`).toMatch(/^#[0-9a-f]{6}$/);
        }
      }
    }
  });

  it('light to shade, and keep the darkest skin’s deepest shade off the outline', () => {
    const nigerian = colouringOf('nigeria', 0).palette;

    expect(lightOf(nigerian.skin)).toBeLessThan(lightOf(SKINS.brazilian.skin));
    expect(colourGap(nigerian.skinDeep, PORTRAIT_BASE.outline)).toBeGreaterThan(30);

    for (const kit of Object.keys(TEAM_LOOKS)) {
      const { palette } = colouringOf(kit, 1);

      expect(lightOf(palette.skinLight)).toBeGreaterThan(lightOf(palette.skin));
      expect(lightOf(palette.skin)).toBeGreaterThan(lightOf(palette.skinShade));
      expect(lightOf(palette.skinShade)).toBeGreaterThan(lightOf(palette.skinDeep));
    }
  });

  it('give Germany’s fair skin a pinker ramp than Japan’s', () => {
    const german = colouringOf('germany', 0);
    const japanese = colouringOf('japan', 0);

    expect([german.skin, japanese.skin]).toEqual(['fair', 'fair']);
    expect(german.palette.skin).toBe(SKINS.german.skin);
    expect(japanese.palette.skin).toBe(SKINS.eastAsian.skin);
  });
});
