// a big hit (heavy, charged or launching) is the same sound, lower and longer
export const NORMAL = { length: 1, tune: 1 };
export const BIG = { length: 1.35, tune: 0.88 };

// a hit sound and its big version from one builder: build(track, pitch, size)
export function hitPair(key, { level, bigLevel, seconds, build }) {
  const sound = (soundLevel, size) => ({
    group: 'hit',
    level: soundLevel,
    takes: 4,
    seconds: seconds * size.length,
    priority: 2,
    build: (track, pitch) => build(track, pitch, size),
  });
  return { [key]: sound(level, NORMAL), [`${key}Big`]: sound(bigLevel, BIG) };
}
