import { hash2 } from '../kit/hash.js';
import { line, rect } from '../kit/raster.js';

// a Khmer house on stilts: a dark space under it with a jar and a ladder, a plank body with its
// shutters, and a steep roof of tin or thatch overhanging its walls
function paintStilts(raster, { x, base, width, stilts }, wood) {
  rect(raster, { x, y: base - stilts, width, height: stilts }, wood[0]);

  for (let post = x; post < x + width; post += 9) {
    rect(raster, { x: post, y: base - stilts, width: 2, height: stilts }, wood[2]);
    rect(raster, { x: post, y: base - stilts, width: 1, height: stilts }, wood[3]);
  }

  for (let step = 0; step < stilts; step += 3) {
    rect(raster, { x: x + width + 1, y: base - step - 1, width: 4, height: 1 }, wood[3]);
  }

  rect(raster, { x: x + 4, y: base - 5, width: 5, height: 5 }, wood[1]);
}

function paintBody(raster, { x, top, width, height, seed }, wood) {
  rect(raster, { x, y: top, width, height }, wood[3]);

  for (let y = top + 2; y < top + height; y += 3) {
    rect(raster, { x, y, width, height: 1 }, wood[2]);
  }

  rect(raster, { x, y: top, width, height: 2 }, wood[1]);
  rect(raster, { x, y: top + height, width, height: 1 }, wood[0]);

  for (let shutter = x + 5; shutter + 6 < x + width; shutter += 13) {
    const open = hash2(seed, shutter, 1) < 0.4;

    rect(raster, { x: shutter, y: top + 5, width: 6, height: 7 }, open ? wood[0] : wood[4]);
    rect(raster, { x: shutter, y: top + 5, width: 6, height: 1 }, wood[5] ?? wood[4]);
  }
}

function paintRoof(raster, { x, bottom, width, height }, ramp) {
  for (let row = 0; row < height; row += 1) {
    const inset = Math.round((row / height) * (height * 0.7));
    const left = x - 4 + inset;
    const span = width + 8 - inset * 2;

    rect(raster, { x: left, y: bottom - row, width: span, height: 1 }, ramp[1 + ((row >> 1) % 2)]);
    rect(raster, { x: left, y: bottom - row, width: 2, height: 1 }, ramp[3]);
  }

  for (let rib = x; rib < x + width; rib += 4) {
    line(raster, { x: rib, y: bottom }, { x: rib + 1, y: bottom - height + 3 }, ramp[0]);
  }

  rect(raster, { x: x - 4, y: bottom, width: width + 8, height: 1 }, ramp[0]);
  rect(
    raster,
    {
      x: x - 4 + Math.round(height * 0.7),
      y: bottom - height,
      width: width + 8 - Math.round(height * 1.4),
      height: 1,
    },
    ramp[4] ?? ramp[3],
  );
}

export function paintStiltHouse(raster, { x, base, width, roof }, art) {
  const stilts = 12;
  const body = 16;
  const top = base - stilts - body;

  paintStilts(raster, { x, base, width, stilts }, art.wood);
  paintBody(raster, { x, top, width, height: body, seed: x }, art.wood);
  paintRoof(
    raster,
    { x, bottom: top, width, height: 13 },
    roof === 'thatch' ? art.thatch : art.tin,
  );
}
