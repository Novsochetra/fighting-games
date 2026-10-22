import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { groundAt, isWall } from '../stage/terrain.js';

const BLAZE_DAMAGE = 4;
// frame 0 of its strip lights it, 1-4 burn while it lasts, 5 dies down
export const BLAZE_LIGHT = 8;
export const BLAZE_OUT = 20;

// the swept floor catches fire in a row ahead of the flail, as far as the road runs level; `at` is
// in his own units (body-point.js), so the fire lies where his flail swept however big he is
export function setBlazes(game, boss, { at, life }) {
  for (const ahead of at) {
    const x = boss.x + boss.facing * ahead * boss.scale;
    if (isWall(game.terrain, x, boss.y)) {
      return;
    }
    game.projectiles.push({
      kind: 'blaze',
      x,
      y: groundAt(game.terrain, x),
      direction: boss.facing,
      speed: 0,
      side: boss.side,
      time: 0,
      life,
      damage: BLAZE_DAMAGE,
      hitTargets: new Set(),
    });
  }
}

export const isBurning = (blaze) => blaze.time >= BLAZE_LIGHT && blaze.time < blaze.life;

// it throws up an ember now and then while it burns, and goes out when its time is up
export function burnBlaze(game, blaze) {
  blaze.dead = blaze.time >= blaze.life + BLAZE_OUT;
  if (isBurning(blaze) && blaze.time % 9 === 0) {
    game.particles.push({
      kind: 'spark',
      x: blaze.x + randomBetween(-10, 10),
      y: blaze.y - randomBetween(6, 16),
      vx: randomBetween(-0.3, 0.3),
      vy: -randomBetween(0.6, 1.2),
      life: 16,
      maxLife: 16,
      color: FX_COLORS.slag,
    });
  }
}
