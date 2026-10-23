import { consumeBuffer } from './controls.js';
import { startHeroMove } from './heavy-gate.js';
import { pickAirMove } from './pick-move.js';

export function isAttack(buffer) {
  return buffer?.action === 'light' || buffer?.action === 'heavy';
}

function dashAttackId(game, player, buffer) {
  if (buffer.action === 'light') {
    return player.airborne ? 'AL' : 'DA';
  }
  return player.airborne ? pickAirMove(buffer, game.input.held, null) : 'UK';
}

// dash and run attacks go the way you hold
export function startDashAttack(game, player, { buffer, direction }) {
  if (direction) {
    player.facing = direction;
  }
  startHeroMove(game, player, dashAttackId(game, player, buffer));
  consumeBuffer(game);
}
