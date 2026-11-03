import { BASIC_OPTIONS, DUELS } from '../../data/duels.js';
import { moveOf } from '../../data/moves.js';
import { DUO_MOVES } from '../combos/duos.js';
import { moveOption, shotOffersOf } from '../combos/offers.js';
import { comboLiftOf } from '../combos/pass-combo.js';
import { goalShareOf } from './geometry.js';
import { findReceiver } from './receivers.js';
import { currentRound, playerOf } from './rounds.js';

// which of his moves each side of each kind of round may use besides the shots on offer: a star's
// specials and a plain player's skill of that kind
const SPECIAL_KINDS = {
  field: { attack: ['dribble'], defend: ['tackle', 'block'] },
  keeper: { attack: [], defend: ['save'] },
};

const basicOption = (basic, bonus = 0) => ({
  ...basic,
  move: null,
  cost: 0,
  power: 0,
  family: 'basic',
  bonus,
  tag: null,
});

// a move's row as the menu first knew it, before the sim said where it came from
export const specialOption = (move) => ({
  id: move.id,
  kind: move.kind,
  label: move.name,
  move: move.id,
  cost: move.cost,
  look: move.look,
  power: move.power,
});

// a move is there to pick when its owner has the spirit for it, is not waiting out his last, and
// a shot is in range
export function canUse(match, player, move) {
  const affordable = (player.spirit ?? 0) >= move.cost;
  const rested = (player.cooldown ?? 0) <= 0;
  const inRange = move.kind !== 'shot' || goalShareOf(match, player) < DUELS.specialRange;

  return affordable && rested && inRange && !DUO_MOVES.has(move.id);
}

export function specialsOf(match, player, kinds) {
  return [...(player.moves ?? []), player.skill]
    .map(moveOf)
    .filter((move) => move && kinds.includes(move.kind) && canUse(match, player, move))
    .map((move) => moveOption(move));
}

// the holder of a pass combo strikes even a plain shot lifted by it; what a round kept as it began
// stands while the human picks
const shootOption = (match, player, round) =>
  basicOption(BASIC_OPTIONS.shoot, round?.lift ?? comboLiftOf(match, player).power);

const offersOf = (match, player, round) => round?.offers ?? shotOffersOf(match, player);

function fieldAttack(match, player, round) {
  const basics = [basicOption(BASIC_OPTIONS.dribble)];

  if (findReceiver(match, player)) {
    basics.push(basicOption(BASIC_OPTIONS.pass));
  }

  if (goalShareOf(match, player) < DUELS.shotRange) {
    basics.push(shootOption(match, player, round));
  }

  return [...basics, ...offersOf(match, player, round)];
}

const BASICS = {
  field: {
    attack: fieldAttack,
    defend: () =>
      [BASIC_OPTIONS.tackle, BASIC_OPTIONS.block, BASIC_OPTIONS.intercept].map((basic) =>
        basicOption(basic),
      ),
  },
  keeper: {
    attack: (match, player, round) => [
      shootOption(match, player, round),
      ...offersOf(match, player, round),
    ],
    defend: () => [BASIC_OPTIONS.catch, BASIC_OPTIONS.punch].map((basic) => basicOption(basic)),
  },
};

// a shot carried into the keeper's round keeps the option it was struck with
export function optionsFor(match, round, side) {
  const player = playerOf(match, round, side);

  if (round.carried && side === 'attack') {
    return [round.picked.attack];
  }

  const basics = BASICS[round.kind][side](match, player, round);

  return [...basics, ...specialsOf(match, player, SPECIAL_KINDS[round.kind][side])];
}

export function duelOptions(match, side) {
  const round = currentRound(match.duel);

  return round ? optionsFor(match, round, side) : [];
}
