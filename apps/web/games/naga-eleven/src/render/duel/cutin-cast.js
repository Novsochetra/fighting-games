import { DUO_COMBOS } from '../../data/combos.js';
import { playerIn } from './show.js';

const distance = (first, second) => Math.hypot(first.x - second.x, first.y - second.y);

// a duo's partner: the sim says which player (`partner`); for an option made before it did, the
// cast member the duo names, else the nearest mate on the pitch
function partnerOf(match, striker, option) {
  if (Number.isInteger(option.partner)) {
    return match.players[option.partner] ?? null;
  }

  const duo = DUO_COMBOS.find((each) => each.move === option.move);
  const mates = match.players.filter(
    (mate) => mate.team === striker.team && mate !== striker && mate.role !== 'keeper',
  );
  const named = duo?.partner.star && mates.find((mate) => mate.star === duo.partner.star);

  return (
    named ||
    mates.sort((first, second) => distance(first, striker) - distance(second, striker))[0] ||
    null
  );
}

// who a cut-in shows: the player who picked the move, and for a duo the mate who strikes it with him
export function castOf(show, round, side, { option, tag }) {
  const striker = playerIn(show, round, side);

  return { striker, partner: tag === 'duo' ? partnerOf(show.match, striker, option) : null };
}
