import { isFlat, onOneLevel } from '../../fighters/terrain-motion.js';
import { STEP_UP, faceAhead, floorBelow, groundAt, platformUnder } from '../../stage/terrain.js';
import { HOP_REACH, drop, hop, isResting } from './hop.js';
import { tryLeap } from './leap.js';

// how close the hero must be for a raider to hop up to him or drop down to him
const HOP_RANGE = 40;
const DROP_RANGE = 70;
// a raider walking at the hero starts its hop this far before a face, while it still has room
const WALL_LOOKAHEAD = 16;
// a hop comes down this far past the edge it goes over, clear of the lip
const LAND_IN = 10;
const LEDGE_LOOK = 4;
const DROP = Object.freeze({ action: 'drop' });

// a little past the edge, or straight up when the raider already stands past that spot
function landingX(x, edgeX, side) {
  const spot = edgeX + side * LAND_IN;
  return side * (spot - x) > 0 ? spot : x;
}

// the near end of the platform the hero stands on, or the face of the bank he stands on; null
// when the way to him is only a slope to walk up
function edgeUnder(terrain, raider, hero, side) {
  const platform = platformUnder(terrain, hero.x, hero.y);
  if (platform) {
    return { edgeX: side > 0 ? platform.x : platform.x + platform.width, faceX: null };
  }
  const faceX = faceAhead(terrain, raider, side, Math.abs(hero.x - raider.x));
  return faceX === null ? null : { edgeX: faceX, faceX };
}

function hopUp(terrain, raider, hero) {
  const dx = hero.x - raider.x;
  const rise = raider.y - hero.y;
  if (rise > HOP_REACH || Math.abs(dx) >= HOP_RANGE) {
    return null;
  }
  const side = Math.sign(dx) || raider.facing;
  const edge = edgeUnder(terrain, raider, hero, side);
  if (!edge) {
    return null;
  }
  return { action: 'hop', toX: landingX(raider.x, edge.edgeX, side), faceX: edge.faceX, rise };
}

function dropDown(terrain, raider, hero) {
  const onPlatform = platformUnder(terrain, raider.x, raider.y) !== null;
  return onPlatform && Math.abs(hero.x - raider.x) < DROP_RANGE ? DROP : null;
}

// only a raider walking at the hero hops a face; one backing away stops at it, as at a screen edge
function hopWall(terrain, raider) {
  if (raider.state !== 'walk' || raider.walkDirection <= 0) {
    return null;
  }
  const side = raider.facing;
  const faceX = faceAhead(terrain, raider, side, WALL_LOOKAHEAD);
  if (faceX === null) {
    return null;
  }
  // the column just past where the face begins, on either side
  const rise = raider.y - groundAt(terrain, faceX + side / 2);
  return rise > HOP_REACH ? null : { action: 'hop', toX: faceX + side * LAND_IN, faceX, rise };
}

// a melee raider backing off to its spacing stops at the lip of a drop, as at a screen edge,
// rather than stepping off a ledge it just climbed
export function ledgeBehind(terrain, raider) {
  if (isFlat(terrain)) {
    return false;
  }
  const behindX = raider.x - raider.facing * LEDGE_LOOK;
  return floorBelow(terrain, behindX, raider.y) - raider.y > STEP_UP;
}

// melee raiders follow the hero up and down; ranged ones keep their distance and perch instead
function changeLevel(terrain, raider, hero) {
  if (raider.def.ranged || hero.airborne || onOneLevel(terrain, raider, hero)) {
    return null;
  }
  return raider.y > hero.y ? hopUp(terrain, raider, hero) : dropDown(terrain, raider, hero);
}

// { action: 'hop', toX, faceX, rise }, { action: 'drop' } or null
export function planClimb(terrain, raider, hero) {
  return changeLevel(terrain, raider, hero) ?? hopWall(terrain, raider);
}

// runs before a raider's own brain and returns true when it hopped or dropped instead
export function tryClimb(game, raider) {
  if (isFlat(game.terrain)) {
    return false;
  }
  if (isResting(raider)) {
    raider.ai.hopWait--;
    return false;
  }
  if (tryLeap(game, raider, game.player.x)) {
    return true;
  }
  const plan = planClimb(game.terrain, raider, game.player);
  if (!plan) {
    return false;
  }
  if (plan.action === 'drop') {
    return drop(game, raider);
  }
  hop(game, raider, plan);
  return true;
}
