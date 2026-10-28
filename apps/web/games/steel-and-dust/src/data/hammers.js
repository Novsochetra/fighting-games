// a steam drop hammer over the foundry floor: it slams on a steady beat, the floor under it
// blinking red first, and crushes whatever stands there
export const HAMMER = {
  // one beat: raised, the warning, the drop, a moment on the floor and the climb back up
  rest: 70,
  warn: 40,
  drop: 6,
  down: 16,
  rise: 18,
  // the head hangs this far over the floor between slams, high enough to walk under
  lift: 72,
  halfWidth: 22,
};

// enough to finish a foot soldier and flatten a heavy; the hero only takes a knock
export const HAMMER_SLAM = {
  raider: {
    damage: 50,
    knockback: [1.8, -3.6],
    knockdown: true,
    knockAway: true,
    hitstop: 10,
    hitstun: 30,
  },
  hero: {
    damage: 18,
    knockback: [1.8, -3.6],
    knockdown: true,
    knockAway: true,
    hitstop: 8,
    hitstun: 26,
  },
};
