import { rect } from '../kit/raster.js';

// a pagoda far off over the trees: a pale hall under tiers of red roof edged in gold, and a golden
// spire, small and hazy with distance
export function paintWat(raster, { x, base }, { wall, roof, gold }) {
  rect(raster, { x: x - 18, y: base - 8, width: 36, height: 8 }, wall[1]);
  rect(raster, { x: x - 18, y: base - 8, width: 36, height: 1 }, wall[0]);

  for (let tier = 0; tier < 3; tier += 1) {
    const width = 44 - tier * 12;
    const bottom = base - 9 - tier * 6;

    for (let row = 0; row < 5; row += 1) {
      rect(
        raster,
        { x: x - width / 2 + row, y: bottom - row, width: width - row * 2, height: 1 },
        roof[row < 2 ? 1 : 2],
      );
    }

    rect(raster, { x: x - width / 2 - 1, y: bottom, width: 3, height: 1 }, gold[2]);
    rect(raster, { x: x + width / 2 - 2, y: bottom, width: 3, height: 1 }, gold[2]);
    rect(raster, { x: x - width / 2, y: bottom, width, height: 1 }, gold[1]);
  }

  rect(raster, { x: x - 1, y: base - 38, width: 3, height: 10 }, gold[1]);
  rect(raster, { x: x - 1, y: base - 38, width: 1, height: 10 }, gold[2]);
  rect(raster, { x, y: base - 44, width: 1, height: 6 }, gold[2]);
}
