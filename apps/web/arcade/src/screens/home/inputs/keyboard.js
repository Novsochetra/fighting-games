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

export function actionForKey({ key, altKey, ctrlKey, metaKey }) {
  if (altKey || ctrlKey || metaKey) {
    return null;
  }
  return KEY_ACTIONS.get(key) ?? null;
}

export function focusZone(target) {
  if (target?.closest?.('.card')) {
    return 'carousel';
  }
  return target?.closest?.('.tile') ? 'library' : null;
}
