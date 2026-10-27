// a slag vent in the foundry floor: its grate glows on a steady beat, each vent on its own, then it
// erupts in a column of molten slag that throws whatever stands over it high
export const VENT = {
  // one beat: cold, glowing (the warning), erupting and dying down
  rest: 140,
  glow: 50,
  erupt: 40,
  cool: 16,
  // the grate either side of its middle, and how high the column reaches over it, as it is drawn
  halfWidth: 14,
  height: 80,
  // a raider caught burns this long after (the Ember Shade's burn)
  burn: 240,
};

// a raider is thrown high, scoring as the hero's hit; the hero is thrown out of the column
export const VENT_BLAST = {
  raider: {
    damage: 22,
    knockback: [1.2, -7.2],
    launch: true,
    knockdown: true,
    knockAway: true,
    hitstop: 8,
    hitstun: 30,
  },
  hero: {
    damage: 14,
    knockback: [2.4, -4.2],
    knockdown: true,
    knockAway: true,
    hitstop: 7,
    hitstun: 24,
  },
};
