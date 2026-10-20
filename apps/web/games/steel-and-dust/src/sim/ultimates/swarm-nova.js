import { FX_COLORS } from '../../art/fx-colors.js';
import { SWARM_NOVA } from '../../data/ultimates/swarm-nova.js';
import { easeOutCubic } from '../../lib/math.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { addSparks } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { releaseFirefly } from '../summons/fireflies.js';
import { finaleFlash, finishUlt, hitEveryTarget, poseFrame, ultTargets } from './common.js';

const RISE_TICKS = 30;

function heightAt(time) {
  const { hover, novaAt, end } = SWARM_NOVA;
  if (time < novaAt) {
    return hover * easeOutCubic(Math.min(1, time / RISE_TICKS));
  }
  return hover * (1 - Math.min(1, (time - novaAt) / (end - novaAt - 6)));
}

function releaseSwarm(game, player) {
  const targets = ultTargets(game);
  const { swarm, sting, stings, recallAt, intro } = SWARM_NOVA;
  for (let i = 0; i < swarm; i++) {
    const angle = (i / swarm) * Math.PI * 2;
    releaseFirefly(game, {
      x: player.x + Math.cos(angle) * 10,
      y: player.y - 34 + Math.sin(angle) * 10,
      angle,
      hit: sting,
      stings,
      target: targets.length ? targets[i % targets.length] : null,
      life: recallAt - intro + 60,
      owner: player,
    });
  }
  game.io.sfx('swarm', false, { x: player.x });
}

function swarmOf(game) {
  return game.summons.filter((summon) => summon.kind === 'firefly' && summon.owner);
}

function recallSwarm(game) {
  for (const fly of swarmOf(game)) {
    fly.mode = 'return';
  }
}

function nova(game, player) {
  for (const fly of swarmOf(game)) {
    fly.done = true;
  }
  const y = player.y - 24;
  addBurst(game, { sprite: 'nova', x: player.x, y, scale: 1.3 });
  addSparks(game, { x: player.x, y, count: 30, color: FX_COLORS.emberGold, speed: 5 });
  hitEveryTarget(game, player, SWARM_NOVA.nova);
  finaleFlash(game);
}

// Firefly: rise on the glow, loose the swarm on every raider, call it home and burst as a nova.
// The floor is taken once, as the rise lifts the hero past whatever platforms are overhead
export function runSwarmNova(game, player, time) {
  const { intro, recallAt, novaAt, end, poseTicks } = SWARM_NOVA;
  if (time === 1) {
    player.ultFloor = floorUnder(game.terrain, player);
  }
  player.y = player.ultFloor - heightAt(time);
  player.airborne = player.y < player.ultFloor;
  player.ultFrame = poseFrame(time, poseTicks);
  if (time === intro) {
    releaseSwarm(game, player);
  }
  if (time === recallAt) {
    recallSwarm(game);
  }
  if (time === novaAt) {
    nova(game, player);
  }
  if (time >= end) {
    player.y = player.ultFloor;
    player.airborne = false;
    finishUlt(player);
  }
}
