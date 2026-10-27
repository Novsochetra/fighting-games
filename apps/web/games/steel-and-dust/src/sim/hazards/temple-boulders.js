import { VIEW_WIDTH } from '../../config.js';
import { BOULDER_CRUSH, TEMPLE_BOULDER } from '../../data/temple-boulders.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { isFightOver } from '../stage/loot-time.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { crushArea, rollOn } from './boulder-roll.js';
import { hazardAttacker } from './hazard-attacker.js';

const { direction, margin, speed, warn } = TEMPLE_BOULDER;
// however the camera moves, it is gone once it has rolled this far
const LONGEST_ROLL = VIEW_WIDTH * 3;
// the road shakes in short quakes, not one long shake, so a big hit's harder shake is never held
// on by it (camera-fx.js keeps the largest amount while any shake lasts)
const QUAKE_EVERY = 6;
const DUST_EVERY = speed * 6;
const SHARD_SCALE = 1.4;

export function createTempleBoulders(spots) {
  return spots.map(({ x }) => ({
    spot: x,
    state: 'waiting',
    time: 0,
    x,
    y: 0,
    vy: 0,
    rolled: 0,
    struck: [],
  }));
}

// it breaks loose once the hero is past its spot, but never in a boss fight or after the last one;
// one he left a screen behind stays put, so two never roll at once
function mayBreakLoose(game, boulder) {
  const { x } = game.player;
  const bossUp = game.fighters.some((fighter) => fighter.def.boss && fighter.state !== 'ko');
  const near = x >= boulder.spot && x < boulder.spot + VIEW_WIDTH;

  return near && !bossUp && !isFightOver(game);
}

function breakLoose(game, boulder) {
  Object.assign(boulder, { state: 'loose', time: 0 });
  shake(game, 2, QUAKE_EVERY - 1);
  game.io.sfx('faceRise', false, { x: game.player.x });
}

// it rolls in from just past the edge of the screen it comes from
function startRolling(game, boulder) {
  const x = direction < 0 ? game.camera.x + VIEW_WIDTH + margin : game.camera.x - margin;

  Object.assign(boulder, { state: 'rolling', x, y: groundAt(game.terrain, x), vy: 0, rolled: 0 });
  game.io.sfx('boulderRoll', false, { x });
}

function shudder(game, boulder) {
  if (++boulder.time % QUAKE_EVERY === 0) {
    shake(game, 2, QUAKE_EVERY - 1);
  }

  if (boulder.time >= warn) {
    startRolling(game, boulder);
  }
}

// a raider caught is the hero's hit, so it scores and builds the combo; the hero caught is hurt
// as by a raider's. It rolls over a shield, so the blow comes from no side a shield could face
function crush(game, boulder, target) {
  const hero = target.side === 'player';
  const attacker = hazardAttacker(
    { x: target.x, direction, side: hero ? 'enemy' : 'player' },
    hero ? 'hammer' : 'axe',
  );
  const move = hero ? BOULDER_CRUSH.hero : BOULDER_CRUSH.raider;

  return applyHit(game, { attacker, target, move, x: target.x, y: target.y - 12 });
}

// everyone in its way it has not struck yet; raiders still walking in are not in the fight
function flatten(game, boulder) {
  const area = crushArea(boulder);

  for (const fighter of game.fighters.slice()) {
    const body = hurtBox(fighter);
    const fresh = body && !fighter.entering && !boulder.struck.includes(fighter);

    if (fresh && overlaps(area, body) && crush(game, boulder, fighter)) {
      boulder.struck.push(fighter);
    }
  }
}

function shatter(game, boulder) {
  boulder.state = 'gone';
  addBurst(game, { sprite: 'shards', x: boulder.x, y: boulder.y, scale: SHARD_SCALE });
  addDust(game, { x: boulder.x, y: boulder.y, count: 10 });
  shake(game, 4, 14);
  game.io.sfx('crumble', false, { x: boulder.x });
}

function pastTheFarEdge(game, boulder) {
  const left = game.camera.x - margin;
  const right = game.camera.x + VIEW_WIDTH + margin;
  const gone = direction < 0 ? boulder.x < left : boulder.x > right;

  return gone || boulder.rolled > LONGEST_ROLL;
}

// the road rumbles under it and it kicks up dust behind it
function roll(game, boulder) {
  if (!rollOn(game.terrain, boulder)) {
    shatter(game, boulder);
    return;
  }

  flatten(game, boulder);
  if (boulder.rolled % DUST_EVERY === 0) {
    shake(game, 1, QUAKE_EVERY - 1);
    addDust(game, { x: boulder.x - direction * 16, y: boulder.y, count: 2 });
  }

  if (pastTheFarEdge(game, boulder)) {
    boulder.state = 'gone';
  }
}

export function updateTempleBoulders(game) {
  for (const boulder of game.boulders) {
    if (boulder.state === 'waiting' && mayBreakLoose(game, boulder)) {
      breakLoose(game, boulder);
    } else if (boulder.state === 'loose') {
      shudder(game, boulder);
    } else if (boulder.state === 'rolling') {
      roll(game, boulder);
    }
  }
}
