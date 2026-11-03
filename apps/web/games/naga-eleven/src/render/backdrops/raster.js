// A backdrop is painted pixel by pixel into a buffer of art pixels, then laid on the view at twice
// the size, so its pixels match the dialogue's portraits drawn at scale 2
export const ART_SCALE = 2;
export const ART_WIDTH = 384;
export const ART_HEIGHT = 216;

const parsed = new Map();

function parseHex(color) {
  const values = color
    .slice(1)
    .match(/../g)
    .map((pair) => parseInt(pair, 16));

  return values.length === 3 ? [...values, 255] : values;
}

export function colorOf(color) {
  let found = parsed.get(color);

  if (!found) {
    found = parseHex(color);
    parsed.set(color, found);
  }

  return found;
}

export const createRaster = (width = ART_WIDTH, height = ART_HEIGHT) => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4),
});

const inside = (raster, x, y) => x >= 0 && y >= 0 && x < raster.width && y < raster.height;

function blendInto(data, at, [red, green, blue, alpha]) {
  const cover = alpha / 255;
  const keep = 1 - cover;

  data[at] = red * cover + data[at] * keep;
  data[at + 1] = green * cover + data[at + 1] * keep;
  data[at + 2] = blue * cover + data[at + 2] * keep;
  data[at + 3] = alpha + data[at + 3] * keep;
}

export function plot(raster, x, y, color) {
  const column = Math.round(x);
  const row = Math.round(y);

  if (!color || !inside(raster, column, row)) {
    return;
  }

  const rgba = colorOf(color);
  const at = (row * raster.width + column) * 4;

  if (rgba[3] === 255) {
    raster.data.set(rgba, at);

    return;
  }

  blendInto(raster.data, at, rgba);
}

export function fillRect(raster, { x, y, width, height }, color) {
  const left = Math.max(0, Math.round(x));
  const top = Math.max(0, Math.round(y));
  const right = Math.min(raster.width, Math.round(x + width));
  const bottom = Math.min(raster.height, Math.round(y + height));

  for (let row = top; row < bottom; row += 1) {
    for (let column = left; column < right; column += 1) {
      plot(raster, column, row, color);
    }
  }
}

export const hline = (raster, { x, y, length }, color) =>
  fillRect(raster, { x, y, width: length, height: 1 }, color);

export const vline = (raster, { x, y, length }, color) =>
  fillRect(raster, { x, y, width: 1, height: length }, color);

const offsetOf = (raster, x, y) => (y * raster.width + x) * 4;

export function pixelAt(raster, x, y) {
  if (!inside(raster, x, y)) {
    return null;
  }

  const at = offsetOf(raster, x, y);

  return raster.data.subarray(at, at + 4);
}

export function copyPixel(raster, from, to) {
  if (inside(raster, from.x, from.y) && inside(raster, to.x, to.y)) {
    const at = offsetOf(raster, from.x, from.y);

    raster.data.copyWithin(offsetOf(raster, to.x, to.y), at, at + 4);
  }
}

// lays one buffer on another at `x`, `y` (its top left), mirrored when `flipX`, its clear pixels
// left out: a prop is painted once facing right and turned as it needs
export function stampRaster(target, source, { x, y, flipX = false }) {
  for (let row = 0; row < source.height; row += 1) {
    for (let column = 0; column < source.width; column += 1) {
      const at = (row * source.width + column) * 4;
      const toX = x + (flipX ? source.width - 1 - column : column);

      if (source.data[at + 3] > 0 && inside(target, toX, y + row)) {
        target.data.set(source.data.subarray(at, at + 4), offsetOf(target, toX, y + row));
      }
    }
  }
}
