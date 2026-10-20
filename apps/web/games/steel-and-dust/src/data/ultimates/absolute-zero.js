// Blue: time stops, every raider is cut and frozen in passing, and the ice shatters on the sheath
export const ABSOLUTE_ZERO = {
  name: 'Absolute Zero',
  summary: 'Stops time, cuts every raider in passing and freezes them; the ice shatters at once.',
  damageText: '4 per cut + 26',
  intro: 46,
  poseTicks: 9,
  saluteFrames: 5,
  strikes: 8,
  gap: 6,
  sheathTicks: 4,
  shatterAt: 122,
  end: 152,
  cut: { damage: 4, knockback: [0, 0], hitstop: 3, hitstun: 90, ultimate: true },
  shatter: {
    damage: 26,
    knockback: [2.4, -6.4],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
