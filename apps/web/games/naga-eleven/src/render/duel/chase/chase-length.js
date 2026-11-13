import { CINEMA } from '../../../data/cinema.js';
import { affords } from '../../cinema/budget.js';
import { addsTime } from '../../cinema/mode.js';
import { REPEAT_SHARE } from '../stages.js';

// read as each chase begins, so a length tuned while the game runs (the camera lab) plays at once
export const chaseFull = () => CINEMA.chase.ticks;

const keyOf = (option) => `chase:${option.move ?? option.id}`;

export function chaseLengthOf(show, round) {
  const attack = round.picked.attack;

  if (!attack?.move || !addsTime(show.cinema)) {
    return 0;
  }

  const full = chaseFull();
  const length = show.seen.moves.has(keyOf(attack)) ? Math.round(full * REPEAT_SHARE) : full;

  return affords(show.budget, length) ? length : 0;
}

export const noteChase = (show, round) => show.seen.moves.add(keyOf(round.picked.attack));
