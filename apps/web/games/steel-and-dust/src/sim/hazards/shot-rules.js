import { knifeBox } from '../combat/boxes.js';
import { FORGE_RULES } from './forge-rules.js';
import { STORM_RULES } from './storm-rules.js';
import { TEMPLE_RULES } from './temple-rules.js';

const KNIFE_HIT = { knockback: [1.6, 0], hitstop: 4, hitstun: 16 };
const WAVE_HIT = { knockback: [3, -3.6], knockdown: true, hitstop: 6, hitstun: 20 };
const BOLT_HIT = { knockback: [3, -2.4], knockdown: true, hitstop: 6, hitstun: 22 };
const SAND_HIT = { knockback: [2.6, -1.2], hitstop: 5, hitstun: 20 };
const FIRE_HIT = { knockback: [1.2, -1.8], hitstop: 3, hitstun: 14 };
const CRESCENT_HIT = { knockback: [3.4, -3.4], knockdown: true, hitstop: 7, hitstun: 22 };
const BOULDER_HIT = { knockback: [3, -3.2], knockdown: true, hitstop: 8, hitstun: 24 };
const SHARD_HIT = { knockback: [1.6, -1.2], hitstop: 4, hitstun: 14 };
const SPIKE_HIT = { knockback: [1.4, -4.6], knockdown: true, hitstop: 7, hitstun: 22 };
const BAMBOO_HIT = { knockback: [2, -3], knockdown: true, hitstop: 7, hitstun: 22 };
const VENOM_HIT = { knockback: [1.8, -0.8], hitstop: 4, hitstun: 18 };
const PUDDLE_HIT = { knockback: [0.4, 0], hitstop: 2, hitstun: 10 };
const WASP_HIT = { knockback: [2.2, -2.2], hitstop: 5, hitstun: 18 };

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
  boulder: {
    range: 400,
    area: (shot) => {
      const half = 8 * shot.size;
      return { x: shot.x - half, y: shot.y - half, width: half * 2, height: half * 2 };
    },
    hit: BOULDER_HIT,
    enemyWeapon: 'hammer',
  },
  shard: {
    range: 26,
    area: (shot) => ({ x: shot.x - 5, y: shot.y - 6, width: 10, height: 6 }),
    hit: SHARD_HIT,
    enemyWeapon: 'hammer',
  },
  // a spike only strikes while it rises and stands, frames 2 to 5 of its strip
  spike: {
    range: 32,
    area: (shot) => ({ x: shot.x - 7, y: shot.y - 34, width: 14, height: 34 }),
    hit: SPIKE_HIT,
    enemyWeapon: 'hammer',
    armed: (shot) => shot.time >= 8 && shot.time < 24,
  },
  // a toppling stalk strikes along its length the moment it lands, frame 3 of its strip
  bamboo: {
    range: 70,
    area: (shot) => ({
      x: shot.direction > 0 ? shot.x : shot.x - 56,
      y: shot.y - 14,
      width: 56,
      height: 14,
    }),
    hit: BAMBOO_HIT,
    enemyWeapon: 'hammer',
    armed: (shot) => shot.time >= 18 && shot.time < 26,
  },
  glob: {
    range: 300,
    area: (shot) => ({ x: shot.x - 5, y: shot.y - 5, width: 10, height: 10 }),
    hit: VENOM_HIT,
    enemyWeapon: 'none',
    breaksOnHit: true,
  },
  // a puddle burns the feet of whoever stands in it, again every so often, until it dries
  puddle: {
    range: 400,
    area: (shot) => ({ x: shot.x - 16, y: shot.y - 5, width: 32, height: 5 }),
    hit: PUDDLE_HIT,
    enemyWeapon: 'none',
    rehitEvery: 40,
  },
  // a wasp only stings once it leaves the screen's edge, after its lane has been marked
  wasp: {
    range: 200,
    area: (shot) => ({ x: shot.x - 7, y: shot.y - 4, width: 14, height: 8 }),
    hit: WASP_HIT,
    enemyWeapon: 'none',
    breaksOnHit: true,
    armed: (shot) => shot.time >= shot.warn,
  },
  // the spot a pounce lands on (pounce-mark.js)
  pounceMark: {
    range: 80,
    area: (shot) => ({ x: shot.x, y: shot.y, width: 0, height: 0 }),
    hit: null,
    enemyWeapon: 'none',
  },
  fire: {
    range: 110,
    area: (shot) => ({ x: shot.x - 16, y: shot.y - 10, width: 32, height: 10 }),
    hit: FIRE_HIT,
    enemyWeapon: 'none',
    rehitEvery: 30,
  },
  ...STORM_RULES,
  ...FORGE_RULES,
  ...TEMPLE_RULES,
};

export function isDeflectable(shot) {
  return (shot.kind === 'knife' || shot.kind === 'bolt') && shot.side === 'enemy';
}
