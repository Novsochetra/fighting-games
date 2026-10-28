import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the rock faces of four forests' sheer steps were crumbled with a black outline on the last
// pixel of every row, a line drawn round the face wherever it met the scenery behind it. The roots
// inside a face keep their black lines, as the road's own roots do, but its edge is its own earth
const GAME_ROOT = join(import.meta.dirname, '../../../');
const FORESTS = ['pine-ridge', 'old-grove', 'bamboo-pass', 'ember-woods'];
const isBlack = ([red, green, blue]) => red + green + blue === 0;

// the band a face is crumbled in, cut back by up to two columns and edged on the next
const EDGE = 3;

function blackOnEdge(face) {
  const found = [];

  for (let y = 0; y < face.height; y++) {
    for (let x = face.width - EDGE; x < face.width; x++) {
      if (face.alpha(x, y) && isBlack(face.rgb(x, y))) {
        found.push({ x, y });
      }
    }
  }

  return found;
}

describe('the rock faces of the forest roads', () => {
  it('end in earth along their outer edge, not a black outline', () => {
    for (const forest of FORESTS) {
      const face = readPngAlpha(join(GAME_ROOT, `assets/backdrops/${forest}/cliff.png`));

      expect(blackOnEdge(face), forest).toEqual([]);
    }
  });

  it('keep the black lines of their roots inside, where the road outlines its own roots', () => {
    const face = readPngAlpha(join(GAME_ROOT, 'assets/backdrops/old-grove/cliff.png'));
    const roots = [];

    for (let y = 0; y < face.height; y++) {
      for (let x = 0; x < face.width - EDGE; x++) {
        if (face.alpha(x, y) && isBlack(face.rgb(x, y))) {
          roots.push(x);
        }
      }
    }

    expect(roots.length).toBeGreaterThan(50);
  });
});
