import { packed, unpack } from '../../../../../../src/render/venues/kit/colour.js';

export { packed };

const lightnesses = new Map();

// how light a packed colour reads, worked out once a colour: a figure has only a few dozen
export function lightnessOf(word) {
  if (!lightnesses.has(word)) {
    const [red, green, blue] = unpack(word);

    lightnesses.set(word, red * 0.3 + green * 0.59 + blue * 0.11);
  }

  return lightnesses.get(word);
}

export const clearAt = ({ width, height, pixels }, x, y) =>
  x < 0 || y < 0 || x >= width || y >= height || pixels[y * width + x] === 0;

export const edgeAt = (raster, x, y) =>
  clearAt(raster, x, y - 1) ||
  clearAt(raster, x - 1, y) ||
  clearAt(raster, x + 1, y) ||
  clearAt(raster, x, y + 1);

export function mapPixels(raster, change) {
  const { width, height, pixels } = raster;
  const out = new Uint32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      out[y * width + x] = change(pixels[y * width + x], x, y);
    }
  }

  return out;
}
