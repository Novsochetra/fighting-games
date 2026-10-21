import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { PHOENIX_PYRE } from '../../data/ultimates/phoenix-pyre.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from '../summons/bursts.js';
import { igniteTarget } from '../summons/burn.js';
import { releasePhoenix } from '../summons/phoenix.js';
import { raisePillar } from '../summons/pillars.js';
import { finaleFlash, finishUlt, hitEveryTarget, poseFrame, ultTargets } from './common.js';

const { intro, waves, waveGap, waveSpacing, phoenixAt, legs, burn } = PHOENIX_PYRE;
const DIVE_AT = phoenixAt + legs[legs.length - 1];

function raiseWave(game, player, wave) {
  const distance = 20 + wave * waveSpacing;
  const scale = 0.8 + wave * 0.06;
  for (const side of [-1, 1]) {
    raisePillar(game, { x: player.x + side * distance, scale, hit: PHOENIX_PYRE.pillar, burn });
  }
  shake(game, 2, 5);
}

function waveAt(since) {
  const wave = since / waveGap;
  return since >= 0 && Number.isInteger(wave) && wave < waves ? wave : -1;
}

function flightOf(game, player) {
  const behind = game.camera.x + (player.facing > 0 ? -40 : VIEW_WIDTH + 40);
  const ahead = game.camera.x + (player.facing > 0 ? VIEW_WIDTH + 40 : -40);
  const middle = game.camera.x + VIEW_WIDTH / 2;
  const floor = floorUnder(game.terrain, player);
  const [low, high] = [floor - 24, floor - 120];
  const points = [
    [player.x - player.facing * 30, high],
    [behind, low],
    [ahead, low],
    [ahead, low - 30],
    [behind, low],
    [middle, high - 10],
    [middle, groundAt(game.terrain, middle) - 8],
  ];
  return [[0, player.x, player.y - 46], ...points.map(([x, y], i) => [legs[i], x, y])];
}

function riseOfThePhoenix(game, player) {
  const flight = flightOf(game, player);
  releasePhoenix(game, { flight, hit: PHOENIX_PYRE.talon, burn, scale: 1.3 });
  addSparks(game, {
    x: player.x,
    y: player.y - 46,
    count: 20,
    color: FX_COLORS.emberGold,
    speed: 4,
  });
  game.io.sfx('phoenix', false, { x: player.x });
}

function inferno(game, player) {
  const x = game.camera.x + VIEW_WIDTH / 2;
  addBurst(game, { sprite: 'inferno', x, y: groundAt(game.terrain, x), scale: 1.5 });
  for (const target of ultTargets(game)) {
    igniteTarget(game, target, burn);
  }
  hitEveryTarget(game, player, PHOENIX_PYRE.inferno);
  addSparks(game, {
    x,
    y: groundAt(game.terrain, x) - 30,
    count: 30,
    color: FX_COLORS.emberGold,
    speed: 5,
  });
  game.io.sfx('boom');
  finaleFlash(game);
}

// Ember: raise the blade, flames roll out to both edges, the phoenix sweeps the field and dives
export function runPhoenixPyre(game, player, time) {
  player.ultFrame = poseFrame(time, PHOENIX_PYRE.poseTicks);
  const wave = waveAt(time - intro);
  if (wave >= 0) {
    raiseWave(game, player, wave);
  }
  if (time === phoenixAt) {
    riseOfThePhoenix(game, player);
  }
  if (time === DIVE_AT) {
    inferno(game, player);
  }
  if (time >= PHOENIX_PYRE.end) {
    finishUlt(player);
  }
}
