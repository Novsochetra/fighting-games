import { BALL, KICK, PLAYER } from '../data/tuning.js';
import { clamp, lerp } from './vector.js';

const MOST_TICKS = 240;

// the drag's powers, multiplied out once rather than taken with Math.pow, which need not round
// the same on every machine
function sumsOf(drag) {
  const sums = [0];
  let power = 1;

  for (let i = 1; i <= MOST_TICKS; i += 1) {
    power *= drag;
    sums.push(sums[i - 1] + power);
  }

  return sums;
}

const AIR = sumsOf(BALL.airDrag);
const ROLL = sumsOf(BALL.rollDrag);

const fallOf = (ticks) => (BALL.gravity * ticks * (ticks + 1)) / 2;

const isFlying = (ball) => ball.z > 0 || ball.vz > 0;

// struck at this speed along the grass it reaches `distance` slowing to passArrival
export const groundSpeedFor = (distance) =>
  clamp(
    KICK.passArrival + (distance * (1 - BALL.rollDrag)) / BALL.rollDrag,
    KICK.passMin,
    KICK.passMax,
  );

export const loftTicksFor = (distance) =>
  Math.round(lerp(KICK.loftTicks[0], KICK.loftTicks[1], clamp(distance / KICK.loftReach[1], 0, 1)));

// the strike that carries the ball `distance` in `ticks` of flight, coming down to `height`
export function loftFor(distance, ticks, height = 0) {
  const flight = clamp(Math.round(ticks), 1, MOST_TICKS);

  return { speed: distance / AIR[flight], lift: (height + fallOf(flight)) / flight };
}

// how many ticks a ball struck in the air at `speed` takes to cover `distance`
export function ticksToCover(speed, distance) {
  let ticks = 1;

  while (ticks < MOST_TICKS && speed * AIR[ticks] < distance) {
    ticks += 1;
  }

  return ticks;
}

// the lift that brings a ball struck at `speed` over `distance` to `height` as it gets there
export function liftFor(speed, distance, height) {
  const ticks = ticksToCover(speed, distance);

  return (height + fallOf(ticks)) / ticks;
}

// a ball climbing past the chest is going over an outfield player, who can only meet it on its
// way down; a lofted pass is chipped, over a man right in front of the kick too, and only a low
// bounce of it can be met as it rises
export function climbsOutOfReach({ z, vz, kick }) {
  if (vz <= 0) {
    return false;
  }

  if (kick !== 'pass') {
    return z > PLAYER.chestHeight;
  }

  return z > PLAYER.reachHeight || vz > KICK.chipRise;
}

// where the ball will be in so many ticks if nobody touches it, its bounces aside
export function predictBall(ball, ticks) {
  const flight = clamp(Math.round(ticks), 0, MOST_TICKS);
  const travel = (isFlying(ball) ? AIR : ROLL)[flight];

  return {
    x: ball.x + ball.vx * travel,
    y: ball.y + ball.vy * travel,
    z: Math.max(0, ball.z + ball.vz * flight - fallOf(flight)),
  };
}
