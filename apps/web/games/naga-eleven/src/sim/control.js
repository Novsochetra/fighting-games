import { SWITCH } from '../data/tuning.js';
import { interceptOf } from './brains/steering.js';
import { nearestTo, outfieldOf, ownerOf } from './squad.js';
import { isLoose } from './loose-ball.js';
import { holdStick } from './stick-hold.js';
import { distance } from './vector.js';

export { humanIntent } from './human.js';
export { stickOf } from './stick.js';

// the mate who will get to the ball first, as the ball runs on
function bestPlacedOf(match, players) {
  let best = null;
  let bestTicks = Infinity;

  for (const player of players) {
    const { ticks } = interceptOf(match, player);

    if (ticks < bestTicks) {
      best = player;
      bestTicks = ticks;
    }
  }

  return best;
}

export function switchPlayer(match, player) {
  const others = outfieldOf(match, player.team).filter((mate) => mate !== player);

  match.controlled = (bestPlacedOf(match, others) ?? nearestTo(others, match.ball)).index;
  match.switchCooldown = SWITCH.cooldownTicks;
}

export function steer(match, player) {
  if (match.humanTeam !== null && player && player.team === match.humanTeam) {
    match.controlled = player.index;
    match.switchCooldown = SWITCH.cooldownTicks;
  }
}

// a loose ball goes to the man who gets to where it drops first, soon enough to run onto it, though
// not straight after the last change; otherwise control moves only when the steered man is left
// far behind the play
function isLeftBehind(match, current, best) {
  const waited = SWITCH.cooldownTicks - match.switchCooldown;

  if (isLoose(match)) {
    const lag = interceptOf(match, current).ticks - interceptOf(match, best).ticks;

    return waited >= SWITCH.looseWait && lag > SWITCH.looseLag;
  }

  const behind = distance(current, match.ball) - distance(best, match.ball);

  return match.switchCooldown === 0 && behind > SWITCH.autoGap;
}

// control follows the ball to a mate who gets it, the keeper too, who is the player's only while
// he holds it, and to the mate best placed for it when the one steered is left far behind
export function updateControl(match) {
  if (match.humanTeam === null) {
    return;
  }

  const owner = ownerOf(match);

  match.switchCooldown = Math.max(0, match.switchCooldown - 1);

  if (owner && owner.team === match.humanTeam) {
    match.controlled = owner.index;

    return;
  }

  const current = match.players[match.controlled];
  const best = bestPlacedOf(match, outfieldOf(match, match.humanTeam));

  if (current.role === 'keeper') {
    steer(match, best);

    return;
  }

  if (isLeftBehind(match, current, best)) {
    steer(match, best);
    holdStick(match, SWITCH.holdTicks);
  }
}

export function controlNearest(match, point = match.ball) {
  if (match.humanTeam !== null) {
    match.controlled = nearestTo(outfieldOf(match, match.humanTeam), point).index;
  }
}
