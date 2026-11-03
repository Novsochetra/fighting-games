import { SAVE_CAM_ART } from '../../../art/save-cam.js';
import { ASIA_BACKDROP } from './asia/index.js';
import { NATIONAL_BACKDROP } from './national.js';
import { drawNightStand } from './night.js';
import { PROVINCIAL_BACKDROP } from './provincial.js';
import { SCHOOL_BACKDROP } from './school/index.js';
import { VILLAGE_BACKDROP } from './village/index.js';

// what stands behind the goal in the save cam, venue by venue (README "Keeper skills and the save
// cam"): a still painted once (`paint`), what moves drawn over it each frame (`live`), the venue's
// own goal (`goal`: its posts, its net, and bamboo or a frame) and whether its sky is bright or
// night (`sky`, which the focus lines are laid over). A match with no venue, or one of its own,
// plays under the World Stadium's floodlights
const nightOf = (id, art) => ({
  id,
  sky: 'night',
  live: (pen, { tick }) => drawNightStand(pen, { tick, art }),
  goal: { post: art.goal?.post ?? art.post, net: art.goal?.net ?? art.net, bamboo: false },
});

const WORLD_NIGHT = nightOf('world-stadium', SAVE_CAM_ART);

const BACKDROPS = {
  'village-field': VILLAGE_BACKDROP,
  'provincial-ground': PROVINCIAL_BACKDROP,
  'city-school-stadium': SCHOOL_BACKDROP,
  'national-stadium': NATIONAL_BACKDROP,
  'asia-stadium': ASIA_BACKDROP,
  'world-stadium': WORLD_NIGHT,
};

export const SAVE_CAM_VENUES = Object.keys(BACKDROPS);

export const backdropOf = (venue) => BACKDROPS[venue] ?? WORLD_NIGHT;
