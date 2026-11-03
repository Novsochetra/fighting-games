export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const shareOf = (tick, start, length) => clamp01((tick - start) / Math.max(1, length));

export const easeOut = (share) => 1 - (1 - clamp01(share)) ** 3;

export const easeIn = (share) => clamp01(share) ** 3;

// a pop that overshoots a little before it settles, as a broadcast graphic lands
export function backOut(share) {
  const rest = clamp01(share) - 1;

  return 1 + 2.7 * rest ** 3 + 1.7 * rest ** 2;
}
