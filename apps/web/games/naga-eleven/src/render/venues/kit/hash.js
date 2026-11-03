// the same place always gets the same grain, so what is drawn once matches what is drawn again
export function hash2(x, y, salt = 0) {
  let mixed = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(salt, 0x9e37);

  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x85ebca6b);
  mixed = Math.imul(mixed ^ (mixed >>> 13), 0xc2b2ae35);

  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
}

const smooth = (share) => share * share * (3 - 2 * share);

// the corners of the noise come from a table of 256 by 256 hashes, made once a salt: a ground is
// millions of pixels and the hash is the slow part. It repeats every 256 cells, too far to see
const LATTICE = 256;
const lattices = [];

function latticeOf(salt) {
  if (!lattices[salt]) {
    const table = new Float32Array(LATTICE * LATTICE);

    for (let i = 0; i < table.length; i += 1) {
      table[i] = hash2(i % LATTICE, Math.floor(i / LATTICE), salt);
    }

    lattices[salt] = table;
  }

  return lattices[salt];
}

const cornerOf = (table, x, y) => table[(x & (LATTICE - 1)) + (y & (LATTICE - 1)) * LATTICE];

// value noise: soft patches a cell wide, for worn grass, dirt and clouds; made once for a cell and
// a salt and then read a pixel at a time
export function noiseOf(cell, salt = 0) {
  const table = latticeOf(salt);

  return (x, y) => {
    const cellX = Math.floor(x / cell);
    const cellY = Math.floor(y / cell);
    const across = smooth(x / cell - cellX);
    const down = smooth(y / cell - cellY);
    const top =
      cornerOf(table, cellX, cellY) * (1 - across) + cornerOf(table, cellX + 1, cellY) * across;
    const bottom =
      cornerOf(table, cellX, cellY + 1) * (1 - across) +
      cornerOf(table, cellX + 1, cellY + 1) * across;

    return top * (1 - down) + bottom * down;
  };
}

export const noise2 = (x, y, { cell, salt = 0 }) => noiseOf(cell, salt)(x, y);

// a hash read from the same table, for a grain that is looked up once a pixel
export const grain2 = (x, y, salt) => cornerOf(latticeOf(salt), x, y);

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// an ordered dither's threshold for a pixel, 0 to just under 1
export const bayer = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
