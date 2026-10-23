import { difficultyOf } from '../../data/difficulty.js';
import { randomBetween } from '../../lib/math.js';
import { addDust } from '../fx/particles.js';
import { movesetOf } from './loadout.js';
import { floorUnder } from './terrain-motion.js';
import { releaseToken } from './tokens.js';

function clearMove(fighter) {
  fighter.move = null;
  fighter.hitboxActive = false;
}

export function startMove(game, fighter, id) {
  const move = movesetOf(game, fighter)[id];
  if (!move) {
    return false;
  }
  Object.assign(fighter, { move, moveTime: 0, state: 'attack', hitboxActive: false });
  fighter.hitTargets.clear();
  fighter.hitConfirmed = false;
  fighter.durabilityUsed = false;
  fighter.poseAtMoveStart = fighter.pose;
  fighter.trail.length = 0;
  if (fighter.airborne && !move.dive && fighter.vy > 0) {
    fighter.vy *= 0.4;
  }
  if (fighter.side === 'enemy' && fighter.def.boss && !move.quiet) {
    game.io.sfx('warn');
  }
  return true;
}

export function endMove(game, fighter) {
  clearMove(fighter);
  fighter.state = fighter.airborne ? 'air' : 'idle';
  if (fighter.side === 'enemy') {
    releaseToken(game, fighter);
    const wait = fighter.def.boss ? randomBetween(30, 60) : randomBetween(45, 95);
    fighter.ai.cooldown = Math.round(wait * difficultyOf(game.settings).cooldown);
  }
}

export function jump(game, fighter, { vy, vx }) {
  fighter.vy = vy;
  if (vx !== undefined) {
    fighter.vx = vx;
  }
  fighter.airborne = true;
  fighter.state = 'air';
  clearMove(fighter);
  game.io.sfx('jump');
  addDust(game, { x: fighter.x, y: floorUnder(game.terrain, fighter), count: 3 });
}

// three frames on the ground before take-off
export function startSquat(fighter, direction) {
  fighter.state = 'squat';
  fighter.stateTime = 0;
  fighter.jumpDirection = direction;
  clearMove(fighter);
}

export function startCharge(fighter) {
  fighter.state = 'charge';
  fighter.stateTime = 0;
  clearMove(fighter);
  fighter.trail.length = 0;
}

// a dash out of a dash gets fewer invincible frames
export function dash(game, fighter, direction) {
  const chained = fighter.state === 'dash';
  fighter.dashChain = chained ? fighter.dashChain + 1 : 0;
  fighter.state = 'dash';
  fighter.stateTime = 0;
  if (direction) {
    fighter.facing = direction;
  }
  fighter.invincible = Math.max(fighter.invincible, chained ? 9 : 14);
  clearMove(fighter);
  fighter.spriteName = null;
  game.io.sfx(fighter.airborne ? 'dashAir' : 'dash', false, { x: fighter.x, dir: fighter.facing });
  if (fighter.airborne) {
    fighter.airDashUsed = true;
    fighter.vy = 0;
  } else {
    addDust(game, { x: fighter.x, y: floorUnder(game.terrain, fighter), count: 4 });
  }
}

export function startRun(fighter) {
  fighter.state = 'run';
  fighter.stateTime = 0;
  clearMove(fighter);
}
