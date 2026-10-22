import { FX_COLORS } from '../../art/fx-colors.js';
import { addDust } from '../fx/particles.js';
import { groundAt, isWall } from '../stage/terrain.js';
import { THRUST_ORB } from './mirage-bolts.js';

const CRAWL_SPEED = 2.2;
const BITE_DAMAGE = 10;

// the scarabs pour out of the sand under his orb and crawl along the floor at the hero: jump them
export function releaseScarabs(game, boss) {
  const x = boss.x + boss.facing * THRUST_ORB.ahead * boss.scale;
  const y = groundAt(game.terrain, x);
  game.projectiles.push({
    kind: 'scarabs',
    x,
    y,
    direction: boss.facing,
    speed: CRAWL_SPEED,
    side: boss.side,
    time: 0,
    damage: BITE_DAMAGE,
    hitTargets: new Set(),
  });
  addDust(game, { x, y, count: 10, color: FX_COLORS.scarabSand });
  game.io.sfx('scarabs', false, { x, dir: boss.facing });
}

// they ride the road up and down its steps and stop at a rise too tall to climb
export function crawlScarabs(game, carpet) {
  if (isWall(game.terrain, carpet.x, carpet.y)) {
    carpet.dead = true;
    addDust(game, { x: carpet.x, y: carpet.y, count: 10, color: FX_COLORS.scarabSand });
    return;
  }
  carpet.y = groundAt(game.terrain, carpet.x);
  if (carpet.time % 6 === 0) {
    const x = carpet.x - carpet.direction * 14;
    addDust(game, { x, y: carpet.y, count: 1, color: FX_COLORS.scarabSand });
  }
}
