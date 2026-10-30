export const AVATAR_PALETTES = 6;

// A letter can be several code points (an accent, or a Khmer vowel sign on its consonant), so the
// first letter is the first grapheme where the browser can split them.
function firstLetter(word) {
  if (typeof Intl.Segmenter !== 'function') {
    return Array.from(word)[0];
  }
  return new Intl.Segmenter().segment(word)[Symbol.iterator]().next().value.segment;
}

export function initialsOf(name) {
  const words = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return words.map(firstLetter).join('').toLocaleUpperCase();
}

// The same name always gets the same color; anonymous supporters stay gray.
export function paletteOf({ name, isAnonymous }) {
  if (isAnonymous) {
    return 0;
  }
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.codePointAt(0)) % 9973;
  }
  return (hash % AVATAR_PALETTES) + 1;
}
