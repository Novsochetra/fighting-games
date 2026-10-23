import { describe, expect, it } from 'vitest';
import { HEAVY_FX_SPRITES } from '../../../src/data/heavy-fx-sprites/index.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { HEROES } from '../../../src/data/heroes.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
// a heavy's strips are pixel art like the bosses': a palette of their own, not an image model's
// smooth thousands of colors
const MAX_COLORS = 32;
const names = Object.keys(HEAVY_FX_SPRITES);

function colorsOf(image) {
  const colors = new Set();
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (image.alpha(x, y) > 0) {
        colors.add(image.colorKey(x, y));
      }
    }
  }
  return colors.size;
}

describe("the Shades' heavy effect strips", () => {
  it('are named after their Shade and join the other effect strips', () => {
    const ids = HEROES.map((hero) => hero.id);
    for (const name of names) {
      expect(
        ids.some((id) => name.startsWith(id)),
        name,
      ).toBe(true);
      expect(FX_SPRITES[name]).toBe(HEAVY_FX_SPRITES[name]);
    }
  });

  it.each(names.length ? names : ['(none yet)'])(
    '%s is a strip of its frames, in few colors',
    (name) => {
      if (!HEAVY_FX_SPRITES[name]) {
        return;
      }
      const { frameWidth, frameHeight, frames, anchorX, anchorY } = HEAVY_FX_SPRITES[name];
      const image = readPngAlpha(new URL(`assets/sprites/fx/${name}.png`, GAME));
      expect([image.width, image.height]).toEqual([frameWidth * frames, frameHeight]);
      expect(anchorX).toBeLessThanOrEqual(frameWidth);
      expect(anchorY).toBeLessThanOrEqual(frameHeight);
      expect(colorsOf(image)).toBeLessThanOrEqual(MAX_COLORS);
    },
  );
});
