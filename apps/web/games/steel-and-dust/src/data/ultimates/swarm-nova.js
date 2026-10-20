// Firefly: rises on a glow, the swarm hunts every raider, then gathers back into a nova
export const SWARM_NOVA = {
  name: 'Swarm Nova',
  summary: 'Rises and looses a swarm that hunts every raider, then gathers into a nova.',
  damageText: '3 per sting + 22',
  intro: 46,
  poseTicks: 5,
  hover: 30,
  swarm: 18,
  stings: 3,
  recallAt: 124,
  novaAt: 140,
  end: 176,
  sting: { damage: 3, knockback: [0.3, -0.8], hitstop: 2, hitstun: 26, ultimate: true },
  nova: {
    damage: 22,
    knockback: [3.6, -6.2],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
