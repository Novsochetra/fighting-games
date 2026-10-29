import { isBlockedName } from './blocked-names.js';

// Steel & Dust's post panel holds the same limits (games/steel-and-dust/src/online/player-name.js);
// a test keeps them equal. A name is counted by code point, as Postgres counts it, and a Khmer
// name has many.
export const NAME_LIMITS = { maxLength: 20 };

// letters of any script with their marks (Khmer's vowels and signs are marks), digits, spaces and
// a few marks a name can hold; nothing that makes a link, a tag or a line
const NAME_CHARACTERS = /^[\p{L}\p{M}\p{N} .'_-]+$/u;
const LINK =
  /\b(https?|www)\b|\.(com|net|org|io|me|xyz|gg|link|kh|app|site|shop|club|top|ru|tk)\b/iu;

export function cleanName(value) {
  return typeof value === 'string' ? value.normalize('NFC').replace(/\s+/gu, ' ').trim() : '';
}

const lengthOf = (text) => [...text].length;

export function nameProblem(name) {
  if (!name) {
    return 'Type your name.';
  }

  if (lengthOf(name) > NAME_LIMITS.maxLength) {
    return `A name can be at most ${NAME_LIMITS.maxLength} characters.`;
  }

  if (!NAME_CHARACTERS.test(name)) {
    return "A name can have letters, numbers, spaces and . ' _ -";
  }

  if (LINK.test(name)) {
    return 'A name cannot be a link.';
  }

  return isBlockedName(name) ? 'Pick another name.' : null;
}
