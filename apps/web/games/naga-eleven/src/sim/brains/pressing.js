import { AI, TACKLE } from '../../data/tuning.js';
import { passTargetOf } from '../pass-target.js';
import { ownGoalOf } from '../pitch.js';
import { chance } from '../random.js';
import { ownerOf } from '../squad.js';
import { shareOf } from '../stats.js';
import { clamp, directionTo, distance, dot } from '../vector.js';
import { runTo } from './steering.js';

const SECOND_GAP = 30;

const toward = (from, direction, gap) => ({
  x: from.x + direction.x * gap,
  y: from.y + direction.y * gap,
});

const isSteered = (match, carrier) => carrier.index === match.controlled;

// anyone who has just won the ball, or just ridden a tackle, gets a moment before the next one
// comes in, so the ball does not change sides on every tick of a scramble; the player gets a
// longer one, and is gone in on a little less than the computer goes in on itself; one who stands
// on the ball to run the clock down gets no moment at all, and is gone in on harder
function keennessOn(match, carrier) {
  const human = isSteered(match, carrier) ? AI.humanKeenness : 1;

  if (standsStill(match)) {
    return human * AI.standKeenness;
  }

  if (carrier.respite > 0 || carrier.holding < AI.takeGraceTicks) {
    return 0;
  }

  return isSteered(match, carrier) && carrier.holding < AI.graceTicks ? 0 : human;
}

// a slide or a tackle on the feet goes where the tackler faces, so they wait to face the ball
function tackleOf(match, player, keenness) {
  const gap = distance(player, match.ball);
  const facing = dot(player.facing, directionTo(player, match.ball)) > AI.tackleFacing;
  const eager = keenness * keennessOn(match, ownerOf(match)) * (0.5 + shareOf(player.stats.tackle));

  if (!facing || gap >= AI.tackleRange || player.recover > 0 || eager === 0) {
    return null;
  }

  if (gap < TACKLE.challengeReach && chance(match.random, AI.challengeChance * eager)) {
    return { kind: 'challenge' };
  }

  return chance(match.random, AI.slideChance * eager) ? { kind: 'tackle' } : null;
}

// a carrier on the move is jockeyed from a step off, too far to be dribbled past; one who
// stands on the ball is stepped in on, near enough for a tackle on the feet
function standsStill(match) {
  const carrier = ownerOf(match);

  return Boolean(carrier) && carrier.still > AI.standTicks;
}

// the second presser steps into the way of the pass the carrier faces, so a side that only ever
// plays it on first time still has its passes read and cut out now and then
function laneSpot(match, carrier) {
  const mate = passTargetOf(match, carrier, carrier.facing);

  if (!mate) {
    return null;
  }

  const gap = distance(carrier, mate);

  return toward(
    carrier,
    directionTo(carrier, mate),
    clamp(gap * 0.45, AI.laneGap[0], AI.laneGap[1]),
  );
}

// the first presser closes the carrier down from the goal side; the second cuts out the pass he
// faces, or comes in from the side he is on
function pressSpot(match, player, first) {
  const { ball } = match;
  const toGoal = directionTo(ball, ownGoalOf(match, player.team));

  if (first) {
    return toward(ball, toGoal, standsStill(match) ? AI.closeGap : AI.jockeyGap);
  }

  const lane = laneSpot(match, ownerOf(match));

  if (lane) {
    return lane;
  }

  const side = (player.x - ball.x) * toGoal.y - (player.y - ball.y) * toGoal.x > 0 ? 1 : -1;
  const across = { x: -toGoal.y * side, y: toGoal.x * side };

  return toward(toward(ball, toGoal, SECOND_GAP * 0.8), across, SECOND_GAP);
}

// a presser by a carrier who stands on the ball turns to face it: one still facing the way they
// came would stand beside him all match and never go in
export function pressIntent(match, player, first) {
  const spot = pressSpot(match, player, first);
  const intent = runTo(player, spot, distance(player, spot) > AI.sprintFrom);

  if (standsStill(match) && distance(player, match.ball) < AI.tackleRange) {
    intent.face = directionTo(player, match.ball);
  }

  intent.action = tackleOf(match, player, first ? 1 : 0.5);

  return intent;
}
