import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { THOUSAND_CUTS } from '../../data/ultimates/thousand-cuts.js';
import { randomBetween } from '../../lib/math.js';
import { themeOf } from '../fighters/hero-colors.js';
import { addFissure } from '../fx/fissure.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { finaleFlash, hitEveryTarget, ultTargets } from './common.js';

const { edge, fissureRun, fissureTicks, split } = THOUSAND_CUTS;
// where the dav's edge bites the ground in the chop frame, ahead of his feet
const BLADE_REACH = 20;
const DEBRIS_STEP = 20;

// slabs of the road thrown up all along the crack
function throwDebris(game) {
  const right = game.camera.x + VIEW_WIDTH - edge;
  for (let x = game.camera.x + edge; x <= right; x += DEBRIS_STEP) {
    const y = groundAt(game.terrain, x);
    for (let i = 0; i < 2; i++) {
      game.particles.push({
        kind: 'chunk',
        x: x + randomBetween(-6, 6),
        y: y - 1,
        vx: randomBetween(-1.2, 1.2),
        vy: -randomBetween(1.6, 3.4),
        life: randomBetween(22, 34) | 0,
        maxLife: 34,
        color: i ? FX_COLORS.reliefStone : FX_COLORS.reliefShade,
      });
    }
    addDust(game, { x, y, count: 1, color: FX_COLORS.reliefStone });
  }
}

// the chop: a crack runs out from the dav's edge to both ends of the field, and the ground breaks
// open in a pillar of light under every raider it throws
export function splitGround(game, player) {
  const targets = ultTargets(game);
  hitEveryTarget(game, player, split);
  const theme = themeOf(game);
  const x = player.x + player.facing * BLADE_REACH;
  const y = groundAt(game.terrain, x);
  addFissure(game, { x, color: theme.blade, run: fissureRun, duration: fissureTicks });
  addBurst(game, { sprite: 'pounce', x, y, scale: 0.9 });
  for (const target of targets) {
    addBurst(game, {
      sprite: 'pounce',
      x: target.x,
      y: groundAt(game.terrain, target.x),
      scale: 0.5,
    });
  }
  throwDebris(game);
  addSparks(game, { x, y: y - 4, count: 18, color: theme.spark, speed: 4.4 });
  game.io.sfx('boom');
  finaleFlash(game);
}
