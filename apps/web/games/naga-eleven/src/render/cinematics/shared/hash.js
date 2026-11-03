// a number in [0, 1) that is always the same for the same two whole numbers, so confetti and
// sparks fall the same way every time a moment is drawn
export function hashOf(seed, salt = 0) {
  let mixed = Math.imul((seed | 0) ^ Math.imul(salt | 0, 0x9e3779b1), 0x85ebca6b);

  mixed ^= mixed >>> 15;
  mixed = Math.imul(mixed, 0xc2b2ae35);
  mixed ^= mixed >>> 13;

  return (mixed >>> 0) / 4294967296;
}
