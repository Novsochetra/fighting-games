import { BAYON_SOUNDS } from './bayon-sounds.js';
import { BOSS_SOUNDS } from './boss-sounds.js';
import { ELEMENT_SOUNDS } from './element-sounds.js';
import { EVENT_SOUNDS } from './event-sounds.js';
import { HANDOFF_SOUNDS } from './handoff-sounds.js';
import { HAZARD_SOUNDS } from './hazard-sounds.js';
import { HEAVY_SOUNDS } from './heavy/index.js';
import { MENU_SOUNDS } from './menu-sounds.js';
import { MOAT_SOUNDS } from './moat-sounds.js';
import { SIGNATURE_SOUNDS } from './signature-sounds.js';
import { SUMMARY_SOUNDS } from './summary-sounds.js';
import { TEMPLE_SOUNDS } from './temple-sounds.js';
import { WARDEN_SOUNDS } from './warden-sounds.js';

// the rarer menu, event and boss sounds, built from live nodes each time: { key: (live, start) => {} }
export const LIVE_SOUNDS = {
  ...MENU_SOUNDS,
  ...EVENT_SOUNDS,
  ...HANDOFF_SOUNDS,
  ...SUMMARY_SOUNDS,
  ...SIGNATURE_SOUNDS,
  ...BOSS_SOUNDS,
  ...ELEMENT_SOUNDS,
  ...HEAVY_SOUNDS,
  ...TEMPLE_SOUNDS,
  ...WARDEN_SOUNDS,
  ...BAYON_SOUNDS,
  ...MOAT_SOUNDS,
  ...HAZARD_SOUNDS,
};

export function isLiveSound(key) {
  return Object.hasOwn(LIVE_SOUNDS, key);
}
