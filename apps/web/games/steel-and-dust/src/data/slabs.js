// a cracked slab in the Bayon's galleries, flush with the road: the hero's dive or a raider thrown
// down on it starts the cracks, and a moment later it gives way under everyone standing on it
export const SLAB = {
  // the slab art is drawn a little bigger than the sprites' density, as deep as the road it sits in
  scale: 1.5,
  // the floor it spans either side of its middle, as wide as it is drawn
  halfWidth: 36,
  // the cracks spread for this long, the moment to get off it, then it breaks up and lies open
  crack: 30,
  breakUp: 10,
  // how far past its edge a body it gave way under climbs back out
  edgeIn: 10,
  // a raider dropped through it is out at once, for a bonus
  fallBonus: 200,
};

// the hero falls in and is thrown out on the nearer edge, knocked down but never knocked out by it
export const SLAB_FALL = {
  hero: {
    damage: 14,
    knockback: [1.6, -3],
    knockdown: true,
    knockAway: true,
    hitstop: 8,
    hitstun: 26,
  },
};
