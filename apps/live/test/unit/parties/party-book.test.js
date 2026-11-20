import { describe, expect, it } from 'vitest';
import { createPartyBook } from '../../../src/parties/party-book.js';
import { MAX_MEMBERS } from '../../../src/parties/party-members.js';

const GAME = 'morodok-angkor';
const ids = Array.from({ length: 12 }, (_, i) => `player-${String(i).padStart(4, '0')}`);

function makeWith(book, playerId = ids[0]) {
  return book.make({ game: GAME, playerId, name: 'Dara' });
}

function joinAs(book, code, i) {
  return book.join({ game: GAME, code, playerId: ids[i], name: `Friend ${'ABCDEFGHIJKL'[i]}` });
}

describe('a party', () => {
  it('holds eight; a ninth is refused; the same player again is not a ninth', () => {
    const book = createPartyBook();
    const { code } = makeWith(book);
    for (let i = 1; i < MAX_MEMBERS; i++) {
      joinAs(book, code, i);
    }

    expect(() => joinAs(book, code, MAX_MEMBERS)).toThrow('full');

    const again = joinAs(book, code, 3);
    const party = book.state({ game: GAME, code, playerId: ids[3], key: again.key });
    expect(party.members).toHaveLength(MAX_MEMBERS);
  });

  it('belongs to its game: another game cannot find it', () => {
    const book = createPartyBook();
    const { code } = makeWith(book);

    expect(() => book.join({ game: 'kit-luy', code, playerId: ids[1], name: 'Vanna' })).toThrow(
      'no-party',
    );
  });

  it('needs the key for everything, and an old key stops when the player joins again', () => {
    const book = createPartyBook();
    const { code } = makeWith(book);
    const first = joinAs(book, code, 1);
    const ask = { game: GAME, code, playerId: ids[1] };

    expect(() => book.state({ ...ask, key: 'wrong' })).toThrow('not-member');
    expect(() => book.state({ ...ask, playerId: ids[2], key: first.key })).toThrow('not-member');

    const second = joinAs(book, code, 1);
    expect(() => book.state({ ...ask, key: first.key })).toThrow('not-member');
    expect(book.state({ ...ask, key: second.key }).code).toBe(code);
  });

  it('lets its maker remove a member for good, and nobody else', () => {
    const book = createPartyBook();
    const maker = makeWith(book);
    const vanna = joinAs(book, maker.code, 1);
    joinAs(book, maker.code, 2);
    const byVanna = { game: GAME, code: maker.code, playerId: ids[1], key: vanna.key };

    expect(() => book.remove({ ...byVanna, target: ids[2] })).toThrow('not-maker');

    book.remove({ game: GAME, code: maker.code, playerId: ids[0], key: maker.key, target: ids[2] });
    expect(() => joinAs(book, maker.code, 2)).toThrow('removed');
    expect(book.state(byVanna).members).toHaveLength(2);
  });

  it('passes to the longest-standing member when its maker leaves, and ends with the last', () => {
    let time = 1000;
    const book = createPartyBook({ now: () => time });
    const maker = makeWith(book);
    time += 10;
    const vanna = joinAs(book, maker.code, 1);
    time += 10;
    const sophea = joinAs(book, maker.code, 2);
    const askFor = (i, key) => ({ game: GAME, code: maker.code, playerId: ids[i], key });

    book.leave(askFor(0, maker.key));
    expect(book.state(askFor(1, vanna.key)).maker).toBe(ids[1]);

    book.leave(askFor(1, vanna.key));
    book.leave(askFor(2, sophea.key));
    expect(book.size()).toBe(0);
    expect(() => joinAs(book, maker.code, 3)).toThrow('no-party');
  });

  it('is forgotten after hours without use', () => {
    let time = 0;
    const book = createPartyBook({ now: () => time });
    const { code } = makeWith(book);

    time += 7 * 60 * 60 * 1000;
    book.sweep();

    expect(() => joinAs(book, code, 1)).toThrow('no-party');
  });
});
