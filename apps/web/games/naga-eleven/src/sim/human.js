import { restartAction, withBall } from './human-ball.js';
import { isHeld, wasPressed } from './input-state.js';
import { keeperInHands } from './keeper-aim.js';
import {
  canPassFirstTime,
  chasesLooseBall,
  meetsPass,
  readyFirstTimePass,
  runOntoBall,
} from './receiving.js';
import { stickOf } from './stick.js';
import { isHeldOver } from './stick-hold.js';
import { distance, ZERO } from './vector.js';

export { restartAction } from './human-ball.js';

const STRIKE_TICKS = 24;
const FIRST_TIME_REACH = 140;

const ballComing = (match, player) =>
  match.ball.owner === null &&
  (player.receiving > 0 || distance(player, match.ball) < FIRST_TIME_REACH);

// without the ball, pass takes another mate, or readies a first-time pass at a pass about to
// reach him; shoot readies a first-time strike at a ball coming in, and slides in at one at an
// opponent's feet
function withoutBall(match, player, stick) {
  const { input } = match;

  Object.assign(player, { charge: 0, charging: null });

  if (wasPressed(input, 'pass') && canPassFirstTime(match, player)) {
    readyFirstTimePass(player, stick);

    return null;
  }

  if (wasPressed(input, 'pass')) {
    return { kind: 'switch' };
  }

  if (!wasPressed(input, 'shoot')) {
    return null;
  }

  if (ballComing(match, player)) {
    Object.assign(player, { strike: STRIKE_TICKS, flick: 0 });

    return null;
  }

  return { kind: 'tackle' };
}

export function humanIntent(match, player) {
  const stick = stickOf(match.input);
  const hasBall = match.ball.owner === player.index;

  if (hasBall && player.role === 'keeper') {
    return keeperInHands(match, player, { stick, action: restartAction(match, player, stick) });
  }

  const action = hasBall ? withBall(match, player, stick) : withoutBall(match, player, stick);

  if (!hasBall && (meetsPass(match, player) || isHeldOver(match, stick))) {
    return runOntoBall(match, player, { stick, action });
  }

  if (!hasBall && chasesLooseBall(match, player, stick)) {
    return runOntoBall(match, player, { stick: ZERO, action });
  }

  return { move: stick, sprint: isHeld(match.input, 'sprint'), action };
}
