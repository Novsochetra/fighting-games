import { describe, expect, it } from 'vitest';
import { duoPassOf } from '../../../src/sim/combos/duos.js';
import { holdBallAt, matchInPlay } from '../../support/match-driver.js';

// A winger at the goal line played a "Whip Cross" thirty metres back to Rafael near halfway, and
// Rafael struck the Carnival Bicycle from there: a duo's pass went backwards to a striker further
// from goal than the man who played it
function wingAtTheLine({ strikerAt }) {
  const match = matchInPlay(1);
  const wing = holdBallAt(match, { x: 1700, y: 700 }, match.players[8]);
  const sochetra = match.players[9];

  Object.assign(wing, { spirit: 100 });
  Object.assign(sochetra, { star: 'sochetra', moves: [], skill: null, spirit: 100, ...strikerAt });

  return { match, wing, sochetra };
}

describe('a duo’s pass', () => {
  it('is not laid back to a striker further from goal than the partner', () => {
    const { match, wing } = wingAtTheLine({ strikerAt: { x: 1300, y: 540 } });

    expect(duoPassOf(match, wing)).toBeNull();
  });

  it('still crosses to a striker nearer the goal', () => {
    const { match, wing, sochetra } = wingAtTheLine({ strikerAt: { x: 1620, y: 520 } });

    expect(duoPassOf(match, wing)).toMatchObject({
      duo: { move: 'kite-header' },
      striker: sochetra,
    });
  });
});
