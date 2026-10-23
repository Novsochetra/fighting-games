import { consumeBuffer, faceOrAim } from './controls.js';
import { startHeroMove, tryCharge } from './heavy-gate.js';
import { pickGroundMove } from './pick-move.js';

export function startGroundAttack(game, player, { buffer, direction }) {
  const held = game.input.held;
  faceOrAim(game, player, direction);
  if (buffer.action === 'heavy' && !(buffer.up || buffer.down || held.up || held.down)) {
    tryCharge(game, player);
  } else {
    startHeroMove(game, player, pickGroundMove(buffer, held, null));
  }
  consumeBuffer(game);
}
