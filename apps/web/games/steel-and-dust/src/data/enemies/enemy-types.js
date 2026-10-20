import { BOSSES } from './types/bosses.js';
import { FOOT_SOLDIERS } from './types/foot-soldiers.js';
import { HEAVIES } from './types/heavies.js';
import { RANGED } from './types/ranged.js';

export const ENEMY_TYPES = { ...FOOT_SOLDIERS, ...RANGED, ...HEAVIES, ...BOSSES };
