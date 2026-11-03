// colours are packed once into the 32-bit words a raster's pixels are written as, in the byte
// order of the machine, so a pixel is one store
const LITTLE_ENDIAN = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
const packedCache = new Map();

export const CLEAR = 0;

function pack(red, green, blue, alpha) {
  return LITTLE_ENDIAN
    ? ((alpha << 24) | (blue << 16) | (green << 8) | red) >>> 0
    : ((red << 24) | (green << 16) | (blue << 8) | alpha) >>> 0;
}

export function channelsOf(hex) {
  const digits = hex.slice(1);

  return [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16));
}

export function packed(hex) {
  if (!packedCache.has(hex)) {
    packedCache.set(hex, pack(...channelsOf(hex), 255));
  }

  return packedCache.get(hex);
}

export function unpack(word) {
  return LITTLE_ENDIAN
    ? [word & 255, (word >>> 8) & 255, (word >>> 16) & 255, word >>> 24]
    : [word >>> 24, (word >>> 16) & 255, (word >>> 8) & 255, word & 255];
}

const SHIFTS = LITTLE_ENDIAN ? [0, 8, 16, 24] : [24, 16, 8, 0];

const channel = (word, index) => (word >>> SHIFTS[index]) & 255;

// a colour laid part of the way over another, as paint over paint: over a clear pixel it is the
// colour itself, that much see-through, so a glow over the night sky still glows
export function mix(under, over, share) {
  const underAlpha = channel(under, 3) / 255;
  const overAlpha = (channel(over, 3) / 255) * share;
  const alpha = overAlpha + underAlpha * (1 - overAlpha);

  if (alpha <= 0) {
    return CLEAR;
  }

  const blend = (index) =>
    Math.round(
      (channel(over, index) * overAlpha + channel(under, index) * underAlpha * (1 - overAlpha)) /
        alpha,
    );

  return pack(blend(0), blend(1), blend(2), Math.round(alpha * 255));
}

const HEX = /^#[0-9a-f]{6}$/i;

// packs every colour of a palette, however deep, and leaves the rest (names, words) as it is
export function packAll(value) {
  if (typeof value === 'string') {
    return HEX.test(value) ? packed(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map(packAll);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, packAll(inner)]));
  }

  return value;
}

// a colour that lets what is under it show through, for nets and glass
export function packedAlpha(hex, alpha) {
  return pack(...channelsOf(hex), Math.round(alpha * 255));
}
