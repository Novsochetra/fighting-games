import { EFFECT_TICKS } from '../../data/move-effects.js';
import { BALL } from '../../data/tuning.js';
import { project } from '../camera.js';
import { addEffect, ageOf } from './effect-list.js';
import { IMPACT_SHAPES } from './impacts/index.js';

const lifeOf = (shape) => EFFECT_TICKS[shape] ?? EFFECT_TICKS.impact;

// a move's impact: `at` is where it bursts (x, y and height z, in world units), `place` the ground
// a wall rises from, `scale` how big (a strike off the foot is smaller than the save it meets)
export function addImpact(effects, match, { plan, at, scale = 1, shape = plan?.impact, place }) {
  if (!plan || !shape) {
    return;
  }

  addEffect(effects, {
    kind: 'impact',
    shape,
    art: plan.art,
    x: at.x,
    y: at.y,
    z: Math.max(0, at.z ?? 0),
    place: { x: (place ?? at).x, y: (place ?? at).y },
    scale,
    born: match.tick,
    seed: (match.tick * 13 + Math.round(at.x)) >>> 0,
    life: lifeOf(shape),
  });
}

export function drawImpact(context, camera, effect, { tick, bake = null }) {
  const age = ageOf(effect, tick);

  IMPACT_SHAPES[effect.shape]?.(context, {
    camera,
    art: effect.art,
    age,
    share: age / effect.life,
    scale: effect.scale,
    seed: effect.seed,
    at: project(camera, effect.x, effect.y, effect.z + BALL.radius),
    ground: project(camera, effect.x, effect.y),
    place: effect.place,
    bake,
  });
}
