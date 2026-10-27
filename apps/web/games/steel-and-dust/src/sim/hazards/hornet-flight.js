import { SWARM } from '../../data/nests.js';
import { clamp } from '../../lib/math.js';

// a hornet pulls toward where it is going a little harder the farther off it is, and overshoots,
// so the swarm loops and buzzes about its mark instead of sitting on it
const PULL = 0.08;
const ACCEL = 0.4;
const DRAG = 0.9;
const TURN = 0.3;
const SCATTER_SPEED = 3;
const SCATTER_RISE = -1.2;

// six hornets out of the broken nest, spread around it and bursting upward
export function hatchHornets(nest) {
  return Array.from({ length: SWARM.hornets }, (_, i) => {
    const phase = (i * Math.PI * 2) / SWARM.hornets;
    const vx = Math.cos(phase) * 1.4;

    return {
      x: nest.x + Math.cos(phase) * 4,
      y: nest.y - 6,
      vx,
      vy: -1.6,
      facing: vx < 0 ? -1 : 1,
      phase,
      radius: SWARM.radius + (i % 3) * 3,
    };
  });
}

export function swarmCenter(hornets) {
  const x = hornets.reduce((total, hornet) => total + hornet.x, 0) / hornets.length;
  const y = hornets.reduce((total, hornet) => total + hornet.y, 0) / hornets.length;

  return { x, y };
}

// each hornet circles its own spot about the point, half as high as it is wide
export function circlePoint(hornet, point, time) {
  const angle = hornet.phase + time * SWARM.spin;

  return {
    x: point.x + Math.cos(angle) * hornet.radius,
    y: point.y + Math.sin(angle * 2) * hornet.radius * 0.5,
  };
}

function steer(velocity, gap) {
  return (velocity + clamp(gap * PULL, -ACCEL, ACCEL)) * DRAG;
}

function move(hornet) {
  hornet.x += hornet.vx;
  hornet.y += hornet.vy;
  if (Math.abs(hornet.vx) > TURN) {
    hornet.facing = Math.sign(hornet.vx);
  }
}

export function flyHornet(hornet, aim) {
  hornet.vx = steer(hornet.vx, aim.x - hornet.x);
  hornet.vy = steer(hornet.vy, aim.y - hornet.y);
  const speed = Math.hypot(hornet.vx, hornet.vy);

  if (speed > SWARM.speed) {
    hornet.vx *= SWARM.speed / speed;
    hornet.vy *= SWARM.speed / speed;
  }

  move(hornet);
}

// when the swarm is spent each hornet flies off up and away the way it was heading
export function flyOff(hornet) {
  hornet.vx = hornet.facing * SCATTER_SPEED;
  hornet.vy = SCATTER_RISE;
  move(hornet);
}
