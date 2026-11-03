import { describe, expect, it } from 'vitest';
import { passTargetOf } from '../../../src/sim/passing.js';
import { holdBallAt, matchInPlay, only } from '../../support/match-driver.js';

// a mate near the passer but well off the stick's line was picked over the one the stick pointed
// at, and a held pass went to a mate further off the line because he stood further away
function lineUp(match, places) {
  for (const [index, place] of Object.entries(places)) {
    Object.assign(match.players[index], place, { vx: 0, vy: 0, stun: 0, noPickup: 0 });
  }
}

const RIGHT = { x: 1, y: 0 };

describe('the mate a pass goes to', () => {
  it('is the one the stick points at, not a nearer one well off its line', () => {
    const match = matchInPlay(2);
    const passer = holdBallAt(match, { x: 600, y: 500 });

    only(match, [passer.index, 4, 10, 13]);
    lineUp(match, { 4: { x: 630, y: 448 }, 10: { x: 1020, y: 500 }, 13: { x: 1060, y: 500 } });

    expect(passTargetOf(match, passer, RIGHT).index).toBe(10);
  });

  it('is, for a held pass, the one along the stick, not a further one off its line', () => {
    const match = matchInPlay(2);
    const passer = holdBallAt(match, { x: 400, y: 540 });

    only(match, [passer.index, 7, 10]);
    lineUp(match, { 10: { x: 850, y: 540 }, 7: { x: 1055, y: 81 } });

    expect(passTargetOf(match, passer, RIGHT, { lofted: true, power: 0.5 }).index).toBe(10);
  });

  // a long ball went to a freer mate 30 degrees off the stick because he stood about as far as
  // the pass was held for, though the player pointed straight at another
  it('is the one within ten degrees of the stick, not a freer one further off it', () => {
    const match = matchInPlay(2);
    const passer = holdBallAt(match, { x: 400, y: 540 });

    only(match, [passer.index, 8, 10, 14]);
    lineUp(match, { 10: { x: 850, y: 580 }, 8: { x: 950, y: 240 }, 14: { x: 910, y: 580 } });

    expect(passTargetOf(match, passer, RIGHT, { lofted: true, power: 0.62 }).index).toBe(10);
  });
});
