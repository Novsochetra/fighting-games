import { describe, expect, it } from 'vitest';
import { ENEMY_ATLAS } from '../../../src/data/enemies/atlas/index.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { BOSSES } from '../../../src/data/enemies/types/bosses.js';
import { PIXEL } from '../../../src/render/fx/fine-pixels.js';
import { drawEnemyFrame } from '../../../src/render/fighters/enemy-sprites.js';

// Bug: the Warden Ox was drawn at his scale (1.95) from a sheet drawn for scale 1, so each of his
// pixels showed nearly two screen pixels wide, some one, beside a hero's one: mixed pixel sizes.
// His sheet is now drawn as fine as he is shown, and every frame lays one sheet pixel on one
// screen pixel
const sprite = ENEMY_SPRITES.ox;

function drawnSpan(name, index) {
  const calls = [];
  const context = {
    save() {},
    restore() {},
    translate() {},
    scale() {},
    drawImage: (image, ...args) => calls.push(args),
  };
  const sheets = { images: { ox: {} }, tints: null };
  const frame = { id: 'ox', frame: [name, index], x: 0, y: 0, facing: 1, size: BOSSES.brute.scale };
  drawEnemyFrame({ context }, sheets, frame);
  return calls[0];
}

describe("the Warden Ox's pixels", () => {
  it('are each one screen pixel, as a hero sprite is', () => {
    for (const [name, strip] of Object.entries(sprite.strips)) {
      for (let index = 0; index < strip.frames; index++) {
        if (!ENEMY_ATLAS.ox[strip.row][index]) {
          continue;
        }

        const [, , sourceWidth, sourceHeight, , , width, height] = drawnSpan(name, index);
        expect(width / sourceWidth, `${name} ${index} across`).toBeCloseTo(PIXEL, 9);
        expect(height / sourceHeight, `${name} ${index} down`).toBeCloseTo(PIXEL, 9);
      }
    }
  });
});
