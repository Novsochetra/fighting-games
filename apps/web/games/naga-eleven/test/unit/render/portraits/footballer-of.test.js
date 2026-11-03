import { describe, expect, it } from 'vitest';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { footballerAge, footballerOf } from '../../../../src/render/portraits/footballer-of.js';
import { createMatch } from '../../../../src/sim/create-match.js';

const matchOf = (home, away) =>
  createMatch({ seed: 3, humanTeam: 0, teams: [TEAMS[home], TEAMS[away]] });

const plain = (player) => !player.star;

describe('which footballer a plain player is', () => {
  it('is his side and place, in the kit his side has on in the match', () => {
    const match = matchOf('cambodia-youth', 'korea-youth');
    const korean = match.sides[1].filter(plain)[2];

    expect(footballerOf(korean, match)).toEqual({
      team: 'korea-youth',
      kit: 'korea',
      wear: 'away',
      place: korean.slotIndex,
    });
  });

  it('puts a keeper in the spare his side changes into when his own shirt clashes', () => {
    const match = matchOf('kampong-cham-high', 'battambang-high');
    const keeper = match.sides[1][0];

    expect(footballerOf(keeper, match)).toMatchObject({
      team: 'battambang-high',
      wear: 'keeper-0',
    });
  });

  it('falls back on his squad’s name and home kit with no match to read', () => {
    const match = matchOf('cambodia-youth', 'korea-youth');
    const [keeper, korean] = match.sides[1];

    expect(footballerOf(korean)).toEqual({
      team: 'korea-youth',
      kit: 'korea',
      wear: 'home',
      place: 1,
    });
    expect(footballerOf(keeper)).toMatchObject({ kit: 'korea', wear: 'keeper', place: 0 });
  });

  it('wears a plain kit on a side with no squad of its own', () => {
    const player = { id: 'p7', team: 1, index: 7, slotIndex: 2, role: 'defender', star: null };

    expect(footballerOf(player)).toEqual({
      team: 'side-1',
      kit: 'plain-1',
      wear: 'home',
      place: 2,
    });
  });

  it('is of the hero’s age, else the children’s in a 7-a-side and grown men’s in an 11', () => {
    expect(footballerAge('teen', { format: '7' })).toBe('teen');
    expect(footballerAge(null, { format: '7' })).toBe('child');
    expect(footballerAge(undefined, { format: '11' })).toBe('young');
    expect(footballerAge(null)).toBe('young');
  });
});
