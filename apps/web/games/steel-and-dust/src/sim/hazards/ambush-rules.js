const STOMP_HIT = {
  knockback: [2.2, -2.6],
  knockAway: true,
  knockdown: true,
  hitstop: 6,
  hitstun: 20,
};
const ERUPT_HIT = {
  knockback: [1.4, -4.6],
  knockAway: true,
  knockdown: true,
  hitstop: 7,
  hitstun: 22,
};

// the raiders' ambushes (drop-marks.js, mounds.js), read with the rest in shot-rules.js
export const AMBUSH_RULES = {
  // the shadow strikes nothing until its raider lands on it and stomps
  dropMark: {
    range: 240,
    area: (mark) => ({ x: mark.x - 10, y: mark.y - 18, width: 20, height: 18 }),
    hit: STOMP_HIT,
    enemyWeapon: 'hammer',
    armed: (mark) => mark.stomp > 0,
  },
  // the mound only strikes as it bursts
  mound: {
    range: 240,
    area: (mound) => ({ x: mound.x - 12, y: mound.y - 30, width: 24, height: 30 }),
    hit: ERUPT_HIT,
    enemyWeapon: 'hammer',
    armed: (mound) => mound.eruptAt > 0,
  },
};
