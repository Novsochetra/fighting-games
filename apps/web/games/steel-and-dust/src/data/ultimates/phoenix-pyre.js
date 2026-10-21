// Ember: flame pillars roll out to both edges, a phoenix sweeps the field and dives into an inferno
export const PHOENIX_PYRE = {
  name: 'Phoenix Pyre',
  summary:
    'Flame pillars roll out to both edges, then a phoenix sweeps the field and dives into an inferno.',
  damageText: '7 per flame + 8 per pass + 26',
  intro: 46,
  poseTicks: 5,
  waves: 6,
  waveGap: 5,
  waveSpacing: 34,
  phoenixAt: 78,
  // ticks after the phoenix bursts from the blade at which it reaches each point of its flight:
  // up behind the Shade, down to the near edge, across, up, back across, high over the middle, dive
  legs: [12, 19, 41, 46, 68, 80, 88],
  end: 196,
  burn: 180,
  pillar: {
    damage: 7,
    knockback: [0.5, -5],
    launch: true,
    hitstop: 4,
    hitstun: 30,
    ultimate: true,
  },
  talon: {
    damage: 8,
    knockback: [1.4, -4.2],
    launch: true,
    hitstop: 6,
    hitstun: 30,
    ultimate: true,
  },
  inferno: {
    damage: 26,
    knockback: [3.2, -7],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
