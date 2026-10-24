import { LOOT_MOTION as MOTION } from '../../data/loot.js';
import { screenEdges } from '../fighters/arena-bounds.js';
import { floorBelow, isWall } from '../stage/terrain.js';

const EDGE_MARGIN = 4;

// a piece's y is its bottom: it rests with its foot on the floor
function moveSideways(piece, game) {
  const toX = piece.x + piece.vx;
  const { left, right } = screenEdges(game);
  if (toX < left + EDGE_MARGIN || toX > right - EDGE_MARGIN || isWall(game.terrain, toX, piece.y)) {
    piece.vx = -piece.vx * MOTION.bounce;
    return;
  }
  piece.x = toX;
}

// too soft a bounce to leave the floor: the piece rolls on with what is left of its speed
function land(piece, floor) {
  piece.y = floor;
  piece.vx *= MOTION.friction;
  if (Math.abs(piece.vy) < MOTION.settleSpeed) {
    piece.vy = 0;
    piece.rolling = true;
    return false;
  }
  piece.vy = -piece.vy * MOTION.bounce;
  return true;
}

// a rolling piece slows on the floor and comes to rest; it follows small dips and drops off a ledge
function roll(piece, game) {
  piece.vx *= MOTION.rollFriction;
  if (Math.abs(piece.vx) < MOTION.rollStop) {
    Object.assign(piece, { vx: 0, rolling: false, landed: true });
    return;
  }
  moveSideways(piece, game);
  const floor = floorBelow(game.terrain, piece.x, piece.y - 1);
  if (floor - piece.y > MOTION.rollDip) {
    piece.rolling = false;
    return;
  }
  piece.y = floor;
}

// returns true on the tick a piece strikes the floor hard enough to bounce, for its clink
export function fallAndBounce(piece, game) {
  if (piece.landed) {
    return false;
  }
  if (piece.rolling) {
    roll(piece, game);
    return false;
  }
  piece.vy += MOTION.gravity;
  piece.vx *= MOTION.airDrag;
  moveSideways(piece, game);
  const floor = floorBelow(game.terrain, piece.x, piece.y - 1);
  const next = piece.y + piece.vy;
  if (piece.vy > 0 && next >= floor) {
    return land(piece, floor);
  }
  piece.y = next;
  return false;
}
