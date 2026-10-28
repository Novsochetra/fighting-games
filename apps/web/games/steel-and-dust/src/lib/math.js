export function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

// runs a little past the end and settles back, as a thing dropped bounces
export function easeOutBack(progress) {
  const past = progress - 1;
  return 1 + 2.70158 * past * past * past + 1.70158 * past * past;
}

// eases in and out over 0 to 1, and holds still past either end
export function smoothstep(progress) {
  const clamped = clamp(progress, 0, 1);

  return clamped * clamped * (3 - 2 * clamped);
}

export function easeInOutCubic(progress) {
  if (progress < 0.5) {
    return 4 * progress * progress * progress;
  }
  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function hashInt(value) {
  let hash = Math.imul(value | 0, 2654435761);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 1274126177);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export function createRng(seed) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function directionOf(from, to) {
  return to >= from ? 1 : -1;
}
