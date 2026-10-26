import { isPlainClick } from '../home/input-actions.js';

// The arcade's screens and where each lives under the arcade. Each also has a page of its own on
// disk, which a visitor can open directly; once one is open, the others come in without a load.
export const SCREENS = [
  { id: 'home', path: '' },
  { id: 'supporters', path: 'supporters/' },
  { id: 'credits', path: 'credits/' },
];

const screenById = (id) => SCREENS.find((screen) => screen.id === id);

// The arcade sits a folder above a screen under it, at whatever path it is served from.
export function arcadeRoot(pageUrl, screenId) {
  const depth = screenById(screenId).path.split('/').filter(Boolean).length;

  return new URL('../'.repeat(depth) || './', pageUrl);
}

export function screenUrl(root, screenId) {
  return new URL(screenById(screenId).path, root);
}

export function screenAt(url, root) {
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) {
    return null;
  }

  const path = url.pathname.slice(root.pathname.length).replace(/(^|\/)index\.html$/, '$1');

  return SCREENS.find((screen) => screen.path === path)?.id ?? null;
}

const opensElsewhere = (anchor) =>
  anchor.hasAttribute('download') || (anchor.target !== '' && anchor.target !== '_self');

// The link a plain click lands on, unless it opens a tab or a window, or downloads its file.
function plainLink(event) {
  const anchor = event.target?.closest?.('a[href]');

  if (event.defaultPrevented || !isPlainClick(event) || !anchor) {
    return null;
  }

  return opensElsewhere(anchor) ? null : anchor;
}

// A plain click on a link to another screen of the arcade, which the arcade then shows itself; a
// link to a game or another site is left to the browser.
export function screenLink(event, root) {
  const anchor = plainLink(event);
  const url = anchor && new URL(anchor.href);
  const screen = url && screenAt(url, root);

  return screen ? { screen, url, back: anchor.hasAttribute('data-back') } : null;
}
