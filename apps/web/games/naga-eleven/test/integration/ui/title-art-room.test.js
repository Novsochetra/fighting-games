import { describe, expect, it } from 'vitest';
import { TITLE_ART } from '../../../src/art/title/palette.js';
import { colorOf, createRaster } from '../../../src/render/backdrops/raster.js';
import { paintTitle } from '../../../src/render/title/title-scene.js';
import { TITLE_ART_LAYOUT } from '../../../src/ui/screens/title-spots.js';

// the title screen sets its words by where the title art leaves room; this paints the real art and
// finds the Naga's crowns and the boy, so a redrawn picture cannot move them under the words
const raster = createRaster();

paintTitle(raster);

const sameColor = (at, color) => color.every((value, i) => raster.data[at + i] === value);

function pixelsOf(color, { left = 0, right = raster.width, top = 0 } = {}) {
  const wanted = colorOf(color).slice(0, 3);
  const found = [];

  for (let y = top; y < raster.height; y += 1) {
    for (let x = left; x < right; x += 1) {
      if (sameColor((y * raster.width + x) * 4, wanted)) {
        found.push({ x, y });
      }
    }
  }

  return found;
}

const centre = raster.width / 2;
const horizon = Math.round(raster.height * 0.7);
const share = (rows) => rows / raster.height;

describe('the title art’s room for words', () => {
  it('has no Naga higher than the sky the logo stands in', () => {
    const outlines = [...pixelsOf(TITLE_ART.gold[0]), ...pixelsOf(TITLE_ART.gold[1])];
    const crown = Math.min(...outlines.map(({ y }) => y));

    expect(share(crown)).toBeGreaterThanOrEqual(TITLE_ART_LAYOUT.headsTop);
    expect(share(crown)).toBeLessThan(TITLE_ART_LAYOUT.headsTop + share(3));
  });

  it('stands the boy and his ball between the prompt’s marks', () => {
    const near = { left: centre - 20, right: centre + 20, top: horizon };
    const boy = [...pixelsOf(TITLE_ART.boy[0], near), ...pixelsOf(TITLE_ART.ball[2], near)];
    const rows = boy.map(({ y }) => y);
    const columns = boy.map(({ x }) => x);

    expect(share(Math.min(...rows))).toBeGreaterThanOrEqual(TITLE_ART_LAYOUT.boyTop);
    expect(share(Math.max(...rows) + 1)).toBeLessThanOrEqual(TITLE_ART_LAYOUT.feet);
    expect((Math.max(...columns) + 1) / raster.width).toBeLessThan(TITLE_ART_LAYOUT.pastBall);
  });
});
