// the match keeps its own seeded generator, so the same seed plays the same match
export const createRandom = (seed) => ({ state: seed >>> 0 });

export function nextRandom(random) {
  random.state = (random.state + 0x6d2b79f5) >>> 0;

  let mixed = Math.imul(random.state ^ (random.state >>> 15), 1 | random.state);

  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
}

export const chance = (random, odds) => nextRandom(random) < odds;

// from -spread to spread, more often near the middle
export const wobble = (random, spread) => (nextRandom(random) + nextRandom(random) - 1) * spread;
