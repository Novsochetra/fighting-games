import { KICK } from '../data/tuning.js';
import { spendChain } from './combos/chains.js';
import { notePass } from './combos/pass-combo.js';
import { steer } from './control.js';
import { pushEvent } from './events.js';
import { kickTo } from './kicks.js';
import { passTargetOf } from './pass-target.js';
import { insidePitch } from './pitch.js';
import { holdStick } from './stick-hold.js';
import { distance, lerp } from './vector.js';

export { opennessOf, passTargetOf } from './pass-target.js';

const LEAD_TICKS = 45;
const SHORT_PASS = 140;
// a mate's run now is no promise of where he is a second later: led all the way, a long ball the
// player aimed dropped into the space behind him, among the defenders
const LOFTED_LEAD = 28;

// where the mate will be when the ball gets there, if they keep running
export function leadOf(match, mate, from, most = LEAD_TICKS) {
  const ticks = Math.min(most, distance(from, mate) / 7);

  return insidePitch(match, { x: mate.x + mate.vx * ticks, y: mate.y + mate.vy * ticks }, 12);
}

function freeSpot(match, player, { aim, lofted, power = 0 }) {
  const reach = lofted ? lerp(KICK.loftReach[0], KICK.loftReach[1], power) : SHORT_PASS;

  return insidePitch(match, { x: player.x + aim.x * reach, y: player.y + aim.y * reach }, 8);
}

const targetOf = (match, player, action) =>
  action.target === undefined
    ? passTargetOf(match, player, action.aim, action)
    : match.players[action.target];

function spotOf(match, player, { action, mate }) {
  if (action.spot) {
    return action.spot;
  }

  if (!mate) {
    return freeSpot(match, player, action);
  }

  return leadOf(match, mate, match.ball, action.lofted ? LOFTED_LEAD : LEAD_TICKS);
}

// the one the player passes to is the one they steer from the kick on, so they see who it is for;
// the stick they aimed the pass with is not his until they move it
function handOver(match, passer, mate) {
  if (passer.index === match.controlled && mate.role !== 'keeper') {
    steer(match, mate);
    holdStick(match, mate.receiving);
  }
}

// action: { aim, lofted, power } from the stick, or { target, spot, lofted, height } from a brain;
// `steps` is what it counts in the pass combo, and a plain pass by the one who was to finish a
// chain breaks it
export function passBall(match, player, action) {
  if (match.ball.owner !== player.index) {
    return;
  }

  const mate = targetOf(match, player, action);
  const spot = spotOf(match, player, { action, mate });

  notePass(match, player, { steps: action.steps ?? 1 });

  if (!action.skill) {
    spendChain(match, player);
  }

  const ticks = kickTo(match, player, { spot, lofted: action.lofted, height: action.height ?? 0 });

  if (mate) {
    mate.receiving = Math.round(Math.max(KICK.receiveTicks, ticks + 40));
    handOver(match, player, mate);
  }

  pushEvent(match, { type: 'pass', player: player.index });
}
