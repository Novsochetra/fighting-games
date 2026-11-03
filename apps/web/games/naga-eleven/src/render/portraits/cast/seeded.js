// FNV-1a: the same text always gives the same number, so a face never changes between duels
export function hashOf(text) {
  let hash = 2166136261;

  for (const letter of String(text)) {
    hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619);
  }

  return hash >>> 0;
}

// each part is picked by its own salt, so changing one pool leaves the other picks as they were
export const pickerOf = (seed) => (list, salt) => list[hashOf(`${seed}:${salt}`) % list.length];

// no part has as many as eleven choices, so a stride that is a larger prime walks the places of a
// side through the mixes of its parts in a scrambled order, and no two places share a mix
const STRIDE = 9973;

export function mixOf(parts, { seed, place }) {
  const names = Object.keys(parts);
  const total = names.reduce((product, name) => product * parts[name].length, 1);
  let rest = (hashOf(seed) + place * STRIDE) % total;

  return Object.fromEntries(
    names.map((name) => {
      const list = parts[name];
      const item = list[rest % list.length];

      rest = Math.floor(rest / list.length);

      return [name, item];
    }),
  );
}
