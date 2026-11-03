import { describe, expect, it } from 'vitest';
import {
  challengeIntent,
  challengeSpotOf,
  isChallenging,
  isShadowing,
  shadowIntent,
  shadowSpotOf,
} from '../../../../src/sim/brains/hunting.js';
import { matchInPlay } from '../../../support/match-driver.js';

// the computer's centre forward hunts the player's, standing still in the computer's half
function huntingMatch() {
  const match = matchInPlay();
  const star = Object.assign(match.players[9], { x: 1200, y: 540, vx: 0, vy: 0 });
  const rival = Object.assign(match.players[20], { hunts: 'sochetra', x: 1500, y: 700 });
  const plan = { hunt: { hunter: rival.index, quarry: star.index }, pressers: [] };

  return { match, star, rival, plan };
}

describe('a rival shadowing the star he hunts', () => {
  it('waits goal side of him, between him and the goal the rival keeps', () => {
    const { match, star, rival } = huntingMatch();

    expect(shadowSpotOf(match, rival, star)).toEqual({ x: 1290, y: 540 });
  });

  it('waits where a star on the move is going, not where he was', () => {
    const { match, star, rival } = huntingMatch();

    Object.assign(star, { vx: 2, vy: 0 });

    expect(shadowSpotOf(match, rival, star).x).toBe(1330);
  });

  it('stays on the pitch by a star running along its edge', () => {
    const { match, star, rival } = huntingMatch();

    Object.assign(star, { x: 1790, y: 4, vx: 0, vy: -3 });

    const spot = shadowSpotOf(match, rival, star);

    expect(spot.y).toBeGreaterThanOrEqual(0);
    expect(spot.x).toBeLessThanOrEqual(match.pitch.length);
  });

  it('shadows him unless he is pressing the star on the ball', () => {
    const { match, rival, plan } = huntingMatch();

    expect(isShadowing(plan, rival)).toBe(true);
    expect(isShadowing(plan, match.players[18])).toBe(false);
    expect(isShadowing({ ...plan, pressers: [rival.index] }, rival)).toBe(false);
    expect(isShadowing({ hunt: null, pressers: [] }, rival)).toBe(false);
  });

  it('runs to him, sprinting from afar and easing in near', () => {
    const { match, star, rival, plan } = huntingMatch();
    const far = shadowIntent(match, rival, plan);

    expect(far.sprint).toBe(true);
    expect(far.move.x).toBeLessThan(0);
    expect(far.move.y).toBeLessThan(0);

    Object.assign(rival, { x: star.x + 100, y: star.y });

    expect(shadowIntent(match, rival, plan).sprint).toBe(false);
  });

  it('steps into the way the star faces once he has the ball, not only goal side of him', () => {
    const { match, star, rival, plan } = huntingMatch();

    Object.assign(star, { facing: { x: 0, y: 1 } });
    match.ball.owner = match.players[4].index;

    expect(isChallenging(match, plan, rival)).toBe(false);

    match.ball.owner = star.index;

    expect(isChallenging(match, plan, rival)).toBe(true);
    expect(isChallenging(match, plan, match.players[18])).toBe(false);
    expect(challengeSpotOf(match, star)).toEqual({ x: 1200, y: 564 });
  });

  it('sprints to that spot', () => {
    const { match, star, rival, plan } = huntingMatch();

    Object.assign(star, { facing: { x: -1, y: 0 } });
    match.ball.owner = star.index;

    const intent = challengeIntent(match, rival, plan);

    expect(intent.sprint).toBe(true);
    expect(intent.move.x).toBeLessThan(0);
    expect(intent.move.y).toBeLessThan(0);
  });
});
