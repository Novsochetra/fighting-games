import { describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { RENDER_SCALE } from '../../../src/config.js';
import { GAZE_EYES } from '../../../src/sim/hazards/gaze-pillars.js';
import { FACE_MOUTH } from '../../../src/sim/hazards/stone-faces.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const sprite = ENEMY_SPRITES.guardian;
const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
const { scale } = ENEMY_TYPES.guardian;
const OWN_STRIPS = ['stoneGaze', 'figRoots', 'fourFaces', 'crumble'];
const GROUND_FX = ['gazePillar', 'figRoot', 'rockBurst', 'stoneFace'];
const fxStrip = (name) => readPngAlpha(new URL(`assets/sprites/fx/${name}.png`, GAME));

function framePixel(strip, frame, { ahead, up }) {
  const x = frame * sprite.frameWidth + sprite.feetX + Math.round(ahead * RENDER_SCALE);
  const y =
    sprite.strips[strip].row * sprite.frameHeight + sprite.feetY - Math.round(up * RENDER_SCALE);
  return { alpha: sheet.alpha(x, y), rgb: sheet.rgb(x, y) };
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

const frameBox = (strip, frame) => ({
  left: frame * sprite.frameWidth,
  top: sprite.strips[strip].row * sprite.frameHeight,
  width: sprite.frameWidth,
  height: sprite.frameHeight,
});

// gold, or the white-hot core of a glow
const isGold = ({ alpha, rgb: [red, green, blue] }) =>
  alpha > 0 && red > 180 && green > 140 && (blue < red - 40 || green > 220);

function touchesEdge(image, { left, top, width, height }) {
  for (let y = 0; y < height; y++) {
    if (image.alpha(left, top + y) || image.alpha(left + width - 1, top + y)) {
      return true;
    }
  }
  for (let x = 0; x < width; x++) {
    if (image.alpha(left + x, top)) {
      return true;
    }
  }
  return false;
}

// what leaves his body, or a stone face's, starts where the art draws it
describe("the Bayon Guardian's art and his spells", () => {
  it('cast the gaze from the eyes the gaze strip lights', () => {
    for (const frame of [3, 4]) {
      const near = [-1, 0, 1].flatMap((dx) =>
        [-1, 0, 1].map((dy) =>
          framePixel('stoneGaze', frame, {
            ahead: GAZE_EYES.ahead + dx / 2,
            up: GAZE_EYES.up + dy / 2,
          }),
        ),
      );
      expect(near.some(isGold), `frame ${frame}`).toBe(true);
    }
    expect(scale).toBeGreaterThan(2);
  });

  it('breathe the beam from the mouth the breathing face draws open', () => {
    const face = FX_SPRITES.stoneFace;
    const strip = fxStrip('stoneFace');
    const x = 5 * face.frameWidth + face.anchorX + FACE_MOUTH.ahead * RENDER_SCALE - 2;
    const y = face.anchorY - FACE_MOUTH.up * RENDER_SCALE;
    expect(isGold({ alpha: strip.alpha(x, y), rgb: strip.rgb(x, y) })).toBe(true);
  });

  // a fighter's feet are drawn two sheet pixels under its feet line, the road's top
  it('stand every frame of his own strips on the line his idle frames stand on', () => {
    const idleFeet = lowestRow(sheet, frameBox('idle', 0));
    expect(idleFeet).toBe(sprite.feetY + 2);
    for (const strip of OWN_STRIPS) {
      for (let frame = 0; frame < sprite.strips[strip].frames; frame++) {
        expect(lowestRow(sheet, frameBox(strip, frame)), `${strip} ${frame}`).toBe(idleFeet);
      }
    }
  });

  it('stand the pillars, roots, rubble and faces on the road as his feet stand on it', () => {
    for (const name of GROUND_FX) {
      const { frameWidth, frameHeight, frames, anchorY } = FX_SPRITES[name];
      const strip = fxStrip(name);
      let lowest = 0;
      for (let frame = 0; frame < frames; frame++) {
        const box = { left: frame * frameWidth, top: 0, width: frameWidth, height: frameHeight };
        lowest = Math.max(lowest, lowestRow(strip, box));
      }
      expect(lowest - anchorY, name).toBe(sprite.frameHeight - sprite.feetY - 2);
    }
  });

  // art that touches its frame's edge was cut off there; only the ground may be touched
  it('cut off nothing at the sides or the top of any frame', () => {
    for (const strip of Object.keys(sprite.strips)) {
      for (let frame = 0; frame < sprite.strips[strip].frames; frame++) {
        expect(touchesEdge(sheet, frameBox(strip, frame)), `${strip} ${frame}`).toBe(false);
      }
    }
    for (const name of GROUND_FX) {
      const { frameWidth, frameHeight, frames } = FX_SPRITES[name];
      const strip = fxStrip(name);
      for (let frame = 0; frame < frames; frame++) {
        const box = { left: frame * frameWidth, top: 0, width: frameWidth, height: frameHeight };
        expect(touchesEdge(strip, box), `${name} ${frame}`).toBe(false);
      }
    }
  });
});
