import { DUELS } from '../../data/duels.js';
import { directionTo, distance, dot } from '../vector.js';
import { isStar, pairKey } from './geometry.js';

const ownerOf = (match) => (match.ball.owner === null ? null : match.players[match.ball.owner]);

const isSteeredAgainst = (match, carrier, other) =>
  match.humanTeam !== null && carrier.team !== match.humanTeam && other.index === match.controlled;

function coolingDown(match, carrier, other) {
  const met = match.duelMemory.pairs[pairKey(carrier, other)];

  return met !== undefined && match.tick - met < DUELS.pairCooldown;
}

// a star with the ball meets a star of the other side, or the opponent's star carries it at the
// player the human steers
function canMeet(match, carrier, other) {
  const isRival = isStar(other) || isSteeredAgainst(match, carrier, other);

  return (
    other.team !== carrier.team &&
    other.role !== 'keeper' &&
    other.stun === 0 &&
    isRival &&
    !coolingDown(match, carrier, other)
  );
}

const inFront = (carrier, other) =>
  dot(directionTo(carrier, other), carrier.facing) > DUELS.inFront;

function canCarry(match, carrier) {
  return Boolean(carrier) && carrier.role !== 'keeper' && isStar(carrier) && carrier.stun === 0;
}

// a kick off is a fresh start: the two stars meet again only once the play has opened up, not
// in the first run the kicker makes at the rival waiting in front of him
const quietUntilOf = (match) =>
  Math.max(match.duelMemory.quietUntil, (match.lastKickoff ?? -Infinity) + DUELS.kickoffQuietTicks);

export function meetingOf(match) {
  const carrier = ownerOf(match);

  if (match.phase !== 'play' || match.tick < quietUntilOf(match) || !canCarry(match, carrier)) {
    return null;
  }

  const rivals = match.players.filter(
    (other) =>
      canMeet(match, carrier, other) &&
      distance(carrier, other) < DUELS.range &&
      inFront(carrier, other),
  );

  rivals.sort((first, second) => distance(carrier, first) - distance(carrier, second));

  return rivals.length > 0 ? { attacker: carrier, defender: rivals[0] } : null;
}
