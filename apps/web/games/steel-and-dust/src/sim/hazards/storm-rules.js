import { isSpinning } from './dust-devils.js';
import { isStriking, strikeArea } from './storm-strikes.js';

const ZAP_HIT = { knockback: [2.4, -3], knockdown: true, hitstop: 7, hitstun: 22 };
const DEVIL_HIT = {
  knockback: [0.6, -6.6],
  knockAway: true,
  launch: true,
  knockdown: true,
  hitstop: 6,
  hitstun: 26,
};
const STRIKE_HIT = {
  knockback: [2, -4.4],
  knockAway: true,
  knockdown: true,
  hitstop: 8,
  hitstun: 24,
};

// the Storm Djinn's bolt, dust devils and lightning, read with the rest in shot-rules.js
export const STORM_RULES = {
  // the bolt's head leads and its crackling tail trails a little behind it
  thunderBolt: {
    range: 130,
    area: (bolt) => ({
      x: bolt.direction > 0 ? bolt.x - 30 : bolt.x - 4,
      y: bolt.y - 5,
      width: 34,
      height: 10,
    }),
    hit: ZAP_HIT,
    enemyWeapon: 'none',
    breaksOnHit: true,
  },
  // the funnel throws whoever it catches high, but not while it is still rising or blowing out
  dustDevil: {
    range: 340,
    area: (devil) => ({ x: devil.x - 12, y: devil.y - 64, width: 24, height: 64 }),
    hit: DEVIL_HIT,
    enemyWeapon: 'none',
    armed: isSpinning,
  },
  stormStrike: {
    range: 200,
    area: strikeArea,
    hit: STRIKE_HIT,
    enemyWeapon: 'none',
    armed: isStriking,
  },
};
