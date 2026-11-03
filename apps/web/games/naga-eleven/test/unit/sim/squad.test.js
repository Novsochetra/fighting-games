import { describe, expect, it } from 'vitest';
import { createMatch } from '../../../src/sim/create-match.js';
import {
  keeperOf,
  nearestOutfield,
  nearestTo,
  opponentsOf,
  outfieldOf,
  ownerOf,
  teammatesOf,
  teamSizeOf,
} from '../../../src/sim/squad.js';

describe('the squads of a match', () => {
  it('lines up each format’s players, keeper first, team 1 after team 0', () => {
    const seven = createMatch({ seed: 1, format: '7' });
    const eleven = createMatch({ seed: 1 });

    expect(teamSizeOf(seven)).toBe(7);
    expect(teamSizeOf(eleven)).toBe(11);
    expect(keeperOf(eleven, 1).index).toBe(11);
    expect(eleven.players.map((player) => player.index)).toEqual([...Array(22).keys()]);
  });

  it('finds mates, opponents, the outfield and the nearest', () => {
    const match = createMatch({ seed: 1 });
    const player = match.players[3];

    expect(teammatesOf(match, player)).toHaveLength(10);
    expect(opponentsOf(match, player).every((other) => other.team === 1)).toBe(true);
    expect(outfieldOf(match, 0).some((other) => other.role === 'keeper')).toBe(false);
    expect(nearestTo(match.players, match.players[7]).index).toBe(7);
    expect(nearestOutfield(match, 0).role).not.toBe('keeper');
  });

  it('knows who has the ball', () => {
    const match = createMatch({ seed: 1 });

    match.ball.owner = null;
    expect(ownerOf(match)).toBe(null);

    match.ball.owner = 4;
    expect(ownerOf(match).index).toBe(4);
  });
});
