import { KEEPER } from '../../data/tuning.js';
import { speedOf } from '../ball.js';
import { attackSign, inBoxOf, midY, ownGoalLineOf, ownGoalOf } from '../pitch.js';
import { byStat, keeperReachOf } from '../stats.js';
import { clamp, directionTo, distance } from '../vector.js';
import { distributeIntent } from './distribution.js';
import { interceptOf, kick, runTo, standStill } from './steering.js';

const POST_GAP = 6;
const SHOT_SPEED = 4;
const SHOT_TICKS = 60;
const NEAR = 220;
const FAR = 500;

// on the line from the goal's middle to the ball, off it to narrow the angle as the ball comes
// near, and further off, sweeping, while it is far away
function guardSpot(match, player) {
  const goal = ownGoalOf(match, player.team);
  const gap = distance(goal, match.ball);
  const out = KEEPER.line + Math.max(0, NEAR - gap) * 0.06 + clamp(gap - FAR, 0, 600) * 0.06;
  const way = directionTo(goal, match.ball);
  const half = match.goal.width / 2 - POST_GAP;
  const sign = attackSign(player.team);

  return {
    x: goal.x + sign * Math.max(KEEPER.line * 0.5, Math.abs(way.x) * out),
    y: clamp(goal.y + way.y * out, midY(match) - half, midY(match) + half),
  };
}

// a keeper sees a shot only a moment after it is struck, a good one sooner, and reads some
// shots quicker than others; till then they stand set where they are
function hasSeen(match, keeper) {
  const { ball } = match;

  if (ball.kick !== 'shot' || ball.lastTouch === null) {
    return true;
  }

  const reaction = byStat(KEEPER.reaction, keeper.stats.keeping) + (ball.read ?? 0);

  return match.tick - match.players[ball.lastTouch].lastKick >= reaction;
}

// where a ball running at the goal will cross the line, and when, or null for one that is not
function incomingOf(match, team) {
  const { ball } = match;
  const line = ownGoalLineOf(match, team);
  const ticks = ball.vx === 0 ? Infinity : (line - ball.x) / ball.vx;
  const y = ball.y + ball.vy * ticks;
  const onTarget = Math.abs(y - midY(match)) < match.goal.width / 2 + 30;

  return ball.owner === null &&
    speedOf(ball) > SHOT_SPEED &&
    ticks > 0 &&
    ticks < SHOT_TICKS &&
    onTarget
    ? { y, ticks }
    : null;
}

// across the line to where the shot will cross it, and a dive at the last when it is out of reach
function saveIntent(match, player, shot) {
  const line = ownGoalLineOf(match, player.team);
  const half = match.goal.width / 2 + POST_GAP;
  const spot = {
    x: line + attackSign(player.team) * KEEPER.line,
    y: clamp(shot.y, midY(match) - half, midY(match) + half),
  };
  const off = shot.y - player.y;

  if (shot.ticks < KEEPER.diveFrom && Math.abs(off) > keeperReachOf(player, match.goal) * 0.7) {
    return kick({ kind: 'dive', side: Math.sign(off) });
  }

  return runTo(player, spot, true);
}

// a loose ball in the box the keeper gets to before anyone of the other side is theirs to claim
function shouldClaim(match, player) {
  if (match.ball.owner !== null) {
    return false;
  }

  const mine = interceptOf(match, player);

  return (
    inBoxOf(match, player.team, mine) &&
    match.sides[1 - player.team].every((other) => interceptOf(match, other).ticks > mine.ticks)
  );
}

export function keeperIntent(match, player) {
  if (match.ball.owner === player.index) {
    return distributeIntent(match, player);
  }

  if (player.dive) {
    return standStill();
  }

  const shot = incomingOf(match, player.team);

  if (shot) {
    return hasSeen(match, player) ? saveIntent(match, player, shot) : standStill();
  }

  if (shouldClaim(match, player)) {
    return runTo(player, interceptOf(match, player), true);
  }

  const spot = guardSpot(match, player);

  return runTo(player, spot, distance(player, spot) > 40);
}

export function startDive(match, player, { side }) {
  player.dive = { tick: match.tick, side };
  player.vx = 0;
  player.vy = side * KEEPER.diveSpeed;
}
