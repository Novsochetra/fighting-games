const ERUPT_HIT = {
  knockback: [1.4, -4.6],
  knockAway: true,
  knockdown: true,
  hitstop: 7,
  hitstun: 22,
};

// the raiders' ambushes (drop-marks.js, mounds.js), read with the rest in shot-rules.js
export const AMBUSH_RULES = {
  // the shadow strikes nothing itself: its raider lands striking (dropSlam in raider-moves.js)
  dropMark: {
    range: 240,
    area: (mark) => ({ x: mark.x, y: mark.y, width: 0, height: 0 }),
    hit: null,
    enemyWeapon: 'none',
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
