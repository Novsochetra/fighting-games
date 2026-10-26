// A screen opened by a load from the arcade (its own page, not a screen change) goes Back through
// history: the browser then brings the arcade back as it was left, from its back/forward cache,
// where following the link would load it fresh at the top.
export function cameFrom(target, { referrer, historyLength }) {
  if (!referrer || historyLength < 2) {
    return false;
  }
  const from = new URL(referrer);
  return from.origin === target.origin && from.pathname === target.pathname;
}
