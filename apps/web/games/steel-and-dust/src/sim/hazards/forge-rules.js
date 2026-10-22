import { isBurning } from './blazes.js';
import { lanceSpan } from './flame-lances.js';

const BLAZE_HIT = { knockback: [1.2, -1.2], knockAway: true, hitstop: 2, hitstun: 10 };
const POT_HIT = { knockback: [2, -2.4], knockdown: true, hitstop: 6, hitstun: 20 };
const LAVA_HIT = { knockback: [1.2, -1.6], knockAway: true, hitstop: 3, hitstun: 14 };
const LANCE_HIT = { knockback: [2.6, -3], knockdown: true, hitstop: 7, hitstun: 22 };

// the Furnace Knight's burning ground, slag pot, lava pool and flame lances, read with the rest
// in shot-rules.js
export const FORGE_RULES = {
  // the flames burn whoever stands in them, again every so often, and hop them out; only feet on
  // the ground burn, so a hero knocked over them is not juggled in the flames
  blaze: {
    range: 600,
    area: (blaze) => ({ x: blaze.x - 11, y: blaze.y - 12, width: 22, height: 12 }),
    hit: BLAZE_HIT,
    enemyWeapon: 'none',
    armed: isBurning,
    rehitEvery: 45,
    groundOnly: true,
  },
  slagPot: {
    range: 300,
    area: (pot) => ({ x: pot.x - 6, y: pot.y - 6, width: 12, height: 12 }),
    hit: POT_HIT,
    enemyWeapon: 'hammer',
  },
  lavaPool: {
    range: 600,
    area: (pool) => ({ x: pool.x - 22, y: pool.y - 6, width: 44, height: 6 }),
    hit: LAVA_HIT,
    enemyWeapon: 'none',
    rehitEvery: 30,
    groundOnly: true,
  },
  // the lance's tip leads and the flame trails behind it; only its white-hot core burns
  flameLance: {
    range: 140,
    area: (lance) => {
      const { left, right } = lanceSpan(lance);
      return { x: left, y: lance.y - 4, width: right - left, height: 8 };
    },
    hit: LANCE_HIT,
    enemyWeapon: 'none',
  },
};
