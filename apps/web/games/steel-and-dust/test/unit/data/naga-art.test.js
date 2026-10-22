import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { HEAD_MOUTHS } from '../../../src/sim/hazards/naga-bolts.js';
import { RAINBOW_HANDS } from '../../../src/sim/hazards/rainbow-orb.js';
import { COIL_FRONT } from '../../../src/sim/hazards/tides.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const sprite = ENEMY_SPRITES.naga;
const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
const { scale } = ENEMY_TYPES.naga;
const EFFECTS = ['tide', 'splash', 'serpentRise', 'spiritNaga', 'nagaBolt', 'rainbowOrb'];
const ON_THE_GROUND = ['tide', 'splash', 'serpentRise'];
const fxStrip = (name) => readPngAlpha(new URL(`assets/sprites/fx/${name}.png`, GAME));

// the sheet pixels round a point given in her units from her feet, on one frame of a strip
function pixelsNear(strip, frame, [ahead, up], reach = 2) {
  const x = frame * sprite.frameWidth + sprite.feetX + Math.round(ahead * scale * RENDER_SCALE);
  const y =
    sprite.strips[strip].row * sprite.frameHeight +
    sprite.feetY -
    Math.round(up * scale * RENDER_SCALE);
  const pixels = [];
  for (let dy = -reach; dy <= reach; dy++) {
    for (let dx = -reach; dx <= reach; dx++) {
      pixels.push({ alpha: sheet.alpha(x + dx, y + dy), rgb: sheet.rgb(x + dx, y + dy) });
    }
  }
  return pixels;
}

function lowestRow(image, { left, top, width, height }) {
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (image.alpha(left + x, top + y) > 0) {
        return y;
      }
    }
  }
  return -1;
}

const cellOf = (strip, frame) => ({
  left: frame * sprite.frameWidth,
  top: sprite.strips[strip].row * sprite.frameHeight,
  width: sprite.frameWidth,
  height: sprite.frameHeight,
});

const isMouthRed = ({ alpha, rgb: [red, green, blue] }) =>
  alpha > 0 && red > 130 && green < 90 && blue < 100;
const isScale = ({ alpha, rgb: [red, green] }) => alpha > 0 && green > red + 15;
const isSkin = ({ alpha, rgb: [red, green] }) => alpha > 0 && green >= red;

// what she spits, rolls or calls up leaves her where the art draws it
describe("the Naga Raja's art and her water", () => {
  it('spits each water naga from an open mouth of the striking frame she shows', () => {
    for (const [frame, mouths] of Object.entries(HEAD_MOUTHS)) {
      for (const mouth of mouths) {
        expect(
          pixelsNear('sevenHeads', Number(frame), mouth).some(isMouthRed),
          `${frame} ${mouth}`,
        ).toBe(true);
      }
    }
  });

  it('rolls the tide from the front of her coil as it crashes down', () => {
    expect(pixelsNear('tidalCoil', 5, [COIL_FRONT, 0]).some(isScale)).toBe(true);
    expect(pixelsNear('tidalCoil', 5, [COIL_FRONT + 4, 0]).some(isScale)).toBe(false);
  });

  it('gathers the rainbow over the hand she raises, frame by frame', () => {
    for (const [frame, hand] of Object.entries(RAINBOW_HANDS)) {
      expect(pixelsNear('rainbowNaga', Number(frame), hand).some(isSkin), frame).toBe(true);
    }
  });

  // a fighter's feet are drawn 2 sheet pixels under its feet line; she leaves the ground only while
  // she is thrown in her knock-out
  it('stands every frame on her feet line', () => {
    const airborne = { ko: [2, 3, 4] };
    for (const [strip, { frames }] of Object.entries(sprite.strips)) {
      for (let frame = 0; frame < frames; frame++) {
        const lowest = lowestRow(sheet, cellOf(strip, frame));
        if (airborne[strip]?.includes(frame)) {
          expect(lowest, `${strip} ${frame}`).toBeLessThan(sprite.feetY + 2);
        } else {
          expect(lowest, `${strip} ${frame}`).toBe(sprite.feetY + 2);
        }
      }
    }
  });

  it('stands the tide, the splash and the rising serpent on the road as her feet stand on it', () => {
    for (const name of ON_THE_GROUND) {
      const { frameWidth, frameHeight, frames, anchorY } = FX_SPRITES[name];
      const strip = fxStrip(name);
      const lowest = lowestRow(strip, {
        left: 0,
        top: 0,
        width: frameWidth * frames,
        height: frameHeight,
      });
      expect(lowest - anchorY, name).toBe(sprite.frameHeight - sprite.feetY - 2);
    }
  });

  // art that touches its frame's edge was cut off there; only the ground may be touched
  it('cuts off nothing at the sides or the top of any effect frame', () => {
    for (const name of EFFECTS) {
      const { frameWidth, frameHeight, frames } = FX_SPRITES[name];
      const strip = fxStrip(name);
      for (let frame = 0; frame < frames; frame++) {
        const left = frame * frameWidth;
        const edge = [];
        for (let y = 0; y < frameHeight; y++) {
          edge.push(strip.alpha(left, y), strip.alpha(left + frameWidth - 1, y));
        }
        for (let x = 0; x < frameWidth; x++) {
          edge.push(strip.alpha(left + x, 0));
        }
        expect(Math.max(...edge), `${name} ${frame}`).toBe(0);
      }
    }
  });
});
