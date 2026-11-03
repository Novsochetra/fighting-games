import { AI } from '../../data/tuning.js';
import { homeSpot } from '../formation.js';
import { ownGoalOf, progressOf, xAtProgress } from '../pitch.js';
import { directionTo, distance, lerp } from '../vector.js';
import { pressIntent } from './pressing.js';
import { runTo } from './steering.js';

const COVER_GAP = 70;

const toward = (from, direction, gap) => ({
  x: from.x + direction.x * gap,
  y: from.y + direction.y * gap,
});

// goal side of the man, a step toward the ball to cut the pass to him, tighter near goal
function markSpot(match, player, mark) {
  const home = homeSpot(match, player);
  const toGoal = directionTo(mark, ownGoalOf(match, player.team));
  const toBall = directionTo(mark, match.ball);
  const goalSide = toward(toward(mark, toGoal, AI.markGap), toBall, 8);
  const tight = progressOf(match, player.team, mark.x) < 0.4 ? 0.85 : 0.55;

  return { x: lerp(home.x, goalSide.x, tight), y: lerp(home.y, goalSide.y, tight) };
}

// a defender never steps up past the back line unless the man they mark drops off it
function holdLine(match, player, spot, plan) {
  if (player.role !== 'defender') {
    return spot;
  }

  const line = progressOf(match, player.team, plan.line);
  const along = Math.min(progressOf(match, player.team, spot.x), line + 0.03);

  return { x: xAtProgress(match, player.team, along), y: spot.y };
}

export function defensivePlaceOf(match, player, plan) {
  if (plan.cover === player.index) {
    const presser = match.players[plan.pressers[0]];

    return toward(presser, directionTo(presser, ownGoalOf(match, player.team)), COVER_GAP);
  }

  const mark = plan.marks[player.index];
  const spot =
    mark === undefined ? homeSpot(match, player) : markSpot(match, player, match.players[mark]);

  return holdLine(match, player, spot, plan);
}

export function defendIntent(match, player, plan) {
  const press = plan.pressers.indexOf(player.index);

  if (press >= 0) {
    return pressIntent(match, player, press === 0);
  }

  const spot = defensivePlaceOf(match, player, plan);

  return runTo(player, spot, distance(player, spot) > AI.sprintFrom * 1.5);
}
