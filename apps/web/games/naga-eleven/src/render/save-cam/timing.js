import { clamp01 } from '../duel/hash.js';

// how long a save cam runs: in a duel's keeper round (the duel's STAGE_TICKS.saveCam) and in
// open play; a press skips it once it has run `skipAfter`
export const SAVE_CAM_TICKS = { duel: 96, open: 90, skipAfter: 18 };

// the ball leaves the foot at `strike` and meets the keeper `flight` later; play then holds still
// for `hitStop` ticks, so the contact lands
export const BEATS = { strike: 10, flight: 30, hitStop: 6 };

export const contactTick = () => BEATS.strike + BEATS.flight;

// the show's own clock: it stops through the hit-stop, so whatever moves holds its place there
export function playTicks(ticks) {
  const contact = contactTick();

  if (ticks < contact) {
    return ticks;
  }

  return Math.max(contact, ticks - BEATS.hitStop);
}

export const inHitStop = (ticks) => ticks >= contactTick() && ticks < contactTick() + BEATS.hitStop;

// how far the ball has flown to the keeper, 0 at the strike and 1 as it meets him
export const flightShare = (ticks) => clamp01((playTicks(ticks) - BEATS.strike) / BEATS.flight);

// ticks of play since the contact, negative before it
export const sinceContact = (ticks) => playTicks(ticks) - contactTick();
