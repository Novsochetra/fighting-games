import { describe, expect, it } from 'vitest';
import { bestPassOf } from '../../../../src/sim/brains/pass-options.js';
import { holdBallAt, matchInPlay, only } from '../../../support/match-driver.js';

function setUp(places) {
  const match = matchInPlay(1, { humanTeam: null });
  const carrier = holdBallAt(match, { x: 800, y: 540 }, match.players[6]);

  only(match, [6, ...Object.keys(places).map(Number)]);

  for (const [index, place] of Object.entries(places)) {
    Object.assign(match.players[index], place, { vx: 0, vy: 0, stun: 0, noPickup: 0 });
  }

  return { match, carrier };
}

describe('the best pass', () => {
  it('goes forward to a free mate rather than back', () => {
    const { match, carrier } = setUp({ 2: { x: 500, y: 540 }, 9: { x: 1100, y: 560 } });

    expect(bestPassOf(match, carrier).target).toBe(9);
  });

  it('is none to a mate an opponent stands in front of', () => {
    const { match, carrier } = setUp({
      9: { x: 1000, y: 540 },
      17: { x: 900, y: 540 },
      16: { x: 1010, y: 560 },
    });

    expect(bestPassOf(match, carrier)).toBe(null);
  });

  it('goes in the air to a free mate far up the pitch', () => {
    const { match, carrier } = setUp({ 9: { x: 1450, y: 540 } });

    expect(bestPassOf(match, carrier)).toMatchObject({ target: 9, lofted: true });
  });

  it('leads a mate running in behind into the space ahead of them', () => {
    const { match, carrier } = setUp({
      9: { x: 1100, y: 540, run: 40, spot: { x: 1400, y: 540 } },
    });

    expect(bestPassOf(match, carrier).spot.x).toBeGreaterThan(1150);
  });
});
