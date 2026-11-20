import { randomBytes as cryptoRandomBytes } from 'node:crypto';
import {
  describeParty,
  findMember,
  joinParty,
  leaveParty,
  makeParty,
  removeMember,
} from './party-members.js';

const IDLE_MS = 6 * 60 * 60 * 1000;

// Parties live in memory only: nothing about a player is written down, and a restart forgets them.
export function createPartyBook({ now = Date.now, randomBytes = cryptoRandomBytes } = {}) {
  const book = { parties: new Map(), now, randomBytes };

  function state(ask) {
    const { code, party } = findMember(book, ask);

    return describeParty(code, party);
  }

  function sweep() {
    const before = now() - IDLE_MS;
    for (const [code, party] of book.parties) {
      if (party.used < before) {
        book.parties.delete(code);
      }
    }
  }

  return {
    make: (ask) => makeParty(book, ask),
    join: (ask) => joinParty(book, ask),
    leave: (ask) => leaveParty(book, ask),
    remove: (ask) => removeMember(book, ask),
    member: (ask) => findMember(book, ask),
    state,
    sweep,
    size: () => book.parties.size,
  };
}
