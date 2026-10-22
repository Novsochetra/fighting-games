import { FX_COLORS } from '../../art/fx-colors.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { clamp, randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { arenaBounds } from '../fighters/arena-bounds.js';
import { addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { leaveEcho } from '../summons/echoes.js';
import { ultTargets } from './common.js';
import { blowAt, FISTS_ROW, RUSH_BLOWS, RUSH_END, rushFrame } from './rush-timing.js';

const { zipTicks, blow: BLOW, drop: DROP } = POUNDING_LION;
// px from a raider he strikes it from, coming in from alternate sides
const REACH = 22;
// with no raider on screen he strikes the air round where he stood, this far either side
const SHADOW_SPOTS = [30, -34, 56, -60, 80, -84, 44, 18];
const LAST = RUSH_BLOWS.length - 1;

// the raiders he rushes, nearest first, fixed as the rush starts so the camera following him cannot
// change who is next
export function rushTargets(game, player) {
  return ultTargets(game).sort(
    (first, second) => Math.abs(first.x - player.x) - Math.abs(second.x - player.x),
  );
}

function liveTarget(player, index) {
  const alive = player.rush.targets.filter((target) => target.state !== 'ko' && !target.removed);
  return alive.length ? alive[index % alive.length] : null;
}

// where the blow lands from: beside the raider, level with it in the air, or a spot of air
function blowSpot(game, player, index) {
  const target = liveTarget(player, index);
  const bounds = arenaBounds(game, player);
  if (!target) {
    const x = clamp(
      player.rush.fromX + player.rush.facing * SHADOW_SPOTS[index],
      bounds.min,
      bounds.max,
    );
    return { x, y: groundAt(game.terrain, x), target, facing: Math.sign(x - player.x) || 1 };
  }
  const side = (index % 2 ? -1 : 1) * (target.x >= player.x ? 1 : -1);
  let x = clamp(target.x - side * REACH * target.scale, bounds.min, bounds.max);
  if (Math.abs(x - target.x) < REACH / 2) {
    x = clamp(target.x + side * REACH * target.scale, bounds.min, bounds.max);
  }
  const ground = groundAt(game.terrain, x);
  const y = index === LAST ? ground : Math.min(target.y, ground);
  return { x, y, target, facing: target.x >= x ? 1 : -1 };
}

function goldImage(player) {
  player.afterimages.push({
    x: player.x,
    y: player.y,
    facing: player.facing,
    sprite: player.ultFrame,
    row: FISTS_ROW,
    color: FX_COLORS.lionGold,
    life: 10,
  });
}

function windLine(game, player) {
  game.particles.push({
    kind: 'streak',
    x: player.x - player.facing * randomBetween(2, 10),
    y: player.y - randomBetween(6, 34),
    vx: -player.facing * randomBetween(1.6, 2.6),
    vy: 0,
    life: 8,
    maxLife: 8,
    length: randomBetween(6, 12) | 0,
  });
}

// he crosses to the spot in a few ticks, leaving gold images of himself all along the way
function zip(game, player, { from, to, since }) {
  const along = Math.min(1, (since + 1) / zipTicks);
  player.x = from.x + (to.x - from.x) * along;
  player.y = from.y + (to.y - from.y) * along;
  goldImage(player);
  windLine(game, player);
}

function strike(game, player, index) {
  const { spot } = player.rush;
  const move = index === LAST ? DROP : BLOW;
  const target = spot.target;
  const hitY = target ? target.y - 18 * target.scale : player.y - 22;
  const hitX = target ? target.x : player.x + player.facing * 18;
  if (target) {
    applyHit(game, { attacker: player, target, move, x: hitX, y: hitY });
  }
  addBurst(game, { sprite: 'strike', x: hitX, y: hitY, scale: index === LAST ? 1 : 0.8 });
  addSparks(game, { x: hitX, y: hitY, count: 6, color: FX_COLORS.lionGold, speed: 3 });
  leaveEcho(game, {
    x: player.x,
    y: player.y,
    facing: player.facing,
    sprite: player.ultFrame,
    target,
  });
}

function startBlow(game, player, index) {
  player.rush.from = { x: player.x, y: player.y };
  player.rush.spot = blowSpot(game, player, index);
  player.facing = player.rush.spot.facing;
  game.io.sfx('warp');
}

// the rush: a zip to the next raider, a blow, and an echo left holding it, eight times over
export function runRush(game, player, time) {
  const index = blowAt(time);
  const blow = RUSH_BLOWS[index];
  player.ultFrame = rushFrame(time);
  if (time === blow.start) {
    startBlow(game, player, index);
  }
  if (time < blow.start + zipTicks) {
    const { from, spot } = player.rush;
    zip(game, player, { from, to: spot, since: time - blow.start });
  }
  if (time === blow.strikeAt) {
    strike(game, player, index);
  }
}

// back to where the rush started, ready to take up the sword again
export function zipBack(game, player, time) {
  const { rush } = player;
  if (time === RUSH_END) {
    rush.from = { x: player.x, y: player.y };
    player.facing = rush.facing;
    game.io.sfx('warp');
  }
  const to = { x: rush.fromX, y: groundAt(game.terrain, rush.fromX) };
  player.ultFrame = rushFrame(time);
  zip(game, player, { from: rush.from, to, since: time - RUSH_END });
}
