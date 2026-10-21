import {
  BUTTON_ACTIONS,
  clampCentre,
  LAYOUT_CONTROLS,
  steppedSize,
} from '../../data/button-layout.js';
import { isPortrait } from '../screen/stage-layout.js';

// the editor works on a copy of the saved layouts, so Cancel only has to drop it; every step
// returns a new draft. A control is one of the buttons or the stick

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

// editing starts from where the original controls stand: `centres` is measured on screen
export function customised(draft, orientation, centres) {
  if (draft[orientation]) {
    return draft;
  }
  const entries = {};
  for (const [control, centre] of Object.entries(centres)) {
    entries[control] = { x: roundFraction(centre.x), y: roundFraction(centre.y), size: 1 };
  }
  return { ...draft, [orientation]: entries };
}

function withEntry(draft, orientation, control, entry) {
  return { ...draft, [orientation]: { ...draft[orientation], [control]: entry } };
}

function placed(entry, centre, half) {
  const scaled = { x: half.x * entry.size, y: half.y * entry.size };
  const inside = clampCentre(centre, scaled);
  return { ...entry, x: roundFraction(inside.x), y: roundFraction(inside.y) };
}

// `half` is the control's half width and height at size 1, as fractions of the layer
export function moveControl(draft, { orientation, control, centre, half }) {
  const entry = draft[orientation][control];
  return withEntry(draft, orientation, control, placed(entry, centre, half));
}

// a control that grows near an edge is pushed back onto the screen
export function resizeControl(draft, { orientation, control, step, half }) {
  const entry = draft[orientation][control];
  const resized = { ...entry, size: steppedSize(entry.size, step) };
  return withEntry(draft, orientation, control, placed(resized, entry, half));
}

export function resetLayout(draft, orientation) {
  return { ...draft, [orientation]: null };
}

// a hidden stick (Settings, Joystick) is neither shown nor edited
export function shownControls(stickMode) {
  return stickMode === 'hidden' ? BUTTON_ACTIONS : LAYOUT_CONTROLS;
}

export function nextControl(control, shown) {
  return shown[(shown.indexOf(control) + 1) % shown.length];
}

export function sizeOf(draft, orientation, control) {
  return draft[orientation]?.[control].size ?? 1;
}

export function savedLayout(draft) {
  return draft.landscape || draft.portrait
    ? { landscape: draft.landscape, portrait: draft.portrait }
    : null;
}
