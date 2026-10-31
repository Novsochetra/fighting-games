import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { HAMMER_HEAD, WAIST } from '../../../src/sim/bosses/executioner.js';
import { GUARD_GLINT } from '../../../src/sim/bosses/guard-counter.js';
import { FIST_ON_FRAME } from '../../../src/sim/hazards/chain-fist.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const sprite = ENEMY_SPRITES.ox;
const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
// sheet pixels per unit of his (body-point.js)
const UNIT = RENDER_SCALE * sprite.density;

// the sheet pixel under a point on his body (body-point.js), in his own units from his feet
function pixelAt(strip, frame, { ahead = 0, up = 0 }) {
  const x = frame * sprite.frameWidth + sprite.feetX + Math.round(ahead * UNIT);
  const y = sprite.strips[strip].row * sprite.frameHeight + sprite.feetY - Math.round(up * UNIT);
  return { alpha: sheet.alpha(x, y), rgb: sheet.rgb(x, y) };
}

const isDrawn = ({ alpha }) => alpha > 0;
const isSteel = ({ alpha, rgb: [red, green, blue] }) =>
  alpha > 0 && Math.max(red, green, blue) - Math.min(red, green, blue) < 48 && blue > 90;

// what leaves his body leaves it where his art draws it
describe("the Warden Ox's art and his skills", () => {
  it('lets the chain out of his fist on each frame that holds it, with nothing drawn past it', () => {
    for (const [frame, fist] of Object.entries(FIST_ON_FRAME)) {
      expect(isDrawn(pixelAt('chainHook', Number(frame), fist)), `fist ${frame}`).toBe(true);
      for (const beyond of [4, 8, 14]) {
        const past = { ahead: fist.ahead + beyond, up: fist.up };
        expect(isDrawn(pixelAt('chainHook', Number(frame), past)), `past ${frame}`).toBe(false);
      }
    }
  });

  it("glints on the hammer's head as he sets his guard", () => {
    expect(isSteel(pixelAt('guardCounter', 2, GUARD_GLINT))).toBe(true);
  });

  it('splits the road where the hammer meets it as he cleaves', () => {
    expect(isSteel(pixelAt('execution', 9, { ...HAMMER_HEAD, up: 3 }))).toBe(true);
  });

  it('spins the whirl round the middle of his body', () => {
    for (const frame of [4, 5, 6]) {
      expect(isDrawn(pixelAt('execution', frame, WAIST)), `frame ${frame}`).toBe(true);
    }
  });
});
