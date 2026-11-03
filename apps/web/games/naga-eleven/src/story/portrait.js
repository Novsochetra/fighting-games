import { CHARACTERS } from '../data/characters.js';
import { pickVillagerFace, villagerAge, villagerKey } from './villagers.js';

export { stableHash } from './villagers.js';

// the hero and the two friends who grow up with him are drawn at the chapter's age
export const AGED_CHARACTERS = ['sochetra', 'dara', 'rithy'];

export const isNarration = (line) => !line.speaker || line.speaker === 'narrator';

// `faces` are the scene's (villagerFaces), so no two villagers in it share one
const villagerOf = (line, { mood, faces }) => ({
  character: 'villager',
  age: villagerAge(line),
  mood,
  variant: faces?.get(villagerKey(line)) ?? pickVillagerFace(line),
});

const ageOf = (character, heroAge) =>
  AGED_CHARACTERS.includes(character) ? heroAge : (CHARACTERS[character]?.ages?.[0] ?? null);

export function portraitFor(line, heroAge, faces) {
  if (isNarration(line)) {
    return null;
  }

  const mood = line.mood ?? 'neutral';

  if (line.speaker === 'villager') {
    return villagerOf(line, { mood, faces });
  }

  return { character: line.speaker, age: ageOf(line.speaker, heroAge), mood };
}
