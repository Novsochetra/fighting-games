import { rect } from '../kit/raster.js';

// the village dog, side on and facing right, in three drawings: two of a trot (legs together, legs
// apart) and one sitting, its tail up; brown with a lighter belly and muzzle, lit from above
export const DOG_SIZE = { width: 24, height: 16 };

function paintBody(raster, { lift }, ramp) {
  const top = 5 + lift;

  rect(raster, { x: 4, y: top, width: 13, height: 5 }, ramp[2]);
  rect(raster, { x: 4, y: top, width: 13, height: 1 }, ramp[3]);
  rect(raster, { x: 5, y: top + 4, width: 11, height: 1 }, ramp[1]);
  rect(raster, { x: 16, y: top - 3, width: 6, height: 5 }, ramp[2]);
  rect(raster, { x: 16, y: top - 3, width: 6, height: 1 }, ramp[3]);
  rect(raster, { x: 21, y: top - 1, width: 3, height: 2 }, ramp[3]);
  rect(raster, { x: 23, y: top - 1, width: 1, height: 1 }, ramp[0]);
  rect(raster, { x: 17, y: top - 5, width: 2, height: 2 }, ramp[1]);
  rect(raster, { x: 19, y: top - 2, width: 1, height: 1 }, ramp[0]);
  rect(raster, { x: 1, y: top - 3, width: 1, height: 3 }, ramp[2]);
  rect(raster, { x: 2, y: top - 1, width: 2, height: 2 }, ramp[2]);
}

const LEGS = [
  [5, 7, 13, 15],
  [3, 8, 11, 16],
];

export function paintDog(raster, index, ramp) {
  if (index === 2) {
    rect(raster, { x: 8, y: 6, width: 9, height: 9 }, ramp[2]);
    rect(raster, { x: 8, y: 6, width: 9, height: 1 }, ramp[3]);
    rect(raster, { x: 14, y: 2, width: 6, height: 5 }, ramp[2]);
    rect(raster, { x: 19, y: 4, width: 3, height: 2 }, ramp[3]);
    rect(raster, { x: 15, y: 0, width: 2, height: 2 }, ramp[1]);
    rect(raster, { x: 6, y: 13, width: 12, height: 2 }, ramp[1]);
    rect(raster, { x: 5, y: 10, width: 2, height: 4 }, ramp[2]);

    return;
  }

  paintBody(raster, { lift: 0 }, ramp);

  for (const x of LEGS[index]) {
    rect(raster, { x, y: 10, width: 2, height: 5 }, ramp[1]);
    rect(raster, { x, y: 15, width: 2, height: 1 }, ramp[0]);
  }
}
