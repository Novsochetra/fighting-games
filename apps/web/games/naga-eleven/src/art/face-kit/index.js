import { ACE_MOODS } from './faces/ace.js';
import { ADULT_MOODS } from './faces/adult.js';
import { CHILD_MOODS } from './faces/child.js';
import { FRIEND_MOODS } from './faces/friend.js';
import { HERO_MOODS } from './faces/hero.js';
import { WALL_MOODS } from './faces/wall.js';

export { KIT_FACIAL } from './facial.js';
export { KIT_GEAR } from './gear.js';
export { KIT_HAIR } from './hair.js';
export { GEAR_TONES } from './gear-tones.js';

export const KIT_FACES = {
  hero: HERO_MOODS,
  friend: FRIEND_MOODS,
  ace: ACE_MOODS,
  wall: WALL_MOODS,
  child: CHILD_MOODS,
  adult: ADULT_MOODS,
};

export const COVERING_GEAR = new Set(['cap', 'beanie']);

// a band takes the side's colours unless a look says otherwise; these keep their own
export const GEAR_OWN_TONES = { glasses: 'frames', earring: 'gold' };
