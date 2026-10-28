import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Angkor Wat road's rock faces were edged with a line of pure black the full height of
// the face, a drawn line no other colour of the road comes near, and at the moat it ran down both
// sides of the water. The face's outer edge is now its own dirt, row for row
const GAME_ROOT = join(import.meta.dirname, '../../../');
const face = readPngAlpha(join(GAME_ROOT, 'assets/backdrops/angkor-wat/cliff.png'));
const edge = face.width - 1;
const rows = Array.from({ length: face.height }, (_, y) => y).filter((y) => face.alpha(edge, y));
const isBlack = ([red, green, blue]) => red + green + blue === 0;

describe('the rock faces of the Angkor Wat road', () => {
  it('have no black outline down their outer edge', () => {
    expect(rows.length).toBe(face.height);
    expect(rows.filter((y) => isBlack(face.rgb(edge, y)))).toEqual([]);
  });

  it('end in the dirt of the face beside the edge on every row', () => {
    for (const y of rows) {
      expect(face.rgb(edge, y), `row ${y}`).toEqual(face.rgb(edge - 1, y));
    }
  });
});
