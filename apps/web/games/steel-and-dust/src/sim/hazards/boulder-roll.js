import { TEMPLE_BOULDER } from '../../data/temple-boulders.js';
import { GRAVITY } from '../fighters/physics.js';
import { groundAt } from '../stage/terrain.js';

const FRAMES = 4;
// each frame of the sheet turns it a quarter, so it turns once for every length of its rim
const QUARTER_TURN = (Math.PI * TEMPLE_BOULDER.diameter) / FRAMES;

export const rollFrame = (rolled) => Math.floor(rolled / QUARTER_TURN) % FRAMES;

// one tick down the road: it follows small rises and drops and falls off a ledge; a rise taller
// than it can climb stops it, and it reports that it was stopped
export function rollOn(terrain, boulder) {
  const x = boulder.x + TEMPLE_BOULDER.direction * TEMPLE_BOULDER.speed;
  const floor = groundAt(terrain, x);
  if (floor < boulder.y - TEMPLE_BOULDER.climb) {
    return false;
  }

  boulder.x = x;
  boulder.rolled += TEMPLE_BOULDER.speed;
  if (boulder.vy === 0 && floor - boulder.y <= TEMPLE_BOULDER.climb) {
    boulder.y = floor;

    return true;
  }

  boulder.vy += GRAVITY;
  boulder.y = Math.min(floor, boulder.y + boulder.vy);
  if (boulder.y === floor) {
    boulder.vy = 0;
  }

  return true;
}

// the part of it that strikes: its lower part, so a jump over it clears it
export function crushArea(boulder) {
  return {
    x: boulder.x - TEMPLE_BOULDER.halfWidth,
    y: boulder.y - TEMPLE_BOULDER.height,
    width: TEMPLE_BOULDER.halfWidth * 2,
    height: TEMPLE_BOULDER.height,
  };
}
