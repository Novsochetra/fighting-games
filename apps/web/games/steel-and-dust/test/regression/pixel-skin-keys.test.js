import { describe, expect, it } from 'vitest';
import { PIXEL_SKINS } from '../../src/data/skins/pixel.js';
import { readPngAlpha } from '../support/png-alpha.js';

const ROUND = ['key-round', 'key-round-pressed', 'dpad'];

// the width and height of what a key's art paints, in pixels of the art
function paintedBox(path) {
  const image = readPngAlpha(path);
  const xs = [];
  const ys = [];

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      if (image.alpha(x, y) > 0) {
        xs.push(x);
        ys.push(y);
      }
    }
  }

  return {
    width: Math.max(...xs) - Math.min(...xs) + 1,
    height: Math.max(...ys) - Math.min(...ys) + 1,
  };
}

describe("the pixel skins' keys", () => {
  // Sandstone's round keys showed as ovals: the bake read a key painted 290 by 295 px on blocks of
  // 8.06 by 7.56, 36 pixels wide and 39 tall, where the art's pixels are square
  it('are as round as they were painted, a round key and the d-pad as wide as they are tall', () => {
    for (const id of Object.keys(PIXEL_SKINS)) {
      for (const key of ROUND) {
        const { width, height } = paintedBox(
          new URL(`../../assets/skins/${id}/${key}.png`, import.meta.url),
        );

        expect(Math.abs(width - height), `${id} ${key} ${width}x${height}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
