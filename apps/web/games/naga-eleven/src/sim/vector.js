// only square roots here, never trig: Math.sqrt rounds the same on every machine, so a recorded
// match replays to the bit on a Mac and on CI
export const lengthOf = (x, y) => Math.sqrt(x * x + y * y);

export const distance = (from, to) => lengthOf(to.x - from.x, to.y - from.y);

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const ZERO = Object.freeze({ x: 0, y: 0 });

export function normalized(x, y) {
  const length = lengthOf(x, y);

  return length > 0 ? { x: x / length, y: y / length } : ZERO;
}

export const directionTo = (from, to) => normalized(to.x - from.x, to.y - from.y);

export const dot = (first, second) => first.x * second.x + first.y * second.y;

export const lerp = (from, to, share) => from + (to - from) * share;

// how far a point lies from the segment between two others, and how far along it its foot falls
export function segmentGap(from, to, point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const span = dx * dx + dy * dy;
  const along =
    span > 0 ? clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / span, 0, 1) : 0;

  return { gap: lengthOf(from.x + dx * along - point.x, from.y + dy * along - point.y), along };
}
