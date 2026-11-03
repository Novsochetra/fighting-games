// what a match has shown already: the moves whose cut-ins have played and how many duels, so a
// second showing runs at half length and the 8 to 14 cut-ins of a match keep it moving. Kept by
// the match, so it goes when the match does
const SEEN = new WeakMap();

export function seenOf(match) {
  let seen = SEEN.get(match);

  if (!seen) {
    seen = { moves: new Set(), duels: 0 };
    SEEN.set(match, seen);
  }

  return seen;
}
