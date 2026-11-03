import { chooseForComputer } from './choose.js';
import { keeperOf } from './geometry.js';
import { resolveRound } from './resolve.js';
import { createRound, currentRound, isChosen, playerOf } from './rounds.js';
import { payForSpecials, rewardWinner } from './spirit.js';

// the moves the two picked: the attack's, with the combo it was, and the defender's skill
function picksOf({ attack, defend }) {
  return {
    move: attack?.move ?? null,
    guard: defend?.move ?? null,
    tag: attack?.tag ?? null,
    from: attack?.from ?? null,
  };
}

// a keeper round says where the shot went, how he dived and how he kept it out
const keeperPartsOf = ({ aim = null, dive = null, style = null }) => ({ aim, dive, style });

function outcomeOf(match, round) {
  const { result } = round;
  const winner = playerOf(match, round, result.side);

  return {
    result: result.word,
    side: result.side,
    winner: winner.team,
    attacker: round.attacker,
    defender: round.defender,
    keeper: round.kind === 'keeper' ? round.defender : null,
    receiver: result.receiver ?? null,
    ...picksOf(round.picked),
    ...keeperPartsOf(result),
  };
}

function conclude(match, duel, round) {
  duel.stage = 'done';
  duel.outcome = outcomeOf(match, round);
  rewardWinner(match, playerOf(match, round, round.result.side));
  match.duelMemory.won[duel.outcome.winner] += 1;
}

// a shot past the defender goes on to the keeper, with the option it was struck with
function onToKeeper(match, duel, round) {
  const shooter = playerOf(match, round, 'attack');
  const keeper = keeperOf(match, 1 - shooter.team);

  if (!keeper) {
    round.result = { ...round.result, word: 'goal' };
    conclude(match, duel, round);

    return;
  }

  const next = createRound({ kind: 'keeper', attacker: shooter, defender: keeper });

  next.picked.attack = round.picked.attack;
  next.carried = true;
  duel.shooter = shooter.index;
  duel.keeper = keeper.index;
  duel.rounds.push(next);
  chooseForComputer(match, next);
}

export function settleRound(match, duel) {
  const round = currentRound(duel);

  chooseForComputer(match, round);

  if (!isChosen(round)) {
    return;
  }

  round.result = resolveRound(match, round);
  payForSpecials(match, duel, round);

  if (round.result.word === 'through') {
    onToKeeper(match, duel, round);
  } else {
    conclude(match, duel, round);
  }
}
