import { ellipse, rect } from '../kit/raster.js';

// a step-through scooter seen side on, parked, facing right: two small wheels with their hubs, a
// curved body in its colour lit along its top, a dark seat, the front shield and handlebar, a
// headlight; `facing` -1 draws the same scooter flipped
const LENGTH = 30;

function wheel(raster, { x, base }, parts) {
  ellipse(raster, { x, y: base - 4, radiusX: 4, radiusY: 4 }, parts.tyre);
  ellipse(raster, { x, y: base - 4, radiusX: 1, radiusY: 1 }, parts.chrome);
}

function paintRight(raster, { x, base }, { body, parts }) {
  wheel(raster, { x: x + 5, base }, parts);
  wheel(raster, { x: x + 24, base }, parts);
  rect(raster, { x: x + 2, y: base - 13, width: 13, height: 6 }, body[1]);
  rect(raster, { x: x + 2, y: base - 13, width: 13, height: 1 }, body[2]);
  rect(raster, { x: x + 13, y: base - 8, width: 7, height: 3 }, body[0]);
  rect(raster, { x: x + 19, y: base - 18, width: 4, height: 12 }, body[1]);
  rect(raster, { x: x + 19, y: base - 18, width: 1, height: 12 }, body[2]);
  rect(raster, { x: x + 21, y: base - 8, width: 6, height: 2 }, body[0]);
  rect(raster, { x: x + 3, y: base - 16, width: 11, height: 3 }, parts.seat);
  rect(raster, { x: x + 4, y: base - 16, width: 9, height: 1 }, parts.chrome);
  rect(raster, { x: x + 18, y: base - 21, width: 7, height: 2 }, parts.chrome);
  rect(raster, { x: x + 23, y: base - 17, width: 2, height: 2 }, parts.light);
}

export function paintScooter(raster, { x, base, facing = 1 }, colours) {
  if (facing > 0) {
    paintRight(raster, { x, base }, colours);

    return;
  }

  const scratch = { width: LENGTH, height: base + 1, pixels: new Uint32Array(LENGTH * (base + 1)) };

  paintRight(scratch, { x: 0, base }, colours);

  for (let row = Math.max(0, base - 22); row <= base; row += 1) {
    for (let column = 0; column < LENGTH; column += 1) {
      const colour = scratch.pixels[row * LENGTH + LENGTH - 1 - column];

      if (colour !== 0 && x + column >= 0 && x + column < raster.width) {
        raster.pixels[row * raster.width + x + column] = colour;
      }
    }
  }
}

export const SCOOTER_LENGTH = LENGTH;
