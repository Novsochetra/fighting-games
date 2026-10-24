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

const TEXT_FIELD_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);
const PRESSABLE_TAGS = new Set(['A', 'BUTTON', 'SUMMARY', ...TEXT_FIELD_TAGS]);

export function actionForKey({ key, altKey, ctrlKey, metaKey }) {
  if (altKey || ctrlKey || metaKey) {
    return null;
  }
  return KEY_ACTIONS.get(key) ?? null;
}

export function isTextField(target) {
  return Boolean(target) && TEXT_FIELD_TAGS.has(target.tagName);
}

// Links and buttons answer Enter and Space themselves, so the page leaves those keys to them.
export function handlesEnter(target) {
  return Boolean(target) && PRESSABLE_TAGS.has(target.tagName);
}

// A click with a modifier or another button keeps its browser meaning: a new tab or window.
export function isPlainClick({ button, altKey, ctrlKey, metaKey, shiftKey }) {
  return button === 0 && !(altKey || ctrlKey || metaKey || shiftKey);
}

export function focusZone(target) {
  if (target?.closest?.('.card')) {
    return 'carousel';
  }
  return target?.closest?.('.tile') ? 'library' : null;
}
