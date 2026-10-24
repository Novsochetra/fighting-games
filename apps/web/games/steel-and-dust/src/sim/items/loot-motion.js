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

function land(piece, floor) {
  piece.y = floor;
  if (Math.abs(piece.vy) < MOTION.settleSpeed) {
    piece.vy = 0;
    piece.vx = 0;
    piece.landed = true;
    return false;
  }
  piece.vy = -piece.vy * MOTION.bounce;
  piece.vx *= MOTION.friction;
  return true;
}

// returns true on the tick a piece strikes the floor hard enough to bounce, for its clink
export function fallAndBounce(piece, game) {
  if (piece.landed) {
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

// a pulled piece flies straight at the hero's middle, quicker every tick, over walls and decks
export function flyToward(piece, target) {
  const dx = target.x - piece.x;
  const dy = target.y - piece.y;
  const distance = Math.hypot(dx, dy) || 1;
  const speed = Math.min(MOTION.magnetTopSpeed, Math.hypot(piece.vx, piece.vy) + MOTION.magnetPull);
  piece.vx = (dx / distance) * speed;
  piece.vy = (dy / distance) * speed;
  piece.x += piece.vx;
  piece.y += piece.vy;
  return distance <= Math.max(MOTION.collectRadius, speed);
}
