// Antler: herds of spirit stags thunder across the screen, then the great stag tramples everything
export const STAMPEDE = {
  name: 'Spirit Stampede',
  summary: 'Herds of spirit stags thunder across the screen, then the great stag tramples all.',
  damageText: '7 per stag + 24',
  intro: 46,
  poseTicks: 5,
  // [ticks after the intro, run direction against the facing, lane offsets]
  herds: [
    [0, 1, [0, 14]],
    [22, -1, [6]],
    [40, 1, [-4, 10]],
    [58, -1, [0, 16]],
  ],
  greatStagAt: 84,
  end: 176,
  speed: 7.5,
  greatSpeed: 9,
  stag: {
    damage: 7,
    knockback: [2.8, -3.4],
    launch: true,
    hitstop: 4,
    hitstun: 30,
    ultimate: true,
  },
  greatStag: {
    damage: 24,
    knockback: [4.2, -6.8],
    launch: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
