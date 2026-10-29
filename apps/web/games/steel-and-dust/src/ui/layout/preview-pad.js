import { renderPad } from '../../../../../packages/touch-pad/src/pad-markup.js';
import { placePad, placesOf } from '../../../../../packages/touch-pad/src/pad-place.js';
import { buttonScale } from '../../data/settings.js';

// a copy of the touch layer (the layout editor's, the skins screen's) draws a skin's controls as
// the real one does, so they look and size exactly like them; `custom` is the player's layout
export function drawPreviewPad(preview, padLayout, custom) {
  const places = placesOf(padLayout, custom);

  renderPad(preview, padLayout);
  placePad(preview, places);

  return places;
}

// the buttons place themselves through CSS; the stick rests where the screen fit puts the real
// one: at its placed centre on the touch layer, or where the original one rests
export function restPreviewStick(preview, { places, layout, app, settings }) {
  const stick = preview.querySelector('.pad-stick');

  if (!stick) {
    return;
  }

  const layer = layout.touchArea() ?? { width: app.clientWidth, height: app.clientHeight };
  const rest = places?.stick
    ? { x: places.stick.x * layer.width, y: places.stick.y * layer.height }
    : layout.originalStickRest(buttonScale(settings));

  stick.style.left = `${rest.x}px`;
  stick.style.top = `${rest.y}px`;
}
