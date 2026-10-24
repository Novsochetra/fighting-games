const DAY_MS = 24 * 60 * 60 * 1000;

// The arcade asks for support only from someone who keeps coming back to play, right after a game,
// and never twice in a row: Not now holds it back a month, a banner left alone comes back in a week.
export const SUPPORT_AFTER_PLAYS = 3;
export const SUPPORT_SNOOZE_MS = 30 * DAY_MS;
export const SUPPORT_RESHOW_MS = 7 * DAY_MS;

export function shouldOfferSupport({ isReturn, playCount, hasGiven, snoozedUntil, now }) {
  const isSnoozed = typeof snoozedUntil === 'number' && now < snoozedUntil;
  return isReturn && !hasGiven && !isSnoozed && playCount >= SUPPORT_AFTER_PLAYS;
}

// A game links back to the arcade by address, so coming back from one is a page load whose
// referrer is a page under games/ on the same site.
export function isGameReferrer(referrer, pageUrl) {
  try {
    const from = new URL(referrer);
    const games = new URL('games/', pageUrl);
    return from.origin === games.origin && from.pathname.startsWith(games.pathname);
  } catch {
    return false;
  }
}
