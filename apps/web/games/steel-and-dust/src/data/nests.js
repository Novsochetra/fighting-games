// a hornets' nest hanging over a forest road: a raider launched up into it, or a blow of the hero's
// that reaches it, knocks it down, and the swarm that breaks out of it stings whoever is closest
export const NEST = {
  // the bottom of the nest hangs this high over the road: a launched raider tumbles up through it,
  // and every blow struck on the ground passes under it
  hang: 64,
  // the papery body a raider or a blow has to reach
  halfWidth: 10,
  height: 20,
  // it sways on its branch for a moment once struck, then drops
  sway: 16,
  gravity: 0.3,
};

export const SWARM = {
  hornets: 6,
  // how long it stings before it scatters off the screen, and how long that takes
  life: 270,
  scatter: 90,
  // it looks again for whoever is closest this often, and never strays farther than this from its
  // nest: back off that far and it leaves you to the raiders
  retarget: 60,
  range: 120,
  // slower than the hero's run, so he can leave it to the raiders, and faster than any raider's walk
  speed: 2.1,
  // each hornet circles its own spot about the body it chases, this far out and this fast
  radius: 10,
  spin: 0.11,
  // the whole swarm stings one body this often, the hero less often than a raider
  raiderEvery: 16,
  heroEvery: 28,
  buzzEvery: 30,
};

// a sting is a small hit and a short flinch, never a knockdown: enough to finish a raider worn down
// already, and a nuisance to the hero
export const STING = {
  raider: { damage: 2, knockback: [0.6, 0], hitstop: 3, hitstun: 12 },
  hero: { damage: 2, knockback: [0.6, 0], hitstop: 3, hitstun: 10 },
};
