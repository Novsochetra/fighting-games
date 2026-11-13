import { CINEMA } from '../../data/cinema.js';
import { affords } from '../cinema/budget.js';
import { addsTime } from '../cinema/mode.js';
import { createSaveCam, roundMoment } from '../save-cam/index.js';
import { chaseLengthOf, noteChase } from './chase/chase-length.js';
import { enter, shownRound } from './show.js';
import { REPEAT_SHARE, STAGE_TICKS } from './stages.js';

// the specials to announce before a clash: a shot carried on to the keeper was announced already
export function specialsIn(show, round) {
  const announced = round.carried && show.round > 0;
  const cutins = [];

  if (round.picked.attack?.move && !announced) {
    cutins.push('attack');
  }

  if (round.picked.defend?.move) {
    cutins.push('defend');
  }

  return cutins;
}

const shortened = (length, short) => (short ? Math.round(length * REPEAT_SHARE) : length);

export const versusLength = (show) => shortened(STAGE_TICKS.versus, show.repeat);

export const cutinLength = (show) => shortened(STAGE_TICKS.cutin, show.cutinShort);

// a cut-in plays in full the first time its move is shown in a match, and shorter after
export function beginCutin(show) {
  const option = shownRound(show).picked[show.cutins[show.cutin]];
  const key = option.move ?? option.id;

  show.cutinShort = show.seen.moves.has(key);
  show.seen.moves.add(key);
  enter(show, 'cutin');
}

const freezeFor = (show) =>
  addsTime(show.cinema) && affords(show.budget, CINEMA.clashFreeze) ? CINEMA.clashFreeze : 0;

export function beginSaveCam(show) {
  const round = shownRound(show);

  show.saveCam = createSaveCam(show.match, roundMoment(round), {
    length: STAGE_TICKS.saveCam,
    seed: (show.duel.id ?? 0) * 7 + show.round,
    venue: show.venue,
    cinema: show.cinema,
  });
  enter(show, 'saveCam');
}

// a special's ball rides across the screen to the goal once, after the shooter's cut-in and
// before the keeper's, or before the save cam where neither plays
export function beginChase(show) {
  const round = shownRound(show);

  if (round.kind !== 'keeper' || show.chased === show.round) {
    return false;
  }

  show.chased = show.round;
  show.chaseLength = chaseLengthOf(show, round);

  if (show.chaseLength === 0) {
    return false;
  }

  noteChase(show, round);
  enter(show, 'chase');

  return true;
}

// a keeper round plays the save cam where a field round plays the clash
export function beginMeeting(show) {
  const round = shownRound(show);

  if (round.kind !== 'keeper') {
    show.freeze = freezeFor(show);
    enter(show, 'clash');
  } else if (!beginChase(show)) {
    beginSaveCam(show);
  }
}

export function nextCutinOrMeeting(show) {
  if (show.cutin < show.cutins.length) {
    beginCutin(show);
  } else {
    beginMeeting(show);
  }
}
