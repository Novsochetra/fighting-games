import { itemOf, padOf } from './pad-markup.js';

const NO_PLACE = { '--pad-x': null, '--pad-y': null, '--pad-size': null };

// a place is a control's centre as fractions of the touch layer, and its size on top of the
// game's own scale (its Button size); these keep it whole on a screen of any shape
export function placeVars(place) {
  if (!place) {
    return NO_PLACE;
  }

  return {
    '--pad-x': String(place.x),
    '--pad-y': String(place.y),
    '--pad-size': String(place.size),
  };
}

function setVars(style, vars) {
  for (const [name, value] of Object.entries(vars)) {
    if (value === null) {
      style.removeProperty(name);
    } else {
      style.setProperty(name, value);
    }
  }
}

// where each control stands, by its id: the player's own places, else the skin's (`at`), else
// null, and the game's own styles place the controls, as a game's first skin may
export function placesOf(layout, custom) {
  if (custom) {
    return custom;
  }

  const placed = layout.items.filter((item) => item.at);

  if (placed.length === 0) {
    return null;
  }

  return Object.fromEntries(placed.map(({ id, at }) => [id, { x: at.x, y: at.y, size: 1 }]));
}

// the stick stands where it rests (PadStick), so only its size is set here
export function placePad(layer, places) {
  const pad = padOf(layer);

  pad.querySelector('.pad-controls').classList.toggle('pad-placed', Boolean(places));

  for (const control of pad.querySelectorAll('[data-control]')) {
    const vars = placeVars(places?.[control.dataset.control]);
    const isStick = itemOf(control).kind === 'stick';

    setVars(control.style, isStick ? { '--pad-size': vars['--pad-size'] } : vars);
  }
}
