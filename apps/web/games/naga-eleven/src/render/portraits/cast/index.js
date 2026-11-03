import { ANNOUNCER } from './announcer.js';
import { BORA, SOKHA, VANNAK } from './coaches.js';
import { NEARY, TA_SOK } from './family.js';
import { footballer } from './footballers.js';
import { DARA, RITHY } from './friends.js';
import { FARHAD, HARUTO, LUKAS, MINJUN, RAFAEL } from './rivals.js';
import { SOCHETRA } from './sochetra.js';
import { VILLAGERS } from './villagers.js';

export { footballerKey } from './footballers.js';
export { VILLAGER_KINDS } from './villagers.js';

export const AGES = ['child', 'teen', 'young', 'adult'];

export const MOODS = ['neutral', 'happy', 'determined', 'shocked', 'sad', 'angry', 'smirk', 'cry'];

export const GROWING_UP = { sochetra: SOCHETRA, dara: DARA, rithy: RITHY };

export const CAST = {
  neary: NEARY,
  'ta-sok': TA_SOK,
  'coach-vannak': VANNAK,
  'coach-sokha': SOKHA,
  'coach-bora': BORA,
  haruto: HARUTO,
  minjun: MINJUN,
  farhad: FARHAD,
  rafael: RAFAEL,
  lukas: LUKAS,
  announcer: ANNOUNCER,
};

export const VILLAGER_COUNT = VILLAGERS.length;

// with no age given, the ones who grow up show as they are for most of the story
export function recipeFor({ character, age, variant = 0 }) {
  if (character === 'villager') {
    const index = Math.abs(Math.trunc(Number(variant) || 0)) % VILLAGERS.length;

    return VILLAGERS[index];
  }

  if (character === 'footballer') {
    return footballer({ ...variant, age });
  }

  if (GROWING_UP[character]) {
    return GROWING_UP[character][age] ?? GROWING_UP[character].young;
  }

  return CAST[character] ?? null;
}

export function hasPortrait(character) {
  return (
    character === 'villager' ||
    character === 'footballer' ||
    Boolean(GROWING_UP[character] || CAST[character])
  );
}
