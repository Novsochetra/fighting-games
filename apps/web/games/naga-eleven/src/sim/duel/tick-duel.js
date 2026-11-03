import { DUELS } from '../../data/duels.js';
import { finishDuel } from './finish.js';
import { settleRound } from './settle.js';

// the show finishes a watched duel; an unwatched one, or a show that never ends, finishes itself
function endsItself(match, duel) {
  const limit = match.duelMemory.watched ? DUELS.showTimeout : DUELS.unwatchedTicks;

  return duel.doneTicks >= limit;
}

export function tickDuel(match) {
  const duel = match.duel;

  if (!duel) {
    match.phase = 'play';

    return;
  }

  duel.ticks += 1;

  if (duel.stage === 'choose') {
    settleRound(match, duel);

    return;
  }

  duel.doneTicks += 1;

  if (endsItself(match, duel)) {
    finishDuel(match);
  }
}
