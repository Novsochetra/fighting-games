import { FX_COLORS } from '../../art/fx-colors.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { randomBetween } from '../../lib/math.js';
import { addRing } from '../fx/effects.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { wakeEcho } from '../summons/echoes.js';
import { releaseLion } from '../summons/lions.js';
import { finaleFlash, finishUlt, hitEveryTarget } from './common.js';
import { COIL_FRAME, gatherMote, letSwordGo, unleash } from './lion-gather.js';
import { heapAt, prideFlight, prideSchedule } from './lion-pride.js';
import { runRush, zipBack } from './lion-rush.js';
import { RUSH_END, rushFrame, WAKE_AT } from './rush-timing.js';

const { poseTicks, slamAt, gatherAt, rushAt } = POUNDING_LION;
export const POUNCE_AT = POUNDING_LION.pounceAt;
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

// his frames: the bow and the sword raised (0-2) through the cut-in, the blow that slams the ground,
// the coil with the sword gone to gold, the rush in his bare-hand strips, then the sword back and
// held high (8) while the pride wakes, and the same blow again as it pounces
export function poundingFrame(time) {
  if (time >= SECOND_STRIKE) {
    return ['ult', strikeFrame(time - SECOND_STRIKE)];
  }
  if (time >= WAKE_AT) {
    return ['ult', HELD_HIGH];
  }
  if (time >= rushAt) {
    return rushFrame(time);
  }
  if (time >= gatherAt) {
    return COIL_FRAME;
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

// while he holds the sword high, gold rises off him into the lions
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

// the sword comes back to his hand in a flash, and every echo he left wakes, in the order he struck,
// and rises as a lion that bounds onto the heap ahead of him
function wakePride(game, player) {
  const echoes = game.summons.filter((summon) => summon.kind === 'echo');
  const heap = heapAt(player.x, player.facing);
  const ground = (x) => groundAt(game.terrain, x);
  addRing(game, { x: player.x, y: player.y - 40, color: FX_COLORS.lionGold, big: true });
  prideSchedule().forEach(({ scale, delay, appear, run }, rank) => {
    const echo = echoes[rank];
    const start = echo ? echo.x : heap - player.facing * (60 + rank * 12);
    if (echo) {
      wakeEcho(echo, delay);
    }
    releaseLion(game, {
      flight: prideFlight(start, rank, { heap, ground, scale, run }),
      hit: POUNDING_LION.lion,
      scale,
      delay,
      appear,
    });
  });
  game.io.sfx('roar', false, { x: player.x });
}

function pounce(game, player) {
  const x = heapAt(player.x, player.facing);
  const y = groundAt(game.terrain, x);
  hitEveryTarget(game, player, POUNDING_LION.pounce);
  addBurst(game, { sprite: 'pounce', x, y, scale: 1.5 });
  addSparks(game, { x, y: y - 20, count: 32, color: FX_COLORS.lionGold, speed: 5 });
  addDust(game, { x, y, count: 12 });
  game.io.sfx('boom');
  finaleFlash(game);
}

function runRushPhases(game, player, time) {
  if (time === gatherAt) {
    letSwordGo(game, player);
  }
  if (time > gatherAt && time < rushAt) {
    gatherMote(game, player);
  }
  if (time === rushAt) {
    unleash(game, player);
  }
  if (time >= rushAt && time < RUSH_END) {
    runRush(game, player, time);
  }
  if (time >= RUSH_END && time < WAKE_AT) {
    zipBack(game, player, time);
  }
}

// Bokator: bow and slam the ground, rush the raiders bare-handed leaving gold echoes that strike
// again, then the echoes rise as a pride of lions that pounces as he pounds the ground again
export function runPoundingLion(game, player, time) {
  player.ultFrame = poundingFrame(time);
  if (time === slamAt) {
    slam(game, player);
  }
  runRushPhases(game, player, time);
  if (time === WAKE_AT) {
    wakePride(game, player);
  }
  if (time > WAKE_AT && time < SECOND_STRIKE && time % 3 === 0) {
    channel(game, player);
  }
  if (time === POUNCE_AT) {
    pounce(game, player);
  }
  if (time >= POUNDING_LION.end) {
    player.rush = null;
    finishUlt(player);
  }
}
