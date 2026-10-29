import { clamp } from '../lib/math.js';
import { ORIENTATIONS, SKINS } from './skins/skins.js';

// a custom layout places each touch control of a skin by its centre as fractions of the touch
// layer, and sizes it on top of the global button size; each skin has one for each orientation,
// or none
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

export const controlsOf = (skin, orientation) =>
  skin.layouts[orientation].items.map((item) => item.id);

function sanitizeOrientation(value, controls) {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const entries = {};
  for (const control of controls) {
    entries[control] = sanitizeEntry(value[control]);
    if (!entries[control]) {
      return null;
    }
  }
  return entries;
}

function sanitizeSkinLayout(value, skin) {
  const [landscape, portrait] = ORIENTATIONS.map((orientation) =>
    sanitizeOrientation(value?.[orientation], controlsOf(skin, orientation)),
  );

  return landscape || portrait ? { landscape, portrait } : null;
}

// before there were skins, the one layout saved was the classic skin's
const isBeforeSkins = (value) =>
  typeof value === 'object' && value !== null && ('landscape' in value || 'portrait' in value);

// a saved layout that is broken or missing a control falls back to the skin's own
export function sanitizeButtonLayout(value) {
  const bySkin = isBeforeSkins(value) ? { classic: value } : value;
  const layouts = {};

  for (const [id, skin] of Object.entries(SKINS)) {
    const layout = sanitizeSkinLayout(bySkin?.[id], skin);

    if (layout) {
      layouts[id] = layout;
    }
  }

  return Object.keys(layouts).length > 0 ? layouts : null;
}
