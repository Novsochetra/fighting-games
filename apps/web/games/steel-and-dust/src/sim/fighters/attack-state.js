import { GROUND_Y } from '../../config.js';
import { activeEnd, moveLength } from '../../data/moves/define-move.js';
import { playSwing, swingLeadTicks } from '../combat/sounds.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { pullIn, quake } from '../hazards/area-moves.js';
import { spawnSlashWave, tossKnife } from '../hazards/projectiles.js';
import { spawnShockwave } from '../hazards/shockwaves.js';
import { endMove } from './actions.js';
import { arenaBounds } from './arena-bounds.js';

function lunge(_game, fighter, move) {
  fighter.vx = fighter.facing * move.forward * (fighter.airborne ? 0.4 : 1);
}

function chargeRelease(game, _fighter, move) {
  game.io.sfx('release');
  shake(game, move.chargeLevel, 6);
}

function stompDown(_game, fighter, move) {
  fighter.vy = Math.max(fighter.vy, move.stomp);
}

const isBossSlam = (fighter, move) =>
  fighter.side === 'enemy' && fighter.def.boss && move.id === 'slam';

// [does this move do it, what it does] on the first active frame
const STRIKE_EFFECTS = [
  [(_fighter, move) => move.forward && !move.sustain, lunge],
  [
    (_fighter, move) => move.shockwave && !move.dive,
    (game, fighter) => spawnShockwave(game, fighter),
  ],
  [isBossSlam, (game) => shake(game, 2, 6)],
  [(_fighter, move) => move.chargeLevel, chargeRelease],
  [(_fighter, move) => move.waveDamage, spawnSlashWave],
  [(_fighter, move) => move.toss, (game, fighter) => tossKnife(game, fighter)],
  [(_fighter, move) => move.quakeDamage, quake],
  [(fighter, move) => move.stomp && fighter.airborne, stompDown],
];

function releaseStrike(game, fighter, move) {
  for (const [applies, run] of STRIKE_EFFECTS) {
    if (applies(fighter, move)) {
      run(game, fighter, move);
    }
  }
}

// a rush that reaches the arena wall stops there with a thud
function sustainRush(game, fighter, move) {
  fighter.vx = fighter.facing * move.forward;
  const bounds = arenaBounds(game, fighter);
  const atWall =
    (fighter.facing > 0 && fighter.x >= bounds.max - 1) ||
    (fighter.facing < 0 && fighter.x <= bounds.min + 1);
  if (atWall) {
    fighter.moveTime = activeEnd(move) - 1;
    shake(game, 2, 8);
    addDust(game, { x: fighter.x + fighter.facing * 10, y: GROUND_Y, count: 6 });
    game.io.sfx('heavy');
  }
}

function whileActive(game, fighter, move, time) {
  if (move.dive) {
    fighter.vx = fighter.facing * move.dive[0];
    fighter.vy = move.dive[1];
    fighter.airborne = true;
  }
  if (move.sustain) {
    sustainRush(game, fighter, move);
  }
  if (move.multiHit && (time - move.startup) % move.multiHit === 0) {
    fighter.hitTargets.clear();
  }
  if (move.multiHit && time > move.startup && (time - move.startup) % (move.multiHit * 2) === 0) {
    playSwing(game, fighter, move);
  }
  if (move.pull) {
    pullIn(game, fighter);
  }
}

export function updateAttack(game, fighter) {
  const move = fighter.move;
  const time = fighter.moveTime;
  if (time === Math.max(0, move.startup - swingLeadTicks(fighter, move))) {
    playSwing(game, fighter, move);
  }
  if (time === move.startup) {
    releaseStrike(game, fighter, move);
  }
  const active = time >= move.startup && time < activeEnd(move);
  if (active) {
    whileActive(game, fighter, move, time);
  }
  fighter.hitboxActive = active;
  fighter.moveTime++;
  if (fighter.moveTime >= moveLength(move)) {
    endMove(game, fighter);
  }
}
