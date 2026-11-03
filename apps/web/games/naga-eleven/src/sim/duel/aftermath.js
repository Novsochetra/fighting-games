import { DUEL_AFTERMATH } from '../../data/duels.js';
import { clamp, distance, normalized } from '../vector.js';
import { attackSign, keepOnPitch } from './geometry.js';

export function floor(player, ticks) {
  player.stun = Math.max(player.stun ?? 0, ticks);
  player.noPickup = Math.max(player.noPickup ?? 0, ticks);
  player.vx = 0;
  player.vy = 0;
}

export function faceGoal(player) {
  player.facing = { x: attackSign(player.team), y: 0 };
}

// who touched the ball last, and how, as the sim's own kicks leave it
export function touched(match, player, { kick = null, move = null } = {}) {
  Object.assign(match.ball, { lastTouch: player.index, kick, move });
}

export function ballAtFeet(match, player) {
  const ball = match.ball;

  touched(match, player);
  Object.assign(ball, {
    owner: player.index,
    x: player.x + player.facing.x * DUEL_AFTERMATH.footGap,
    y: player.y + player.facing.y * DUEL_AFTERMATH.footGap,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
  });
  keepOnPitch(match, ball, 5);
  player.holding = 0;
}

export function looseBall(match, { x, y, height = 0, vx, vy, vz = 0 }) {
  Object.assign(match.ball, { owner: null, x, y, z: height, vx, vy, vz });
  keepOnPitch(match, match.ball, 5);
}

// on the grass the ball loses the same share of its speed each tick, so struck at this speed
// it reaches the mate at about the arrival speed
export function passSpeedFor(gap) {
  const { rollDrag, passArrival, passMin, passMax } = DUEL_AFTERMATH;

  return clamp(gap * (1 - rollDrag) + passArrival, passMin, passMax);
}

export function rollTo(match, from, to) {
  const aim = normalized(to.x - from.x, to.y - from.y);
  const speed = passSpeedFor(distance(from, to));

  looseBall(match, { x: from.x, y: from.y, vx: aim.x * speed, vy: aim.y * speed });
}
