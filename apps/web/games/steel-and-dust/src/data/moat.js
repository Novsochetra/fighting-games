// what the Angkor moat does to whoever falls in: a raider is out at once, however much health it
// has left, and pays a bonus for it; the hero climbs out on the nearer bank, a little worse for it
export const MOAT = {
  ringOutBonus: 200,
  // a fall never knocks the hero out on its own
  heroDamage: 10,
  // a moment to get clear of the raiders waiting at the edge
  heroInvincible: 60,
  // how far from the edge a body climbs out, and a raider's purse washes up
  bankIn: 12,
  // a raider this tall at scale 1 sinks on through the water once it is out, and is gone when the
  // water is over its head
  raiderHeight: 56,
};

// the water a body throws up as it falls in bursts up out of the pit from below the bottom of the
// screen, big enough that its spray clears the banks
export const MOAT_SPLASH = { scale: 1.4 };
