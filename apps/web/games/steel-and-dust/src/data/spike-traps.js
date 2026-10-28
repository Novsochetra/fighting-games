// a row of the Mirage Temple's floor tiles that push spikes up on a beat, dust puffing out of their
// slots first, each tile coming up a moment after the one before it
export const SPIKE_TRAP = {
  // one beat: flat, the dust puffing, the spikes shooting up, standing and sinking back
  rest: 84,
  warn: 36,
  rise: 4,
  up: 30,
  sink: 14,
  // a row lies edge to edge around its spot, a tile as wide as it is drawn
  tiles: 3,
  pitch: 38,
  stagger: 20,
  // the spikes stand across the tile's top and this high over the road
  halfWidth: 15,
  height: 16,
};

// enough to finish any foot soldier and throw it up off the spikes; the hero only takes a jab
export const SPIKE_STAB = {
  raider: {
    damage: 48,
    knockback: [0.9, -5],
    launch: true,
    hitstop: 10,
    hitstun: 30,
  },
  hero: {
    damage: 14,
    knockback: [1.8, -3.2],
    knockdown: true,
    hitstop: 8,
    hitstun: 24,
  },
};
