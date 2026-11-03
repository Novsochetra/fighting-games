import { KICK } from '../data/tuning.js';
import { bestPassOf } from './brains/pass-options.js';
import { cornerGoers } from './corner-spots.js';
import { leadOf, opennessOf } from './passing.js';
import { inBoxOf, inGoalAreaOf } from './pitch.js';
import { chance } from './random.js';
import { nearestTo, teammatesOf } from './squad.js';
import { directionTo, distance, dot } from './vector.js';

const CROSS_HEIGHT = 36;
const SHORT_CORNER = 0.2;
const THROW_HEIGHT = 10;
// about 40 degrees either side of the stick, as for a pass in open play
const CONE = 0.76;

function freestOf(match, players) {
  let best = null;
  let bestRoom = -1;

  for (const player of players) {
    const room = opennessOf(match, player, player.team);

    if (room > bestRoom) {
      best = player;
      bestRoom = room;
    }
  }

  return best;
}

const passTo = (match, mate, extra = {}) => ({
  kind: 'pass',
  target: mate.index,
  spot: leadOf(match, mate, match.ball),
  ...extra,
});

// most corners are swung into the box at whoever is freest there, some played short
function cornerChoice(match, taker) {
  const nearest = nearestTo(teammatesOf(match, taker), taker);

  if (chance(match.random, SHORT_CORNER)) {
    return passTo(match, nearest);
  }

  return passTo(match, freestOf(match, cornerGoers(match, taker.team)), {
    lofted: true,
    height: CROSS_HEIGHT,
  });
}

function throwChoice(match, taker) {
  const near = teammatesOf(match, taker).filter((mate) => distance(mate, taker) < KICK.throwReach);
  const mate = freestOf(match, near) ?? nearestTo(teammatesOf(match, taker), taker);

  return passTo(match, mate, { lofted: true, height: THROW_HEIGHT });
}

function goalKickChoice(match, taker) {
  const option = bestPassOf(match, taker);

  return option
    ? { kind: 'pass', ...option }
    : passTo(match, freestOf(match, teammatesOf(match, taker)), { lofted: true });
}

const CHOICES = { corner: cornerChoice, throwIn: throwChoice, goalKick: goalKickChoice };

export const computerRestart = (match, taker) => CHOICES[match.restart.kind](match, taker);

// a corner the player holds pass or shoot for is swung in at head height, as the computer swings
// its own, to the freest mate in the box the stick points to, or in the whole box when it points
// at none of them
export function humanCross(match, taker, action) {
  const inBox = cornerGoers(match, taker.team).filter(
    (mate) => inBoxOf(match, 1 - taker.team, mate) && !inGoalAreaOf(match, 1 - taker.team, mate),
  );
  const aimed = inBox.filter((mate) => dot(directionTo(taker, mate), action.aim) >= CONE);
  const mate = freestOf(match, aimed.length > 0 ? aimed : inBox);

  return mate ? { ...action, target: mate.index, height: CROSS_HEIGHT } : action;
}
