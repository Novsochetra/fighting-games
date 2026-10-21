import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { clamp } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { releaseLion } from '../summons/lions.js';
import { finaleFlash, finishUlt, hitEveryTarget, poseFrame } from './common.js';

const { slamAt, lionAt, appear, legs, leapHeight, pounceHeight } = POUNDING_LION;
const POUNCE_AT = lionAt + appear + legs[legs.length - 1];
const BEHIND = 40;
// world px from the lion's centre to its tail and paws at the scale the ultimate draws it
const HALF_LION = 70;
const OFFSCREEN = 60;
// where each point of the run sits between its start behind the hero (0) and the edge ahead (1),
// and how high above the ground, in leaps
const RUN = [
  [0, 0],
  [1 / 6, 1],
  [1 / 3, 0],
  [1 / 2, 1],
  [2 / 3, 0],
  [5 / 6, 1],
  [1, 0],
];

function slam(game, player) {
  hitEveryTarget(game, player, POUNDING_LION.slam);
  for (const side of [-1, 1]) {
    addSparks(game, {
      x: player.x + side * 14,
      y: player.y - 4,
      count: 14,
      color: FX_COLORS.lionGold,
      speed: 4.4,
    });
    addDust(game, { x: player.x + side * 20, y: player.y, count: 6 });
  }
  shake(game, 5, 16);
  game.io.sfx('heavy');
}

function lionRun(game, player) {
  // it rises behind the hero, but never so near the screen's edge that it is cut off
  const left = game.camera.x + HALF_LION;
  const behind = clamp(player.x - player.facing * BEHIND, left, left + VIEW_WIDTH - HALF_LION * 2);
  const ahead = game.camera.x + (player.facing > 0 ? VIEW_WIDTH + OFFSCREEN : -OFFSCREEN);
  const middle = game.camera.x + VIEW_WIDTH / 2;
  const ground = (x) => groundAt(game.terrain, x);
  const points = RUN.map(([along, leaps]) => {
    const x = behind + (ahead - behind) * along;
    return [x, ground(x) - leaps * leapHeight];
  });
  points.push([middle, ground(middle) - pounceHeight], [middle, ground(middle)]);
  return points.map(([x, y], i) => [legs[i], x, y]);
}

function guardianLion(game, player) {
  const flight = lionRun(game, player);
  releaseLion(game, { flight, hit: POUNDING_LION.lion, scale: 1.3, appear });
  game.io.sfx('roar', false, { x: player.x });
}

function pounce(game, player) {
  const x = game.camera.x + VIEW_WIDTH / 2;
  hitEveryTarget(game, player, POUNDING_LION.pounce);
  addSparks(game, {
    x,
    y: groundAt(game.terrain, x) - 20,
    count: 32,
    color: FX_COLORS.lionGold,
    speed: 5,
  });
  addDust(game, { x, y: groundAt(game.terrain, x), count: 12 });
  game.io.sfx('boom');
  finaleFlash(game);
}

// Bokator: bow, slam the ground, then the guardian lion bounds across the field and pounces
export function runPoundingLion(game, player, time) {
  player.ultFrame = poseFrame(time, POUNDING_LION.poseTicks);
  if (time === slamAt) {
    slam(game, player);
  }
  if (time === lionAt) {
    guardianLion(game, player);
  }
  if (time === POUNCE_AT) {
    pounce(game, player);
  }
  if (time >= POUNDING_LION.end) {
    finishUlt(player);
  }
}
