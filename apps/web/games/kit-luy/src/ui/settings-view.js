import { nextValue, rowsFor } from '../data/settings-rows.js';

function valueName(row, value, text) {
  if (row.names) {
    return row.names[value];
  }

  return text.t(value ? 'settings.on' : 'settings.off');
}

function rowButton(document, row, { settings, text }) {
  const button = document.createElement('button');
  const label = document.createElement('span');
  const value = document.createElement('b');

  button.className = 'row';
  button.dataset.setting = row.key;
  button.toggleAttribute('data-off', settings[row.key] === false);
  label.textContent = text.t(`settings.${row.key}`);
  value.textContent = valueName(row, settings[row.key], text);
  button.append(label, value);

  return button;
}

export function createSettingsView({ list, settings, text, can, changed }) {
  const rows = rowsFor(can);

  function render() {
    const focused = list.ownerDocument.activeElement?.dataset?.setting;
    const buttons = rows.map((row) => rowButton(list.ownerDocument, row, { settings, text }));

    list.replaceChildren(...buttons);
    buttons.find((button) => button.dataset.setting === focused)?.focus();
  }

  list.addEventListener('click', (event) => {
    const row = rows.find((entry) => entry.key === event.target.closest('.row')?.dataset.setting);

    if (row) {
      settings[row.key] = nextValue(row, settings[row.key]);
      changed(row.key);
      render();
    }
  });

  return render;
}
