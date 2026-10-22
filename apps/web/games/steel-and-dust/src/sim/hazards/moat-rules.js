import { isDarting } from './naga-bolts.js';
import { isRising, isSweeping, SPIRIT_HEAD_UP } from './spirit-nagas.js';
import { isRolling } from './tides.js';

const TIDE_HIT = { knockback: [3, -3.4], knockdown: true, hitstop: 7, hitstun: 22 };
const BOLT_HIT = { knockback: [2.4, -2], hitstop: 5, hitstun: 18 };
const SWEEP_HIT = { knockback: [3.4, -3.6], knockdown: true, hitstop: 8, hitstun: 24 };
const RISE_HIT = { knockback: [1.4, -6.4], launch: true, knockdown: true, hitstop: 8, hitstun: 26 };
const SWEEP_LOW = SPIRIT_HEAD_UP - 5;

// the Naga Raja's wave, water nagas, spirit nagas and rising serpent, read with the rest in
// shot-rules.js
export const MOAT_RULES = {
  // the curl at the front of the wave, low enough to jump
  tide: {
    range: 160,
    area: (tide) => ({
      x: tide.x - 15 + tide.direction * 3,
      y: tide.y - 26,
      width: 30,
      height: 26,
    }),
    hit: TIDE_HIT,
    enemyWeapon: 'none',
    armed: isRolling,
  },
  nagaBolt: {
    range: 140,
    area: (bolt) => ({ x: bolt.x - 10, y: bolt.y - 5, width: 20, height: 10 }),
    hit: BOLT_HIT,
    enemyWeapon: 'none',
    breaksOnHit: true,
    armed: isDarting,
  },
  // the head and the body skimming the stone behind it, low enough to jump
  spiritNaga: {
    range: 200,
    area: (spirit) => ({
      x: spirit.direction > 0 ? spirit.x - 45 : spirit.x - 15,
      y: spirit.y - SWEEP_LOW,
      width: 60,
      height: SWEEP_LOW,
    }),
    hit: SWEEP_HIT,
    enemyWeapon: 'none',
    armed: isSweeping,
  },
  // the orb over her hand strikes nothing
  rainbowOrb: {
    range: 200,
    area: (orb) => ({ x: orb.x, y: orb.y, width: 0, height: 0 }),
    hit: null,
    enemyWeapon: 'none',
  },
  // the whole column of water, so a jump does not get out from under it
  serpentRise: {
    range: 200,
    area: (rise) => ({ x: rise.x - rise.half, y: rise.y - 96, width: rise.half * 2, height: 96 }),
    hit: RISE_HIT,
    enemyWeapon: 'none',
    armed: isRising,
  },
};
