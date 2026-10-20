import { EVENT_SOUNDS } from './event-sounds.js';
import { MENU_SOUNDS } from './menu-sounds.js';
import { SIGNATURE_SOUNDS } from './signature-sounds.js';

// the rarer menu and event sounds, built from live nodes each time: { key: (live, start) => {} }
export const LIVE_SOUNDS = { ...MENU_SOUNDS, ...EVENT_SOUNDS, ...SIGNATURE_SOUNDS };

export function isLiveSound(key) {
  return Object.hasOwn(LIVE_SOUNDS, key);
}
