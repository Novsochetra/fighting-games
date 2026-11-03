import { computerChoice } from './computer.js';
import { settleRound } from './settle.js';
import { currentRound, SIDES } from './rounds.js';

const MOST_ROUNDS = 3;

// a duel ended before its sides chose (the show closed early) is decided as the computer would
export function forceChoices(match) {
  const duel = match.duel;

  for (let i = 0; i < MOST_ROUNDS && duel.stage !== 'done'; i += 1) {
    const round = currentRound(duel);

    for (const side of SIDES) {
      round.picked[side] ??= computerChoice(match, round, side);
    }

    settleRound(match, duel);
  }
}
