const TEXT_FIELD_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);
const PRESSABLE_TAGS = new Set(['A', 'BUTTON', 'SUMMARY', ...TEXT_FIELD_TAGS]);

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
