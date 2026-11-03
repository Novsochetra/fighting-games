import { AI } from '../../data/tuning.js';
import { leadOf, opennessOf } from '../passing.js';
import { inBoxOf, midY, progressOf } from '../pitch.js';
import { chance } from '../random.js';
import { teammatesOf } from '../squad.js';

const CROSS_HEIGHT = 36;
const WIDE = 0.22;
const DEEP = 0.74;
const BYLINE = 0.9;

function targetOf(match, player) {
  let best = null;
  let bestRoom = 0;

  for (const mate of teammatesOf(match, player)) {
    const room = opennessOf(match, mate, mate.team);

    if (inBoxOf(match, 1 - player.team, mate) && room > bestRoom) {
      best = mate;
      bestRoom = room;
    }
  }

  return best;
}

// wide in the last third the carrier crosses for a mate in the box to head or volley, the
// sooner the nearer the goal line
export function crossOf(match, player) {
  const deep = progressOf(match, player.team, player.x);
  const wide = Math.abs(player.y - midY(match)) / match.pitch.width > WIDE;
  const urge = deep > BYLINE ? AI.crossChance * 4 : AI.crossChance;

  if (!wide || deep < DEEP || !chance(match.random, urge)) {
    return null;
  }

  const mate = targetOf(match, player);

  if (!mate) {
    return null;
  }

  const spot = leadOf(match, mate, match.ball);

  return { kind: 'pass', target: mate.index, spot, lofted: true, height: CROSS_HEIGHT };
}
