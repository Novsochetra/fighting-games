import { CINEMA } from '../../../data/cinema.js';
import { affords } from '../../cinema/budget.js';
import { addsTime } from '../../cinema/mode.js';
import { REPEAT_SHARE } from '../stages.js';

export const CHASE_FULL = CINEMA.chase.ticks;

const keyOf = (option) => `chase:${option.move ?? option.id}`;

export function chaseLengthOf(show, round) {
  const attack = round.picked.attack;

  if (!attack?.move || !addsTime(show.cinema)) {
    return 0;
  }

  const length = show.seen.moves.has(keyOf(attack))
    ? Math.round(CHASE_FULL * REPEAT_SHARE)
    : CHASE_FULL;

  return affords(show.budget, length) ? length : 0;
}

export const noteChase = (show, round) => show.seen.moves.add(keyOf(round.picked.attack));
