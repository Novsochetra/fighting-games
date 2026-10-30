const DAY_MS = 24 * 60 * 60 * 1000;

// The arcade asks for support only from someone who keeps coming back to play, right after a game,
// and never twice in a row: Not now holds it back a month, a banner left alone comes back in a week.
export const SUPPORT_AFTER_PLAYS = 3;
export const SUPPORT_SNOOZE_MS = 30 * DAY_MS;
export const SUPPORT_RESHOW_MS = 7 * DAY_MS;

// Back from a game is a game opened since the banner last looked, however the player came back:
// the Back button, a game's own link, or a game on another site. The very first look only takes the
// count, so a player who already had plays is not asked the moment they arrive.
export const isBackFromGame = ({ playCount, seenPlays }) =>
  typeof seenPlays === 'number' && playCount > seenPlays;

export function shouldOfferSupport({ isReturn, playCount, hasGiven, snoozedUntil, now }) {
  const isSnoozed = typeof snoozedUntil === 'number' && now < snoozedUntil;
  return isReturn && !hasGiven && !isSnoozed && playCount >= SUPPORT_AFTER_PLAYS;
}
