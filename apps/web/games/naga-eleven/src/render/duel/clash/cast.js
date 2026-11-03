import { looksOf } from '../../actors/looks.js';
import { shownRound } from '../show.js';

// the player a side of the shown round sends into the clash, in his own look and shirt number
export function castOf(show, side) {
  const round = show && shownRound(show);
  const index = { attack: round?.attacker, defend: round?.defender }[side];
  const player = show?.match?.players?.[index];

  if (!player) {
    return null;
  }

  return { look: looksOf(show.match).players[index], number: player.number };
}
