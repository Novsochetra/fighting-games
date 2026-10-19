import { COLORS } from '../art/colors.js';
import { GROUND_Y, VIEW_WIDTH } from '../config.js';
import { ULT_SPRITES } from '../data/hero-sprites.js';
import { ULTIMATE } from '../data/ultimate.js';
import { clamp } from '../lib/math.js';
import { applyHit } from './combat/apply-hit.js';
import { arenaBounds } from './fighters/arena-bounds.js';
import { shake } from './fx/camera-fx.js';
import { addSparks } from './fx/particles.js';

const STRIKES_END = ULTIMATE.intro + ULTIMATE.gap * ULTIMATE.strikes;

export function ultTargets(game) {
  const left = game.camera.x - 8;
  const right = game.camera.x + VIEW_WIDTH + 8;
  return game.fighters.filter(
    (fighter) =>
      fighter.side === 'enemy' &&
      fighter.state !== 'ko' &&
      !fighter.removed &&
      !fighter.entering &&
      fighter.x > left &&
      fighter.x < right,
  );
}

export function startUlt(game, player) {
  Object.assign(player, { state: 'ult', stateTime: 0, move: null, hitboxActive: false });
  player.trail.length = 0;
  Object.assign(player, { vx: 0, vy: 0, invincible: 999, ultFrame: ['cleave', 1] });
  game.ultMeter = 0;
  game.ultFreeze = ULTIMATE.intro;
  game.io.sfx('ult');
  shake(game, 2, 12);
  addSparks(game, { x: player.x, y: player.y - 24, count: 16, color: COLORS.gold, speed: 3.4 });
}

function leaveAfterimage(player) {
  player.afterimages.push({
    x: player.x,
    y: player.y,
    facing: player.facing,
    sprite: player.ultFrame,
    color: COLORS.gold,
    life: 14,
  });
}

function warpStrike(game, player, strike, bounds) {
  const targets = ultTargets(game);
  player.ultFrame = ULT_SPRITES[strike % ULT_SPRITES.length];
  if (!targets.length) {
    addSparks(game, {
      x: player.x + player.facing * 14,
      y: player.y - 22,
      count: 6,
      color: COLORS.gold,
      speed: 2.4,
    });
    return;
  }
  const target = targets[strike % targets.length];
  const side = strike % 2 ? 1 : -1;
  leaveAfterimage(player);
  player.x = clamp(target.x + side * 16 * target.scale, bounds.min, bounds.max);
  player.y = target.y;
  Object.assign(player, { airborne: player.y < GROUND_Y, vx: 0, vy: 0 });
  player.facing = target.x >= player.x ? 1 : -1;
  game.io.sfx('warp');
  const x = target.x - player.facing * 4;
  applyHit(game, {
    attacker: player,
    target,
    move: ULTIMATE.hit,
    x,
    y: target.y - 18 * target.scale,
  });
}

function returnToCenter(game, player, bounds) {
  leaveAfterimage(player);
  player.x = clamp(game.camera.x + VIEW_WIDTH / 2, bounds.min, bounds.max);
  Object.assign(player, { y: GROUND_Y, airborne: false, vx: 0, vy: 0 });
  game.io.sfx('warp');
}

function finaleFrame(elapsed) {
  const { finaleAt, finale } = ULTIMATE;
  if (elapsed < finaleAt) {
    return Math.min(2, Math.floor((elapsed * 3) / finaleAt));
  }
  return Math.min(7, 3 + Math.floor(((elapsed - finaleAt) * 5) / (finale - finaleAt)));
}

function finalSlash(game, player) {
  game.flashTime = 10;
  game.slashBandTime = 16;
  shake(game, 6, 24);
  game.io.sfx('ultEnd');
  game.slowMotion = Math.max(game.slowMotion, 36);
  const facing = player.facing;
  for (const target of ultTargets(game)) {
    player.facing = target.x >= player.x ? 1 : -1;
    applyHit(game, {
      attacker: player,
      target,
      move: ULTIMATE.end,
      x: target.x,
      y: target.y - 18 * target.scale,
    });
  }
  player.facing = facing;
}

function runFinale(game, player, elapsed) {
  player.ultFrame = ['cleave', finaleFrame(elapsed)];
  if (elapsed === ULTIMATE.finaleAt) {
    finalSlash(game, player);
  }
  if (elapsed >= ULTIMATE.finale) {
    Object.assign(player, { invincible: 40, state: 'idle', ultFrame: null, vx: 0, vy: 0 });
  }
}

export function updateUlt(game, player) {
  const time = ++player.stateTime;
  const { intro, gap } = ULTIMATE;
  const bounds = arenaBounds(game, player);
  if (time >= intro && time < STRIKES_END && (time - intro) % gap === 0) {
    warpStrike(game, player, (time - intro) / gap, bounds);
  }
  if (time === STRIKES_END) {
    returnToCenter(game, player, bounds);
  }
  if (time >= STRIKES_END) {
    runFinale(game, player, time - STRIKES_END);
  }
}
