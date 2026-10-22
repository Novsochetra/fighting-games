import { activeEnd } from '../../../data/moves/define-move.js';
import { clamp } from '../../../lib/math.js';
import { dash, jump, startCharge, startMove } from '../../fighters/actions.js';
import { autoFace } from '../../fighters/aim.js';
import { consumeBuffer } from './controls.js';
import { pickAirMove, pickGroundMove } from './pick-move.js';

const GROUND_STEP = 0.25;

// a launcher that connects jumps after the enemy while up is held or jump is pressed
function jumpCancel(game, player, buffer) {
  const move = player.move;
  const wantsJump = game.input.held.up || buffer?.action === 'jump';
  if (!move.jumpCancel || !player.hitConfirmed || player.moveTime < activeEnd(move) || !wantsJump) {
    return false;
  }
  jump(game, player, { vy: -6.6 });
  if (buffer?.action === 'jump') {
    consumeBuffer(game);
  }
  return true;
}

function faceForFollowUp(game, player, direction) {
  if (player.airborne) {
    return;
  }
  if (direction) {
    player.facing = direction;
  } else {
    autoFace(game, player);
  }
}

function chainAttack(game, player, { buffer, direction }) {
  const move = player.move;
  const [open, close] = move.cancelWindow;
  if (player.moveTime < open || player.moveTime > close) {
    return false;
  }
  const held = game.input.held;
  const id = player.airborne ? pickAirMove(buffer, held, move) : pickGroundMove(buffer, held, move);
  if (id) {
    faceForFollowUp(game, player, direction);
    startMove(game, player, id);
    consumeBuffer(game);
    return true;
  }
  // no heavy follow-up in this string: charge straight out of it
  if (!player.airborne && buffer.action === 'heavy' && !move.chargeLevel) {
    if (direction) {
      player.facing = direction;
    }
    startCharge(player);
    consumeBuffer(game);
    return true;
  }
  return false;
}

// dash out of recovery, sooner on a hit
function dashCancel(game, player, { buffer, direction }) {
  const move = player.move;
  const ready = player.moveTime >= activeEnd(move) + (player.hitConfirmed ? 0 : 5);
  if (buffer.action === 'dash' && !move.dive && !(player.airborne && player.airDashUsed) && ready) {
    dash(game, player, buffer.direction || direction);
    consumeBuffer(game);
  }
}

// on the ground only the way the hero faces steps in, so a swing never slides backwards
function drift(player, direction) {
  const move = player.move;
  if (!direction || move.dive) {
    return;
  }
  if (player.airborne) {
    player.vx = clamp(player.vx + direction * 0.08, -1.9, 1.9);
  } else if (direction === player.facing && !move.sustain) {
    player.vx += direction * GROUND_STEP;
  }
}

export function thinkAttack(game, player, intent) {
  const { buffer, direction } = intent;
  drift(player, direction);
  if (jumpCancel(game, player, buffer) || !buffer) {
    return;
  }
  const attacking = buffer.action === 'light' || buffer.action === 'heavy';
  if (attacking && chainAttack(game, player, intent)) {
    return;
  }
  dashCancel(game, player, intent);
}
