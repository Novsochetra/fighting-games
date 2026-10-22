import { FX_COLORS } from '../../art/fx-colors.js';
import { addSparks } from '../fx/particles.js';
import { groundAt, isWall } from '../stage/terrain.js';

const BOLT_SPEED = 3.6;
const BOLT_DAMAGE = 12;
// the fist on the punch's frame, in sheet pixels from his feet, halved and scaled like his body
const FIST = { ahead: 34, up: 22 };
// it leaves the fist and dives to run along the floor at shin height: jump it
const SKIM = 7;
const DIVE_TICKS = 10;

export function fireThunderBolt(game, boss) {
  const x = boss.x + boss.facing * FIST.ahead * boss.scale;
  const floor = groundAt(game.terrain, x);
  const height = FIST.up * boss.scale;
  game.projectiles.push({
    kind: 'thunderBolt',
    x,
    y: floor - height,
    floor,
    from: height,
    direction: boss.facing,
    speed: BOLT_SPEED,
    side: boss.side,
    time: 0,
    damage: BOLT_DAMAGE,
    hitTargets: new Set(),
  });
  addSparks(game, { x, y: floor - height, count: 8, color: FX_COLORS.zap, speed: 2 });
  game.io.sfx('zap', false, { x, dir: boss.facing });
}

// it rides the road up and down its steps, and breaks on a rise too tall to step up
export function runThunderBolt(game, bolt) {
  if (isWall(game.terrain, bolt.x, bolt.floor)) {
    bolt.dead = true;
    return;
  }
  bolt.floor = groundAt(game.terrain, bolt.x);
  const dive = Math.min(1, bolt.time / DIVE_TICKS);
  bolt.y = bolt.floor - SKIM - (bolt.from - SKIM) * (1 - dive);
  if (bolt.time % 3 === 0) {
    addSparks(game, { x: bolt.x, y: bolt.floor - 1, count: 1, color: FX_COLORS.zap, speed: 1 });
  }
}
