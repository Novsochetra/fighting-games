export const ULTIMATE = {
  name: 'Shade Requiem',
  intro: 46,
  gap: 7,
  strikes: 8,
  finale: 30,
  finaleAt: 10,
  hit: { name: 'Requiem', damage: 7, knockback: [0.4, 0], hitstop: 4, hitstun: 30, ultimate: true },
  end: {
    name: 'Requiem',
    damage: 24,
    knockback: [3.2, -6.4],
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
    launch: true,
  },
};

export const ULT_START_STATES = new Set([
  'idle',
  'walk',
  'attack',
  'air',
  'dash',
  'charge',
  'squat',
]);
