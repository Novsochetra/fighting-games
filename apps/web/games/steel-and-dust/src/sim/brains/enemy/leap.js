import { waterAt } from '../../stage/terrain.js';
import { leap } from './hop.js';

// a raider leaps from no further back from the water than this, and comes down this far past it
const LEAP_LOOKAHEAD = 12;
const LAND_IN = 10;

// only a raider walking toward `targetX` with a moat in the way leaps it; one backing off stops at
// the edge. Returns the spot on the far bank it leaps to, or null
export function planLeap(terrain, raider, targetX) {
  if (raider.state !== 'walk' || raider.walkDirection <= 0) {
    return null;
  }

  const side = raider.facing;
  const water = waterAt(terrain, raider.x + side * LEAP_LOOKAHEAD);

  if (!water) {
    return null;
  }

  const [nearEdge, farEdge] = side > 0 ? [water.from, water.to] : [water.to, water.from];

  return side * (targetX - nearEdge) > 0 ? farEdge + side * LAND_IN : null;
}

export function tryLeap(game, raider, targetX) {
  const toX = planLeap(game.terrain, raider, targetX);

  if (toX === null) {
    return false;
  }

  leap(game, raider, toX);

  return true;
}
