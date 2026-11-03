import { describe, expect, it } from 'vitest';
import { KEEPER } from '../../../src/data/tuning.js';
import { keeperInHands, updateAim } from '../../../src/sim/keeper-aim.js';
import { holdBallAt, matchInPlay, only } from '../../support/match-driver.js';

function keeperAiming(options) {
  const match = matchInPlay(5, options);
  const keeper = holdBallAt(match, { x: 40, y: 540 }, match.players[0]);

  only(match, [0, 2, 9]);
  Object.assign(match.players[2], { x: 250, y: 800, stun: 0 });
  Object.assign(match.players[9], { x: 500, y: 300, stun: 0 });
  match.controlled = keeper.index;

  return { match, keeper };
}

const aimDown = (match) =>
  Object.assign(match.input.sources.keys.held, { down: true, right: true });

describe('the aim of the player’s keeper', () => {
  it('marks the mate in the cone of the stick', () => {
    const { match } = keeperAiming();

    aimDown(match);
    updateAim(match);

    expect(match.aimTarget).toBe(2);
  });

  it('marks nobody while the stick points nowhere, or the ball is not his', () => {
    const { match } = keeperAiming();

    updateAim(match);
    expect(match.aimTarget).toBe(null);

    aimDown(match);
    match.ball.owner = null;
    updateAim(match);
    expect(match.aimTarget).toBe(null);
  });

  it('marks nobody in a match the computer plays both sides of', () => {
    const { match } = keeperAiming({ humanTeam: null });

    aimDown(match);
    updateAim(match);

    expect(match.aimTarget).toBe(null);
  });

  it('keeps him standing where he holds it, facing the stick, and lets him play it out himself when left', () => {
    const { match, keeper } = keeperAiming();
    const stick = { x: 0, y: 1 };

    expect(keeperInHands(match, keeper, { stick, action: null })).toMatchObject({
      move: { x: 0, y: 0 },
    });
    expect(keeper.facing).toEqual(stick);

    keeper.holding = KEEPER.humanHold + 1;

    expect(keeperInHands(match, keeper, { stick, action: null }).action).not.toBe(null);
  });
});
