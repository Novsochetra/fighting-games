const KEY_ACTIONS = new Map([
  ['ArrowUp', 'up'],
  ['w', 'up'],
  ['W', 'up'],
  ['ArrowDown', 'down'],
  ['s', 'down'],
  ['S', 'down'],
  ['ArrowLeft', 'left'],
  ['a', 'left'],
  ['A', 'left'],
  ['ArrowRight', 'right'],
  ['d', 'right'],
  ['D', 'right'],
  ['Enter', 'start'],
  [' ', 'start'],
]);

const FORM_CONTROL_TAGS = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

export function actionForKey({ key, altKey, ctrlKey, metaKey }) {
  if (altKey || ctrlKey || metaKey) {
    return null;
  }
  return KEY_ACTIONS.get(key) ?? null;
}

export function isFormControl(target) {
  return Boolean(target) && FORM_CONTROL_TAGS.has(target.tagName);
}

// A click with a modifier or another button keeps its browser meaning: a new tab or window.
export function isPlainClick({ button, altKey, ctrlKey, metaKey, shiftKey }) {
  return button === 0 && !(altKey || ctrlKey || metaKey || shiftKey);
}
