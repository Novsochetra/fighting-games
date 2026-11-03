import { computerChoice } from './computer.js';
import { optionsFor } from './options.js';
import { currentRound, isHumanSide, SIDES } from './rounds.js';

// the human's pick, from the duel menu; false when it is not theirs to make or not on offer
export function chooseDuel(match, side, optionId) {
  const duel = match.duel;
  const round = currentRound(duel);

  if (!round || duel.stage !== 'choose' || round.picked[side] !== null) {
    return false;
  }

  const option = optionsFor(match, round, side).find((entry) => entry.id === optionId);

  if (!option) {
    return false;
  }

  round.picked[side] = option;

  return true;
}

export function chooseForComputer(match, round) {
  for (const side of SIDES) {
    if (round.picked[side] === null && !isHumanSide(match, round, side)) {
      round.picked[side] = computerChoice(match, round, side);
    }
  }
}
