import { COBRA_KIT } from './cobra.js';
import { COLOSSUS_KIT } from './colossus.js';
import { DJINN_KIT } from './djinn.js';
import { FURNACE_KIT } from './furnace.js';
import { GNOLL_KIT } from './gnoll.js';
import { GUARDIAN_KIT } from './guardian.js';
import { IRONHORN_KIT } from './ironhorn.js';
import { KHAN_KIT } from './khan.js';
import { PHARAOH_KIT } from './pharaoh.js';
import { QUEEN_KIT } from './queen.js';

// each boss with a kit of its own skills and ultimate; a boss without one swipes, slams and charges
export const BOSS_KITS = {
  khan: KHAN_KIT,
  colossus: COLOSSUS_KIT,
  ironhorn: IRONHORN_KIT,
  cobra: COBRA_KIT,
  queen: QUEEN_KIT,
  gnoll: GNOLL_KIT,
  djinn: DJINN_KIT,
  furnace: FURNACE_KIT,
  pharaoh: PHARAOH_KIT,
  guardian: GUARDIAN_KIT,
};
