import { createRandom, nextRandom } from '../sim/random.js';

const UINT32 = 4294967296;

export function hashText(text) {
  let hash = 0x811c9dc5;

  for (const character of String(text)) {
    hash = Math.imul(hash ^ character.codePointAt(0), 0x01000193) >>> 0;
  }

  return hash;
}

export function mixSeeds(...parts) {
  return parts.reduce((seed, part) => {
    const random = createRandom((seed ^ Math.imul(Number(part) >>> 0, 0x9e3779b1)) >>> 0);

    return Math.floor(nextRandom(random) * UINT32) >>> 0;
  }, 0x2545f491);
}

export function matchSeedFor(save, stage) {
  const { at } = stage;
  const replays = at.cup ? (save.cups[at.cup.id]?.replays ?? 0) : 0;

  return mixSeeds(save.seed, hashText(`${at.chapterId}/${at.stage}`), save.attempts, replays);
}
