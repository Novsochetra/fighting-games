import { FX_COLORS } from '../../art/fx-colors.js';
import { addSparks } from '../fx/particles.js';
import { groundAt, isWall } from '../stage/terrain.js';

const TIDE_SPEED = 2.4;
const TIDE_DAMAGE = 12;
// the wave rises out of the stone, rolls on its curl and breaks for this many ticks at the end
export const TIDE_RISE = 8;
export const TIDE_BREAK = 18;
export const TIDE_RANGE = 150;
// the front of her coil as it crashes down (tidalCoil frame 5), ahead of her feet in her own units
// (sheet pixels over twice her scale)
export const COIL_FRONT = 6;
// the wave rises with the back of its base (tide frames 0-1) on the front of her coil
const TIDE_BACK = 18;

// a wave of moat water rises at the front of her coil and rolls along the floor at the hero
export function releaseTide(game, boss) {
  const x = boss.x + boss.facing * (COIL_FRONT * boss.scale + TIDE_BACK);
  game.projectiles.push({
    kind: 'tide',
    x,
    y: groundAt(game.terrain, x),
    direction: boss.facing,
    speed: 0,
    side: boss.side,
    time: 0,
    breakAt: TIDE_RANGE - TIDE_BREAK,
    damage: TIDE_DAMAGE,
    hitTargets: new Set(),
  });
  game.io.sfx('tide', false, { x, dir: boss.facing });
}

// it rides the road up and down its steps, and breaks where a rise too tall stops it
export function rollTide(game, tide) {
  if (tide.time < tide.breakAt && isWall(game.terrain, tide.x + tide.direction * 8, tide.y)) {
    tide.breakAt = tide.time;
  }
  const rolling = tide.time >= TIDE_RISE && tide.time < tide.breakAt;
  tide.speed = rolling ? TIDE_SPEED : 0;
  tide.y = groundAt(game.terrain, tide.x);
  if (rolling && tide.time % 5 === 0) {
    const x = tide.x - tide.direction * 10;
    addSparks(game, { x, y: tide.y - 4, count: 1, color: FX_COLORS.foam, speed: 1 });
  }
  tide.dead = tide.time >= tide.breakAt + TIDE_BREAK;
}

// it only strikes while it rolls, not while it rises or breaks
export const isRolling = (tide) => tide.time >= TIDE_RISE && tide.time < tide.breakAt;
