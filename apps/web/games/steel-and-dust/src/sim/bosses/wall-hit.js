import { shake } from '../fx/camera-fx.js';
import { startMove } from '../fighters/actions.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { dropBamboo } from '../hazards/bamboo.js';
import { addBurst } from '../summons/bursts.js';

// a boss left dazed bounces back off the wall, so the hero sees him whole while he reels
const WALL_BOUNCE = 10;

// a rush that meets the arena's wall smashes into it, knocks a bamboo stalk down into the arena and
// turns into the move it names: a daze if it missed the hero, or another run back the other way
export function hitWall(game, fighter, move) {
  const floor = floorUnder(game.terrain, fighter);
  const wallX = fighter.x + fighter.facing * 14;
  const burstX = fighter.x + fighter.facing * 6;
  addBurst(game, { sprite: 'impact', x: burstX, y: floor, scale: 1, direction: fighter.facing });
  dropBamboo(game, { x: wallX, direction: -fighter.facing, side: fighter.side });
  shake(game, 6, 18);
  game.io.sfx('boom', false, { x: fighter.x });
  const { move: next, turn, onlyOnMiss } = move.wallNext;
  if (onlyOnMiss && fighter.hitConfirmed) {
    return;
  }
  if (turn) {
    fighter.facing = -fighter.facing;
  } else {
    fighter.x -= fighter.facing * WALL_BOUNCE;
    fighter.vx = 0;
  }
  startMove(game, fighter, next);
}
