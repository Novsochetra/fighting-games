import { VIEW_WIDTH } from '../../config.js';
import { addFissure, fissureReach } from '../fx/fissure.js';
import { groundAt } from '../stage/terrain.js';

const RIFT_DAMAGE = 10;
// the crack runs at a steady pace, so a hero sees it coming and jumps it as it passes
const RIFT_SPEED = 4;
export const RIFT_RUN = VIEW_WIDTH / RIFT_SPEED;
// the crack glows on a while after it has run out
const GLOWS = 1.6;

// each running end of the crack is a rift that throws up a hero standing on it; both run with the
// crack drawn on the road, read from the same reach, so the hit is where the crack is
export function openRift(game, { x, side, color }) {
  addFissure(game, { x, color, run: RIFT_RUN, duration: RIFT_RUN * GLOWS, linear: true });
  for (const direction of [-1, 1]) {
    game.projectiles.push({
      kind: 'rift',
      origin: x,
      x,
      y: groundAt(game.terrain, x),
      direction,
      speed: 0,
      side,
      time: 0,
      damage: RIFT_DAMAGE,
      hitTargets: new Set(),
    });
  }
}

export function runRift(game, rift) {
  const reach = fissureReach({ time: rift.time, run: RIFT_RUN, linear: true });
  rift.x = rift.origin + rift.direction * reach;
  rift.y = groundAt(game.terrain, rift.x);
  rift.dead = rift.time >= RIFT_RUN;
}
