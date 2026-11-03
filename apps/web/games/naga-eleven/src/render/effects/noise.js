// the same tick and salt always give the same number in 0..1, so effects never need Math.random
export function noise(tick, salt) {
  let mixed = Math.imul((tick * 374761393 + salt * 668265263) ^ 0x27d4eb2f, 0x85ebca6b);

  mixed ^= mixed >>> 13;
  mixed = Math.imul(mixed, 0xc2b2ae35);

  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
}
