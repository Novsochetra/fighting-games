import { viewAt } from '../../../../../src/render/duel/lens/track.js';
import { hash } from '../../../../../src/render/duel/hash.js';
import { NAGA_TIMINGS } from '../sequence.js';
import { nagaAt } from '../tracks/naga.js';
import { UNITS, VIEW, WORLD } from '../world.js';
import { pointsAt } from './points.js';
import { NAGA_SHAKES, NAGA_SHOTS } from './shots.js';

function stillView(points) {
  return { x: points.ball.x + 30, y: points.play.y, step: 0 };
}

// the view never leaves the world, so nothing past its edge ever shows
function clamped({ x, y }, unit) {
  const halfWidth = VIEW.width / 2 / unit;
  const halfHeight = VIEW.height / 2 / unit;

  return {
    x: Math.min(WORLD.width - halfWidth, Math.max(halfWidth, x)),
    y: Math.min(WORLD.height - halfHeight, Math.max(halfHeight, y)),
  };
}

const SINCE = {
  manifest: (clock) => ({ kind: 'pulse', ticks: nagaAt(clock).pulse ?? -1 }),
  impact: (clock) => ({ kind: 'hit', ticks: clock.ticks - NAGA_TIMINGS.contact }),
  collision: (clock) => ({ kind: 'crash', ticks: clock.ticks }),
  aftermath: (clock) => ({ kind: 'crash', ticks: clock.lengths.collision + clock.ticks }),
};

export function shakeAt(clock) {
  const since = SINCE[clock.stage]?.(clock);
  const shake = since && NAGA_SHAKES[since.kind];

  if (!shake || since.ticks < 0 || since.ticks >= shake.ticks) {
    return { x: 0, y: 0 };
  }

  const strength = shake.strength * (1 - since.ticks / shake.ticks);

  return {
    x: Math.round((hash(clock.frame, 11) * 2 - 1) * strength),
    y: Math.round((hash(clock.frame, 12) * 2 - 1) * strength * 0.6),
  };
}

export function cameraAt(clock, { ending, camera, shake = true }) {
  const points = pointsAt(clock, ending);
  const moving = camera !== 'off';
  const view = moving ? viewAt(NAGA_SHOTS[clock.stage], clock.full, points) : stillView(points);
  const unit = UNITS.least + Math.max(0, Math.min(UNITS.most - UNITS.least, view.step));

  return {
    ...clamped(view, unit),
    unit,
    shake: shake ? shakeAt(clock) : { x: 0, y: 0 },
  };
}
