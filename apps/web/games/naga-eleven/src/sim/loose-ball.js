import { BALL, PLAYER } from '../data/tuning.js';
import { predictBall } from './flight.js';

const LOOK_AHEAD = 120;
const EDGE = 10;

const isUp = (ball) => ball.z > 0 || ball.vz > 0;

const isOnPitch = ({ pitch }, spot) =>
  spot.x > -EDGE && spot.x < pitch.length + EDGE && spot.y > -EDGE && spot.y < pitch.width + EDGE;

// a ball nobody has and nobody was played: off a keeper, a block, a clearance, a header or a
// tackle; a shot on its way is the keeper's
export const isLoose = (match) =>
  match.phase === 'play' &&
  match.ball.owner === null &&
  match.ball.inGoal === null &&
  match.ball.kick !== 'shot' &&
  !match.players.some((player) => player.receiving > 0);

// where a ball in the air, loose or a long pass, comes down to head height and in how many ticks,
// for the view to mark; null for a ball on the grass, a shot, or one coming down off the pitch
export function dropOf(match) {
  const { ball } = match;

  if (match.phase !== 'play' || ball.owner !== null || ball.kick === 'shot' || !isUp(ball)) {
    return null;
  }

  for (let ticks = 0; ticks <= LOOK_AHEAD; ticks += 1) {
    const spot = predictBall(ball, ticks);
    const falling = ball.vz - BALL.gravity * ticks <= 0;

    if (falling && spot.z < PLAYER.headHeight) {
      return isOnPitch(match, spot) ? { x: spot.x, y: spot.y, ticks } : null;
    }
  }

  return null;
}

export function updateDropSpot(match) {
  match.dropSpot = dropOf(match);
}
