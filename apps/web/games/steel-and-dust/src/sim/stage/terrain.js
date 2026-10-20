import { groundAt } from '../../data/missions/terrain.js';

export { groundAt };

// the tallest step a fighter walks up or down without jumping or falling
export const STEP_UP = 8;

function spans(platform, x) {
  return x >= platform.x && x <= platform.x + platform.width;
}

// the first surface at or below y: the ground is solid, a platform only catches what is above it
export function floorBelow(terrain, x, y) {
  let floor = groundAt(terrain, x);
  for (const platform of terrain.platforms) {
    if (platform.y < floor && platform.y >= y && spans(platform, x)) {
      floor = platform.y;
    }
  }
  return floor;
}

export function platformUnder(terrain, x, y) {
  return terrain.platforms.find((platform) => platform.y === y && spans(platform, x)) ?? null;
}

// a fighter on the ground cannot walk into a rise taller than a step
export function isWall(terrain, toX, feetY) {
  return groundAt(terrain, toX) < feetY - STEP_UP;
}
