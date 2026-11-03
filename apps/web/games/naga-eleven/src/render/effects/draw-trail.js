import { BALL } from '../../data/tuning.js';
import { carryFade } from './carries.js';
import { FADE_TICKS } from './flight.js';
import { resample, screenPath } from './path.js';
import { ringPoints } from './ring.js';
import { drawAfterimages, drawTrailShape } from './trails/index.js';

// the most samples a trail is cut into: a serpent's body is drawn in layers, so fewer
const MOST_SAMPLES = { 'twin-coils': 18, heads: 20, coils: 24 };
// a carried trail rides at his middle, but a flame licks up from his feet
const CARRY_LIFT = { flame: 0, default: 24 };

function trailOf({ path, plan, ...rest }) {
  const { samples, step } = resample(path, { most: MOST_SAMPLES[plan.trail] ?? 28 });
  const way = samples.at(-1);

  return samples.length < 2
    ? null
    : { ...rest, samples, step, head: path.at(-1), flip: way.dx < 0, art: plan.art };
}

// the passes the river ran along, then the foot the ball left, where the view draws them
const riverOf = (camera, flight, ball) =>
  flight.river ? screenPath(camera, [...flight.river, ...ball.slice(0, 1)]) : null;

// the trail of a move's ball, true when one was drawn; it draws in toward the ball once over.
// `bake` makes the canvases its little pictures are painted on once (pixel-map.js)
export function drawBallTrail(context, camera, effects, { match, bake }) {
  const flight = effects?.flight;

  if (!flight || flight.released === null) {
    return false;
  }

  const fade = flight.endedAt === null ? 0 : (match.tick - flight.endedAt) / FADE_TICKS;
  const ball = ringPoints(effects.trail, Math.floor(effects.trail.count * fade));
  const trail = trailOf({
    path: screenPath(camera, ball, BALL.radius),
    plan: flight.plan,
    tick: match.tick,
    age: match.tick - flight.released,
    alpha: 1 - fade * 0.5,
    seed: flight.born,
    bake,
  });

  if (!trail) {
    return false;
  }

  drawTrailShape(context, flight.plan.trail, { ...trail, river: riverOf(camera, flight, ball) });

  return true;
}

function drawCarry(context, carry, { camera, match, drawGhost, bake }) {
  const points = ringPoints(carry.ring);
  const alpha = 1 - carryFade(carry, match.tick);
  const { plan } = carry;

  if (plan.trail === 'afterimage') {
    const drawAt = (on, foot) => drawGhost(on, match.players[carry.player], foot);

    drawAfterimages(context, { camera, points, alpha, drawAt });

    return;
  }

  const lift = CARRY_LIFT[plan.trail] ?? CARRY_LIFT.default;
  const age = match.tick - carry.started;
  const trail = trailOf({
    path: screenPath(camera, points, lift),
    plan,
    tick: match.tick,
    age,
    alpha,
    seed: carry.started,
    bake,
  });

  if (trail) {
    drawTrailShape(context, plan.trail, trail);
  }
}

// the trails of what players carry, under the players; `drawGhost(context, player, foot)` draws a
// player's sprite at a point, for the afterimages
export function drawCarries(context, camera, effects, { match, drawGhost, bake }) {
  for (const carry of effects?.carries ?? []) {
    if (carry.started !== null && match.players[carry.player]) {
      drawCarry(context, carry, { camera, match, drawGhost, bake });
    }
  }
}
