import { drawConfetti, drawWind } from './bits.js';
import { drawBolt } from './bolt.js';
import { drawSevenHeads } from './heads.js';
import { drawHorns } from './horns.js';
import { drawKite } from './kite.js';
import { drawArc, drawBlade } from './moon.js';
import { drawCoils, drawTwinCoils } from './serpent.js';
import { drawFlame, drawRibbon, drawStreak } from './streak.js';
import { drawRiver, drawWave } from './water.js';
import { drawWings } from './wings.js';

export { drawAfterimages } from './ghosts.js';

// every trail of EFFECT_SHAPES.trail but the afterimage, which draws the player himself
export const TRAIL_SHAPES = {
  streak: drawStreak,
  coils: drawCoils,
  'twin-coils': drawTwinCoils,
  heads: drawSevenHeads,
  wings: drawWings,
  blade: drawBlade,
  arc: drawArc,
  flame: drawFlame,
  horns: drawHorns,
  ribbon: drawRibbon,
  kite: drawKite,
  river: drawRiver,
  wave: drawWave,
  bolt: drawBolt,
  confetti: drawConfetti,
  wind: drawWind,
};

// `trail` is { samples, head, flip, art, tick, age, alpha, seed, river } (draw-trail.js)
export function drawTrailShape(context, shape, trail) {
  (TRAIL_SHAPES[shape] ?? drawStreak)(context, trail);
}
