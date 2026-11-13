export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const lerp = (from, to, share) => from + (to - from) * share;

export const easeOut = (share) => 1 - (1 - clamp01(share)) ** 3;

export const easeIn = (share) => clamp01(share) ** 2;

export const easeOutSoft = (share) => 1 - (1 - clamp01(share)) ** 2;

export const easeInOut = (share) => {
  const value = clamp01(share);

  return value * value * (3 - 2 * value);
};

export function phaseOf(value, from, length) {
  if (length <= 0) {
    return value >= from ? 1 : 0;
  }

  return clamp01((value - from) / length);
}

export const between = (from, to, share) => ({
  x: lerp(from.x, to.x, share),
  y: lerp(from.y, to.y, share),
});

export function bezier(from, control, to, share) {
  return between(between(from, control, share), between(control, to, share), share);
}
