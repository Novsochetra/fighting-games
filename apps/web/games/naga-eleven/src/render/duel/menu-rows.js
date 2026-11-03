import { DUO_COMBOS, NAMED_CHAINS, PASS_COMBO } from '../../data/combos.js';
import { moveOf } from '../../data/moves.js';

const DUO_MOVES = new Set(DUO_COMBOS.map((duo) => duo.move));
const CHAIN_MOVES = new Set(NAMED_CHAINS.map((chain) => chain.move));
const FINISHERS = new Set(
  Object.values(PASS_COMBO.finishers).flatMap((levels) => Object.values(levels)),
);

// where a pick comes from: the sim says (`family`); an option made before it did is read off its
// move
export function familyOf(option) {
  if (option.family) {
    return option.family;
  }

  return moveOf(option.move)?.family ?? (option.move ? 'star' : 'basic');
}

export function tagOf(option) {
  if (option.tag !== undefined) {
    return option.tag;
  }

  if (DUO_MOVES.has(option.move)) {
    return 'duo';
  }

  if (FINISHERS.has(option.move)) {
    return 'finisher';
  }

  return CHAIN_MOVES.has(option.move) || option.from ? 'chain' : null;
}

const COMBO_ICONS = { duo: 'duo', chain: 'chain', finisher: 'combo' };

const BASIC_ICONS = { shot: 'shot' };

export function iconOf(option) {
  const family = familyOf(option);

  if (family === 'combo' || tagOf(option)) {
    return { icon: COMBO_ICONS[tagOf(option)] ?? 'combo', palette: 'combo' };
  }

  if (family === 'role') {
    return { icon: 'skill', palette: 'skill' };
  }

  return option.move
    ? { icon: 'special', palette: 'special' }
    : { icon: BASIC_ICONS[option.kind] ?? option.id, palette: 'plain' };
}

export const partnerOf = (match, option) => match?.players?.[option.partner] ?? null;

const tagsOf = (tag, { bonus, partner }) => [
  ...(bonus > 0 ? [{ word: 'bonus', value: bonus }] : []),
  ...(tag === 'duo' ? [{ word: 'duo', partner: partner?.name ?? null }] : []),
  ...(tag === 'chain' ? [{ word: 'chain' }] : []),
];

// a finisher is free, the passing paid for it; a duo's striker pays his share
function paysOf(option, tag) {
  const cost = option.cost ?? 0;

  if (tag === 'finisher' || (option.move && cost === 0)) {
    return 'free';
  }

  return cost || null;
}

// what a row says beside its name: what lifts it, what kind of combo it is (a duo with whom), and
// what the picker pays
export function rowFacts(option, match = null) {
  const tag = tagOf(option);

  return {
    ...iconOf(option),
    tag,
    tags: tagsOf(tag, { bonus: option.bonus ?? 0, partner: partnerOf(match, option) }),
    pays: paysOf(option, tag),
  };
}

export const strengthOf = (option) => (option.power ?? 0) + (option.bonus ?? 0);

function strongestMove(options) {
  let best = -1;

  options.forEach((option, i) => {
    if (option.move && (best < 0 || strengthOf(option) > strengthOf(options[best]))) {
      best = i;
    }
  });

  return best;
}

// where the cursor opens, so a quick PASS plays the big move: on the strongest combo or special
// the attacker has, or on the skill that answers a special struck at the defender
export function openingCursor(options, { side, attack = null }) {
  const answering = side === 'defend' && Boolean(attack?.move);
  const best = side === 'attack' || answering ? strongestMove(options) : -1;

  return Math.max(0, best);
}
