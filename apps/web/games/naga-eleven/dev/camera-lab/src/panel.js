import { CHOICES } from './options.js';

const NONE = '(none)';

const picks = (document) => [...document.querySelectorAll('[data-pick]')];

export function fillChoices(document) {
  for (const select of document.querySelectorAll('select[data-pick]')) {
    const options = CHOICES[select.dataset.pick].map((value) =>
      Object.assign(document.createElement('option'), { value, textContent: value || NONE }),
    );

    select.replaceChildren(...options);
  }
}

function valueOf(input) {
  if (input.type === 'checkbox') {
    return input.checked;
  }

  return input.type === 'range' ? Number(input.value) : input.value;
}

export const readSettings = (document) =>
  Object.fromEntries(picks(document).map((input) => [input.dataset.pick, valueOf(input)]));

export function writeSettings(document, settings) {
  for (const input of picks(document)) {
    const value = settings[input.dataset.pick];

    if (input.type === 'checkbox') {
      input.checked = Boolean(value);
    } else if (value !== undefined) {
      input.value = String(value);
    }
  }
}

export function showFor(document, scene) {
  for (const set of document.querySelectorAll('[data-for]')) {
    set.hidden = !set.dataset.for.split(' ').includes(scene);
  }
}

export function onSettings(document, handle) {
  for (const input of picks(document)) {
    input.addEventListener('input', () => handle(readSettings(document)));
  }
}
