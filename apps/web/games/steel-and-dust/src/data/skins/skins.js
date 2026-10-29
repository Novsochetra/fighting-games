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

// every move is a round key, unless the player picks pills for a skin's shoulder keys where it
// offers them (`shapes`, Clear's DASH and ULT); a pill is otherwise only for what runs the game
export const KEY_SHAPES = ['round', 'pill'];

export const keyShapeOf = (settings) =>
  KEY_SHAPES.includes(settings.keyShape) ? settings.keyShape : 'round';

export const offersKeyShapes = (skinId) => Boolean(SKINS[skinId].shapes);

// a skin's layout held one way, with its shoulder keys in the shape picked if it offers it
export function layoutOf(skinId, orientation, keyShape) {
  const skin = SKINS[skinId];

  return skin.shapes?.[keyShape]?.[orientation] ?? skin.layouts[orientation];
}

export function skinLayoutFor(settings, orientation) {
  return layoutOf(skinIdFor(settings), orientation, keyShapeOf(settings));
}

export const steersWithDpad = (padLayout) => padLayout.items.some((item) => item.kind === 'dpad');
