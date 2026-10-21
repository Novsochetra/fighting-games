import { clamp } from '../../lib/math.js';
import { isCenterCard, isHeroCard, isSettingRow, isTab, MENU_KEYS, tabKey } from './menu-items.js';

function reselect(menus, key) {
  menus.state.selected = Math.max(
    0,
    menus.items().findIndex((item) => tabKey(item) === key),
  );
  menus.highlight(true);
}

function stepTab(menus, current, step, audio) {
  const siblings = [...current.parentNode.children];
  const next = siblings[clamp(siblings.indexOf(current) + step, 0, siblings.length - 1)];
  const key = tabKey(next);
  next.click();
  reselect(menus, key);
  audio.sfx('ui');
}

function adjust(menus, { current, step, audio }) {
  if (current && isSettingRow(current)) {
    menus.changeSetting(current.dataset.k, step, false);
    return;
  }
  if (current && isTab(current)) {
    stepTab(menus, current, step, audio);
    return;
  }
  if (menus.top() === 'heroes') {
    stepHero(menus, step, audio);
  } else if (menus.top() !== 'settings' && menus.top() !== 'help') {
    move(menus, step, audio);
  }
}

// up and down go between the carousel's middle card and Back
function toggleBack(menus) {
  const items = menus.items();
  const onCard = isHeroCard(items[menus.state.selected]);
  menus.state.selected = onCard ? items.length - 1 : items.findIndex(isCenterCard);
}

function move(menus, step, audio) {
  if (menus.top() === 'heroes') {
    toggleBack(menus);
  } else {
    const count = menus.items().length;
    menus.state.selected = (menus.state.selected + step + count) % count;
  }
  menus.highlight(true);
  audio.sfx('ui');
}

// the carousel loops round the heroes: stepping turns it and never lands on Back
export function stepHero(menus, step, audio) {
  const cards = menus.items().filter(isHeroCard);
  const center = cards.findIndex(isCenterCard);
  menus.state.selected = (((center + step) % cards.length) + cards.length) % cards.length;
  menus.highlight(true);
  audio.sfx('ui');
}

// a row with a button of its own (Button layout: Edit) opens it, the others cycle their value
function chooseSetting(menus, row) {
  const button = row.querySelector('[data-act]');
  if (button) {
    button.click();
  } else {
    menus.changeSetting(row.dataset.k, 1, true);
  }
}

function choose(menus, { current, audio }) {
  if (!current) {
    return;
  }
  if (isSettingRow(current)) {
    chooseSetting(menus, current);
    return;
  }
  const key = tabKey(current);
  current.click();
  if (key) {
    audio.sfx('ui');
    reselect(menus, key);
  }
}

function isPauseOnly(menus) {
  return menus.state.stack.length === 1 && menus.state.stack[0] === 'pause';
}

export function createNavigator({ menus, audio, act }) {
  function navigate(kind, step) {
    const items = menus.items();
    if (!items.length && kind !== 'back') {
      return;
    }
    const current = items[menus.state.selected];
    const context = { current, step, audio };
    const handlers = {
      move: () => move(menus, step, audio),
      adjust: () => adjust(menus, context),
      ok: () => choose(menus, context),
      back: () => menus.back(),
      start: () => (isPauseOnly(menus) ? act('resume') : navigate('ok')),
    };
    handlers[kind]?.();
  }
  return navigate;
}

// Esc / P are both pause keys, but only P resumes from the pause menu
export function handleMenuKey(event, { menus, navigate, ui }) {
  const binding = MENU_KEYS[event.code];
  if (!binding) {
    return;
  }
  event.preventDefault();
  if (event.repeat && binding[0] !== 'move' && binding[0] !== 'adjust') {
    return;
  }
  ui.noteInput('key');
  if (event.code === 'KeyP' && !isPauseOnly(menus)) {
    return;
  }
  navigate(...binding);
}
