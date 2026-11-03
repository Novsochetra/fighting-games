import { describe, expect, it } from 'vitest';
import { cornerGoers, cornerSpotOf } from '../../../src/sim/corner-spots.js';
import { startRestart } from '../../../src/sim/restart-setup.js';
import { looseBallAt, matchInPlay } from '../../support/match-driver.js';

function cornerFor(format) {
  const match = matchInPlay(3, { format, humanTeam: null });

  looseBallAt(match, {
    x: match.pitch.length + 8,
    y: 60,
    vx: 2,
    lastTouch: match.sides[1][2].index,
  });
  startRestart(match);

  return match;
}

describe('a corner', () => {
  it('sends up the forwards, the midfielders and in 11 v 11 the centre backs, never the taker', () => {
    const match = cornerFor('11');
    const goers = cornerGoers(match, 0);
    const roles = goers.map((player) => player.role);

    expect(goers.map((player) => player.index)).not.toContain(match.restart.taker);
    expect(roles.slice(0, 2)).toEqual(['forward', 'forward']);
    expect(roles).toContain('defender');
    expect(cornerGoers(cornerFor('7'), 0).every((player) => player.role !== 'defender')).toBe(true);
  });

  it('stands each goer on a spot of the box and the keeper of the other side on their line', () => {
    const match = cornerFor('11');
    const keeper = cornerSpotOf(match, match.players[11]);

    for (const goer of cornerGoers(match, 0)) {
      expect(cornerSpotOf(match, goer).x).toBeGreaterThan(match.pitch.length - 320);
    }

    expect(keeper.x).toBeGreaterThan(match.pitch.length - 20);
    expect(cornerSpotOf(match, match.players[1])).toBe(null);
  });
});
