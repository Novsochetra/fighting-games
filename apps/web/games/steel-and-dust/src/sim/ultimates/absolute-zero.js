import { VIEW_WIDTH } from '../../config.js';
import { ULT_SPRITES } from '../../data/hero-sprites.js';
import { ABSOLUTE_ZERO } from '../../data/ultimates/absolute-zero.js';
import { clamp } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { freezeTarget } from '../combat/freeze.js';
import { arenaBounds } from '../fighters/arena-bounds.js';
import { themeOf } from '../fighters/hero-colors.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { addCutLine } from '../fx/effects.js';
import { addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { shatterIce } from '../summons/ice.js';
import { finaleFlash, finishUlt, ultTargets } from './common.js';

const { intro, gap, strikes } = ABSOLUTE_ZERO;
const STRIKES_END = intro + gap * strikes;
// the ice holds until the sheath shatters it, however long that takes
const HELD = 999;

function leaveAfterimage(game, player) {
  player.afterimages.push({
    x: player.x,
    y: player.y,
    facing: player.facing,
    sprite: player.ultFrame,
    color: themeOf(game).blade,
    life: 14,
  });
}

function blinkTo(game, player, target, side) {
  leaveAfterimage(game, player);
  const bounds = arenaBounds(game, player);
  player.x = clamp(target.x + side * 16 * target.scale, bounds.min, bounds.max);
  // level with the raider, but never inside a rise beside it
  player.y = Math.min(target.y, groundAt(game.terrain, player.x));
  Object.assign(player, { airborne: player.y < floorUnder(game.terrain, player), vx: 0, vy: 0 });
  player.facing = target.x >= player.x ? 1 : -1;
  game.io.sfx('warp');
}

// each cut lands in passing and leaves the raider frozen where it stood
function iaiCut(game, player, strike) {
  const targets = ultTargets(game);
  player.ultFrame = ULT_SPRITES[strike % ULT_SPRITES.length];
  if (!targets.length) {
    const x = player.x + player.facing * 14;
    addSparks(game, { x, y: player.y - 22, count: 6, color: themeOf(game).spark, speed: 2.4 });
    return;
  }
  const target = targets[strike % targets.length];
  blinkTo(game, player, target, strike % 2 ? 1 : -1);
  const y = target.y - 18 * target.scale;
  applyHit(game, { attacker: player, target, move: ABSOLUTE_ZERO.cut, x: target.x, y });
  addCutLine(game, { x: target.x, y, angle: strike * 1.3, color: themeOf(game).blade });
  freezeTarget(game, target, { duration: HELD, shatter: ABSOLUTE_ZERO.shatter });
}

function returnToCenter(game, player) {
  leaveAfterimage(game, player);
  const bounds = arenaBounds(game, player);
  player.x = clamp(game.camera.x + VIEW_WIDTH / 2, bounds.min, bounds.max);
  Object.assign(player, { y: groundAt(game.terrain, player.x), airborne: false, vx: 0, vy: 0 });
  game.io.sfx('warp');
}

function shatterAll(game) {
  for (const ice of game.summons.filter((summon) => summon.kind === 'ice')) {
    shatterIce(game, ice);
  }
  game.slashBandTime = 16;
  finaleFlash(game);
}

function sheathFrame(time) {
  const { saluteFrames, poseTicks, sheathTicks } = ABSOLUTE_ZERO;
  if (time < intro) {
    return ['ult', Math.min(saluteFrames - 1, Math.floor(time / poseTicks))];
  }
  return ['ult', Math.min(8, saluteFrames + Math.floor((time - STRIKES_END) / sheathTicks))];
}

// Blue: time stops; every raider is cut in passing and frozen, and the ice shatters on the sheath
export function runAbsoluteZero(game, player, time) {
  const cutting = time >= intro && time < STRIKES_END;
  if (!cutting) {
    player.ultFrame = sheathFrame(time);
  }
  if (cutting && (time - intro) % gap === 0) {
    iaiCut(game, player, (time - intro) / gap);
  }
  if (time === STRIKES_END) {
    returnToCenter(game, player);
  }
  if (time === ABSOLUTE_ZERO.shatterAt) {
    shatterAll(game);
  }
  if (time >= ABSOLUTE_ZERO.end) {
    finishUlt(player);
  }
}
