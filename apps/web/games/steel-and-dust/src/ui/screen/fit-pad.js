import { renderPad } from '../../../../../packages/touch-pad/src/pad-markup.js';
import { placePad, placesOf } from '../../../../../packages/touch-pad/src/pad-place.js';
import {
  customStickPlace,
  placeStickZone,
} from '../../../../../packages/touch-pad/src/stick-place.js';
import { buttonScale } from '../../data/settings.js';
import { SKINS, skinIdFor, steersWithDpad } from '../../data/skins/skins.js';
import { orientationOf, savedEntries, slotOf } from '../layout/layout-draft.js';
import { STICK_RADIUS } from './stage-layout.js';
import { touchAreaOf } from './touch-area.js';

const screenOf = ({ elements }) => ({
  width: elements.app.clientWidth,
  height: elements.app.clientHeight,
});

const orientationNow = (context) => {
  const { width, height } = screenOf(context);

  return orientationOf(width, height);
};

// the skin shown: the one picked, or the one the Skins screen shows while it is open
const skinIdNow = (context) => context.previewSkin?.() ?? skinIdFor(context.game.settings);

export function padLayoutOf(context) {
  return SKINS[skinIdNow(context)].layouts[orientationNow(context)];
}

function customLayout(context) {
  const slot = slotOf(skinIdNow(context), orientationNow(context));

  return savedEntries(context.game.settings.buttonLayout, slot);
}

// the player's layout for the way the phone is held, else the skin's places, else none
function placesFor(context) {
  return placesOf(padLayoutOf(context), customLayout(context));
}

// a placed stick on the touch layer
export function customStick(context, scale) {
  const stick = placesFor(context)?.stick;

  if (!stick) {
    return null;
  }

  const layer = touchAreaOf(context.hingeNow()) ?? screenOf(context);

  return customStickPlace({ stick, layer, radius: STICK_RADIUS * scale * stick.size });
}

// a skin's frame for the game's screen, in px at the player's Button size, as its controls grow
// with it
export function frameOf(padLayout, scale) {
  const { screen } = padLayout;

  if (!screen) {
    return null;
  }

  const frame = { align: screen.align };

  for (const side of ['top', 'right', 'bottom', 'left']) {
    frame[side] = (screen[side] ?? 0) * scale;
  }

  return frame;
}

export function fitControls(context) {
  const { elements, game } = context;
  const padLayout = padLayoutOf(context);
  const zone = renderPad(elements.touch, padLayout).querySelector('.pad-zone');

  // the hints name what steers (overlays.js)
  game.device.steersWithDpad = steersWithDpad(padLayout);

  placePad(elements.touch, placesFor(context), { fromSkin: !customLayout(context) });

  if (zone) {
    placeStickZone(zone, customStick(context, buttonScale(game.settings))?.zone);
  }
}
