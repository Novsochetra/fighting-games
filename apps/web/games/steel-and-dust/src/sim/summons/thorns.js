import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES, fxLength } from '../../data/fx-sprites.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { strikeArea } from './strike.js';

const STRIKE_TICK = FX_SPRITES.thorns.ticks * 2;
const COMBO_THORN = { damage: 6, knockback: [0.6, -4.4], launch: true, hitstop: 5, hitstun: 22 };

// a bramble bursting out of the ground; it strikes once, as its spikes reach full height
export function raiseThorn(game, { x, scale, hit, delay = 0 }) {
  game.summons.push({
    kind: 'thorn',
    x,
    y: groundAt(game.terrain, x),
    direction: 1,
    side: 'player',
    time: -delay,
    scale,
    hit,
    hitTargets: new Set(),
  });
}

function scatterLeaves(game, thorn) {
  for (let i = 0; i < 5; i++) {
    game.particles.push({
      kind: 'chunk',
      x: thorn.x + randomBetween(-12, 12) * thorn.scale,
      y: thorn.y - randomBetween(12, 40) * thorn.scale,
      vx: randomBetween(-1.6, 1.6),
      vy: -randomBetween(1, 3),
      life: randomBetween(20, 32) | 0,
      maxLife: 32,
      color: i % 2 ? FX_COLORS.leaf : FX_COLORS.leafLight,
    });
  }
}

function thornArea(thorn) {
  const half = 16 * thorn.scale;
  const height = 46 * thorn.scale;
  return { x: thorn.x - half, y: thorn.y - height, width: half * 2, height };
}

export function updateThorn(game, thorn) {
  if (thorn.time === 1) {
    addDust(game, { x: thorn.x, y: thorn.y, count: 3 });
    game.io.sfx('thorns', false, { x: thorn.x });
  }
  if (thorn.time === STRIKE_TICK) {
    strikeArea(game, thorn, thornArea(thorn));
    scatterLeaves(game, thorn);
    shake(game, 1, 4);
  }
  thorn.done = thorn.time >= fxLength('thorns');
}

// a finisher's brambles erupt one after another along the ground ahead, or on both sides in a ring
export function raiseComboThorns(game, fighter, { count, ring = false, ahead = 30 }) {
  const sides = ring ? [fighter.facing, -fighter.facing] : [fighter.facing];
  for (const side of sides) {
    for (let i = 0; i < count; i++) {
      raiseThorn(game, {
        x: fighter.x + side * (ahead + i * 22),
        scale: 0.6,
        hit: COMBO_THORN,
        delay: i * 4,
      });
    }
  }
}
