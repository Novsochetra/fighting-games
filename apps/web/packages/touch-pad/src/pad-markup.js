import { installPadStyles } from './pad-styles.js';

const DIRECTIONS = ['up', 'right', 'down', 'left'];
const itemsByControl = new WeakMap();
const layoutsByPad = new WeakMap();
// a game asks for a control on every frame (its states, like ULT ready), so each pad keeps its
// controls by id, and each layer its pad
const controlsByPad = new WeakMap();
const padsByLayer = new WeakMap();

export function element(document, tag, className) {
  const node = document.createElement(tag);

  node.className = className;

  return node;
}

export const classesOf = (base, item) => (item.class ? `${base} ${item.class}` : base);

function buttonMarkup(document, item) {
  const button = element(document, 'button', classesOf('pad-button', item));

  button.type = 'button';
  button.tabIndex = -1;
  button.textContent = item.label ?? '';

  return button;
}

function dpadMarkup(document, item) {
  const dpad = element(document, 'div', classesOf('pad-dpad', item));

  for (const direction of DIRECTIONS) {
    const arm = element(document, 'span', 'pad-arm');

    arm.dataset.direction = direction;
    dpad.append(arm);
  }

  return dpad;
}

function stickMarkup(document, item) {
  const base = element(document, 'div', classesOf('pad-stick', item));

  base.append(element(document, 'div', 'pad-knob'));

  return base;
}

const MARKUP = { button: buttonMarkup, dpad: dpadMarkup, stick: stickMarkup };

function controlOf(document, item) {
  const control = MARKUP[item.kind](document, item);

  control.dataset.control = item.id;
  itemsByControl.set(control, item);

  if (item.size) {
    control.style.setProperty('--pad-base', `${item.size}px`);
  }

  if (item.aspect) {
    control.style.setProperty('--pad-aspect', String(item.aspect));
  }

  return control;
}

export const itemOf = (control) => itemsByControl.get(control);

export const padOf = (layer) => padsByLayer.get(layer);

// the stick stands in a zone of its own, the half of the screen a thumb grabs it in; the other
// controls stand together, after it, so they stay on top of it
function fill(pad, layout) {
  const { ownerDocument: document } = pad;
  const controls = element(document, 'div', 'pad-controls');
  const zones = [];
  const byId = new Map();

  for (const item of layout.items) {
    const control = controlOf(document, item);

    byId.set(item.id, control);

    if (item.kind === 'stick') {
      const zone = element(document, 'div', 'pad-zone');

      zone.append(control);
      zones.push(zone);
    } else {
      controls.append(control);
    }
  }

  pad.replaceChildren(...zones, controls);
  controlsByPad.set(pad, byId);
}

// draws a skin's layout for the way the phone is held on `layer` (the touch layer, or the layout
// editor's copy of it), first in it; the same layout again is left as it is, so a refit never cuts
// a thumb's press short
export function renderPad(layer, layout, { debug = false } = {}) {
  const document = layer.ownerDocument;
  let pad = padOf(layer);

  if (pad?.parentNode !== layer) {
    installPadStyles(document);
    pad = element(document, 'div', 'pad');
    layer.prepend(pad);
    padsByLayer.set(layer, pad);
  }

  pad.classList.toggle('pad-debug', debug);

  if (layoutsByPad.get(pad) !== layout) {
    fill(pad, layout);
    layoutsByPad.set(pad, layout);
  }

  return pad;
}

export const controlIn = (layer, id) => controlsByPad.get(padOf(layer))?.get(id);
