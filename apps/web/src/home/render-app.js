import { escapeHtml } from './escape-html.js';

// About two screens of icons on a phone; the rest load as they scroll near.
export const EAGER_ICON_COUNT = 24;

function renderArt({ coverSrc, monogram }, index) {
  if (coverSrc === '') {
    return `<span class="app__art app__art--monogram" aria-hidden="true">${escapeHtml(monogram)}</span>`;
  }
  const loading = index < EAGER_ICON_COUNT ? 'eager' : 'lazy';
  return `<img class="app__art" src="${escapeHtml(coverSrc)}" alt="" width="128" height="128" loading="${loading}" decoding="async" draggable="false" />`;
}

export function renderAppIcon(card, index) {
  return `<li class="app-slot">
  <a class="app" href="${escapeHtml(card.href)}" data-game-index="${escapeHtml(index)}" tabindex="-1">
    <span class="app__icon">${renderArt(card, index)}</span>
    <span class="app__label">${escapeHtml(card.title)}</span>
  </a>
</li>`;
}

export function renderAppGrid(cards) {
  return cards.map((card, index) => renderAppIcon(card, index)).join('\n');
}
