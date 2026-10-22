import { groundAt, isWall } from '../stage/terrain.js';

const LANCE_SPEED = 6;
const LANCE_DAMAGE = 14;
// the chest furnace's mouth on the firing frame, in sheet pixels from his feet halved and scaled
const CHEST = { ahead: 6, up: 20 };
const LANCE_LENGTH = 70;

// a lance of flame leaves the open furnace and runs down the arena at its height: jump it
export function looseLance(game, boss) {
  const x = boss.x + boss.facing * CHEST.ahead * boss.scale;
  game.projectiles.push({
    kind: 'flameLance',
    x,
    from: x,
    y: groundAt(game.terrain, x) - CHEST.up * boss.scale,
    height: CHEST.up * boss.scale,
    direction: boss.facing,
    speed: LANCE_SPEED,
    side: boss.side,
    time: 0,
    damage: LANCE_DAMAGE,
    hitTargets: new Set(),
  });
  game.io.sfx('flame', false, { x: boss.x, dir: boss.facing });
}

// the stretch of road the lance covers, from its tip back along its length, but never behind the
// furnace's mouth it came out of
export function lanceSpan(lance) {
  const tail = lance.x - lance.direction * LANCE_LENGTH;
  if (lance.direction > 0) {
    return { left: Math.max(tail, lance.from), right: lance.x };
  }
  return { left: lance.x, right: Math.min(tail, lance.from) };
}

// it keeps its height over the road and burns out against a rise too tall for it
export function runLance(game, lance) {
  const floor = groundAt(game.terrain, lance.x);
  if (isWall(game.terrain, lance.x, lance.y + lance.height)) {
    lance.dead = true;
    return;
  }
  lance.y = floor - lance.height;
}
