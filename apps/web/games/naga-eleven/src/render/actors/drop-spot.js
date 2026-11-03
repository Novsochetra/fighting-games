import { BALL, PLAYER } from '../../data/tuning.js';
import { predictBall } from '../../sim/flight.js';

const isInFlight = (ball) => ball.z > 0 || ball.vz > 0;

// how high the ball's flight between two bounces goes, met or still to come: a ball on its way
// down has fallen from as high as it would climb from here going up
const peakOf = (ball) => ball.z + (ball.vz * ball.vz) / (2 * BALL.gravity);

// the first tick the ball is on the grass again: z + vz t - g t (t + 1) / 2 comes down to 0
export function ticksToLand(ball) {
  const rise = ball.vz - BALL.gravity / 2;

  return Math.max(
    1,
    Math.ceil((rise + Math.sqrt(rise * rise + 2 * BALL.gravity * ball.z)) / BALL.gravity),
  );
}

function predictedDrop(match) {
  const { ball } = match;
  const isLoose = (ball.owner ?? null) === null && (ball.inGoal ?? null) === null;

  if (
    match.phase !== 'play' ||
    !isLoose ||
    !isInFlight(ball) ||
    peakOf(ball) <= PLAYER.chestHeight
  ) {
    return null;
  }

  const ticks = ticksToLand(ball);
  const spot = predictBall(ball, ticks);

  return { x: spot.x, y: spot.y, ticks };
}

// where a high or bouncing loose ball comes down next and in how many ticks, { x, y, ticks }, or
// null for a ball held, rolling or skimming under the chest; the sim's own `match.dropSpot` when it
// keeps one, else foreseen here from the ball's flight
export function dropSpotOf(match) {
  return 'dropSpot' in match ? (match.dropSpot ?? null) : predictedDrop(match);
}
