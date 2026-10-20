import { STEP_UP, faceAhead, platformUnder } from '../../stage/terrain.js';
import { HOP_REACH, drop, hop, isResting } from './hop.js';
import { walk } from './movement.js';

// how far from its centre a ranged raider still walks over to a platform to throw from it
const PERCH_RANGE = 120;
// a raider hops onto a platform from this far in under its nearer end
const PERCH_INSET = 10;
const ARRIVED = 1;

export function perchSpot(platform, x) {
  const centre = platform.x + platform.width / 2;
  return x < centre ? platform.x + PERCH_INSET : platform.x + platform.width - PERCH_INSET;
}

// a hop up it can make, near enough, and no face to stop the walk under it
function canReach({ terrain, raider }, platform, spot) {
  const rise = raider.y - platform.y;
  const centre = platform.x + platform.width / 2;
  const side = Math.sign(spot - raider.x);
  return (
    rise > STEP_UP &&
    rise <= HOP_REACH &&
    Math.abs(centre - raider.x) <= PERCH_RANGE &&
    faceAhead(terrain, raider, side, Math.abs(spot - raider.x)) === null
  );
}

// the hero stays at throwing distance from the perch and never stands between the raider and it
function keepsHeroInRange({ terrain, raider, hero, near, far }, platform, spot) {
  const fromHero = Math.abs(spot - hero.x);
  const heroBetween = Math.sign(hero.x - raider.x) !== Math.sign(hero.x - spot);
  const heroOnIt = platformUnder(terrain, hero.x, hero.y) === platform;
  return fromHero > near && fromHero <= far && !heroBetween && !heroOnIt;
}

// the nearest platform worth throwing from, or null
export function choosePerch(terrain, raider, hero, [near, far]) {
  const view = { terrain, raider, hero, near, far };
  let best = null;
  let bestGap = Infinity;
  for (const platform of terrain.platforms) {
    const spot = perchSpot(platform, raider.x);
    const gap = Math.abs(spot - raider.x);
    if (gap < bestGap && canReach(view, platform, spot) && keepsHeroInRange(view, platform, spot)) {
      best = platform;
      bestGap = gap;
    }
  }
  return best;
}

// a perched raider that is still resting from its hop up stays and throws until it may drop
function holdPerch(game, raider, distance, [near, far]) {
  if (distance < near && !isResting(raider) && drop(game, raider)) {
    return 'moving';
  }
  return distance <= far ? 'perched' : null;
}

function climbTo(game, raider, platform) {
  const spot = perchSpot(platform, raider.x);
  const gap = spot - raider.x;
  if (Math.abs(gap) > ARRIVED) {
    walk(raider, Math.sign(gap) * raider.facing, 1);
  } else {
    hop(game, raider, { toX: spot, faceX: null, rise: raider.y - platform.y });
  }
  return 'moving';
}

// 'moving' when the raider walked, hopped or dropped; 'perched' when it should hold still and
// throw; null to fight as on a flat road. A hero who walks out of range takes it off its perch
export function thinkPerch(game, raider, distance, keepAway) {
  const { terrain, player } = game;
  if (!terrain.platforms.length) {
    return null;
  }
  if (platformUnder(terrain, raider.x, raider.y)) {
    return holdPerch(game, raider, distance, keepAway);
  }
  if (isResting(raider)) {
    return null;
  }
  const platform = choosePerch(terrain, raider, player, keepAway);
  return platform ? climbTo(game, raider, platform) : null;
}
