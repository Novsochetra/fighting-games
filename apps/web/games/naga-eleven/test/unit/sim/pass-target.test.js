import { describe, expect, it } from 'vitest';
import { passTargetOf } from '../../../src/sim/pass-target.js';
import { holdBallAt, matchInPlay, only } from '../../support/match-driver.js';

function lineUp(match, places) {
  for (const [index, place] of Object.entries(places)) {
    Object.assign(match.players[index], place, { vx: 0, vy: 0, stun: 0, noPickup: 0 });
  }
}

const RIGHT = { x: 1, y: 0 };

describe('the mate the stick picks', () => {
  it('is the free one of two in the cone round the stick', () => {
    const match = matchInPlay(3);
    const passer = holdBallAt(match, { x: 600, y: 540 });

    only(match, [passer.index, 7, 10, 14]);
    lineUp(match, {
      10: { x: 850, y: 540 },
      7: { x: 820, y: 420 },
      14: { x: 800, y: 540 },
    });

    expect(passTargetOf(match, passer, RIGHT).index).toBe(7);
  });

  it('is the one along the stick rather than a free one off its line', () => {
    const match = matchInPlay(3);
    const passer = holdBallAt(match, { x: 600, y: 540 });

    only(match, [passer.index, 7, 10, 14]);
    lineUp(match, {
      10: { x: 850, y: 540 },
      7: { x: 700, y: 360 },
      14: { x: 880, y: 560 },
    });

    expect(passTargetOf(match, passer, RIGHT).index).toBe(10);
  });

  it('is, in the air, the one about as far as the pass was held for', () => {
    const match = matchInPlay(3);
    const passer = holdBallAt(match, { x: 300, y: 540 });

    only(match, [passer.index, 7, 10]);
    lineUp(match, { 7: { x: 600, y: 520 }, 10: { x: 1050, y: 560 } });

    expect(passTargetOf(match, passer, RIGHT, { lofted: true, power: 0.2 }).index).toBe(7);
    expect(passTargetOf(match, passer, RIGHT, { lofted: true, power: 0.9 }).index).toBe(10);
  });

  it('is the mate nearest the stick’s line when nobody stands in the cone', () => {
    const match = matchInPlay(3);
    const passer = holdBallAt(match, { x: 600, y: 540 });

    only(match, [passer.index, 7, 10]);
    lineUp(match, { 7: { x: 700, y: 380 }, 10: { x: 650, y: 420 } });

    expect(passTargetOf(match, passer, RIGHT).index).toBe(7);
  });
});
