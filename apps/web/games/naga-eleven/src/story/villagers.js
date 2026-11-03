import { CHARACTERS } from '../data/characters.js';
import { VILLAGER_KINDS } from '../render/portraits/cast/index.js';
import { textOf } from '../render/text.js';

export const VILLAGER_AGES = ['child', 'young', 'adult', 'elder'];

// there are no teen villagers: a teen line wears a young face
const FACE_AGE = { teen: 'young' };

export function stableHash(text) {
  let hash = 2166136261;

  for (const letter of text) {
    hash = Math.imul(hash ^ letter.codePointAt(0), 16777619) >>> 0;
  }

  return hash;
}

// a crowd of villagers has no fixed faces, so each one is told apart by what they are called or
// say, and keeps that face whenever the scene is played again
export const villagerKey = (line) => textOf(line.name ?? line.text, 'en');

export function villagerAge(line) {
  const ages = CHARACTERS.villager?.ages ?? VILLAGER_AGES;
  const age = line.age ?? ages[(stableHash(villagerKey(line)) >>> 8) % ages.length];

  return FACE_AGE[age] ?? age;
}

const gap = (age, other) => Math.abs(VILLAGER_AGES.indexOf(age) - VILLAGER_AGES.indexOf(other));

// the faces in the order a line would wear them: its own age and sex, then its age, then the
// nearest ages, so a crowd that runs out of faces of one age borrows the closest
function facesInOrder({ age, sex }) {
  const fit = (kind) =>
    (kind.age === age ? 0 : 2 + gap(kind.age, age) * 2) + (sex && kind.sex !== sex ? 1 : 0);

  return VILLAGER_KINDS.map((kind, face) => ({ face, fit: fit(kind) })).sort(
    (one, other) => one.fit - other.fit || one.face - other.face,
  );
}

export function pickVillagerFace(line, taken = new Set()) {
  if (line.face !== undefined) {
    return line.face;
  }

  const ranked = facesInOrder({ age: villagerAge(line), sex: line.sex });
  const best = ranked.filter(({ fit }) => fit === ranked[0].fit);
  const preferred = best[stableHash(villagerKey(line)) % best.length].face;

  if (!taken.has(preferred)) {
    return preferred;
  }

  return ranked.find(({ face }) => !taken.has(face))?.face ?? preferred;
}

// every villager who speaks in a scene, by key, and the face they wear in it: two of them never
// share one while faces are left
export function villagerFaces(lines) {
  const faces = new Map();
  const villagers = lines.filter((line) => line.speaker === 'villager');

  villagers
    .filter((line) => line.face !== undefined)
    .forEach((line) => faces.set(villagerKey(line), line.face));

  for (const line of villagers) {
    const key = villagerKey(line);

    if (!faces.has(key)) {
      faces.set(key, pickVillagerFace(line, new Set(faces.values())));
    }
  }

  return faces;
}
