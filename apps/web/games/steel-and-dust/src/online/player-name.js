// The server holds the same limits and has the last word (server/src/leaderboard/read-name.js);
// a test keeps them equal. A name is counted by code point, as the server counts it, and a Khmer
// name has many.
export const NAME_LIMITS = { maxLength: 20 };

const NAME_CHARACTERS = /^[\p{L}\p{M}\p{N} .'_-]+$/u;
const MAX_STORED_LENGTH = 200;

export function cleanName(value) {
  return typeof value === 'string' ? value.normalize('NFC').replace(/\s+/gu, ' ').trim() : '';
}

const lengthOf = (text) => [...text].length;

// what the post panel says before it sends a name the server would turn away; the words the server
// blocks are its own to know
export function nameProblem(name) {
  if (!name) {
    return 'Type your name.';
  }

  if (lengthOf(name) > NAME_LIMITS.maxLength) {
    return `A name can be at most ${NAME_LIMITS.maxLength} characters.`;
  }

  return NAME_CHARACTERS.test(name) ? null : "A name can have letters, numbers, spaces and . ' _ -";
}

export function readStoredName(stored) {
  return typeof stored === 'string' && stored.length <= MAX_STORED_LENGTH ? stored : '';
}
