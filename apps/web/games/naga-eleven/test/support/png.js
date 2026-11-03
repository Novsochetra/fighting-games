import { deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;

  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }

  return crc >>> 0;
});

function crcOf(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crcOf(body));

  return Buffer.concat([length, body, crc]);
}

// `data` is RGBA, four bytes a pixel, row after row
export function encodePng({ width, height, data }) {
  const header = Buffer.alloc(13);
  const stride = width * 4;
  const rows = Buffer.alloc((stride + 1) * height);

  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  for (let y = 0; y < height; y += 1) {
    rows.set(data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunksOf(png) {
  const chunks = [];

  for (let at = 8; at < png.length;) {
    const length = png.readUInt32BE(at);

    chunks.push({
      type: png.toString('ascii', at + 4, at + 8),
      data: png.subarray(at + 8, at + 8 + length),
    });
    at += length + 12;
  }

  return chunks;
}

function paeth(left, up, upLeft) {
  const guess = left + up - upLeft;
  const toLeft = Math.abs(guess - left);
  const toUp = Math.abs(guess - up);
  const toUpLeft = Math.abs(guess - upLeft);

  if (toLeft <= toUp && toLeft <= toUpLeft) {
    return left;
  }

  return toUp <= toUpLeft ? up : upLeft;
}

const UNFILTER = [
  (value) => value,
  (value, left) => value + left,
  (value, left, up) => value + up,
  (value, left, up) => value + Math.floor((left + up) / 2),
  (value, left, up, upLeft) => value + paeth(left, up, upLeft),
];

function unfilterRows(raw, { width, height, channels }) {
  const stride = width * channels;
  const pixels = new Uint8Array(stride * height);

  for (let y = 0; y < height; y += 1) {
    const filter = UNFILTER[raw[y * (stride + 1)]];

    for (let i = 0; i < stride; i += 1) {
      const at = y * stride + i;
      const left = i >= channels ? pixels[at - channels] : 0;
      const up = y > 0 ? pixels[at - stride] : 0;
      const upLeft = i >= channels && y > 0 ? pixels[at - stride - channels] : 0;

      pixels[at] = filter(raw[y * (stride + 1) + 1 + i], left, up, upLeft) & 255;
    }
  }

  return pixels;
}

const CHANNELS = { 2: 3, 3: 1, 6: 4 };

function paletteOf(chunks) {
  const colors = chunks.find((each) => each.type === 'PLTE')?.data ?? Buffer.alloc(0);
  const alphas = chunks.find((each) => each.type === 'tRNS')?.data ?? Buffer.alloc(0);

  return Array.from({ length: colors.length / 3 }, (_, i) => [
    colors[i * 3],
    colors[i * 3 + 1],
    colors[i * 3 + 2],
    i < alphas.length ? alphas[i] : 255,
  ]);
}

function toRgba(pixels, { channels, palette }) {
  const count = pixels.length / channels;
  const out = new Uint8ClampedArray(count * 4);

  for (let i = 0; i < count; i += 1) {
    const at = i * channels;
    const rgba = palette
      ? palette[pixels[at]]
      : [pixels[at], pixels[at + 1], pixels[at + 2], channels === 4 ? pixels[at + 3] : 255];

    out.set(rgba, i * 4);
  }

  return out;
}

// reads an 8-bit RGB, RGBA or palette png, as PixelLab and this file write them, into RGBA
export function decodePng(png) {
  const chunks = chunksOf(png);
  const header = chunks.find((each) => each.type === 'IHDR').data;
  const width = header.readUInt32BE(0);
  const height = header.readUInt32BE(4);
  const channels = CHANNELS[header[9]];

  if (header[8] !== 8 || !channels) {
    throw new Error(
      `only 8-bit RGB, RGBA or palette pngs are read, not depth ${header[8]} type ${header[9]}`,
    );
  }

  const idat = Buffer.concat(
    chunks.filter((each) => each.type === 'IDAT').map((each) => each.data),
  );
  const pixels = unfilterRows(inflateSync(idat), { width, height, channels });
  const palette = header[9] === 3 ? paletteOf(chunks) : null;

  return { width, height, data: toRgba(pixels, { channels, palette }) };
}
