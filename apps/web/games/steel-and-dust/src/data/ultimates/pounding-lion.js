// Bokator: a bow, a slam that throws the raiders up, then a pride of the guardian lions that line
// Angkor's stairs rises out of the gold, bounds across the field and pounces on the middle as one;
// bokator means "pounding the lion"
export const POUNDING_LION = {
  name: 'Pounding the Lion',
  summary:
    'A bow, a slam that throws every raider up, then a pride of golden lions bounds across the field and pounces as one.',
  damageText: '8 + 3 per lion + 24',
  intro: 46,
  // ticks for each frame of the bow, before the blow
  poseTicks: 16,
  slamAt: 60,
  prideAt: 64,
  // the lions in the order they rise, nearest the slam first, and later land: each one's size, and
  // the ticks it crouches after rising, so no two ever bound in step; the last is the big leader
  pride: [
    { scale: 0.4, wait: 0 },
    { scale: 0.46, wait: 5 },
    { scale: 0.36, wait: 2 },
    { scale: 0.5, wait: 8 },
    { scale: 0.42, wait: 1 },
    { scale: 0.54, wait: 6 },
    { scale: 0.46, wait: 3 },
    { scale: 0.72, wait: 9 },
  ],
  // they rise two at a time, this many ticks apart
  ripple: 6,
  // ticks for each of the two bounds across the field to where the other half stood
  hopTicks: 20,
  // they pounce on the middle one after another, this many ticks apart, the leader last as he strikes
  cascade: 4,
  pounceAt: 174,
  // heights for a lion of scale 0.5; bigger ones leap higher. The half bounding the way the hero
  // faces leaps high over the half running the other way
  highLeap: 52,
  lowLeap: 24,
  pounceHeight: 80,
  end: 216,
  slam: {
    damage: 8,
    knockback: [0.4, -4.6],
    launch: true,
    hitstop: 8,
    hitstun: 30,
    ultimate: true,
  },
  lion: {
    damage: 3,
    knockback: [1.8, -3.6],
    launch: true,
    hitstop: 4,
    hitstun: 30,
    ultimate: true,
  },
  pounce: {
    damage: 24,
    knockback: [3.2, -7],
    launch: true,
    knockAway: true,
    hitstop: 14,
    hitstun: 30,
    ultimate: true,
  },
};
