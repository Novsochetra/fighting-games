// the Angkor Warrior: he raises his dav and the carved army of the Bayon steps out of the stone across
// the field, a rank thrusting each way, then he leaps and splits the ground under every raider
export const MARCH_OF_THE_BAYON = {
  name: 'March of the Bayon',
  summary:
    'Raises his dav; two ranks of carved soldiers step out across the field and thrust, then he splits the ground.',
  damageText: '10 per rank + 26',
  intro: 46,
  poseTicks: 10,
  // when each rank steps out, and which way it thrusts: 1 is the way he faces
  ranks: [
    { at: 56, facing: 1 },
    { at: 80, facing: -1 },
  ],
  // px between the soldiers of a rank, and kept clear of the screen's edges
  spacing: 40,
  edge: 24,
  leapAt: 112,
  chopAt: 124,
  end: 184,
  rank: {
    damage: 10,
    knockback: [1.4, -4],
    launch: true,
    hitstop: 6,
    hitstun: 30,
    ultimate: true,
  },
  split: {
    damage: 26,
    knockback: [3, -7],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
