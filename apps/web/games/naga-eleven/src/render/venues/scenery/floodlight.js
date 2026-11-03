import { rect } from '../kit/raster.js';

// a floodlight mast by day: a tall steel pole, lit down its left, and at its top a frame of lamps,
// grey and unlit; the lamps sit high, in the top rows of the picture, where a far look shows them
export function paintMast(raster, { x, top, base }, { steel, lamp }) {
  rect(raster, { x: x - 1, y: top + 10, width: 3, height: base - top - 10 }, steel[1]);
  rect(raster, { x: x - 1, y: top + 10, width: 1, height: base - top - 10 }, steel[2]);
  rect(raster, { x: x - 9, y: top, width: 19, height: 11 }, steel[0]);

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      rect(raster, { x: x - 8 + column * 4, y: top + 1 + row * 3, width: 3, height: 2 }, lamp);
    }
  }
}
