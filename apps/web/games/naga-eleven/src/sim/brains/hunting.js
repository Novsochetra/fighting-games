import { AI } from '../../data/tuning.js';
import { insidePitch, ownGoalOf } from '../pitch.js';
import { directionTo, distance } from '../vector.js';
import { pressIntent } from './pressing.js';
import { runTo } from './steering.js';

// in world units: far enough off the star that his mates still see him free to pass to and the
// two do not look tied together, near enough to be on him as the ball arrives
const SHADOW_GAP = 90;
// a star on the move is shadowed where he will be this many ticks on: a hunter who ran to where
// the star stood was always a step behind him when the ball came
const LEAD_TICKS = 20;
// in world units, inside a duel's reach (DUELS.range)
const CHALLENGE_GAP = 24;

// a hunter whose star has the ball closes him down as his side's first presser instead
export const isShadowing = (plan, player) =>
  plan.hunt?.hunter === player.index && !plan.pressers.includes(player.index);

export const isChallenging = (match, plan, player) =>
  plan.hunt?.hunter === player.index && match.ball.owner === plan.hunt.quarry;

export function shadowSpotOf(match, hunter, quarry) {
  const ahead = { x: quarry.x + quarry.vx * LEAD_TICKS, y: quarry.y + quarry.vy * LEAD_TICKS };
  const toGoal = directionTo(ahead, ownGoalOf(match, hunter.team));

  return insidePitch(match, {
    x: ahead.x + toGoal.x * SHADOW_GAP,
    y: ahead.y + toGoal.y * SHADOW_GAP,
  });
}

export const challengeSpotOf = (match, quarry) =>
  insidePitch(match, {
    x: quarry.x + quarry.facing.x * CHALLENGE_GAP,
    y: quarry.y + quarry.facing.y * CHALLENGE_GAP,
  });

// the hunter steps into the way the star faces rather than goal side of him, as a presser does: a
// duel is met only in front of the carrier, and a star who had turned with the ball had his
// hunter at his back until he passed it
export function challengeIntent(match, player, plan) {
  const spot = challengeSpotOf(match, match.players[plan.hunt.quarry]);
  const { action } = pressIntent(match, player, true);

  return { ...runTo(player, spot, true), action };
}

// goal side of the star whether the hunter's side has the ball or not: one who went forward with
// his side's attacks was never back in time to meet the star when the ball came to him
export function shadowIntent(match, player, plan) {
  const spot = shadowSpotOf(match, player, match.players[plan.hunt.quarry]);

  return runTo(player, spot, distance(player, spot) > AI.sprintFrom / 2);
}
