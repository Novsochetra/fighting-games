import { attackSign, goalOf, isInMouth, progressOf } from '../pitch.js';
import { opponentsOf } from '../squad.js';
import { distance, dot, normalized } from '../vector.js';

const LOOK = [40, 80];
const ROOM = 70;
const EDGE = 30;
// straight on, then turned about 30, 55 and 90 degrees either way, as shares of forward and across
const WAYS = [
  [1, 0],
  [1, 0.58],
  [1, -0.58],
  [1, 1.4],
  [1, -1.4],
  [0, 1],
  [0, -1],
];

const pointAt = (player, way, gap) => ({ x: player.x + way.x * gap, y: player.y + way.y * gap });

function roomOf(match, player, way) {
  let room = 1;

  for (const opponent of opponentsOf(match, player)) {
    for (const gap of LOOK) {
      room = Math.min(room, distance(pointAt(player, way, gap), opponent) / ROOM);
    }
  }

  return room;
}

// running the ball off the pitch, or into the goal line beside the posts, is no way to go
function edgeCost(match, player, way) {
  const { pitch } = match;
  const ahead = pointAt(player, way, LOOK[1]);
  const offSide = ahead.y < EDGE || ahead.y > pitch.width - EDGE;
  const offEnd = (ahead.x < EDGE || ahead.x > pitch.length - EDGE) && !isInMouth(match, ahead.y);

  return (offSide ? 1 : 0) + (offEnd ? 1.5 : 0);
}

// in the last third the carrier heads for goal, before it up the pitch
function forwardOf(match, player) {
  if (progressOf(match, player.team, player.x) > 0.66) {
    const goal = goalOf(match, player.team);

    return normalized(goal.x - player.x, goal.y - player.y);
  }

  return { x: attackSign(player.team), y: 0 };
}

// of a few ways round the opponents, the one with the most room that still goes forward
export function dribbleWayOf(match, player) {
  const forward = forwardOf(match, player);
  let best = forward;
  let bestScore = -Infinity;

  for (const [ahead, across] of WAYS) {
    const way = normalized(
      forward.x * ahead - forward.y * across,
      forward.y * ahead + forward.x * across,
    );
    const score =
      roomOf(match, player, way) * 1.4 +
      dot(way, forward) * 0.7 +
      dot(way, player.facing) * 0.3 -
      edgeCost(match, player, way);

    if (score > bestScore) {
      best = way;
      bestScore = score;
    }
  }

  return best;
}

export const roomAheadOf = (match, player) => roomOf(match, player, forwardOf(match, player));
