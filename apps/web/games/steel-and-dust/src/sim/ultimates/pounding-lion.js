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
import { breatheIn, gatherMote, unleash } from './lion-gather.js';
import { heapAt, prideFlight, prideSchedule } from './lion-pride.js';
import { runRush, zipBack } from './lion-rush.js';
import { FINALE_START, poundingFrame } from './pounding-frames.js';
import { RUSH_END, WAKE_AT } from './rush-timing.js';

const { slamAt, gatherAt, rushAt, pounceAt } = POUNDING_LION;
// where his fist meets the ground in the slam frame, ahead of his feet
const FIST_REACH = 14;

function fistPoint(game, player) {
  const x = player.x + player.facing * FIST_REACH;
  return { x, y: groundAt(game.terrain, x) };
}

function slam(game, player) {
  hitEveryTarget(game, player, POUNDING_LION.slam);
  const fist = fistPoint(game, player);
  addBurst(game, { sprite: 'pounce', ...fist, scale: 0.7 });
  addSparks(game, { x: fist.x, y: fist.y - 4, count: 18, color: FX_COLORS.lionGold, speed: 4.4 });
  addDust(game, { ...fist, count: 8 });
  shake(game, 5, 16);
  game.io.sfx('heavy');
}

// while he stands in his stance, gold rises off him into the lions
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

// he plants his stance in a ring of gold, and every echo he left wakes, in the order he struck, and
// rises as a lion that bounds onto the heap ahead of him
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
    breatheIn(game, player);
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

// Bokator, bare-handed throughout: bow and slam the ground with his fist, rush the raiders leaving
// gold echoes that strike again, then the echoes rise as a pride of lions that pounces as he pounds
// the ground again
export function runPoundingLion(game, player, time) {
  player.ultFrame = poundingFrame(time);
  if (time === slamAt) {
    slam(game, player);
  }
  runRushPhases(game, player, time);
  if (time === WAKE_AT) {
    wakePride(game, player);
  }
  if (time > WAKE_AT && time < FINALE_START && time % 3 === 0) {
    channel(game, player);
  }
  if (time === pounceAt) {
    pounce(game, player);
  }
  if (time >= POUNDING_LION.end) {
    player.rush = null;
    finishUlt(player);
  }
}
