const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const INITIALS_SIZE = 3;
const FIRST_INITIALS = ['A', 'A', 'A'];

export function readInitials(stored) {
  return typeof stored === 'string' && /^[A-Z]{3}$/.test(stored)
    ? [...stored]
    : [...FIRST_INITIALS];
}

// the letters wrap round, as on an arcade cabinet: up from A is B, down from A is Z
export function stepLetter(letter, step) {
  const at = LETTERS.indexOf(letter);

  return LETTERS[(((at + step) % LETTERS.length) + LETTERS.length) % LETTERS.length];
}

export function typedLetter(code) {
  const letter = /^Key([A-Z])$/.exec(code)?.[1];

  return letter ?? null;
}
