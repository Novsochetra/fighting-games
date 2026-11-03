import { describe, expect, it } from 'vitest';
import { duoPassOf, duoStrikeOf, strikeDuosOf } from '../../../../src/sim/combos/duos.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

// Sochetra in range of the goal, his gauge full, and the mates the duos name about him
function duoMatch({ systems, rithyAt = 1350, moves = ['twin-naga'] } = {}) {
  const match = matchInPlay(1, systems ? { systems } : {});
  const sochetra = holdBallAt(match, { x: 1400, y: 540 }, match.players[9]);

  Object.assign(sochetra, { star: 'sochetra', moves, skill: null, spirit: 100 });
  Object.assign(match.players[7], {
    star: 'rithy',
    moves: ['preah-khan-strike'],
    x: rithyAt,
    y: 600,
    spirit: 100,
  });
  Object.assign(match.players[8], { x: 1300, y: 900, spirit: 100 });

  return { match, sochetra, rithy: match.players[7], wing: match.players[8] };
}

describe('a duo', () => {
  it('struck by two: Sochetra with the ball and Rithy near, both with their shares', () => {
    const { match, sochetra } = duoMatch();

    expect(
      strikeDuosOf(match, sochetra).map(({ duo, partner }) => [duo.move, partner.index]),
    ).toEqual([['twin-naga', 7]]);
  });

  it('needs the partner within its reach, the striker to know it, and the story to have it', () => {
    const far = duoMatch({ rithyAt: 800 });

    expect(strikeDuosOf(far.match, far.sochetra)).toEqual([]);

    const unknown = duoMatch({ moves: ['naga-shot'] });
    const off = duoMatch({ systems: { duos: [] } });

    expect(strikeDuosOf(unknown.match, unknown.sochetra)).toEqual([]);
    expect(strikeDuosOf(off.match, off.sochetra)).toEqual([]);
  });

  it('played in by the partner: a winger’s pass to Sochetra in reach is the Kite Header', () => {
    const { match, wing, sochetra } = duoMatch();

    expect(duoPassOf(match, wing)).toMatchObject({
      duo: { move: 'kite-header' },
      striker: sochetra,
    });

    wing.spirit = 10;
    expect(duoPassOf(match, wing)).toBeNull();
  });

  it('is the striker’s to strike first time while the ball is still the partner’s pass', () => {
    const { match, sochetra, wing } = duoMatch();

    match.duoPass = { move: 'kite-header', striker: 9, partner: 8, tick: match.tick };
    match.ball.lastTouch = 8;
    expect(duoStrikeOf(match, sochetra)).toMatchObject({
      duo: { move: 'kite-header' },
      partner: wing,
    });

    match.ball.lastTouch = 14;
    expect(duoStrikeOf(match, sochetra)).toBeNull();
  });
});
