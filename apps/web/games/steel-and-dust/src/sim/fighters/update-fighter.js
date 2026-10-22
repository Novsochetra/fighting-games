import { WEAPONS } from '../../data/weapons/index.js';
import { randomBetween } from '../../lib/math.js';
import { thinkEnemy } from '../brains/enemy/think-enemy.js';
import { thinkPlayer } from '../brains/player/think-player.js';
import { enemySpriteFrame } from '../enemy-animation.js';
import { addDust } from '../fx/particles.js';
import { heroAnimation } from '../hero-animation.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { updateScarf } from '../pose/scarf.js';
import { strikePoints } from '../pose/weapon-line.js';
import { isPlayer } from './loadout.js';
import { applyPhysics } from './physics.js';
import { updateState } from './state-update.js';
import { floorUnder } from './terrain-motion.js';

const COUNTDOWNS = ['flashTime', 'armorFlash', 'blockFlash', 'invincible', 'hpBarTime'];

function tickTimers(fighter) {
  fighter.hitShake = 0;
  fighter.animTime++;
  for (const key of COUNTDOWNS) {
    if (fighter[key] > 0) {
      fighter[key]--;
    }
  }
}

// a move drawn on a timeline of its own strip carries its own smear in the frames, and so does every
// swing of a boss, whose sheet draws its own arc where the drawn weapon really is
function inSwing(fighter) {
  const move = fighter.move;
  return (
    fighter.state === 'attack' &&
    move &&
    !move.frameAt &&
    !fighter.def?.boss &&
    fighter.moveTime >= move.startup - 1 &&
    fighter.moveTime <= move.startup + move.active + 1
  );
}

function updateTrail(fighter) {
  if (inSwing(fighter)) {
    const { tip, inner } = strikePoints(fighter);
    fighter.trail.push({ tipX: tip.x, tipY: tip.y, innerX: inner.x, innerY: inner.y });
    if (fighter.trail.length > 6) {
      fighter.trail.shift();
    }
  } else if (fighter.trail.length) {
    fighter.trail.shift();
  }
}

// a few spaced echoes, not one per tick
function wantsAfterimage(fighter) {
  if (fighter.state === 'dash') {
    return fighter.stateTime % 4 === 1 && fighter.stateTime < 14;
  }
  const move = fighter.move;
  return (
    fighter.state === 'attack' &&
    move &&
    move.afterimages &&
    fighter.hitboxActive &&
    fighter.animTime % 3 === 0
  );
}

function addAfterimage(fighter) {
  fighter.afterimages.push({
    x: fighter.x,
    y: fighter.y,
    joints: fighter.joints,
    facing: fighter.facing,
    pose: fighter.pose,
    sprite: isPlayer(fighter) ? heroAnimation(fighter) : enemySpriteFrame(fighter),
    row: isPlayer(fighter) ? WEAPONS[fighter.weapon.id].spriteRow : 0,
    life: 12,
    ghost: fighter.move?.ghost,
  });
}

function addWindLine(game, fighter) {
  game.particles.push({
    kind: 'streak',
    x: fighter.x - fighter.facing * randomBetween(4, 10),
    y: fighter.y - randomBetween(6, 30),
    vx: -fighter.facing * randomBetween(1.2, 2.2),
    vy: 0,
    life: 10,
    maxLife: 10,
    length: randomBetween(5, 10) | 0,
  });
}

function addMotionEffects(game, fighter) {
  if (wantsAfterimage(fighter)) {
    addAfterimage(fighter);
  }
  if (fighter.state === 'dash' && fighter.stateTime < 12 && fighter.stateTime % 2 === 0) {
    addWindLine(game, fighter);
  }
  if (fighter.state === 'walk' && !fighter.entering && fighter.animTime % 14 === 0) {
    const y = floorUnder(game.terrain, fighter);
    addDust(game, { x: fighter.x - fighter.facing * 5, y, count: 1 });
  }
  for (const image of fighter.afterimages) {
    image.life--;
  }
  fighter.afterimages = fighter.afterimages.filter((image) => image.life > 0);
}

function easeHealthBar(fighter) {
  fighter.hpLag =
    fighter.hpLag > fighter.hp ? Math.max(fighter.hp, fighter.hpLag - 0.5) : fighter.hp;
}

// a fighter in hitstop is frozen: logic and pose both pause
export function updateFighter(game, fighter) {
  if (fighter.hitstop > 0) {
    fighter.hitstop--;
    return;
  }
  tickTimers(fighter);
  if (isPlayer(fighter)) {
    thinkPlayer(game, fighter);
  } else {
    thinkEnemy(game, fighter);
  }
  updateState(game, fighter);
  applyPhysics(game, fighter);
  refreshPose(fighter);
  updateTrail(fighter);
  addMotionEffects(game, fighter);
  if (fighter.scarf) {
    updateScarf(fighter, game.tickCount);
  }
  easeHealthBar(fighter);
}
