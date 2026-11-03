import { DUEL_WEIGHTS, DUELS } from '../../data/duels.js';
import { SKILL_AI } from '../../data/skills.js';
import { nextRandom } from '../random.js';
import { goalShareOf } from './geometry.js';
import { optionsFor } from './options.js';
import { playerOf } from './rounds.js';

// near the goal a shot is likelier, and a defender there expects one
function closeness(match, player) {
  return Math.max(0, 1 - goalShareOf(match, player) / DUELS.shotRange);
}

// a defender meets a special struck at him (or one the attacker has on offer, before he picks)
// with his own skill or special
function facesSpecial(round) {
  const attack = round.picked.attack;

  return attack ? Boolean(attack.move) : (round.offers ?? []).some((option) => option.move);
}

function moveWeight(round, side, option) {
  const strength = ((option.power ?? 0) + (option.bonus ?? 0)) / 8;
  const answers = side === 'defend' && facesSpecial(round);

  return (answers ? SKILL_AI.answer : DUEL_WEIGHTS.special) + strength;
}

function weightOf(match, round, side, option) {
  const attacker = playerOf(match, round, 'attack');

  if (option.move) {
    return moveWeight(round, side, option);
  }

  const base = DUEL_WEIGHTS[option.kind] ?? 1;

  if (option.kind === 'shot' || option.kind === 'block') {
    return base + closeness(match, attacker) * 4;
  }

  if (option.kind === 'catch') {
    return base + ((playerOf(match, round, side).stats?.keeping ?? 50) - 50) / 15;
  }

  return base;
}

export function pickWeighted(random, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let left = nextRandom(random) * total;

  for (const entry of entries) {
    left -= entry.weight;

    if (left < 0) {
      return entry.value;
    }
  }

  return entries.at(-1)?.value ?? null;
}

// stars spend their spirit on the specials they can afford, more often the stronger the move
export function computerChoice(match, round, side) {
  const options = optionsFor(match, round, side);
  const entries = options.map((option) => ({
    value: option,
    weight: Math.max(0.1, weightOf(match, round, side, option)),
  }));

  return pickWeighted(match.random, entries);
}
