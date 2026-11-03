import { DUELS } from '../../data/duels.js';
import { spendChain } from '../combos/chains.js';
import { rest } from '../skills/fire.js';
import { gainSpirit } from '../spirit.js';
import { pushEvent } from './events.js';
import { playerOf, SIDES } from './rounds.js';

const spend = (player, cost) => {
  player.spirit = Math.max(0, (player.spirit ?? 0) - (cost ?? 0));
};

// a duo's partner pays his share with the striker's, unless he paid it with his pass
function payPartner(match, option) {
  const partner = Number.isInteger(option.partner) ? match.players[option.partner] : null;

  if (partner) {
    spend(partner, option.partnerShare);
    rest(partner);
  }

  return partner;
}

function pay(match, player, option) {
  const partner = payPartner(match, option);

  spend(player, option.cost);
  rest(player);

  if (option.tag === 'chain') {
    spendChain(match, player);
  }

  pushEvent(match, {
    type: 'special',
    player: player.index,
    move: option.move,
    tag: option.tag ?? null,
    ...(partner ? { partner: partner.index } : {}),
  });
}

// a special is paid for once in a duel, even when its shot goes on to meet the keeper; a finisher
// is free, the passing paid for it
export function payForSpecials(match, duel, round) {
  for (const side of SIDES) {
    const option = round.picked[side];
    const player = playerOf(match, round, side);
    const key = `${player.index}:${option?.move}`;

    if (option?.move && !duel.paid.includes(key)) {
      duel.paid.push(key);
      pay(match, player, option);
    }
  }
}

export function rewardWinner(match, player) {
  gainSpirit(match, player, DUELS.winSpirit);
}
