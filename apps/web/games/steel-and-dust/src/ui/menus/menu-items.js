export function menuElement(document, id) {
  return document.getElementById(`m-${id}`);
}

// the Skins screen's bar, then the keys of the preview a player may pick a shape for; while a
// key's chooser is open, only its choices
function skinsItems(menu) {
  const chooser = menu.querySelector('.key-chooser:not([hidden])');

  if (chooser) {
    return [...chooser.querySelectorAll('button')];
  }

  return [
    ...menu.querySelectorAll('.layout-bar button'),
    ...menu.querySelectorAll('.skin-preview [data-pickable]'),
  ];
}

// what arrow keys and the d-pad step through in the open menu
export function navigableItems(document, top) {
  if (!top) {
    return [];
  }
  const menu = menuElement(document, top);
  if (top === 'settings') {
    return [...menu.querySelectorAll('.setrow'), menu.querySelector('.xbtn')];
  }
  if (top === 'heroes') {
    return [...menu.querySelectorAll('.hero-card'), menu.querySelector('.xbtn')];
  }
  if (top === 'leaderboard') {
    const rows = menu.querySelectorAll('.tabs button, .board-row');
    return [...rows, menu.querySelector('.xbtn')];
  }
  if (top === 'post') {
    const buttons = [...menu.querySelectorAll('.mbtn')].filter((button) => !button.hidden);
    return [...menu.querySelectorAll('.post-name'), ...buttons, menu.querySelector('.xbtn')];
  }
  if (top === 'help') {
    return [...menu.querySelectorAll('.tabs button'), menu.querySelector('.xbtn')];
  }
  if (top === 'skins') {
    return skinsItems(menu);
  }
  if (top === 'layout') {
    return [...menu.querySelectorAll('.layout-bar button')];
  }
  if (top === 'credits') {
    return [menu.querySelector('.xbtn')];
  }
  return [...menu.querySelectorAll('.mbtn')].filter((button) => !button.hidden);
}

export function tabKey(item) {
  return item.dataset.tab || item.dataset.w;
}

export function isSettingRow(item) {
  return item.classList.contains('setrow');
}

export function isTab(item) {
  return item.parentNode.classList.contains('tabs');
}

export function isHeroCard(item) {
  return item.classList.contains('hero-card');
}

export function isCenterCard(item) {
  return isHeroCard(item) && item.dataset.depth === '0';
}

export const MENU_KEYS = {
  ArrowUp: ['move', -1],
  KeyW: ['move', -1],
  ArrowDown: ['move', 1],
  KeyS: ['move', 1],
  ArrowLeft: ['adjust', -1],
  KeyA: ['adjust', -1],
  ArrowRight: ['adjust', 1],
  KeyD: ['adjust', 1],
  Enter: ['ok'],
  NumpadEnter: ['ok'],
  Space: ['ok'],
  KeyJ: ['ok'],
  Escape: ['back'],
  Backspace: ['back'],
  KeyK: ['back'],
  KeyP: ['start'],
};
