import { DASH_TICKS, RUN_SPEED } from '../../../config.js';
import { dash, jump } from '../../fighters/actions.js';
import { dropThrough, floorUnder } from '../../fighters/terrain-motion.js';
import { addDust } from '../../fx/particles.js';
import { stoneDrag } from '../../summons/stone-skin.js';
import { consumeBuffer, dashDirection } from './controls.js';
import { isAttack, startDashAttack } from './dash-attack.js';

// the dash ends a little under the run's pace, so the run picks up over a few strides
const PICK_UP = 0.15;

// a ground dash still held its way on its last tick runs on instead of slowing to a walk
export function runsOnFromDash(player, { buffer, direction }) {
  return (
    !buffer && !player.airborne && player.stateTime >= DASH_TICKS - 1 && direction === player.facing
  );
}

// a running jump that comes down with the run still held keeps running
export function runsOnFromJump(player, direction) {
  return (
    player.runningJump && player.animTime - player.landedAt <= 1 && direction === player.facing
  );
}

function leap(game, player, buffer) {
  if ((buffer.down || game.input.held.down) && dropThrough(game, player)) {
    return;
  }
  jump(game, player, { vy: -5.8, vx: player.facing * 2.2 });
  player.runningJump = true;
}

function act(game, player, intent) {
  const { buffer, direction } = intent;
  if (isAttack(buffer)) {
    startDashAttack(game, player, intent);
    return;
  }
  if (buffer.action === 'jump') {
    leap(game, player, buffer);
  } else if (buffer.action === 'dash') {
    dash(game, player, dashDirection(buffer, direction, player));
  }
  consumeBuffer(game);
}

// letting go skids to a stop; holding the other way turns into a walk back
function stop(game, player, direction) {
  addDust(game, { x: player.x, y: floorUnder(game.terrain, player), count: 3 });
  if (direction) {
    player.facing = direction;
    player.state = 'walk';
    player.walkDirection = 1;
    player.vx = direction * 0.9;
  } else {
    player.state = 'idle';
  }
}

export function thinkRun(game, player, intent) {
  if (intent.buffer) {
    act(game, player, intent);
  } else if (intent.direction !== player.facing) {
    stop(game, player, intent.direction);
  } else {
    const pace = player.facing * RUN_SPEED * stoneDrag(player);
    player.vx += (pace - player.vx) * PICK_UP;
  }
}
