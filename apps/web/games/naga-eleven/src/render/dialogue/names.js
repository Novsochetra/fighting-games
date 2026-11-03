import { CHARACTERS } from '../../data/characters.js';
import { textOf } from '../text.js';

const fromId = (id) =>
  id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const entryOf = (characters, id) =>
  Array.isArray(characters)
    ? characters.find((character) => character.id === id)
    : characters?.[id];

// a line may name its speaker (the fisherman among the villagers); else the cast's own name, else
// the id written out, so a speaker the cast does not list yet still gets a plate
export function speakerName(line, { lang = 'en', characters = CHARACTERS } = {}) {
  if (line.name) {
    return textOf(line.name, lang);
  }

  const entry = entryOf(characters, line.speaker);

  return entry?.name ? textOf(entry.name, lang) : fromId(line.speaker);
}
