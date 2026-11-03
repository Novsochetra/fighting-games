import { looksOf } from '../../actors/looks.js';
import { castOf as cutinCastOf } from '../cutin-cast.js';
import { shownRound } from '../show.js';

// found as the duo's cut-in finds him, so the clash shows the mate its portrait does
function partnerOf(show, round) {
  const option = round.picked?.attack;
  const striker = show.match?.players?.[round.attacker];

  return option && striker
    ? cutinCastOf(show, round, 'attack', { option, tag: 'duo' }).partner
    : null;
}

function playerOf(show, round, side) {
  if (side === 'partner') {
    return partnerOf(show, round);
  }

  const index = { attack: round.attacker, defend: round.defender }[side];

  return show.match?.players?.[index] ?? null;
}

// the player a side of the shown round sends into the clash, in his own look and shirt number
export function castOf(show, side) {
  const round = show && shownRound(show);
  const player = round ? playerOf(show, round, side) : null;

  if (!player) {
    return null;
  }

  const index = show.match.players.indexOf(player);

  return { look: looksOf(show.match).players[index], number: player.number };
}
