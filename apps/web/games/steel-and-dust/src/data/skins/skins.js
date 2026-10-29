import { CLASSIC } from './classic.js';
import { CLEAR_SKINS } from './clear.js';
import { DUSK } from './dusk.js';

export const SKINS = { classic: CLASSIC, dusk: DUSK, ...CLEAR_SKINS };

export const SKIN_IDS = Object.keys(SKINS);

export const ORIENTATIONS = ['landscape', 'portrait'];

// one skin for both ways of holding the phone, each with a layout for each way
export function skinIdFor(settings) {
  return Object.hasOwn(SKINS, settings.skin) ? settings.skin : 'classic';
}

export function skinLayoutFor(settings, orientation) {
  return SKINS[skinIdFor(settings)].layouts[orientation];
}

export const steersWithDpad = (padLayout) => padLayout.items.some((item) => item.kind === 'dpad');
