import { shake } from '../fx/camera-fx.js';
import { startMove } from '../fighters/actions.js';
import { bodyPoint, bodySize } from '../fighters/body-point.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { dropBamboo } from '../hazards/bamboo.js';
import { addBurst } from '../summons/bursts.js';

// a boss left dazed bounces back off the wall, so the hero sees him whole while he reels
const WALL_BOUNCE = 10;
// where his horns meet the wall, the burst there and its size, in his own units (body-point.js)
const HORNS = { ahead: 14 };
const BURST = { ahead: 6 };
const IMPACT_SIZE = 1;

function smashWall(game, fighter) {
  const floor = floorUnder(game.terrain, fighter);
  const wallX = bodyPoint(fighter, HORNS).x;
  const burstX = bodyPoint(fighter, BURST).x;
  const scale = bodySize(fighter, IMPACT_SIZE);
  addBurst(game, { sprite: 'impact', x: burstX, y: floor, scale, direction: fighter.facing });
  dropBamboo(game, { x: wallX, direction: -fighter.facing, side: fighter.side });
  shake(game, 6, 18);
  game.io.sfx('boom', false, { x: fighter.x });
}

// a rush that meets the arena's wall smashes into it, knocks a bamboo stalk down into the arena and
// turns into the move it names: a daze if it missed the hero, or another run back the other way; a
// `soft` turn only skids round
export function hitWall(game, fighter, move) {
  const { move: next, turn, onlyOnMiss, soft } = move.wallNext;
  if (!soft) {
    smashWall(game, fighter);
  }
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
