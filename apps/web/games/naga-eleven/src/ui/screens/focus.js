import { wrapIndex } from './nav-step.js';

const isReachable = (item) => !item.closest('[hidden]') && !item.disabled;

// while a screen asks to confirm, only its question's buttons can be reached
export const scopeOf = (section) => section?.querySelector('.confirm:not([hidden])') ?? section;

export const navItems = (scope) =>
  scope ? [...scope.querySelectorAll('[data-nav]')].filter(isReachable) : [];

export function focusedItem(scope) {
  const active = scope?.ownerDocument.activeElement;

  return navItems(scope).find((item) => item === active) ?? null;
}

export const focusedIndex = (scope) => navItems(scope).indexOf(focusedItem(scope));

// a screen opens at its top; a move of the pad brings the item it lands on into view
export function focusAt(scope, index, { scroll = false } = {}) {
  const items = navItems(scope);
  const item = items[Math.min(Math.max(0, index), items.length - 1)];

  item?.focus({ preventScroll: !scroll });

  return item ?? null;
}

export function moveFocus(scope, by) {
  const items = navItems(scope);
  const at = focusedIndex(scope);
  const next = at < 0 ? 0 : wrapIndex(at, by, items.length);

  return focusAt(scope, next, { scroll: true });
}
