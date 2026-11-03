// the cut-ins never call Math.random: what flickers is picked from the tick and a place, so a
// frame drawn twice comes out the same
export function hash(...values) {
  let mixed = 0x9e3779b9;

  for (const value of values) {
    mixed = Math.imul(mixed ^ Math.round(value), 0x85ebca6b);
    mixed ^= mixed >>> 13;
    mixed = Math.imul(mixed, 0xc2b2ae35);
    mixed ^= mixed >>> 16;
  }

  return (mixed >>> 0) / 4294967296;
}

export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const lerp = (from, to, share) => from + (to - from) * share;

export const easeOut = (share) => 1 - (1 - clamp01(share)) ** 3;

export const easeIn = (share) => clamp01(share) ** 2;

// slides past its mark and settles back, as a panel thrown in
export function overshoot(share) {
  const left = clamp01(share) - 1;

  return 1 + 2.4 * left ** 3 + 1.4 * left ** 2;
}

export const phaseOf = (ticks, from, length) => clamp01((ticks - from) / length);
