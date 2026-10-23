import { clamp } from '../../../lib/math.js';
import { dash } from '../../fighters/actions.js';
import { consumeBuffer, dashDirection, faceOrAim } from './controls.js';
import { startHeroMove } from './heavy-gate.js';
import { pickAirMove } from './pick-move.js';

export function thinkAir(game, player, { buffer, direction }) {
  if (direction) {
    player.vx = clamp(player.vx + direction * 0.15, -1.9, 1.9);
  }
  if (buffer?.action === 'dash' && !player.airDashUsed) {
    dash(game, player, dashDirection(buffer, direction, player));
    consumeBuffer(game);
    return;
  }
  if (buffer?.action === 'light' || buffer?.action === 'heavy') {
    const id = pickAirMove(buffer, game.input.held, null);
    if (id) {
      faceOrAim(game, player, direction);
      startHeroMove(game, player, id);
      consumeBuffer(game);
    }
  }
}
