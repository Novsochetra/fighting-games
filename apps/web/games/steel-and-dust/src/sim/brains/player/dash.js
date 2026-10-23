import { dash, jump, startRun } from '../../fighters/actions.js';
import { floorUnder } from '../../fighters/terrain-motion.js';
import { addDust } from '../../fx/particles.js';
import { consumeBuffer, dashDirection } from './controls.js';
import { isAttack, startDashAttack } from './dash-attack.js';
import { runBack, runsOnFromDash } from './run.js';

const MAX_DASH_CHAIN = 2;

// a new dash the other way starts at once; the same way only late in the dash
function redash(game, player, { buffer, direction }) {
  if (buffer?.action !== 'dash' || player.airborne || player.stateTime < 4) {
    return false;
  }
  if (player.dashChain >= MAX_DASH_CHAIN) {
    return false;
  }
  const next = dashDirection(buffer, direction, player);
  if (next === player.facing && player.stateTime < 10) {
    return false;
  }
  dash(game, player, next);
  consumeBuffer(game);
  return true;
}

// holding the other way brakes and turns
function brakeAndTurn(game, player, { buffer, direction }) {
  const busy = isAttack(buffer) || buffer?.action === 'dash';
  if (!direction || direction === player.facing || player.stateTime < 5 || busy) {
    return false;
  }
  player.facing = direction;
  addDust(game, { x: player.x, y: floorUnder(game.terrain, player), count: 3 });
  if (player.airborne) {
    player.state = 'air';
    player.vx = direction * 0.6;
  } else {
    runBack(player, direction);
  }
  return true;
}

export function thinkDash(game, player, intent) {
  if (redash(game, player, intent) || brakeAndTurn(game, player, intent)) {
    return;
  }
  if (runsOnFromDash(player, intent)) {
    startRun(player);
    return;
  }
  const { buffer } = intent;
  if (!buffer || player.stateTime < 2) {
    return;
  }
  if (isAttack(buffer)) {
    startDashAttack(game, player, intent);
  } else if (buffer.action === 'jump' && !player.airborne) {
    jump(game, player, { vy: -5.8, vx: player.facing * 2.2 });
    consumeBuffer(game);
  }
}
