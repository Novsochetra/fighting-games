import { BEAST_BOSSES } from './types/beast-bosses.js';
import { BOSSES } from './types/bosses.js';
import { FOOT_SOLDIERS } from './types/foot-soldiers.js';
import { HEAVIES } from './types/heavies.js';
import { RANGED } from './types/ranged.js';
import { TEMPLE_BOSSES } from './types/temple-bosses.js';
import { WARLORD_BOSSES } from './types/warlord-bosses.js';

export const ENEMY_TYPES = {
  ...FOOT_SOLDIERS,
  ...RANGED,
  ...HEAVIES,
  ...BOSSES,
  ...BEAST_BOSSES,
  ...WARLORD_BOSSES,
  ...TEMPLE_BOSSES,
};
