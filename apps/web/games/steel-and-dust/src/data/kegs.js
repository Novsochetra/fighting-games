// a powder keg on a camp road: a blow lights it, and so does a raider knocked flying into it; when
// its fuse burns down it blows up everything near it, the hero too
export const KEG = {
  fuse: 40,
  // it flashes white over the fuse's last ticks, the moment to get clear
  flashFrom: 16,
  // a raider thrown into a keg sets it off almost at once, before it can get up and walk away;
  // a blow of the hero's leaves him the whole fuse to get clear
  thrownFuse: 10,
  // a keg caught in another's blast goes up almost at once, so a row of them chains
  chainFuse: 8,
  halfWidth: 9,
  height: 28,
  // the blast's reach either side of the keg and above it, as wide as the blast is drawn
  reach: 42,
  rise: 60,
};

// enough to finish a foot soldier and leave a heavy reeling; the hero only takes a knock
export const KEG_BLAST = {
  raider: {
    damage: 60,
    knockback: [3.4, -5.6],
    launch: true,
    knockdown: true,
    knockAway: true,
    hitstop: 10,
    hitstun: 30,
  },
  hero: {
    damage: 18,
    knockback: [3, -4.2],
    knockdown: true,
    knockAway: true,
    hitstop: 8,
    hitstun: 26,
  },
};
