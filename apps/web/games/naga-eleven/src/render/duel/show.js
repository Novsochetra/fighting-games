import { currentRound, humanSideOf } from '../../sim/duel/index.js';
import { seenOf } from './seen.js';

// a show keeps the duel it was made for, which the match lets go of once the show finishes it;
// `venue` is the match's, whose goal its save cam shows
export function createDuelShow(match, { heroAge = null, venue = null } = {}) {
  const seen = seenOf(match);
  const repeat = match.duel ? seen.duels > 0 : false;

  if (match.duel) {
    seen.duels += 1;
  }

  return {
    match,
    duel: match.duel,
    heroAge,
    venue,
    stage: match.duel ? 'intro' : 'done',
    stageTicks: 0,
    ticks: 0,
    round: 0,
    cutins: [],
    cutin: 0,
    cursor: 0,
    shake: 0,
    flash: 0,
    seen,
    repeat,
    cutinShort: false,
    saveCam: null,
  };
}

export const isShowDone = (show) => show.stage === 'done';

export const shownRound = (show) => show.duel?.rounds[show.round] ?? null;

export const isShowingCurrent = (show) => shownRound(show) === currentRound(show.duel);

// the side the human picks for in the round being shown, while their pick is still to make
export function pendingSide(show) {
  const round = shownRound(show);
  const side = isShowingCurrent(show) ? humanSideOf(show.match, round) : null;

  return side && round.picked[side] === null ? side : null;
}

export const playerIn = (show, round, side) =>
  show.match.players[side === 'attack' ? round.attacker : round.defender];

export function enter(show, stage) {
  show.stage = stage;
  show.stageTicks = 0;
}
