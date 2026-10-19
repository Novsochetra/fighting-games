import { CHARGE_LEVEL1, CHARGE_MAX } from '../../../config.js';
import { dash, startMove, startSquat } from '../../fighters/actions.js';
import { autoFace } from '../../fighters/aim.js';
import { consumeBuffer, dashDirection } from './controls.js';

function chargedMoveId(chargeTime) {
  if (chargeTime >= CHARGE_MAX) {
    return 'C2';
  }
  return chargeTime >= CHARGE_LEVEL1 ? 'C1' : 'K1';
}

function cancelCharge(game, player, { buffer, direction }) {
  if (buffer?.action === 'light') {
    if (!direction) {
      autoFace(game, player);
    }
    startMove(game, player, 'L1');
  } else if (buffer?.action === 'jump') {
    startSquat(player, direction);
  } else if (buffer?.action === 'dash') {
    dash(game, player, dashDirection(buffer, direction, player));
  } else {
    return false;
  }
  consumeBuffer(game);
  return true;
}

// heavy is held; letting go picks the move by how long it was held
export function thinkCharge(game, player, intent) {
  const held = game.input.held;
  if (intent.direction) {
    player.facing = intent.direction;
  }
  if (player.stateTime <= 4 && (held.up || held.down)) {
    startMove(game, player, 'UK');
    return;
  }
  if (cancelCharge(game, player, intent)) {
    return;
  }
  if (!held.heavy) {
    if (!intent.direction) {
      autoFace(game, player);
    }
    startMove(game, player, chargedMoveId(player.stateTime));
  }
}
