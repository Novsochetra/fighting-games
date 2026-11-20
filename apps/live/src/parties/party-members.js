import { timingSafeEqual } from 'node:crypto';
import { checkName, checkPlayerId } from './checks.js';
import { makeCode, normalizeCode } from './codes.js';
import { PartyError } from './party-error.js';

export const MAX_MEMBERS = 8;

const KEY_BYTES = 24;

function sameKey(kept, given) {
  if (typeof given !== 'string' || given.length !== kept.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(kept), Buffer.from(given));
}

function newKey(book) {
  return book.randomBytes(KEY_BYTES).toString('base64url');
}

function partyOf(book, { game, code }) {
  const party = book.parties.get(normalizeCode(code));
  if (!party || party.game !== game) {
    throw new PartyError(404, 'no-party');
  }

  return party;
}

export function findMember(book, ask) {
  const party = partyOf(book, ask);
  const member = party.members.get(checkPlayerId(ask.playerId));
  if (!member || !sameKey(member.key, ask.key)) {
    throw new PartyError(403, 'not-member');
  }

  party.used = book.now();

  return { code: normalizeCode(ask.code), party, member };
}

export function makeParty(book, { game, playerId, name }) {
  checkPlayerId(playerId);
  const member = { name: checkName(name), key: newKey(book), joined: book.now() };

  const code = makeCode(book.randomBytes, (taken) => book.parties.has(taken));
  book.parties.set(code, {
    game,
    maker: playerId,
    members: new Map([[playerId, member]]),
    removed: new Set(),
    used: book.now(),
  });

  return { code, key: member.key };
}

// The same player again (a reload, a second tab) gets a new key and the old one stops working.
export function joinParty(book, ask) {
  const party = partyOf(book, ask);

  if (party.removed.has(checkPlayerId(ask.playerId))) {
    throw new PartyError(403, 'removed');
  }

  const earlier = party.members.get(ask.playerId);
  if (!earlier && party.members.size >= MAX_MEMBERS) {
    throw new PartyError(409, 'full');
  }

  const key = newKey(book);
  const name = checkName(ask.name);
  party.members.set(ask.playerId, { name, key, joined: earlier?.joined ?? book.now() });
  party.used = book.now();

  return { code: normalizeCode(ask.code), key };
}

function longestStanding(members) {
  return [...members].reduce((oldest, entry) =>
    entry[1].joined < oldest[1].joined ? entry : oldest,
  )[0];
}

export function leaveParty(book, ask) {
  const { code, party } = findMember(book, ask);
  party.members.delete(ask.playerId);

  if (party.members.size === 0) {
    book.parties.delete(code);
  } else if (party.maker === ask.playerId) {
    party.maker = longestStanding(party.members);
  }

  return code;
}

// A removed player can't come back into that party; a new party is a new code from a friend.
export function removeMember(book, ask) {
  const { code, party } = findMember(book, ask);
  if (party.maker !== ask.playerId) {
    throw new PartyError(403, 'not-maker');
  }

  if (checkPlayerId(ask.target) === ask.playerId) {
    throw new PartyError(400, 'bad-id');
  }

  party.members.delete(ask.target);
  party.removed.add(ask.target);

  return code;
}

export function describeParty(code, party) {
  return {
    code,
    maker: party.maker,
    members: [...party.members].map(([id, member]) => ({ id, name: member.name })),
    max: MAX_MEMBERS,
  };
}
