import { BUTTON_ACTIONS, clampCentre, steppedSize } from '../../data/button-layout.js';
import { isPortrait } from '../screen/stage-layout.js';

// the editor works on a copy of the saved layouts, so Cancel only has to drop it; every step
// returns a new draft

export function orientationOf(width, height) {
  return isPortrait(width, height) ? 'portrait' : 'landscape';
}

export function layoutForScreen(buttonLayout, width, height) {
  return buttonLayout?.[orientationOf(width, height)] ?? null;
}

export function createDraft(buttonLayout) {
  return {
    landscape: buttonLayout?.landscape ?? null,
    portrait: buttonLayout?.portrait ?? null,
  };
}

// four decimals place a centre to a tenth of a pixel on any phone and keep the save short
const roundFraction = (value) => Math.round(value * 10000) / 10000;

// editing starts from where the original buttons stand: `centres` is measured on screen
export function customised(draft, orientation, centres) {
  if (draft[orientation]) {
    return draft;
  }
  const entries = {};
  for (const [action, centre] of Object.entries(centres)) {
    entries[action] = { x: roundFraction(centre.x), y: roundFraction(centre.y), size: 1 };
  }
  return { ...draft, [orientation]: entries };
}

function withEntry(draft, orientation, action, entry) {
  return { ...draft, [orientation]: { ...draft[orientation], [action]: entry } };
}

function placed(entry, centre, half) {
  const scaled = { x: half.x * entry.size, y: half.y * entry.size };
  const inside = clampCentre(centre, scaled);
  return { ...entry, x: roundFraction(inside.x), y: roundFraction(inside.y) };
}

// `half` is the button's half width and height at size 1, as fractions of the layer
export function moveButton(draft, { orientation, action, centre, half }) {
  const entry = draft[orientation][action];
  return withEntry(draft, orientation, action, placed(entry, centre, half));
}

// a button that grows near an edge is pushed back onto the screen
export function resizeButton(draft, { orientation, action, step, half }) {
  const entry = draft[orientation][action];
  const resized = { ...entry, size: steppedSize(entry.size, step) };
  return withEntry(draft, orientation, action, placed(resized, entry, half));
}

export function resetLayout(draft, orientation) {
  return { ...draft, [orientation]: null };
}

export function nextAction(action) {
  return BUTTON_ACTIONS[(BUTTON_ACTIONS.indexOf(action) + 1) % BUTTON_ACTIONS.length];
}

export function sizeOf(draft, orientation, action) {
  return draft[orientation]?.[action].size ?? 1;
}

export function savedLayout(draft) {
  return draft.landscape || draft.portrait
    ? { landscape: draft.landscape, portrait: draft.portrait }
    : null;
}
