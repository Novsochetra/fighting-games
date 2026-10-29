import { clampCentre, steppedSize } from '../../data/button-layout.js';
import { ORIENTATIONS, SKINS, skinIdFor } from '../../data/skins/skins.js';
import { isPortrait } from '../screen/stage-layout.js';

// the editor works on a copy of the saved layouts, so Cancel only has to drop it; every step
// returns a new draft. A draft holds a layout, or null for the skin's own, for each slot: a skin
// held one way ('dusk:portrait'), so a player's layouts for every skin come through an edit. A
// control is one of a skin's buttons, its stick or its d-pad

export function orientationOf(width, height) {
  return isPortrait(width, height) ? 'portrait' : 'landscape';
}

export const slotOf = (skinId, orientation) => `${skinId}:${orientation}`;

// the slot the editor shows: the skin picked, held the way the phone is
export function slotFor(settings, orientation) {
  return slotOf(skinIdFor(settings), orientation);
}

export function savedEntries(buttonLayout, slot) {
  const [skin, orientation] = slot.split(':');

  return buttonLayout?.[skin]?.[orientation] ?? null;
}

const SLOTS = Object.keys(SKINS).flatMap((skin) =>
  ORIENTATIONS.map((orientation) => slotOf(skin, orientation)),
);

export function createDraft(buttonLayout) {
  return Object.fromEntries(SLOTS.map((slot) => [slot, savedEntries(buttonLayout, slot)]));
}

// four decimals place a centre to a tenth of a pixel on any phone and keep the save short
const roundFraction = (value) => Math.round(value * 10000) / 10000;

// editing starts from where the original controls stand: `centres` is measured on screen
export function customised(draft, slot, centres) {
  if (draft[slot]) {
    return draft;
  }
  const entries = {};
  for (const [control, centre] of Object.entries(centres)) {
    entries[control] = { x: roundFraction(centre.x), y: roundFraction(centre.y), size: 1 };
  }
  return { ...draft, [slot]: entries };
}

function withEntry(draft, slot, control, entry) {
  return { ...draft, [slot]: { ...draft[slot], [control]: entry } };
}

function placed(entry, centre, half) {
  const scaled = { x: half.x * entry.size, y: half.y * entry.size };
  const inside = clampCentre(centre, scaled);
  return { ...entry, x: roundFraction(inside.x), y: roundFraction(inside.y) };
}

// `half` is the control's half width and height at size 1, as fractions of the layer
export function moveControl(draft, { slot, control, centre, half }) {
  const entry = draft[slot][control];
  return withEntry(draft, slot, control, placed(entry, centre, half));
}

// a control that grows near an edge is pushed back onto the screen
export function resizeControl(draft, { slot, control, step, half }) {
  const entry = draft[slot][control];
  const resized = { ...entry, size: steppedSize(entry.size, step) };
  return withEntry(draft, slot, control, placed(resized, entry, half));
}

export function resetLayout(draft, slot) {
  return { ...draft, [slot]: null };
}

// the order the controls are picked in, whatever order a skin draws them in
const PICK_ORDER = ['light', 'heavy', 'jump', 'dash', 'ult', 'dpad', 'stick'];

function pickRank(control) {
  const rank = PICK_ORDER.indexOf(control);

  return rank === -1 ? PICK_ORDER.length : rank;
}

// a hidden stick (Settings, Joystick) is neither shown nor edited
export function shownControls(padLayout, stickMode) {
  return padLayout.items
    .filter((item) => item.kind !== 'stick' || stickMode !== 'hidden')
    .map((item) => item.id)
    .sort((first, second) => pickRank(first) - pickRank(second));
}

export function nextControl(control, shown) {
  return shown[(shown.indexOf(control) + 1) % shown.length];
}

export function sizeOf(draft, slot, control) {
  return draft[slot]?.[control].size ?? 1;
}

export function savedLayout(draft) {
  const layouts = {};

  for (const [slot, entries] of Object.entries(draft)) {
    const [skin, orientation] = slot.split(':');

    if (entries) {
      layouts[skin] = { landscape: null, portrait: null, ...layouts[skin], [orientation]: entries };
    }
  }

  return Object.keys(layouts).length > 0 ? layouts : null;
}
