import { describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Furnace Knight's swipe, slam and knock-out frames came from his first, smaller sheet,
// drawn cut off at its edges: the flail's fire arc ending in a straight line, the slam's explosion
// sliced flat and his body lying across the bottom. No frame may touch its edges with more than a
// few pixels, the last specks of a fading arc
const MOST_ON_AN_EDGE = 3;
const GAME = new URL('../../../', import.meta.url);
const CHECKED = ['furnace', 'khan', 'colossus'];

function edgePixels(sheet, { left, top, width, height }) {
  let count = 0;
  for (let x = 0; x < width; x++) {
    count += sheet.alpha(left + x, top) > 0 ? 1 : 0;
    count += sheet.alpha(left + x, top + height - 1) > 0 ? 1 : 0;
  }
  for (let y = 0; y < height; y++) {
    count += sheet.alpha(left, top + y) > 0 ? 1 : 0;
    count += sheet.alpha(left + width - 1, top + y) > 0 ? 1 : 0;
  }
  return count;
}

describe('boss frames', () => {
  for (const kind of CHECKED) {
    it(`keep every frame of the ${kind} inside its edges`, () => {
      const { file, frameWidth, frameHeight, strips } = ENEMY_SPRITES[kind];
      const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${file}`, GAME));
      for (const [name, { row, frames }] of Object.entries(strips)) {
        for (let frame = 0; frame < frames; frame++) {
          const box = {
            left: frame * frameWidth,
            top: row * frameHeight,
            width: frameWidth,
            height: frameHeight,
          };
          expect(edgePixels(sheet, box), `${name} ${frame}`).toBeLessThanOrEqual(MOST_ON_AN_EDGE);
        }
      }
    });
  }
});
