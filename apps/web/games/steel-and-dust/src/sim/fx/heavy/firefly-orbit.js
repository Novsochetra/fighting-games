import { FIREFLY_HEAVY_FEEL } from '../../../data/heavy-feel/firefly.js';
import { between, strikePointOf } from './firefly-swarm.js';

export const SWARM_SIZE = 8;

// the swarm circles the waist, below the face, flattened as if seen a little from above
const WIDE = 19;
const TIGHT = 3;
const FLAT = 0.42;

// the drawn lean of heavy-glow.js, so the swarm stays round the sprite as it draws back
function leanOf(fighter, move, time) {
  if (time >= move.startup) {
    return 0;
  }
  const { lean, leanTicks } = FIREFLY_HEAVY_FEEL;
  return -fighter.facing * Math.round(lean * Math.min(1, (Math.max(0, time) + 1) / leanTicks));
}

// gathered in full on the last tick of the wind-up
export function windupShare(move, time) {
  return Math.min(1, Math.max(0, time / Math.max(1, move.startup - 1)));
}

// the swarm flies out ahead and knots where the blow will land, for the blow to burst it: a heavy's
// strike pose throws the head forward, so a knot any nearer the body would sit on the face
export function swarmKnotOf(fighter, move) {
  return strikePointOf(fighter, move);
}

// the swarm turns faster as it tightens, so its near side runs forward into the strike
function spinOf(fighter, time) {
  return -fighter.facing * (0.32 * time + 0.03 * time * time);
}

// the middle of the swarm at `time`: round the waist at first, out at its knot by the strike
export function swarmCentreAt(fighter, move, time) {
  const share = windupShare(move, time);
  const waist = {
    x: fighter.x + fighter.facing * 2 + leanOf(fighter, move, time),
    y: fighter.y - 17,
  };
  return between(waist, swarmKnotOf(fighter, move), share * share);
}

// one firefly of the gathering swarm at `time` of the wind-up (a fraction of a tick too)
export function swarmBugAt(fighter, { move, time, i }) {
  const share = windupShare(move, time);
  const radius = (WIDE + (TIGHT - WIDE) * share ** 1.5) * (0.85 + ((i * 37) % 7) / 20);
  const angle = (i / SWARM_SIZE) * Math.PI * 2 + spinOf(fighter, time);
  const bob = Math.sin(time * 0.9 + i * 2.1) * 1.6 * (1 - share);
  const centre = swarmCentreAt(fighter, move, time);
  return {
    x: centre.x + Math.cos(angle) * radius,
    y: centre.y + Math.sin(angle) * radius * FLAT + bob,
    front: Math.sin(angle) > 0,
  };
}

// every firefly of the swarm at `time`, and which way each one flies
export function swarmOrbit(fighter, move, time) {
  return Array.from({ length: SWARM_SIZE }, (_, i) => {
    const now = swarmBugAt(fighter, { move, time, i });
    const before = swarmBugAt(fighter, { move, time: time - 1, i });
    return { ...now, i, vx: now.x - before.x, vy: now.y - before.y };
  });
}
