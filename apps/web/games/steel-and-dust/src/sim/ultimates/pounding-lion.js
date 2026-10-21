import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { clamp, randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { releaseLion } from '../summons/lions.js';
import { finaleFlash, finishUlt, hitEveryTarget } from './common.js';

const { poseTicks, slamAt, lionAt, appear, legs, leapHeight, pounceHeight } = POUNDING_LION;
export const POUNCE_AT = lionAt + appear + legs[legs.length - 1];
const BEHIND = 40;
// world px from the lion's centre to its tail and paws at the scale the ultimate draws it
const HALF_LION = 70;
// it turns just inside the far edge, so it never leaves the screen
const EDGE_INSET = 40;
const LEAPS = 3;
// where the sword tip meets the ground in the slam frame, ahead of his feet
const SWORD_REACH = 18;
// [frame, ticks] of a blow: the sword overhead (3), the swing (4), the slam (5), rising (6-7)
const STRIKE = [
  [3, 6],
  [4, 6],
  [5, 12],
  [6, 10],
  [7, 10],
];
const STRIKE_LEAD = 12;
const STRIKE_TICKS = STRIKE.reduce((sum, [, ticks]) => sum + ticks, 0);
const HELD_HIGH = 8;
const FIRST_STRIKE = slamAt - STRIKE_LEAD;
const SECOND_STRIKE = POUNCE_AT - STRIKE_LEAD;

function strikeFrame(since) {
  let left = since;
  for (const [frame, ticks] of STRIKE) {
    if (left < ticks) {
      return frame;
    }
    left -= ticks;
  }
  return HELD_HIGH;
}

// his ultimate strip: the bow and the sword raised (0-2) through the cut-in, the blow that slams the
// ground, the sword held high (8) while the lion runs, then the same blow again as it pounces
export function poundingFrame(time) {
  if (time >= SECOND_STRIKE) {
    return ['ult', strikeFrame(time - SECOND_STRIKE)];
  }
  if (time >= FIRST_STRIKE) {
    return ['ult', strikeFrame(time - FIRST_STRIKE)];
  }
  return ['ult', Math.min(2, Math.floor(time / poseTicks))];
}

function swordTip(game, player) {
  const x = player.x + player.facing * SWORD_REACH;
  return { x, y: groundAt(game.terrain, x) };
}

function slam(game, player) {
  hitEveryTarget(game, player, POUNDING_LION.slam);
  const tip = swordTip(game, player);
  addBurst(game, { sprite: 'pounce', ...tip, scale: 0.7 });
  addSparks(game, { x: tip.x, y: tip.y - 4, count: 18, color: FX_COLORS.lionGold, speed: 4.4 });
  addDust(game, { ...tip, count: 8 });
  shake(game, 5, 16);
  game.io.sfx('heavy');
}

// while he holds the sword high, gold rises off him into the lion's run
function channel(game, player) {
  game.particles.push({
    kind: 'mote',
    x: player.x + randomBetween(-14, 14),
    y: player.y - randomBetween(0, 44),
    vx: 0,
    vy: -randomBetween(0.5, 1.1),
    life: 24,
    maxLife: 24,
    color: game.tickCount % 2 ? FX_COLORS.lionGold : FX_COLORS.lionDeep,
  });
}

// it hops from behind the hero to the edge ahead, then makes one high bound back down on the middle
function lionRun(game, player) {
  // it rises behind the hero, but never so near the screen's edge that it is cut off
  const left = game.camera.x + HALF_LION;
  const behind = clamp(player.x - player.facing * BEHIND, left, left + VIEW_WIDTH - HALF_LION * 2);
  const ahead = game.camera.x + (player.facing > 0 ? VIEW_WIDTH - EDGE_INSET : EDGE_INSET);
  const middle = game.camera.x + VIEW_WIDTH / 2;
  const ground = (x) => groundAt(game.terrain, x);
  const points = [[behind, ground(behind)]];
  for (let leap = 1; leap <= LEAPS; leap++) {
    const x = behind + ((ahead - behind) * leap) / LEAPS;
    points.push([x, ground(x), leapHeight]);
  }
  points.push([middle, ground(middle), pounceHeight]);
  return points.map((point, i) => [legs[i], ...point]);
}

function guardianLion(game, player) {
  const flight = lionRun(game, player);
  releaseLion(game, { flight, hit: POUNDING_LION.lion, scale: 1.3, appear });
  game.io.sfx('roar', false, { x: player.x });
}

function pounce(game, player) {
  const x = game.camera.x + VIEW_WIDTH / 2;
  const y = groundAt(game.terrain, x);
  hitEveryTarget(game, player, POUNDING_LION.pounce);
  addBurst(game, { sprite: 'pounce', x, y, scale: 1.5 });
  addSparks(game, { x, y: y - 20, count: 32, color: FX_COLORS.lionGold, speed: 5 });
  addDust(game, { x, y, count: 12 });
  const tip = swordTip(game, player);
  addSparks(game, { x: tip.x, y: tip.y - 4, count: 10, color: FX_COLORS.lionGold, speed: 3.6 });
  game.io.sfx('boom');
  finaleFlash(game);
}

// Bokator: bow, slam the ground, then the guardian lion bounds across the field and pounces as he
// pounds the ground again
export function runPoundingLion(game, player, time) {
  player.ultFrame = poundingFrame(time);
  if (time === slamAt) {
    slam(game, player);
  }
  if (time === lionAt) {
    guardianLion(game, player);
  }
  if (time >= FIRST_STRIKE + STRIKE_TICKS && time < SECOND_STRIKE && time % 3 === 0) {
    channel(game, player);
  }
  if (time === POUNCE_AT) {
    pounce(game, player);
  }
  if (time >= POUNDING_LION.end) {
    finishUlt(player);
  }
}
