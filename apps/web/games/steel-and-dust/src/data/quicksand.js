// a patch of soft sand on the canyon road: a raider knocked off its feet in it is held fast and
// sinks until it is swallowed; the hero wading through it is slowed and pulled down
export const QUICKSAND = {
  // the sand feet can stand in, either side of the patch's middle, inside the rocks round its rim
  halfWidth: 25,
  // a held raider goes down this far a tick at scale 1, and is swallowed once it is in up to the
  // top of its head: about two and a half seconds, whatever its size
  raiderSink: 0.3,
  raiderHeight: 44,
  // the hero goes down slower, deepest in the middle, and the sand throws him out once he is in
  // to the waist; the sand by the rim is shallow, so he steps out of it rather than popping up
  heroSink: 0.06,
  heroDepth: 14,
  shelf: 1.6,
  // walking in it covers this share of the ground it would on the road
  wade: 0.5,
  swallowBonus: 150,
  // being thrown out never knocks the hero out on its own
  heroDamage: 8,
  // how far from the rim a swallowed raider's purse is left
  rimOut: 8,
};

// the sand heaving the hero up and out of it, away from its middle
export const QUICKSAND_HEAVE = {
  knockback: [2.4, -4.6],
  launch: true,
  knockdown: true,
  hitstop: 6,
  hitstun: 20,
};
