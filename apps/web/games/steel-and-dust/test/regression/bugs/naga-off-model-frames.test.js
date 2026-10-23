import { describe, expect, it } from 'vitest';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { readPngAlpha } from '../../support/png-alpha.js';
import { readSheet } from '../../support/sheet-cells.js';

// Bug: the Naga Raja's idle was drawn apart from the stance her moves start and end in (her torso
// eleven pixels lower, the hood fan half as wide again), so she changed shape whenever a move began;
// her redrawn strips kept a grey keying matte round their outline and along the road; and the first
// frame of her rising serpent floated over its spot, its bottom cut off by a box edge
const { sprite, image, cellOf } = readSheet('naga');
const REDRAWN = ['attack', 'slam', 'tidalCoil', 'sevenHeads', 'rainbowNaga'];
// the few dark greys her own shading uses at her edge; the matte left hundreds
const MOST_GREY_ON_THE_EDGE = 60;
const serpent = readPngAlpha(
  new URL('../../../assets/sprites/fx/serpentRise.png', import.meta.url),
);

const drawn = (cell, x, y) => image.alpha(cell.left + x, cell.top + y) > 0;

// how much of two frames' silhouettes is the same shape, from 0 to 1
function overlap(one, other) {
  let both = 0;
  let either = 0;
  for (let y = 0; y < one.height; y++) {
    for (let x = 0; x < one.width; x++) {
      both += drawn(one, x, y) && drawn(other, x, y) ? 1 : 0;
      either += drawn(one, x, y) || drawn(other, x, y) ? 1 : 0;
    }
  }
  return both / either;
}

const onEdge = (cell, x, y) =>
  [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].some(([dx, dy]) => !drawn(cell, x + dx, y + dy));

function greyEdge(cell) {
  let count = 0;
  for (let y = 1; y < cell.height - 1; y++) {
    for (let x = 1; x < cell.width - 1; x++) {
      const rgb = image.rgb(cell.left + x, cell.top + y);
      const [low, high] = [Math.min(...rgb), Math.max(...rgb)];
      const grey = high - low <= 14 && high >= 60 && high <= 140;
      count += drawn(cell, x, y) && grey && onEdge(cell, x, y) ? 1 : 0;
    }
  }
  return count;
}

// the lowest row a frame of the serpent fills with more than a stray pixel or two
function footOf(frame) {
  const { frameWidth, frameHeight } = FX_SPRITES.serpentRise;
  for (let y = frameHeight - 1; y >= 0; y--) {
    let count = 0;
    for (let x = 0; x < frameWidth; x++) {
      count += serpent.alpha(frame * frameWidth + x, y) > 0 ? 1 : 0;
    }
    if (count >= 8) {
      return y;
    }
  }
  return -1;
}

describe('the Naga Raja, strip to strip', () => {
  it('idles in the stance her moves start and end in', () => {
    for (let frame = 0; frame < sprite.strips.idle.frames; frame++) {
      const match = overlap(cellOf('idle', frame), cellOf('attack', 0));
      expect(match, `idle ${frame}`).toBeGreaterThan(0.85);
    }
  });

  it('outlines her redrawn strips without a grey matte', () => {
    for (const strip of REDRAWN) {
      for (let frame = 0; frame < sprite.strips[strip].frames; frame++) {
        const grey = greyEdge(cellOf(strip, frame));
        expect(grey, `${strip} ${frame}`).toBeLessThanOrEqual(MOST_GREY_ON_THE_EDGE);
      }
    }
  });

  it('raises the serpent out of the road from its very first frame', () => {
    const { frames, anchorY } = FX_SPRITES.serpentRise;
    for (let frame = 0; frame < frames; frame++) {
      expect(Math.abs(footOf(frame) - (anchorY + 2)), `frame ${frame}`).toBeLessThanOrEqual(1);
    }
  });
});
