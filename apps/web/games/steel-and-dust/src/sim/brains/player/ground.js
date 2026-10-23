import { dash, startSquat } from '../../fighters/actions.js';
import { dropThrough } from '../../fighters/terrain-motion.js';
import { consumeBuffer, dashDirection } from './controls.js';
import { isAttack } from './dash-attack.js';
import { startGroundAttack } from './ground-attack.js';
import { startHeroMove } from './heavy-gate.js';
import { setOff } from './run.js';

// down and jump on a platform drops through it; anywhere else it is a jump
function jumpOrDrop(game, player, { buffer, direction }) {
  const down = buffer.down || game.input.held.down;
  if (!(down && dropThrough(game, player))) {
    startSquat(player, direction);
  }
}

function act(game, player, intent) {
  const { buffer, direction } = intent;
  if (isAttack(buffer)) {
    startGroundAttack(game, player, intent);
    return;
  }
  if (buffer.action === 'jump') {
    jumpOrDrop(game, player, intent);
  } else if (buffer.action === 'dash') {
    dash(game, player, dashDirection(buffer, direction, player));
  }
  consumeBuffer(game);
}

export function thinkGrounded(game, player, { buffer, direction }) {
  if (buffer) {
    act(game, player, { buffer, direction });
  } else if (direction) {
    setOff(player, direction);
  } else {
    player.vx *= 0.6;
    player.state = 'idle';
  }
}

// up and a button pressed together: launcher or rising strike
export function thinkSquat(game, player, { buffer, direction }) {
  if (direction) {
    player.jumpDirection = direction;
  }
  const id = { heavy: 'UK', light: 'UL' }[buffer?.action];
  if (id) {
    if (direction) {
      player.facing = direction;
    }
    startHeroMove(game, player, id);
    consumeBuffer(game);
  }
}
