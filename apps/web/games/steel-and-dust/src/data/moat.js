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
};

// the water a body throws up as it falls in bursts up out of the pit from below the bottom of the
// screen, its flat foot `sunk` deep enough that no shake lifts it into view
export const MOAT_SPLASH = { scale: 1.4, sunk: 8 };
