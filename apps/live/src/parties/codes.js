import { PartyError } from './party-error.js';

// Friends read the code out to each other, so no letters that look alike: 0 / O, 1 / I / L.
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

const MAX_TRIES = 50;

export function makeCode(randomBytes, isTaken) {
  for (let i = 0; i < MAX_TRIES; i++) {
    const code = [...randomBytes(CODE_LENGTH)]
      .map((byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length])
      .join('');

    if (!isTaken(code)) {
      return code;
    }
  }

  throw new PartyError(503, 'busy');
}

export function normalizeCode(code) {
  if (typeof code !== 'string') {
    throw new PartyError(400, 'bad-code');
  }

  const typed = code.toUpperCase().replace(/[\s-]/g, '');
  const fits = typed.length === CODE_LENGTH && [...typed].every((ch) => CODE_ALPHABET.includes(ch));
  if (!fits) {
    throw new PartyError(400, 'bad-code');
  }

  return typed;
}
