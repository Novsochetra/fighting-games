import { describe, expect, it } from 'vitest';
import { crossOf } from '../../../../src/sim/brains/crossing.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

function crossesFrom(spot, { mateInBox = true } = {}) {
  let crosses = 0;

  for (let seed = 1; seed <= 40; seed += 1) {
    const match = matchInPlay(seed);
    const winger = holdBallAt(match, spot, match.players[8]);

    only(match, [8, 9]);
    Object.assign(match.players[9], mateInBox ? { x: 1650, y: 540 } : { x: 900, y: 540 }, {
      stun: 0,
    });

    const cross = crossOf(match, winger);

    if (cross) {
      expect(cross).toMatchObject({ kind: 'pass', target: 9, lofted: true });
      crosses += 1;
    }
  }

  return crosses;
}

describe('the computer crossing', () => {
  it('crosses from wide in the last third for a mate in the box, more at the byline', () => {
    const byline = crossesFrom({ x: 1760, y: 950 });
    const wide = crossesFrom({ x: 1450, y: 950 });

    expect(wide).toBeGreaterThan(0);
    expect(byline).toBeGreaterThan(wide);
  });

  it('never crosses from the middle, from deep or with nobody in the box', () => {
    expect(crossesFrom({ x: 1500, y: 540 })).toBe(0);
    expect(crossesFrom({ x: 900, y: 950 })).toBe(0);
    expect(crossesFrom({ x: 1760, y: 950 }, { mateInBox: false })).toBe(0);
  });
});
