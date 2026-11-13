// mulberry32. The seed lives on the object handed in (a run), so a run stays plain data that a
// test or a recording replays draw for draw.
export function nextRandom(source) {
  source.seed = (source.seed + 0x6d2b79f5) | 0;

  let mixed = Math.imul(source.seed ^ (source.seed >>> 15), 1 | source.seed);

  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

  return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
}

export const randomInt = (source, low, high) =>
  low + Math.floor(nextRandom(source) * (high - low + 1));

export const pick = (source, list) => list[randomInt(source, 0, list.length - 1)];

export function shuffled(source, list) {
  const mixed = [...list];

  for (let i = mixed.length - 1; i > 0; i--) {
    const j = randomInt(source, 0, i);

    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }

  return mixed;
}
