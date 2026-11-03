import { rect } from '../kit/raster.js';

// a sun umbrella over a few fans on the bank: a dome of cloth in two colours on a thin pole
export function paintUmbrella(raster, { x, base, height = 16 }, colours) {
  rect(raster, { x, y: base - height, width: 1, height }, colours.pole);

  for (let row = 0; row < 4; row += 1) {
    const half = 3 + row * 2;

    for (let column = -half; column <= half; column += 1) {
      const panel = Math.floor((column + half) / 3) % 2;

      rect(
        raster,
        { x: x + column, y: base - height - 4 + row, width: 1, height: 1 },
        colours.cloth[panel + (row === 0 ? 1 : 0)],
      );
    }
  }
}
