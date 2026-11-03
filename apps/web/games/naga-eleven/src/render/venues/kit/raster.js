import { mix } from './colour.js';

// a block of pixels drawn in plain JavaScript, every coordinate a whole pixel, then put on a canvas
// in one go: crisp pixel art with no smoothing, and one canvas call however much is drawn
export function createRaster(width, height) {
  const data = new Uint8ClampedArray(Math.max(1, width * height) * 4);

  return { width, height, data, pixels: new Uint32Array(data.buffer) };
}

const inside = (raster, x, y) => x >= 0 && y >= 0 && x < raster.width && y < raster.height;

export function plot(raster, x, y, colour) {
  const column = Math.round(x);
  const row = Math.round(y);

  if (inside(raster, column, row)) {
    raster.pixels[row * raster.width + column] = colour;
  }
}

export function rect(raster, { x, y, width, height }, colour) {
  const left = Math.max(0, Math.round(x));
  const top = Math.max(0, Math.round(y));
  const right = Math.min(raster.width, Math.round(x + width));
  const bottom = Math.min(raster.height, Math.round(y + height));

  if (right <= left) {
    return;
  }

  for (let row = top; row < bottom; row += 1) {
    raster.pixels.fill(colour, row * raster.width + left, row * raster.width + right);
  }
}

export function hline(raster, { x, y, width }, colour) {
  rect(raster, { x, y, width, height: 1 }, colour);
}

// Bresenham's line, one pixel thick, ends included
export function line(raster, from, to, colour) {
  let x = Math.round(from.x);
  let y = Math.round(from.y);
  const endX = Math.round(to.x);
  const endY = Math.round(to.y);
  const stepX = Math.sign(endX - x);
  const stepY = Math.sign(endY - y);
  const dx = Math.abs(endX - x);
  const dy = -Math.abs(endY - y);
  let error = dx + dy;

  for (;;) {
    plot(raster, x, y, colour);

    if (x === endX && y === endY) {
      return;
    }

    const twice = 2 * error;

    if (twice >= dy) {
      error += dy;
      x += stepX;
    }

    if (twice <= dx) {
      error += dx;
      y += stepY;
    }
  }
}

export function ellipse(raster, { x, y, radiusX, radiusY }, colour) {
  for (let row = -radiusY; row <= radiusY; row += 1) {
    const half = Math.round(radiusX * Math.sqrt(Math.max(0, 1 - (row / (radiusY + 0.5)) ** 2)));

    hline(raster, { x: x - half, y: y + row, width: half * 2 + 1 }, colour);
  }
}

// a pixel art picture holds few colours, so each mix of one colour over another at a share (in
// 64ths) is worked out once and looked up after: a night's shade and glow are millions of mixes
const mixes = new Map();

function mixOnce(under, over, share) {
  const steps = Math.round(Math.min(1, share) * 64);

  if (!mixes.has(over)) {
    mixes.set(over, new Map());
  }

  const known = mixes.get(over);
  const key = under * 65 + steps;

  if (!known.has(key)) {
    known.set(key, mix(under, over, steps / 64));
  }

  return known.get(key);
}

// lays a colour part of the way over what is there, for glows, haze and shade
export function tint(raster, x, y, { colour, share }) {
  const column = Math.round(x);
  const row = Math.round(y);

  if (inside(raster, column, row) && share > 0) {
    const at = row * raster.width + column;

    raster.pixels[at] = mixOnce(raster.pixels[at], colour, share);
  }
}

export function mirror(raster) {
  const flipped = createRaster(raster.width, raster.height);

  for (let row = 0; row < raster.height; row += 1) {
    for (let column = 0; column < raster.width; column += 1) {
      flipped.pixels[row * raster.width + column] =
        raster.pixels[row * raster.width + raster.width - 1 - column];
    }
  }

  return flipped;
}

// fills a four-sided shape given corner to corner, a row at a time between its edges
export function fillQuad(raster, corners, colour) {
  const ys = corners.map((corner) => corner.y);

  for (
    let row = Math.max(0, Math.ceil(Math.min(...ys)));
    row <= Math.min(raster.height - 1, Math.floor(Math.max(...ys)));
    row += 1
  ) {
    const crossings = corners.flatMap((from, i) => {
      const to = corners[(i + 1) % corners.length];
      const spans = (from.y <= row && to.y > row) || (to.y <= row && from.y > row);

      return spans ? [from.x + ((row - from.y) / (to.y - from.y)) * (to.x - from.x)] : [];
    });

    if (crossings.length >= 2) {
      const left = Math.round(Math.min(...crossings));

      hline(
        raster,
        { x: left, y: row, width: Math.round(Math.max(...crossings)) - left + 1 },
        colour,
      );
    }
  }
}
