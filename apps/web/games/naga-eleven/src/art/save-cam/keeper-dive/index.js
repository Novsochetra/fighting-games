import { HIGH_CATCH, HIGH_REACH } from './high.js';
import { LAND, LAND_BALL } from './land.js';
import { LOW_CATCH, LOW_PUNCH, LOW_REACH } from './low.js';
import { MID_CATCH, MID_REACH } from './mid.js';
import { HIGH_PUNCH, MID_PUNCH } from './punch.js';
import { PUSH_LOW, PUSH_MID } from './push-low.js';
import { PUSH, SET } from './set.js';

export { DIVE_INKS, DIVE_KIT_LETTERS } from './palette.js';

// the dive frame by frame: set, push-off, full stretch (a steep diagonal for a high ball, a shallow
// one at mid height, flat for a low one, its hands by what he does with the ball) and down on the
// grass
export const DIVE_FRAMES = {
  set: SET,
  push: { high: PUSH, mid: PUSH_MID, low: PUSH_LOW },
  high: { reach: HIGH_REACH, catch: HIGH_CATCH, punch: HIGH_PUNCH },
  mid: { reach: MID_REACH, catch: MID_CATCH, punch: MID_PUNCH },
  low: { reach: LOW_REACH, catch: LOW_CATCH, punch: LOW_PUNCH },
  land: { empty: LAND, ball: LAND_BALL },
};
