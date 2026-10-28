import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPngAlpha } from '../../support/png-alpha.js';

// Bug: the Angkor Wat road's rock faces were edged with a line of pure black the full height of
// the face, a drawn line no other colour of the road comes near, and at the moat it ran down both
// sides of the water. The face's outer edge is now its own stone and dirt, row for row; since the
// faces became the ends of the road's courses (raised-road-over-a-void.test.js), the end of the
// paving, the ends of the courses at a step and the broken banks of the breach all keep to it
const GAME_ROOT = join(import.meta.dirname, '../../../');
const picture = (name) => readPngAlpha(join(GAME_ROOT, `assets/backdrops/angkor-wat/${name}.png`));
// each picture's faces side by side, as wide as this, their high side on the left
const FACES = [
  ['cliff', 12],
  ['face', 11],
  ['breach', 16],
];
const isBlack = ([red, green, blue]) => red + green + blue === 0;

// the outermost pixel of every row of each face in a picture, toward the low side
function outerEdges(name, width) {
  const face = picture(name);
  const edges = [];

  for (let left = 0; left < face.width; left += width) {
    const columns = Array.from({ length: width }, (_, i) => left + width - 1 - i);
    const rows = Array.from({ length: face.height }, (_, y) => y);
    const edge = rows.flatMap((y) => {
      const x = columns.find((column) => face.alpha(column, y) === 255);

      return x === undefined ? [] : [face.rgb(x, y)];
    });

    edges.push(edge);
  }

  return edges;
}

describe.each(FACES)('the %s faces of the Angkor Wat road', (name, width) => {
  it('have no black outline down their outer edge', () => {
    for (const edge of outerEdges(name, width)) {
      expect(edge.length).toBeGreaterThan(0);
      expect(edge.filter(isBlack)).toEqual([]);
    }
  });

  it('end in their own stone and dirt, not one colour drawn down the edge', () => {
    for (const edge of outerEdges(name, width)) {
      expect(new Set(edge.map(String)).size).toBeGreaterThan(1);
    }
  });
});
