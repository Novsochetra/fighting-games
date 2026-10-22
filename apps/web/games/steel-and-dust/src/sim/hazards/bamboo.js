import { groundAt } from '../stage/terrain.js';

const BAMBOO_DAMAGE = 10;

// a bamboo stalk knocked loose at the wall topples into the arena and strikes where it lands
export function dropBamboo(game, { x, direction, side }) {
  game.projectiles.push({
    kind: 'bamboo',
    x,
    y: groundAt(game.terrain, x),
    direction,
    speed: 0,
    side,
    time: 0,
    damage: BAMBOO_DAMAGE,
    hitTargets: new Set(),
  });
}
