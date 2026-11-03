import { CHAIN_RULES, NAMED_CHAINS } from '../../data/combos.js';
import { DUELS } from '../../data/duels.js';
import { moveOf } from '../../data/moves.js';
import { SKILL_RULES } from '../../data/skills.js';
import { goalShareOf } from '../duel/geometry.js';
import { isRested, roleSkillOf } from '../skills/fire.js';
import { chainOf } from './chains.js';
import { DUO_MOVES, duoStrikeOf, strikeDuosOf } from './duos.js';
import { finisherOf } from './finisher.js';
import { comboLiftOf } from './pass-combo.js';

// a duel option for a move: `family` where it comes from, `bonus` the power a combo or a chain
// adds, `tag` the combo it is, `from` a chain's first move and `partner` a duo partner's index
export const moveOption = (move, extra = {}) => ({
  id: move.id,
  kind: move.kind,
  label: move.name,
  move: move.id,
  cost: move.cost,
  look: move.look,
  power: move.power,
  family: move.family,
  bonus: 0,
  tag: null,
  from: null,
  partner: null,
  ...extra,
});

const capped = (bonus) => Math.min(bonus, SKILL_RULES.mostBonus);

// what he can pay for: a star's shot specials (a duo's move is struck only with its partner) and
// his role shot skill
function shotMovesOf(player) {
  const specials = (player.moves ?? [])
    .map(moveOf)
    .filter((move) => move?.kind === 'shot' && !DUO_MOVES.has(move.id));
  const role = roleSkillOf(player, ['shot']);

  return [...specials, ...(role ? [role] : [])].filter((move) => (player.spirit ?? 0) >= move.cost);
}

const duoOption = ({ duo, partner }, partnerShare) =>
  moveOption(moveOf(duo.move), {
    cost: duo.shares.striker,
    partner: partner.index,
    partnerShare,
    tag: 'duo',
  });

const duoStrikesOf = (match, player) =>
  strikeDuosOf(match, player).map((entry) => duoOption(entry, entry.duo.shares.partner));

// a shot straight after a dribble or pass skill: a star's own named chain, or the shot lifted
function chainOption(move, { chain, lift }) {
  const named = NAMED_CHAINS.find((each) => each.from === chain.move && each.to === move.id);
  const extra = { tag: 'chain', from: chain.move, replaces: move.id };

  if (named) {
    const bonus = capped(lift.power + CHAIN_RULES.power) - CHAIN_RULES.power;

    return moveOption(moveOf(named.move), { ...extra, bonus });
  }

  return moveOption(move, {
    ...extra,
    id: `chain:${move.id}`,
    bonus: capped(lift.power + CHAIN_RULES.power),
  });
}

function chainOptions(match, player, { shots, lift }) {
  const chain = match.systems?.chains === false ? null : chainOf(match, player);
  const options = chain ? shots.map((move) => chainOption(move, { chain, lift })) : [];

  return [
    ...options.filter((option) => option.family === 'combo'),
    ...options.filter((option) => option.family !== 'combo'),
  ];
}

function finisherOptions(match, player) {
  const finisher = finisherOf(match, player);

  return finisher ? [moveOption(finisher.move, { tag: 'finisher', level: finisher.level })] : [];
}

function plainOptions(player, { shots, lift, chained }) {
  const left = isRested(player) ? shots.filter((move) => !chained.has(move.id)) : [];
  const options = left.map((move) => moveOption(move, { bonus: capped(lift.power) }));

  return [
    ...options.filter((option) => option.family === 'star'),
    ...options.filter((option) => option.family !== 'star'),
  ];
}

// a duo's ball coming to him is struck as the duo; with the ball at his feet, a duo struck by two
function duosFor(match, player, firstTime) {
  const passed = duoStrikeOf(match, player);

  if (passed) {
    return [duoOption(passed, 0)];
  }

  return firstTime ? [] : duoStrikesOf(match, player);
}

// every shot a full-charge SHOOT may strike now, in the menu's order: duo, named chain, chain,
// finisher, the star's specials, the role shot skill. Struck first time it is only a duo or a chain
export function shotOffersOf(match, player, { firstTime = false } = {}) {
  if (goalShareOf(match, player) >= DUELS.specialRange) {
    return [];
  }

  const lift = comboLiftOf(match, player);
  const shots = shotMovesOf(player);
  const duos = duosFor(match, player, firstTime);
  const chains = duos.length > 0 ? [] : chainOptions(match, player, { shots, lift });

  if (firstTime) {
    return [...duos, ...chains];
  }

  const chained = new Set(chains.map((option) => option.replaces));

  return [
    ...duos,
    ...chains,
    ...finisherOptions(match, player),
    ...plainOptions(player, { shots, lift, chained }),
  ];
}

// one skill plays on; a special, a combo and a chain stop for the duel
export const opensDuel = (offers) =>
  offers.some((option) => option.family !== 'role' || option.tag);
