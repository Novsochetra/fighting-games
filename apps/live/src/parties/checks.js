import { PartyError } from './party-error.js';

const PLAYER_ID = /^[A-Za-z0-9_-]{8,64}$/;
const GAME_ID = /^[a-z0-9-]{2,40}$/;
const NAME_LETTERS = /^[\p{L}\p{M}\p{N} '.-]+$/u;
const PHONE_NUMBER = /\d{4,}/;
const LINK = /(www|http|\.com|\.kh|\.net)/i;
const STAFF = /(admin|moderator|\bmod\b|staff|official)/i;
const MIN_LETTERS = 2;
const MAX_LETTERS = 16;

// A player id is random, made on the device: no account, no personal data.
export function checkPlayerId(id) {
  if (typeof id !== 'string' || !PLAYER_ID.test(id)) {
    throw new PartyError(400, 'bad-id');
  }

  return id;
}

export function checkGame(game, games) {
  if (typeof game !== 'string' || !GAME_ID.test(game) || !games.includes(game)) {
    throw new PartyError(400, 'bad-game');
  }

  return game;
}

// Khmer letters are several code points each, so a name is counted in what a reader sees as letters.
function letterCount(text) {
  return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].length;
}

// The game checks the name first; this is the check a script outside the game cannot skip.
export function checkName(name) {
  if (typeof name !== 'string') {
    throw new PartyError(400, 'bad-name');
  }

  const tidy = name.normalize('NFC').trim().replace(/\s+/g, ' ');
  const count = letterCount(tidy);
  const digits = tidy.replace(/[\s.-]/g, '');
  const refused =
    count < MIN_LETTERS ||
    count > MAX_LETTERS ||
    !NAME_LETTERS.test(tidy) ||
    PHONE_NUMBER.test(digits) ||
    LINK.test(tidy) ||
    STAFF.test(tidy);

  if (refused) {
    throw new PartyError(400, 'bad-name');
  }

  return tidy;
}
