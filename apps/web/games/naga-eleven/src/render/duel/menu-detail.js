import { DUO_COMBOS, NAMED_CHAINS, PASS_COMBO } from '../../data/combos.js';
import { moveOf } from '../../data/moves.js';
import { SKILL_WORDS } from '../../data/skill-words.js';
import { numberIn, textOf } from '../text.js';
import { tagOf } from './menu-rows.js';

const nameOf = (id, lang) => textOf(moveOf(id)?.name ?? '', lang);

// the level a finisher was built on: the sim says, else the match's combo, else the level its
// move is the finisher of
export function finisherLevel(option, match) {
  if (option.level) {
    return option.level;
  }

  if (match?.combo?.level) {
    return match.combo.level;
  }

  const levels = Object.values(PASS_COMBO.finishers).flatMap((byLevel) => Object.entries(byLevel));
  const found = levels.find(([, move]) => move === option.move);

  return found ? Number(found[0]) : PASS_COMBO.finisherFrom;
}

// the two moves of a chain: the skill it started from and the shot it ends in
export function chainMoves(option) {
  const named = NAMED_CHAINS.find((chain) => chain.move === option.move);

  if (named) {
    return [named.from, named.to];
  }

  return [option.from ?? null, option.move];
}

// what each of a duo pays, the striker's share first as his row's price shows it: the row names
// the partner, so the head tells what the row cannot, that both pay. A partner who paid with his
// pass (`partnerShare` 0) still gave his share, so the move's own share is told for him
export function duoShares(option) {
  const shares = DUO_COMBOS.find((duo) => duo.move === option.move)?.shares;
  const striker = option.cost || shares?.striker;
  const partner = option.partnerShare || shares?.partner;

  return striker && partner ? [striker, partner] : null;
}

const DETAILS = {
  duo: (option, match, lang) =>
    duoShares(option)
      ?.map((share) => numberIn(share, lang))
      .join(' + ') ?? null,
  chain: (option, match, lang) =>
    chainMoves(option)
      .filter(Boolean)
      .map((id) => nameOf(id, lang))
      .join(' > '),
  finisher: (option, match, lang) =>
    `x${numberIn(finisherLevel(option, match), lang)} ${textOf(SKILL_WORDS.combo, lang)}`,
};

// a line on what the lit row brings with it, or null for a row that is only itself
export function detailOf(match, option, lang = 'en') {
  const tag = option ? tagOf(option) : null;

  return tag ? DETAILS[tag](option, match, lang) : null;
}
