import { KICK } from '../data/tuning.js';
import { nearestTo, teammatesOf } from './squad.js';
import { directionTo, distance, dot, lerp, segmentGap } from './vector.js';

const NEAREST_PASS = 40;
// about 40 degrees either side of the stick, so a mate between two of the keys' eight ways is in
// the cone of both
const CONE = 0.76;
// a mate further off this line than about 70 degrees is not one the passer means
const LEAST_ALIGNMENT = 0.35;
const IN_CONE = 10;
// a mate within about 10 degrees of the stick is the one the player points at: another in the cone
// takes the pass from him only when he is much freer, or an opponent stands across the line to him
const ON_LINE = 0.985;
const ON_LINE_BONUS = 0.3;
const OPEN_ROOM = 120;
const LANE_ROOM = 40;

export const opennessOf = (match, spot, team) =>
  distance(spot, nearestTo(match.sides[1 - team], spot) ?? { x: Infinity, y: Infinity });

const farthestPass = (lofted) => (lofted ? KICK.loftReach[1] : KICK.groundReach * 1.2);

// along the grass an opponent near its line steps across it
function laneRoomOf(match, passer, mate) {
  let room = LANE_ROOM;

  for (const foe of match.sides[1 - passer.team]) {
    const { gap, along } = segmentGap(passer, mate, foe);

    if (along > 0.05 && along < 0.95) {
      room = Math.min(room, gap);
    }
  }

  return room / LANE_ROOM;
}

// a pass along the grass is meant for a near mate; one in the air goes about as far as the pass
// was held for
function reachFitOf(gap, { lofted, power }) {
  if (!lofted) {
    return -gap / 900;
  }

  return -Math.abs(gap - lerp(KICK.loftReach[0], KICK.loftReach[1], power)) / 2500;
}

function passScore(match, passer, mate, pass) {
  const gap = distance(passer, mate);
  const alignment = dot(directionTo(passer, mate), pass.aim);
  const reachable = gap >= NEAREST_PASS && gap <= farthestPass(pass.lofted);

  if (mate.stun > 0 || !reachable || alignment < LEAST_ALIGNMENT) {
    return -Infinity;
  }

  const open = Math.min(opennessOf(match, mate, mate.team), OPEN_ROOM) / OPEN_ROOM;
  const lane = pass.lofted ? 1 : laneRoomOf(match, passer, mate);
  const cone = alignment >= CONE ? IN_CONE : 0;
  const onLine = alignment >= ON_LINE ? ON_LINE_BONUS * lane : 0;

  return cone + onLine + alignment * 2 + open * 0.4 + lane * 0.3 + reachFitOf(gap, pass);
}

// the mate the passer means: of those in the cone round the stick, the one most in line, free,
// with a clear lane and about as far as the pass was meant to go; with nobody in it, the mate
// nearest its line
export function passTargetOf(match, passer, aim, { lofted = false, power = 0 } = {}) {
  let best = null;
  let bestScore = -Infinity;

  for (const mate of teammatesOf(match, passer)) {
    const score = passScore(match, passer, mate, { aim, lofted, power });

    if (score > bestScore) {
      best = mate;
      bestScore = score;
    }
  }

  return best;
}
