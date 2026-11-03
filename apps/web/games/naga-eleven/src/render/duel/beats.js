import { createSaveCam, roundMoment } from '../save-cam/index.js';
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

// a keeper round plays the save cam where a field round plays the clash
export function beginMeeting(show) {
  const round = shownRound(show);

  if (round.kind !== 'keeper') {
    enter(show, 'clash');

    return;
  }

  show.saveCam = createSaveCam(show.match, roundMoment(round), {
    length: STAGE_TICKS.saveCam,
    seed: (show.duel.id ?? 0) * 7 + show.round,
    venue: show.venue,
  });
  enter(show, 'saveCam');
}
