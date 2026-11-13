import { worldPen } from './camera/world-pen.js';
import { drawStriker, drawKeeper } from './draw/actors.js';
import { drawBackdrop } from './draw/backdrop.js';
import { drawShotBall } from './draw/ball.js';
import { drawEffectsBehind } from './draw/effects-behind.js';
import { drawEffectsInFront } from './draw/effects-front.js';
import { drawGoalBack, drawGoalFront } from './draw/goal.js';
import { drawSummonedNaga } from './draw/naga.js';
import { drawProjectile } from './draw/projectile.js';
import { drawCinemaBars, drawFlash, drawTitles } from './draw/screen.js';
import { isShown } from './layers.js';
import { momentOf } from './moment.js';
import { clockAt, planFor } from './sequence.js';

// back to front: each layer the lab can hide, by its name, and the ones always drawn by null
const WORLD_LAYERS = [
  ['naga', drawSummonedNaga],
  ['effects', drawEffectsBehind],
  [null, drawGoalBack],
  ['keeper', drawKeeper],
  ['player', drawStriker],
  ['trail', drawProjectile],
  ['ball', drawShotBall],
  [null, drawGoalFront],
  ['effects', drawEffectsInFront],
];

const SCREEN_LAYERS = [
  ['flash', drawFlash],
  ['bars', drawCinemaBars],
  ['titles', drawTitles],
];

const shown =
  (settings) =>
  ([layer]) =>
    layer === null || isShown(settings, layer);

export function drawNagaShot(context, moment) {
  const pen = worldPen(context, moment.camera);

  drawBackdrop(context, moment);
  WORLD_LAYERS.filter(shown(moment.settings)).forEach(([, draw]) => draw(pen, moment));
  SCREEN_LAYERS.filter(shown(moment.settings)).forEach(([, draw]) => draw(context, moment));
}

// the Naga Shot as a scene of the lab: stepped a frame at a time, every frame drawn from the
// frame alone
export function nagaShotScene(settings) {
  const plan = planFor(settings);
  let frame = 0;

  return {
    step() {
      frame += 1;
    },

    draw: (context, { actors, lang }) =>
      drawNagaShot(context, { ...momentOf(plan, frame, settings), actors, lang }),
    isDone: () => frame >= plan.total,
    stage: () => clockAt(plan, frame).stage,
    stageTicks: () => clockAt(plan, frame).ticks,
  };
}
