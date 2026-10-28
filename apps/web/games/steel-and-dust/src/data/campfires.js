// a raider camp's fire burning on the road: a raider thrown or walking into it catches alight, and
// the hero who walks into it is singed and pushed back out of it
export const CAMPFIRE = {
  halfWidth: 11,
  height: 26,
  // a raider burns this long after it last touched the flames (the Ember Shade's burn)
  burn: 240,
  // the same fire singes the hero again only after this long, not on every tick he stands in it
  singeEvery: 40,
};

export const CAMPFIRE_SINGE = {
  damage: 6,
  knockback: [2.6, -2.4],
  knockAway: true,
  hitstop: 4,
  hitstun: 16,
};
