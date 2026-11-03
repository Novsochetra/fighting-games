import { rect } from '../kit/raster.js';

// a corner flag: a thin pole and a pennant snapping in the wind, in two drawings, its foot at the
// bottom middle of the picture
export const FLAG_SIZE = { width: 14, height: 36 };

export function paintCornerFlag(raster, index, { pole, cloth }) {
  const x = 2;

  rect(raster, { x, y: 1, width: 2, height: FLAG_SIZE.height - 1 }, pole[1]);
  rect(raster, { x, y: 1, width: 1, height: FLAG_SIZE.height - 1 }, pole[2]);
  rect(raster, { x, y: 0, width: 2, height: 1 }, pole[2]);

  for (let column = 0; column < 9; column += 1) {
    const ripple =
      index === 0
        ? Math.round(Math.sin(column * 0.9) * 0.8)
        : Math.round(Math.sin(column * 0.9 + 2) * 0.8);
    const height = 7 - Math.floor(column / 3);

    rect(raster, { x: x + 2 + column, y: 2 + ripple, width: 1, height }, cloth[column < 3 ? 2 : 1]);
    rect(raster, { x: x + 2 + column, y: 2 + ripple + height - 1, width: 1, height: 1 }, cloth[0]);
  }
}
