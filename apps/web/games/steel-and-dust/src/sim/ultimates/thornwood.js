import { FX_COLORS } from '../../art/fx-colors.js';
import { THORNWOOD } from '../../data/ultimates/thornwood.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { addDust } from '../fx/particles.js';
import { raiseThorn } from '../summons/thorns.js';
import { finaleFlash, finishUlt, poseFrame, ultTargets } from './common.js';

// the bloom's thorns strike two frames after they break the ground
const BLOOM_STRIKE = 6;

function plantBlade(game, player) {
  shake(game, 3, 10);
  addDust(game, {
    x: player.x + player.facing * 10,
    y: floorUnder(game.terrain, player),
    count: 10,
  });
  game.io.sfx('boom');
}

function raiseWave(game, player, wave) {
  const distance = 22 + wave * THORNWOOD.waveSpacing;
  const scale = 0.85 + wave * 0.05;
  for (const side of [-1, 1]) {
    raiseThorn(game, { x: player.x + side * distance, scale, hit: THORNWOOD.thorn });
  }
  shake(game, 2, 5);
}

function leafStorm(game, player) {
  const floor = floorUnder(game.terrain, player);
  for (let i = 0; i < 40; i++) {
    game.particles.push({
      kind: 'mote',
      x: player.x + randomBetween(-200, 200),
      y: floor - randomBetween(0, 120),
      vx: randomBetween(-0.6, 0.6),
      vy: -randomBetween(0.3, 1.2),
      life: 50,
      maxLife: 50,
      color: i % 3 ? FX_COLORS.leafLight : FX_COLORS.leaf,
    });
  }
}

function bloom(game, player) {
  for (const target of ultTargets(game)) {
    raiseThorn(game, { x: target.x, scale: 1.35, hit: THORNWOOD.bloom });
  }
  leafStorm(game, player);
}

function waveAt(since) {
  const wave = since / THORNWOOD.waveGap;
  return since >= 0 && Number.isInteger(wave) && wave < THORNWOOD.waves ? wave : -1;
}

// Moss: kneel and plant the blade, brambles roll out to both edges, then bloom under everyone
export function runThornwood(game, player, time) {
  player.ultFrame = poseFrame(time, THORNWOOD.poseTicks);
  const since = time - THORNWOOD.intro;
  if (since === 0) {
    plantBlade(game, player);
  }
  const wave = waveAt(since);
  if (wave >= 0) {
    raiseWave(game, player, wave);
  }
  if (time === THORNWOOD.bloomAt) {
    bloom(game, player);
  }
  if (time === THORNWOOD.bloomAt + BLOOM_STRIKE) {
    finaleFlash(game);
  }
  if (time >= THORNWOOD.end) {
    finishUlt(player);
  }
}
