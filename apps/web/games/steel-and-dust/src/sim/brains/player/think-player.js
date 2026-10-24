import { COLORS } from '../../../art/colors.js';
import { ULT_FULL } from '../../../config.js';
import { ULT_START_STATES } from '../../../data/ultimates/index.js';
import { addFloatText } from '../../fx/effects.js';
import { startUlt } from '../../ultimates/index.js';
import { thinkAir } from './air.js';
import { thinkAttack } from './attack.js';
import { thinkCharge } from './charge.js';
import { consumeBuffer, heldDirection } from './controls.js';
import { thinkDash } from './dash.js';
import { thinkGrounded, thinkSquat } from './ground.js';
import { thinkRun } from './run.js';

const ON_FOOT = new Set(['idle', 'walk', 'run']);

const THINK_BY_STATE = {
  idle: thinkGrounded,
  walk: thinkGrounded,
  run: thinkRun,
  squat: thinkSquat,
  charge: thinkCharge,
  air: thinkAir,
  dash: thinkDash,
  attack: thinkAttack,
};

function idleBetweenFights(game, player) {
  if (player.state === 'charge' || player.state === 'squat') {
    player.state = 'idle';
  }
  if (ON_FOOT.has(player.state)) {
    player.vx *= 0.6;
    player.state = game.clearTime > 0 ? 'win' : 'idle';
  }
}

function tryUltimate(game, player) {
  consumeBuffer(game);
  // with the boss down no one is left to strike, and the bar carries into the next mission
  if (game.lootTime > 0) {
    return false;
  }
  if (game.ultMeter >= ULT_FULL && ULT_START_STATES.has(player.state)) {
    startUlt(game, player);
    return true;
  }
  if (game.ultMeter < ULT_FULL) {
    addFloatText(game, {
      x: player.x,
      y: player.y - 48,
      text: 'ULT not ready',
      color: COLORS.lilac,
    });
  }
  return false;
}

export function thinkPlayer(game, player) {
  const direction = heldDirection(game.input.held);
  if (game.mode !== 'play' || game.clearTime > 0) {
    idleBetweenFights(game, player);
    return;
  }
  let buffer = game.input.buffer.action ? game.input.buffer : null;
  if (buffer?.action === 'ult') {
    if (tryUltimate(game, player)) {
      return;
    }
    buffer = null;
  }
  const think = THINK_BY_STATE[player.state];
  if (think) {
    think(game, player, { buffer, direction });
  }
}
