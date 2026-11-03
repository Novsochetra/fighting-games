import { describe, expect, it } from 'vitest';
import {
  hero,
  member,
  starPlayer,
  statsOf,
  team,
  withSpirit,
} from '../../../../src/data/teams/squad.js';

const STATS = [1, 2, 3, 4, 5, 6, 7];

describe('the squad helpers', () => {
  it('read a stat line in README order', () => {
    expect(statsOf(STATS)).toEqual({
      speed: 1,
      shot: 2,
      pass: 3,
      dribble: 4,
      tackle: 5,
      keeping: 6,
      stamina: 7,
    });
  });

  it('make a star from the cast, named as the cast names them', () => {
    expect(starPlayer('dara', 1, STATS, ['angkor-wall'])).toMatchObject({
      id: 'dara',
      star: 'dara',
      name: { en: 'Dara', km: 'ដារ៉ា' },
      moves: ['angkor-wall'],
    });
  });

  it('give a rival a gauge of his own, the rest of him as he was', () => {
    const rival = starPlayer('haruto', 10, STATS, ['silent-moon']);

    expect(withSpirit(rival, 170)).toEqual({ ...rival, spiritMax: 170 });
    expect(rival.spiritMax).toBeUndefined();
  });

  it('place each player in the role of their slot, with an id from the team and number', () => {
    const side = team({
      id: 'test-side',
      name: { en: 'Test', km: 'តេស្ត' },
      short: 'TST',
      format: '7',
      players: [
        member('Keeper', 1, STATS),
        ...[2, 3, 4, 5, 6].map((number) => member(`Player ${number}`, number, STATS)),
        hero(),
      ],
    });

    expect(side.kit).toBe('test-side');
    expect(side.players[0]).toMatchObject({ id: 'test-side-1', role: 'keeper', star: null });
    expect(side.players[6]).toMatchObject({ id: 'sochetra', role: 'forward', hero: true });
  });
});
