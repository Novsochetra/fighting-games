import { DASH_TICKS, RUN_SPEED } from '../../../config.js';
import { dash, jump, startRun } from '../../fighters/actions.js';
import { dropThrough, floorUnder } from '../../fighters/terrain-motion.js';
import { addDust } from '../../fx/particles.js';
import { stoneDrag } from '../../summons/stone-skin.js';
import { consumeBuffer, dashDirection } from './controls.js';
import { isAttack } from './dash-attack.js';
import { startGroundAttack } from './ground-attack.js';

// a held direction sets off at once at a walk's pace, so a short push still answers at once, and
// picks up to the run's pace over a few strides
const SET_OFF_SPEED = 1.55;
const PICK_UP = 0.15;

// the hero runs wherever it goes on foot, never slower than it already goes that way
export function setOff(player, direction) {
  const pace = Math.max(direction * player.vx, SET_OFF_SPEED * stoneDrag(player));
  player.facing = direction;
  player.vx = direction * pace;
  startRun(player);
}

export function runBack(player, direction) {
  player.facing = direction;
  player.vx = direction * 0.9;
  startRun(player);
}

// a ground dash still held its way on its last tick runs on instead of slowing down
export function runsOnFromDash(player, { buffer, direction }) {
  return (
    !buffer && !player.airborne && player.stateTime >= DASH_TICKS - 1 && direction === player.facing
  );
}

function leap(game, player, buffer) {
  if ((buffer.down || game.input.held.down) && dropThrough(game, player)) {
    return;
  }
  jump(game, player, { vy: -5.8, vx: player.facing * 2.2 });
}

// attacks out of the run are the ones from a stand, so a combo starts on the move
function act(game, player, intent) {
  const { buffer, direction } = intent;
  if (isAttack(buffer)) {
    startGroundAttack(game, player, intent);
    return;
  }
  if (buffer.action === 'jump') {
    leap(game, player, buffer);
  } else if (buffer.action === 'dash') {
    dash(game, player, dashDirection(buffer, direction, player));
  }
  consumeBuffer(game);
}

// letting go skids to a stop; holding the other way skids and runs back
function stop(game, player, direction) {
  addDust(game, { x: player.x, y: floorUnder(game.terrain, player), count: 3 });
  if (direction) {
    runBack(player, direction);
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
