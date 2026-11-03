import { CHAIN_RULES } from '../../data/combos.js';
import { struckAt } from '../charge.js';
import { sideOf } from '../squad.js';

const chainsOn = (match) => match.systems?.chains !== false;

// a chain lives until the one to finish it has struck, or its ticks run out
const isLive = (match, chain) =>
  Boolean(chain) &&
  struckAt(match, match.players[chain.receiver]) - chain.tick <= CHAIN_RULES.ticks;

// a skill that plays dribble, pass or cross starts one: the shot that may finish it is his own
// after a dribble, or the receiver's after a pass
export function startChain(match, player, move, receiver = player.index) {
  if (chainsOn(match) && CHAIN_RULES.starts.includes(move.play)) {
    player.chain = { move: move.id, tick: match.tick, receiver };
  }
}

// the chain a shot struck by him now would finish, and whose it is
export function chainOf(match, shooter) {
  const owner = sideOf(match, shooter.team).find(
    (mate) => isLive(match, mate.chain) && mate.chain.receiver === shooter.index,
  );

  return owner ? { ...owner.chain, owner: owner.index } : null;
}

// a shot spends it, and a plain pass by the one who was to strike breaks it
export function spendChain(match, shooter) {
  for (const mate of sideOf(match, shooter.team)) {
    if (mate.chain?.receiver === shooter.index) {
      mate.chain = null;
    }
  }
}

export function clearChains(match) {
  for (const player of match.players) {
    player.chain = null;
  }
}

// the ball lost to the other side, or the ticks run out, breaks a side's chain
export function watchChains(match) {
  const toucher = match.players[match.ball.lastTouch] ?? null;

  for (const player of match.players) {
    const lost = toucher !== null && toucher.team !== player.team;

    if (player.chain && (lost || !isLive(match, player.chain))) {
      player.chain = null;
    }
  }
}
