import { DUELS } from '../../data/duels.js';
import { isSought } from '../hunts.js';
import { directionTo, distance, dot } from '../vector.js';
import { pairKey } from './geometry.js';
import { FIELD_ATTACK_KINDS, specialsOf } from './options.js';

const inFront = (carrier, other) =>
  dot(directionTo(carrier, other), carrier.facing) > DUELS.inFront;

function pairRested(match, carrier, other) {
  const met = match.duelMemory.pairs[pairKey(carrier, other)];

  return met === undefined || match.tick - met >= DUELS.pairCooldown;
}

const challenger = (match, carrier) => (other) =>
  other.team !== carrier.team &&
  other.role !== 'keeper' &&
  other.stun === 0 &&
  distance(carrier, other) < DUELS.range &&
  inFront(carrier, other) &&
  pairRested(match, carrier, other);

// the rival's face to face with the hero is the story's own moment, so until they have met no
// plain defender stops the hero for a menu
function mayAsk(match, carrier) {
  const memory = match.duelMemory;

  return (
    memory.watched &&
    carrier.team === match.humanTeam &&
    carrier.role !== 'keeper' &&
    carrier.stun === 0 &&
    match.tick - (memory.commandAt ?? -Infinity) >= DUELS.commandCooldown &&
    !isSought(match, carrier)
  );
}

// asked at a challenge, a skill is a row on a menu instead of a held key; asked only with one to
// pay for, play never stops for a menu of nothing but the basics
export function commandMeetingOf(match, carrier) {
  if (!mayAsk(match, carrier) || specialsOf(match, carrier, FIELD_ATTACK_KINDS).length === 0) {
    return null;
  }

  const challengers = match.players.filter(challenger(match, carrier));

  challengers.sort((first, second) => distance(carrier, first) - distance(carrier, second));

  return challengers.length > 0
    ? { attacker: carrier, defender: challengers[0], command: true }
    : null;
}
