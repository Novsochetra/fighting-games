// a carved boulder up the Mirage Temple road that breaks loose once the hero passes its spot: the
// ground shakes and a '!' flashes at the edge of the screen first, then it rolls down the road
// across the screen and flattens whoever stands in its way
export const TEMPLE_BOULDER = {
  // the shaking before it rolls into view, the moment to get ready to jump
  warn: 60,
  speed: 3,
  // down the road from the temple, so in from the right edge of the screen
  direction: -1,
  // as wide as it is drawn, though it strikes a box a little smaller, so a jump clears it
  diameter: 45,
  halfWidth: 16,
  height: 26,
  // the tallest rise it rolls up, a temple step; a taller one breaks it
  climb: 8,
  // it rolls in from this far outside the view, and is gone this far past its far edge
  margin: 26,
};

// enough to flatten a foot soldier and knock a heavy down; the hero only takes a knock
export const BOULDER_CRUSH = {
  raider: { damage: 50, knockback: [3, -3.6], knockdown: true, hitstop: 10, hitstun: 30 },
  hero: { damage: 16, knockback: [2.4, -3.4], knockdown: true, hitstop: 8, hitstun: 26 },
};
