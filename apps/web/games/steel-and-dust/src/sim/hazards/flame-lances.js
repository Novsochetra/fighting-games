import { groundAt } from '../stage/terrain.js';

const LANCE_SPEED = 6;
const LANCE_DAMAGE = 14;
const LANCE_LENGTH = 70;
// the burning core reaches this far above and below the lance's middle
export const LANCE_CORE = 4;
// the flame in the furnace's open mouth on the firing frame, in sheet pixels from his feet halved
// and scaled; a lance starts a little inside that flame's tip, so it grows out of it
export const FURNACE_MOUTH = { ahead: 4, up: 19 };

// a lance of flame leaves the open furnace and runs level down the arena at chest height: jump it
export function looseLance(game, boss) {
  const x = boss.x + boss.facing * FURNACE_MOUTH.ahead * boss.scale;
  game.projectiles.push({
    kind: 'flameLance',
    x,
    from: x,
    y: boss.y - FURNACE_MOUTH.up * boss.scale,
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

// it flies level and burns out against a rise in the road that comes up to its core
export function runLance(game, lance) {
  lance.dead = groundAt(game.terrain, lance.x) <= lance.y + LANCE_CORE;
}
