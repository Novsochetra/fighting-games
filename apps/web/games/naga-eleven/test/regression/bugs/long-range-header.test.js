import { describe, expect, it } from 'vitest';
import { duoPassOf } from '../../../src/sim/combos/duos.js';
import { holdBallAt, matchInPlay } from '../../support/match-driver.js';

// Sochetra met a winger's Kite Header cross 45 metres from goal and headed it in from there: a duo
// struck with the head or an overhead kick took the range of a special shot
function crossFrom(wingAt, strikerAt) {
  const match = matchInPlay(1);
  const wing = holdBallAt(match, wingAt, match.players[8]);
  const sochetra = match.players[9];

  Object.assign(wing, { spirit: 100 });
  Object.assign(sochetra, { star: 'sochetra', moves: [], skill: null, spirit: 100, ...strikerAt });

  return { match, wing, sochetra };
}

describe('a headed duo', () => {
  it('is not met two fifths of the pitch out', () => {
    const { match, wing } = crossFrom({ x: 1000, y: 800 }, { x: 1100, y: 540 });

    expect(duoPassOf(match, wing)).toBeNull();
  });

  it('is met at the edge of the box', () => {
    const { match, wing, sochetra } = crossFrom({ x: 1450, y: 900 }, { x: 1520, y: 540 });

    expect(duoPassOf(match, wing)).toMatchObject({
      duo: { move: 'kite-header' },
      striker: sochetra,
    });
  });
});
