import { applyValue, EDITABLE, editsOf, isEdited, resetValue, textOf } from './shot-lists.js';

const EDITED_MARK = ' •';

function fillLists(select) {
  const options = Object.entries(EDITABLE).map(([key, entry]) =>
    Object.assign(select.ownerDocument.createElement('option'), {
      value: key,
      textContent: entry.label + (isEdited(key) ? EDITED_MARK : ''),
    }),
  );
  const chosen = select.value;

  select.replaceChildren(...options);
  select.value = chosen || options[0].value;
}

function parsed(text) {
  try {
    return { value: JSON.parse(text) };
  } catch (error) {
    return { problem: `not JSON yet: ${error.message}` };
  }
}

// the shot editor: a list of the game's shots as JSON, played as soon as it reads right
export function installEditor(document, { onChange }) {
  const select = document.getElementById('list');
  const text = document.getElementById('shots');
  const problem = document.getElementById('problem');
  const show = () => {
    fillLists(select);
    text.value = textOf(select.value);
    problem.textContent = '';
  };

  select.addEventListener('input', show);
  text.addEventListener('input', () => {
    const read = parsed(text.value);

    problem.textContent = read.problem ?? applyValue(select.value, read.value) ?? '';

    if (!problem.textContent) {
      fillLists(select);
      onChange();
    }
  });
  show();

  return {
    show,
    resetList: () => resetValue(select.value),
    resetAll: () => Object.keys(EDITABLE).forEach(resetValue),
    copy: () =>
      document.defaultView.navigator.clipboard?.writeText(JSON.stringify(editsOf(), null, 2)),
  };
}
