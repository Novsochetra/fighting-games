// a Bayon face tower on the road with loose stones hanging over the fight: a blow of the hero's
// cracks it, it comes apart, and its stones come down on the spots their shadows mark first
export const TOWER = {
  // the tower art is drawn a little bigger than the sprites' density, a head taller than the hero
  scale: 1.25,
  // the body a blow has to reach, from its base up
  halfWidth: 18,
  height: 72,
  // it shakes and creaks for this long after the blow, then comes apart and is gone
  crack: 24,
  apart: 12,
};

export const STONES = {
  // one stone to each stretch of the half screen around the tower
  count: 4,
  spread: 96,
  // each shadow shows this long before its stone lands, the stones landing one after another
  lead: 36,
  every: 8,
  // a stone drops into view over its last ticks, from this far above where it lands
  fall: 30,
  drop: 240,
  // the road a stone strikes either side of where it lands, as wide as its shadow at the end, and
  // how high over that road it strikes a body, so a jump does not get out from under it
  halfWidth: 14,
  height: 64,
};

// enough to finish a foot soldier and flatten a heavy; the hero takes a solid knock
export const STONE_HIT = {
  raider: {
    damage: 60,
    knockback: [1.4, -3],
    knockdown: true,
    knockAway: true,
    hitstop: 10,
    hitstun: 30,
  },
  hero: {
    damage: 18,
    knockback: [1.4, -3],
    knockdown: true,
    knockAway: true,
    hitstop: 8,
    hitstun: 26,
  },
};
