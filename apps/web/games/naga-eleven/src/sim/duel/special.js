import { opensDuel, shotOffersOf } from '../combos/offers.js';
import { keeperOf } from './geometry.js';
import { createRound, isHumanSide } from './rounds.js';
import { startDuel } from './start.js';

const strengthOf = (option) => (option.power ?? 0) + (option.bonus ?? 0);

const strongest = (options) =>
  options.reduce((best, option) => (strengthOf(option) > strengthOf(best) ? option : best));

// a human with more than one shot on offer picks which in the duel menu; anyone else lets go of
// the strongest
function presetShot(match, player, keeper, offers) {
  const round = createRound({ kind: 'keeper', attacker: player, defender: keeper });

  return offers.length > 1 && isHumanSide(match, round, 'attack') ? null : strongest(offers);
}

// a full-charge SHOOT with a special, a combo or a chain on offer opens the keeper duel; so does a
// duo's or a chain's ball struck first time as it comes
export function beginSpecial(match, player, { firstTime = false } = {}) {
  const owns = match.ball.owner === player?.index;
  const ready = match.phase === 'play' && !match.duel && (owns || firstTime);
  const keeper = ready ? keeperOf(match, 1 - player.team) : null;
  const offers = keeper ? shotOffersOf(match, player, { firstTime: !owns }) : [];

  if (!opensDuel(offers)) {
    return false;
  }

  const attack = presetShot(match, player, keeper, offers);

  return startDuel(match, { kind: 'keeper', attacker: player, defender: keeper, attack, offers });
}
