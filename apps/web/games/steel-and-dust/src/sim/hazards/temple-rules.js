const SCARAB_HIT = { knockback: [1.8, -2.6], hitstop: 4, hitstun: 16 };
const MIRAGE_BOLT_HIT = { knockback: [2, -1.6], hitstop: 5, hitstun: 18 };

const still = () => ({ x: 0, y: 0, width: 0, height: 0 });

// the Sand Pharaoh's scarabs, mirage bolts, canopic jars and the curse's eye, read with the rest
// in shot-rules.js
export const TEMPLE_RULES = {
  // the carpet bites only feet on the ground, so a hero who jumps it is clear
  scarabs: {
    range: 220,
    area: (carpet) => ({ x: carpet.x - 18, y: carpet.y - 7, width: 36, height: 7 }),
    hit: SCARAB_HIT,
    enemyWeapon: 'none',
    groundOnly: true,
  },
  mirageBolt: {
    range: 160,
    area: (bolt) => ({ x: bolt.x - 4, y: bolt.y - 4, width: 8, height: 8 }),
    hit: MIRAGE_BOLT_HIT,
    enemyWeapon: 'none',
    breaksOnHit: true,
  },
  // the jars and the eye strike nothing; the hero breaks the jars (canopic-jars.js)
  canopic: { range: 600, area: still, hit: null, enemyWeapon: 'none' },
  curseMark: { range: 600, area: still, hit: null, enemyWeapon: 'none' },
};
