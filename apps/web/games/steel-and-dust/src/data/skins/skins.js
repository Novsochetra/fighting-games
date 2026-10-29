import { CLASSIC } from './classic.js';
import { DUSK } from './dusk.js';

export const SKINS = { classic: CLASSIC, dusk: DUSK };

export const ORIENTATIONS = ['landscape', 'portrait'];

// each way of holding the phone has a skin of its own, as Delta's controller skins have
export const SKIN_SETTINGS = { landscape: 'skinLandscape', portrait: 'skinPortrait' };

export function skinIdFor(settings, orientation) {
  const id = settings[SKIN_SETTINGS[orientation]];

  return Object.hasOwn(SKINS, id) ? id : 'classic';
}

export function skinLayoutFor(settings, orientation) {
  return SKINS[skinIdFor(settings, orientation)].layouts[orientation];
}

export const steersWithDpad = (padLayout) => padLayout.items.some((item) => item.kind === 'dpad');
