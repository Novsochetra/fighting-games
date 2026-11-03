import { fillSlot, make } from '../dom.js';
import { CONTROLS, DEVICES, firstDevice } from '../howto-controls.js';
import { wrapIndex } from '../nav-step.js';

const capText = (view, cap) => (typeof cap === 'string' ? cap : view.say(cap.say));

function capsOf(view, caps, device) {
  const list = make(view.document, 'dd', { className: 'control-caps' });

  for (const cap of caps) {
    list.append(
      make(view.document, 'kbd', { className: `cap cap-${device}`, text: capText(view, cap) }),
    );
  }

  return list;
}

function notesOf(view, notes) {
  const list = make(view.document, 'dd', { className: 'control-notes' });

  for (const note of notes) {
    list.append(make(view.document, 'span', { className: 'control-note', text: view.say(note) }));
  }

  return list;
}

// a control's notes stand under its row, across the screen, so a long one wraps the least
function controlRow(view, control, device) {
  const term = make(view.document, 'dt', {
    className: 'control-does',
    text: view.say(control.does),
  });
  const row = [term, capsOf(view, control[device], device)];

  return control.notes ? [...row, notesOf(view, control.notes)] : row;
}

function pickDevice(app, device) {
  app.current.state.device = device;
  app.rerender();
}

// data: { device: 'keys' | 'pad' | 'touch' }, the tab it opens on; a side screen
export const HOWTO_SCREEN = {
  side: true,
  start(data, app) {
    return { device: DEVICES.includes(data.device) ? data.device : firstDevice(app.settings) };
  },
  render(section, { state, view }) {
    for (const tab of section.querySelectorAll('[data-device]')) {
      tab.setAttribute('aria-selected', String(tab.dataset.device === state.device));
    }

    fillSlot(
      section,
      'controls',
      CONTROLS.flatMap((control) => controlRow(view, control, state.device)),
    );
  },
  adjust(_key, by, app) {
    const at = DEVICES.indexOf(app.current.state.device);

    pickDevice(app, DEVICES[wrapIndex(at, by, DEVICES.length)]);
  },
  act(action, button, app) {
    if (action !== 'tab') {
      return false;
    }

    pickDevice(app, button.dataset.device);

    return true;
  },
};
