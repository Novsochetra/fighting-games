import { screenEdges } from '../fighters/arena-bounds.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';

const WASP_SPEED = 3.2;
const WASP_DAMAGE = 8;
const WARN_TICKS = 36;
// low skims the shins (jump it), high flies over a standing hero's head (stay down)
const LANE_HEIGHT = { low: 12, high: 46 };

// the wasp of the swarm that leaves her tail on this tick of the move, if any
export function waspAt(move, time) {
  return move.swarm?.wasps.find(([at]) => move.swarm.from + at === time);
}

// a wasp waits just past the screen's edge while its lane is marked, then flies straight across;
// near ones come from behind her, far ones from behind the hero
export function releaseWasp(game, boss, [, from, lane]) {
  const { left, right } = screenEdges(game);
  const direction = from === 'near' ? boss.facing : -boss.facing;
  const x = direction > 0 ? left - 16 : right + 16;
  game.projectiles.push({
    kind: 'wasp',
    x,
    y: groundAt(game.terrain, x) - LANE_HEIGHT[lane],
    height: LANE_HEIGHT[lane],
    direction,
    speed: 0,
    side: boss.side,
    time: 0,
    warn: WARN_TICKS,
    damage: WASP_DAMAGE,
    hitTargets: new Set(),
  });
}

export function flyWasp(game, wasp) {
  wasp.speed = wasp.time >= wasp.warn ? WASP_SPEED : 0;
  const bob = Math.round(Math.sin(wasp.time / 5) * 2);
  wasp.y = groundAt(game.terrain, wasp.x) - wasp.height + bob;
  if (wasp.time === wasp.warn) {
    game.io.sfx('buzz', false, { x: wasp.x, dir: wasp.direction });
  }
}

// the pincers come down and the swarm is spent
export function slamPincers(game, boss) {
  addDust(game, { x: boss.x, y: floorUnder(game.terrain, boss), count: 12 });
  shake(game, 4, 12);
  game.io.sfx('heavy', false, { x: boss.x });
}
