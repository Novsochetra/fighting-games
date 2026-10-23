import { dash, startRun, startSquat } from '../../fighters/actions.js';
import { dropThrough } from '../../fighters/terrain-motion.js';
import { stoneDrag } from '../../summons/stone-skin.js';
import { consumeBuffer, dashDirection, faceOrAim } from './controls.js';
import { startHeroMove, tryCharge } from './heavy-gate.js';
import { pickGroundMove } from './pick-move.js';
import { runsOnFromJump } from './run.js';

// down and jump on a platform drops through it; anywhere else it is a jump
function jumpOrDrop(game, player, { buffer, direction }) {
  const down = buffer.down || game.input.held.down;
  if (!(down && dropThrough(game, player))) {
    startSquat(player, direction);
  }
}

function act(game, player, { buffer, direction }) {
  const held = game.input.held;
  if (buffer.action === 'jump') {
    jumpOrDrop(game, player, { buffer, direction });
  } else if (buffer.action === 'dash') {
    dash(game, player, dashDirection(buffer, direction, player));
  } else if (buffer.action === 'heavy' && !(buffer.up || buffer.down || held.up || held.down)) {
    faceOrAim(game, player, direction);
    tryCharge(game, player);
  } else {
    const id = pickGroundMove(buffer, held, null);
    faceOrAim(game, player, direction);
    startHeroMove(game, player, id);
  }
  consumeBuffer(game);
}

export function thinkGrounded(game, player, { buffer, direction }) {
  const runsOn = !buffer && runsOnFromJump(player, direction);
  player.runningJump = false;
  if (runsOn) {
    startRun(player);
    return;
  }
  if (buffer) {
    act(game, player, { buffer, direction });
    return;
  }
  if (direction) {
    player.facing = direction;
    player.vx = direction * 1.55 * stoneDrag(player);
    player.state = 'walk';
    player.walkDirection = 1;
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
