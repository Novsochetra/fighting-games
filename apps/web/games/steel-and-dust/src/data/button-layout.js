import { clamp } from '../lib/math.js';

// a custom layout places each touch control, the buttons and the stick, by its centre as fractions
// of the touch layer, and sizes it on top of the global button size; each orientation has its own
// layout or none
export const BUTTON_ACTIONS = ['light', 'heavy', 'jump', 'dash', 'ult'];
export const LAYOUT_CONTROLS = [...BUTTON_ACTIONS, 'stick'];
export const BUTTON_SIZE = { min: 0.6, max: 1.8, step: 0.1 };

// sizes are kept to one decimal so steps never drift into 1.2000000000000002
function roundSize(size) {
  return clamp(Math.round(size * 10) / 10, BUTTON_SIZE.min, BUTTON_SIZE.max);
}

export function steppedSize(size, step) {
  return roundSize(size + step * BUTTON_SIZE.step);
}

function clampAxis(value, half) {
  return half >= 0.5 ? 0.5 : clamp(value, half, 1 - half);
}

// `half` is half the button's width and height, as fractions of the layer, so it stays whole on it
export function clampCentre(centre, half) {
  return { x: clampAxis(centre.x, half.x), y: clampAxis(centre.y, half.y) };
}

const isFraction = (value) => Number.isFinite(value) && value >= 0 && value <= 1;

function sanitizeEntry(entry) {
  if (!entry || !isFraction(entry.x) || !isFraction(entry.y) || !Number.isFinite(entry.size)) {
    return null;
  }
  return { x: entry.x, y: entry.y, size: roundSize(entry.size) };
}

function sanitizeOrientation(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const entries = {};
  for (const control of LAYOUT_CONTROLS) {
    entries[control] = sanitizeEntry(value[control]);
    if (!entries[control]) {
      return null;
    }
  }
  return entries;
}

// a saved layout that is broken or missing a control falls back to the original one
export function sanitizeButtonLayout(value) {
  const layout = {
    landscape: sanitizeOrientation(value?.landscape),
    portrait: sanitizeOrientation(value?.portrait),
  };
  return layout.landscape || layout.portrait ? layout : null;
}
