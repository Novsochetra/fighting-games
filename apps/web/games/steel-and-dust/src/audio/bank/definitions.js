import { ARMOR_SOUNDS } from './armor.js';
import { CRASH_SOUNDS } from './crashes.js';
import { DASH_SOUNDS } from './dashes.js';
import { BLADE_SOUNDS } from './hits-blade.js';
import { BLUNT_SOUNDS } from './hits-blunt.js';
import { HEAVY_SOUNDS } from './hits-heavy.js';
import { PIERCE_SOUNDS } from './hits-pierce.js';
import { MOVEMENT_SOUNDS } from './movement.js';
import { SWING_SOUNDS } from './swings.js';
import { VOICE_SOUNDS } from './voices.js';

// combat sounds synthesized once into a few takes each: { group, level, takes, seconds, priority,
// build(track, pitch, take) -> finish shape }. The order is the warm-up order
const { jump, land, warp, release } = MOVEMENT_SOUNDS;

export const SOUND_DEFINITIONS = {
  ...SWING_SOUNDS,
  ...BLUNT_SOUNDS,
  ...BLADE_SOUNDS,
  ...PIERCE_SOUNDS,
  ...HEAVY_SOUNDS,
  ...ARMOR_SOUNDS,
  jump,
  land,
  ...DASH_SOUNDS,
  warp,
  release,
  ...CRASH_SOUNDS,
  ...VOICE_SOUNDS,
};

export const SOUND_TAKES = Object.fromEntries(
  Object.entries(SOUND_DEFINITIONS).map(([key, definition]) => [key, definition.takes]),
);

export function isBankSound(key) {
  return Object.hasOwn(SOUND_DEFINITIONS, key);
}
