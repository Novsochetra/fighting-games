import { itemOf, padOf } from './pad-markup.js';

const NO_PLACE = {
  '--pad-x': null,
  '--pad-y': null,
  '--pad-dx': null,
  '--pad-dy': null,
  '--pad-size': null,
};

const px = (offset) => (offset ? `${offset}px` : null);

// a place is a control's centre as fractions of the touch layer, moved by `dx` and `dy` px at the
// game's scale 1, so a cluster anchored to a corner keeps its shape on a screen of any shape, and
// its size on top of that scale (its Button size); the pad's rules keep it whole on the layer
export function placeVars(place) {
  if (!place) {
    return NO_PLACE;
  }

  return {
    '--pad-x': String(place.x),
    '--pad-y': String(place.y),
    '--pad-dx': px(place.dx),
    '--pad-dy': px(place.dy),
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

  return Object.fromEntries(placed.map(({ id, at }) => [id, { ...at, size: 1 }]));
}

// the stick stands where it rests (PadStick), so only its size is set here. `fromSkin` says the
// places are the skin's own, measured inside the safe area, not the player's
export function placePad(layer, places, { fromSkin = false } = {}) {
  const pad = padOf(layer);
  const controls = pad.querySelector('.pad-controls');

  controls.classList.toggle('pad-placed', Boolean(places));
  controls.classList.toggle('pad-safe', Boolean(places) && fromSkin);

  for (const control of pad.querySelectorAll('[data-control]')) {
    const vars = placeVars(places?.[control.dataset.control]);
    const isStick = itemOf(control).kind === 'stick';

    setVars(control.style, isStick ? { '--pad-size': vars['--pad-size'] } : vars);
  }
}
