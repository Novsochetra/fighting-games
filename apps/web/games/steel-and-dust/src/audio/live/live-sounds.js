import { BAYON_SOUNDS } from './bayon-sounds.js';
import { BOSS_SOUNDS } from './boss-sounds.js';
import { ELEMENT_SOUNDS } from './element-sounds.js';
import { EVENT_SOUNDS } from './event-sounds.js';
import { MENU_SOUNDS } from './menu-sounds.js';
import { SIGNATURE_SOUNDS } from './signature-sounds.js';
import { TEMPLE_SOUNDS } from './temple-sounds.js';

// the rarer menu, event and boss sounds, built from live nodes each time: { key: (live, start) => {} }
export const LIVE_SOUNDS = {
  ...MENU_SOUNDS,
  ...EVENT_SOUNDS,
  ...SIGNATURE_SOUNDS,
  ...BOSS_SOUNDS,
  ...ELEMENT_SOUNDS,
  ...TEMPLE_SOUNDS,
  ...BAYON_SOUNDS,
};

export function isLiveSound(key) {
  return Object.hasOwn(LIVE_SOUNDS, key);
}
