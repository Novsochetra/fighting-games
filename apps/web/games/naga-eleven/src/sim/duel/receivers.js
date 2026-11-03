import { attackSign } from './geometry.js';
import { distance } from '../vector.js';

const NEAREST = 40;
const FURTHEST = 300;

const nearestOpponentGap = (match, mate) =>
  Math.min(
    ...match.players
      .filter((other) => other.team !== mate.team)
      .map((other) => distance(other, mate)),
  );

// the mate a pass out of a duel looks for: on their feet, not too near or far, ahead and free
function receiverScore(match, passer, mate) {
  const gap = distance(passer, mate);

  if (mate.role === 'keeper' || mate.stun > 0 || gap < NEAREST || gap > FURTHEST) {
    return -Infinity;
  }

  const ahead = (mate.x - passer.x) * attackSign(passer.team);

  return ahead / 200 + Math.min(nearestOpponentGap(match, mate), 120) / 120 - gap / 600;
}

export function findReceiver(match, passer) {
  let best = null;
  let bestScore = -Infinity;

  for (const mate of match.players) {
    const score =
      mate.team === passer.team && mate !== passer ? receiverScore(match, passer, mate) : -Infinity;

    if (score > bestScore) {
      best = mate;
      bestScore = score;
    }
  }

  return best;
}
