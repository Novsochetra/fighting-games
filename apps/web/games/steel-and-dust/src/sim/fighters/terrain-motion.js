import { STEP_UP, floorBelow, groundAt, isWall, platformUnder } from '../stage/terrain.js';

// a flat road keeps the old arithmetic exactly, so every helper here leaves it alone
export function isFlat(terrain) {
  return !terrain.heights && !terrain.platforms.length;
}

export function floorUnder(terrain, fighter) {
  return floorBelow(terrain, fighter.x, fighter.y);
}

// a teleport lands on the ground of the spot it reaches
export function placeOnGround(terrain, fighter) {
  if (!isFlat(terrain)) {
    fighter.y = groundAt(terrain, fighter.x);
  }
}

function leaveGround(fighter) {
  fighter.airborne = true;
  if (fighter.state === 'idle' || fighter.state === 'walk') {
    fighter.state = 'air';
  }
}

// a fighter on its feet keeps them on slopes and small steps and falls off anything taller;
// raiders walking in from off screen stay on the ground whatever it does, and the ultimate places
// the hero itself
export function followFloor(terrain, fighter) {
  if (isFlat(terrain) || fighter.airborne || fighter.state === 'ult') {
    return;
  }
  if (fighter.entering) {
    fighter.y = groundAt(terrain, fighter.x);
    return;
  }
  const floor = floorBelow(terrain, fighter.x, fighter.y);
  if (floor - fighter.y > STEP_UP) {
    leaveGround(fighter);
  } else {
    fighter.y = floor;
  }
}

// a rise taller than a step, measured from where the feet were, sends the fighter back to where
// it stood; returns the side it ran into, or 0
export function blockWall(terrain, fighter, from) {
  if (isFlat(terrain) || fighter.entering || fighter.x === from.x) {
    return 0;
  }
  if (!isWall(terrain, fighter.x, from.y)) {
    return 0;
  }
  const side = Math.sign(fighter.x - from.x);
  fighter.x = from.x;
  return side;
}

// pushes and pulls stop at the face of a step and keep a fighter on its feet on a slope
export function nudge(terrain, fighter, distance) {
  if (isFlat(terrain)) {
    fighter.x += distance;
    return;
  }
  if (!isWall(terrain, fighter.x + distance, fighter.y)) {
    fighter.x += distance;
    followFloor(terrain, fighter);
  }
}

// stepping off the top of a platform: one pixel below it, the floor under it takes over
export function dropThrough(game, fighter) {
  const { terrain } = game;
  if (!terrain.platforms.length || fighter.airborne) {
    return false;
  }
  const platform = platformUnder(terrain, fighter.x, fighter.y);
  if (!platform) {
    return false;
  }
  Object.assign(fighter, { y: platform.y + 1, vy: 0, airborne: true, state: 'air' });
  return true;
}
