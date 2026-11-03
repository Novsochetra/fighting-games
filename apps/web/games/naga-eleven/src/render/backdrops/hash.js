// the same numbers always give the same value in [0, 1): scenery and its twinkles are placed by
// hash, never by Math.random, so a frame can be drawn again exactly
export function hash(...values) {
  let mixed = 0x9e3779b9;

  for (const value of values) {
    mixed = Math.imul(mixed ^ (value | 0), 0x85ebca6b);
    mixed ^= mixed >>> 13;
    mixed = Math.imul(mixed, 0xc2b2ae35);
    mixed ^= mixed >>> 16;
  }

  return (mixed >>> 0) / 4294967296;
}

// a value that wanders smoothly along `x`, a new turn every `period` pixels: tree lines, hills
export function smoothNoise(seed, x, period) {
  const step = Math.floor(x / period);
  const part = x / period - step;
  const ease = part * part * (3 - 2 * part);
  const from = hash(seed, step);

  return from + (hash(seed, step + 1) - from) * ease;
}

// smooth noise over a plane, for patches of grass, worn earth or stains
export function patchNoise(seed, { x, y }, period) {
  const column = Math.floor(x / period);
  const row = Math.floor(y / period);
  const across = x / period - column;
  const down = y / period - row;
  const easeX = across * across * (3 - 2 * across);
  const easeY = down * down * (3 - 2 * down);
  const top =
    hash(seed, column, row) + (hash(seed, column + 1, row) - hash(seed, column, row)) * easeX;
  const bottom =
    hash(seed, column, row + 1) +
    (hash(seed, column + 1, row + 1) - hash(seed, column, row + 1)) * easeX;

  return top + (bottom - top) * easeY;
}
