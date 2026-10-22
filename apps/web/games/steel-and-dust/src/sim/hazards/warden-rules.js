import { hookArea } from './chain-hook.js';
import { RIFT_RUN } from './rifts.js';

const RIFT_HIT = { knockback: [1.4, -5], knockdown: true, hitstop: 7, hitstun: 22 };

// the Warden Ox's chain hook and the rifts his cleave splits the road with, read with the rest in
// shot-rules.js
export const WARDEN_RULES = {
  // the hook strikes nothing itself: it catches the hero and drags them in (chain-hook.js)
  chainHook: { range: 200, area: hookArea, hit: null, enemyWeapon: 'none' },
  // a rift throws up only a hero standing on the road, so a hero who jumps it is clear
  rift: {
    range: RIFT_RUN + 2,
    area: (rift) => ({ x: rift.x - 5, y: rift.y - 8, width: 10, height: 8 }),
    hit: RIFT_HIT,
    enemyWeapon: 'none',
    groundOnly: true,
  },
};
