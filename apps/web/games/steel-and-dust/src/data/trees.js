// a dead pine by a forest road: a blow fells it the way it was struck, and the trunk comes down
// across the road on everyone under it
export const TREE = {
  // it creaks and leans first, the moment to get out from under it
  creak: 20,
  fall: 8,
  // the trunk a blow has to reach, from the stump up
  halfWidth: 8,
  height: 104,
  // the fallen trunk lies from this far past the stump to its tip, as far as it is drawn
  from: 8,
  reach: 124,
  // a jump clears the trunk as it comes down
  depth: 36,
};

// enough to finish a foot soldier and flatten a heavy; the hero only takes a knock
export const TREE_FALL = {
  raider: { damage: 60, knockback: [1.4, -2.6], knockdown: true, hitstop: 10, hitstun: 30 },
  hero: { damage: 20, knockback: [1.4, -2.6], knockdown: true, hitstop: 8, hitstun: 26 },
};
