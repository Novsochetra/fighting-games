import { DUELS, FIELD_RESULTS } from '../../data/duels.js';
import { nextRandom } from '../random.js';
import { goalShareOf } from './geometry.js';
import { attackChance, wideChanceOf } from './odds.js';
import { keeperResult, styleOf } from './keeper-result.js';
import { findReceiver } from './receivers.js';
import { playerOf } from './rounds.js';

function duelists(match, round) {
  return {
    attacker: playerOf(match, round, 'attack'),
    defender: playerOf(match, round, 'defend'),
    attack: round.picked.attack,
    defend: round.picked.defend,
  };
}

function resolveField(match, round) {
  const sides = duelists(match, round);
  const chance = attackChance(sides);
  const roll = nextRandom(match.random);
  const won = roll < chance;
  const [winWord, loseWord] = FIELD_RESULTS[sides.attack.kind] ?? FIELD_RESULTS.dribble;
  const result = { word: won ? winWord : loseWord, side: won ? 'attack' : 'defend', chance, roll };

  if (won && sides.attack.kind === 'pass') {
    result.receiver = findReceiver(match, sides.attacker)?.index ?? null;
  }

  return result;
}

// a punch knocks it away; a catch only just reached on the line is pushed away instead; a wall
// stands and it comes off him (the finish bounces it back into play)
function keeperWord(defend, roll, chance) {
  const style = styleOf(defend);

  if (style === 'punch') {
    return 'parried';
  }

  return style === 'catch' && roll - chance < DUELS.parryMargin ? 'parried' : 'saved';
}

function keeperWordOf(match, sides) {
  const distanceShare = goalShareOf(match, sides.attacker);
  const wide = nextRandom(match.random) < wideChanceOf(sides.attacker, sides.attack, distanceShare);
  const chance = attackChance({ ...sides, distanceShare });
  const roll = nextRandom(match.random);

  if (wide) {
    return { word: 'wide', side: 'defend', chance, roll };
  }

  if (roll < chance) {
    return { word: 'goal', side: 'attack', chance, roll };
  }

  return { word: keeperWord(sides.defend, roll, chance), side: 'defend', chance, roll };
}

// the round's word, and where the shot went, how he dived and how he kept it out
function resolveKeeper(match, round) {
  const sides = duelists(match, round);
  const result = keeperWordOf(match, sides);

  return { ...result, ...keeperResult(match, { word: result.word, defend: sides.defend }) };
}

export const resolveRound = (match, round) =>
  round.kind === 'keeper' ? resolveKeeper(match, round) : resolveField(match, round);
