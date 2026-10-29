import { hasOwn } from '../../lib/objects.js';
import { CLASSIC } from './classic.js';
import { CLEAR_SKINS } from './clear.js';
import { DUSK } from './dusk.js';

export const SKINS = { classic: CLASSIC, dusk: DUSK, ...CLEAR_SKINS };

export const SKIN_IDS = Object.keys(SKINS);

export const ORIENTATIONS = ['landscape', 'portrait'];

// one skin for both ways of holding the phone, each with a layout for each way
export function skinIdFor(settings) {
  return hasOwn(SKINS, settings.skin) ? settings.skin : 'classic';
}

// every move is a round key, unless the player picks a pill for a key the skin offers one for
// (`pills`, Clear's DASH and ULT), key by key; a pill is otherwise only for what runs the game
export const keyShapesOf = (settings) =>
  Object.fromEntries(
    Object.entries(settings.keyShapes ?? {}).filter(([, shape]) => shape === 'pill'),
  );

// the keys of a skin held one way that the player may have as pills
export const pillsOffered = (skinId, orientation) =>
  (SKINS[skinId].pills?.[orientation] ?? []).map((pill) => pill.id);

// the touch pad keeps the pad it drew for the same layout, so each pick of pills is one layout,
// made once, and a fit hands the pad the one it has
const pilledLayouts = new Map();

// a skin's layout held one way, each key it offers a pill for in the shape picked for it
export function layoutOf(skinId, orientation, keyShapes = {}) {
  const layout = SKINS[skinId].layouts[orientation];
  const offered = SKINS[skinId].pills?.[orientation] ?? [];
  const pills = offered.filter((pill) => keyShapes[pill.id] === 'pill');
  const key = [skinId, orientation, ...pills.map((pill) => pill.id)].join(':');

  if (pills.length === 0) {
    return layout;
  }

  if (!pilledLayouts.has(key)) {
    const items = layout.items.map((item) => pills.find((pill) => pill.id === item.id) ?? item);

    pilledLayouts.set(key, { ...layout, items });
  }

  return pilledLayouts.get(key);
}

export function skinLayoutFor(settings, orientation) {
  return layoutOf(skinIdFor(settings), orientation, keyShapesOf(settings));
}

export const steersWithDpad = (padLayout) => padLayout.items.some((item) => item.kind === 'dpad');
