import { describe, expect, it } from 'vitest';
import { HERO_ATLAS } from '../../../src/data/hero-atlas/index.js';
import { HERO_SPRITES } from '../../../src/data/hero-sprites.js';
import { PIXEL } from '../../../src/render/fx/fine-pixels.js';
import { drawHeroFrame } from '../../../src/render/fighters/hero-sprites.js';

function drawnPieces(sheet, frame) {
  const calls = [];
  const context = {
    save() {},
    restore() {},
    translate() {},
    scale() {},
    drawImage: (image, ...args) => calls.push(args),
  };
  drawHeroFrame({ context }, sheet, { x: 0, y: 0, facing: 1, ...frame });
  return calls;
}

const onScreenPixel = (value) => Math.abs(value / PIXEL - Math.round(value / PIXEL)) < 1e-9;

// each sheet pixel of the piece falls on the screen pixel it fell on drawn as its whole frame
function misplaced(pieces, { name, row, index }) {
  const { feetX, feetY, frameHeight, scale } = HERO_SPRITES;
  const height = pieces[name][0];
  const [sx, sy, width, tall, left, top] = pieces[name][1 + row][index];
  const sheet = { pieces, images: { [name]: {} }, tints: null };
  const [call] = drawnPieces(sheet, { frame: [name, index], row });
  const frameTop = -(feetY + height - frameHeight) * scale;
  const expected = [sx, sy, width, tall, -feetX * scale + left * scale, frameTop + top * scale];
  const wrong = expected.some((value, i) => value !== call[i]);
  const sizes = call[6] !== width * scale || call[7] !== tall * scale;
  return wrong || sizes || !call.slice(4).every(onScreenPixel);
}

describe('a Shade drawn from its packed strips', () => {
  it('lands every piece on the screen pixels its frame put it on, a sheet pixel to a screen pixel', () => {
    for (const [hero, pieces] of Object.entries(HERO_ATLAS)) {
      for (const [name, [, ...rows]] of Object.entries(pieces)) {
        rows.forEach((frames, row) =>
          frames.forEach((_, index) => {
            expect(misplaced(pieces, { name, row, index }), `${hero} ${name} ${row} ${index}`).toBe(
              false,
            );
          }),
        );
      }
    }
  });

  it('draws nothing for a frame its strip leaves empty', () => {
    const sheet = { pieces: { idle: [80, [null]] }, images: { idle: {} }, tints: null };
    expect(drawnPieces(sheet, { frame: ['idle', 0], row: 0 })).toEqual([]);
  });
});
