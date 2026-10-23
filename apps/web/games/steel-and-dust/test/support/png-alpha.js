import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

// enough of a PNG decoder to read the alpha and color of the game's own sprites: 8-bit, not
// interlaced, RGBA or indexed with a tRNS chunk
const BYTES_PER_PIXEL = { 3: 1, 6: 4 };

function readChunks(buffer) {
  const chunks = { IDAT: [] };
  for (let at = 8; at < buffer.length;) {
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString('latin1', at + 4, at + 8);
    const data = buffer.subarray(at + 8, at + 8 + length);
    if (type === 'IDAT') {
      chunks.IDAT.push(data);
    } else {
      chunks[type] = data;
    }
    at += length + 12;
  }
  return chunks;
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const toLeft = Math.abs(estimate - left);
  const toUp = Math.abs(estimate - up);
  const toUpLeft = Math.abs(estimate - upLeft);
  if (toLeft <= toUp && toLeft <= toUpLeft) {
    return left;
  }
  return toUp <= toUpLeft ? up : upLeft;
}

function predict(filter, { left, up, upLeft }) {
  const predictors = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)];
  return predictors[filter];
}

function unfilter(raw, { width, height, bytesPerPixel }) {
  const stride = width * bytesPerPixel;
  const pixels = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const at = y * stride + i;
      const left = i >= bytesPerPixel ? pixels[at - bytesPerPixel] : 0;
      const up = y ? pixels[at - stride] : 0;
      const upLeft = y && i >= bytesPerPixel ? pixels[at - stride - bytesPerPixel] : 0;
      const value = raw[y * (stride + 1) + 1 + i] + predict(filter, { left, up, upLeft });
      pixels[at] = value & 255;
    }
  }
  return pixels;
}

export function readPngAlpha(path) {
  const chunks = readChunks(readFileSync(path));
  const header = chunks.IHDR;
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const colorType = header[9];
  const bytesPerPixel = BYTES_PER_PIXEL[colorType];
  if (header[8] !== 8 || header[12] !== 0 || !bytesPerPixel) {
    throw new Error(`${path}: only 8-bit RGBA or indexed PNGs are read here`);
  }
  const pixels = unfilter(inflateSync(Buffer.concat(chunks.IDAT)), {
    width,
    height,
    bytesPerPixel,
  });
  const alpha = (x, y) => {
    const value = pixels[(y * width + x) * bytesPerPixel + bytesPerPixel - 1];
    return colorType === 6 ? value : (chunks.tRNS?.[value] ?? 255);
  };
  const rgb = (x, y) => {
    const at = (y * width + x) * bytesPerPixel;
    const source = colorType === 6 ? pixels : chunks.PLTE;
    const start = colorType === 6 ? at : pixels[at] * 3;
    return [source[start], source[start + 1], source[start + 2]];
  };
  // the color as one number, for counting and comparing many pixels without building arrays
  const colorKey = (x, y) => {
    const at = (y * width + x) * bytesPerPixel;
    const source = colorType === 6 ? pixels : chunks.PLTE;
    const start = colorType === 6 ? at : pixels[at] * 3;
    return (source[start] << 16) | (source[start + 1] << 8) | source[start + 2];
  };
  return { width, height, alpha, rgb, colorKey };
}
