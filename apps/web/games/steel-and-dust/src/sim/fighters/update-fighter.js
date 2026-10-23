import { thinkEnemy } from '../brains/enemy/think-enemy.js';
import { thinkPlayer } from '../brains/player/think-player.js';
import { refreshPose } from '../pose/refresh-pose.js';
import { updateScarf } from '../pose/scarf.js';
import { strikePoints } from '../pose/weapon-line.js';
import { isPlayer } from './loadout.js';
import { addMotionEffects } from './motion-effects.js';
import { applyPhysics } from './physics.js';
import { updateState } from './state-update.js';

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
