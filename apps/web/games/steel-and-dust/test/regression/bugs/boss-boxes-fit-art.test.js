import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { BOSS_BODIES } from '../../../src/data/enemies/boss-bodies.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const SOLID = 40;

// how far a frame's art reaches, in the boss's own units from its feet
function artExtent(id, strip, frame) {
  const sprite = ENEMY_SPRITES[id];
  const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
  const left = frame * sprite.frameWidth;
  const top = sprite.strips[strip].row * sprite.frameHeight;
  let ahead = -Infinity;
  let up = -Infinity;
  for (let y = 0; y < sprite.frameHeight; y++) {
    for (let x = 0; x < sprite.frameWidth; x++) {
      if (sheet.alpha(left + x, top + y) > SOLID) {
        ahead = Math.max(ahead, (x - sprite.feetX) / RENDER_SCALE);
        up = Math.max(up, (sprite.feetY - y) / RENDER_SCALE);
      }
    }
  }
  return { ahead, up };
}

// drawn two to three times the hero's size, a boss whose boxes were shared by every boss swung
// blades that passed through the hero without a hit, and took blows only on a sliver of its body
describe("every boss's boxes against its art", () => {
  for (const [id, body] of Object.entries(BOSS_BODIES)) {
    it(`fits ${id}'s swipe and slam to the weapon on their strike frames`, () => {
      for (const strip of ['attack', 'slam']) {
        const move = strip === 'attack' ? 'swipe' : 'slam';
        const [ahead, , width] = body.reach[move];
        const art = artExtent(id, strip, ENEMY_SPRITES[id].strips[strip].strike);
        expect(ahead + width, `${id} ${move}`).toBeGreaterThan(art.ahead - 8);
        expect(ahead + width, `${id} ${move}`).toBeLessThanOrEqual(art.ahead + 1);
      }
    });

    it(`stands ${id}'s hurt box as tall as the body it is drawn with`, () => {
      const art = artExtent(id, 'idle', 0);
      expect(body.hurtShape[1], id).toBeGreaterThan(art.up - 5);
      expect(body.hurtShape[1], id).toBeLessThanOrEqual(art.up);
    });
  }
});
