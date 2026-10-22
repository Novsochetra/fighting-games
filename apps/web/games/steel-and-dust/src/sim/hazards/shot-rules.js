import { knifeBox } from '../combat/boxes.js';

const KNIFE_HIT = { knockback: [1.6, 0], hitstop: 4, hitstun: 16 };
const WAVE_HIT = { knockback: [3, -3.6], knockdown: true, hitstop: 6, hitstun: 20 };
const BOLT_HIT = { knockback: [3, -2.4], knockdown: true, hitstop: 6, hitstun: 22 };
const SAND_HIT = { knockback: [2.6, -1.2], hitstop: 5, hitstun: 20 };
const FIRE_HIT = { knockback: [1.2, -1.8], hitstop: 3, hitstun: 14 };
const CRESCENT_HIT = { knockback: [3.4, -3.4], knockdown: true, hitstop: 7, hitstun: 22 };
const VENOM_HIT = { knockback: [1.8, -0.8], hitstop: 4, hitstun: 18 };

// how each kind of thrown or fired thing flies, what it covers and what a hit does
export const SHOT_RULES = {
  knife: { range: 150, area: knifeBox, hit: KNIFE_HIT, enemyWeapon: 'knife', breaksOnHit: true },
  wave: {
    range: 70,
    area: (shot) => ({ x: shot.x - 8, y: shot.y - 18, width: 16, height: 36 }),
    hit: WAVE_HIT,
    enemyWeapon: 'knife',
  },
  bolt: {
    range: 46,
    area: (shot) => ({ x: shot.x - 7, y: shot.y - 3, width: 14, height: 6 }),
    hit: BOLT_HIT,
    enemyWeapon: 'knife',
    breaksOnHit: true,
  },
  sand: {
    range: 64,
    area: (shot) => ({ x: shot.x - 10, y: shot.y - 16, width: 20, height: 30 }),
    hit: SAND_HIT,
    enemyWeapon: 'none',
  },
  venom: {
    range: 120,
    area: (shot) => ({ x: shot.x - 4, y: shot.y - 4, width: 8, height: 8 }),
    hit: VENOM_HIT,
    enemyWeapon: 'none',
    breaksOnHit: true,
  },
  bomb: {
    range: 200,
    area: (shot) => ({ x: shot.x - 3, y: shot.y - 3, width: 6, height: 6 }),
    hit: null,
    enemyWeapon: 'hammer',
  },
  crescent: {
    range: 160,
    area: (shot) => ({ x: shot.x - 8 - shot.direction * 8, y: shot.y - 14, width: 16, height: 14 }),
    hit: CRESCENT_HIT,
    enemyWeapon: 'knife',
  },
  fire: {
    range: 110,
    area: (shot) => ({ x: shot.x - 16, y: shot.y - 10, width: 32, height: 10 }),
    hit: FIRE_HIT,
    enemyWeapon: 'none',
    rehitEvery: 30,
  },
};

export function isDeflectable(shot) {
  return (shot.kind === 'knife' || shot.kind === 'bolt') && shot.side === 'enemy';
}
