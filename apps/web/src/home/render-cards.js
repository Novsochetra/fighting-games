import { escapeHtml } from './escape-html.js';

// Phones fill their art from the poster, the tall crop of a game's key art.
export const NARROW_MEDIA = '(max-width: 43.75rem)';
// The cards near the center are seen at once; the rest load as the carousel brings them near.
export const EAGER_CARD_COUNT = 5;

const attributes = (pairs) =>
  Object.entries(pairs)
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ');

export function renderArt({ bannerSrc, monogram }, { loading = 'eager' } = {}) {
  if (bannerSrc === '') {
    return `<span class="art art--monogram" aria-hidden="true">${escapeHtml(monogram)}</span>`;
  }
  const image = { class: 'art', src: bannerSrc, alt: '', loading, decoding: 'async' };
  return `<img ${attributes(image)} draggable="false" />`;
}

export function renderCard(card, index) {
  const loading = index < EAGER_CARD_COUNT ? 'eager' : 'lazy';
  const button = { class: 'card', type: 'button', 'data-game-index': index, tabindex: -1 };
  return `<button ${attributes(button)} aria-label="${escapeHtml(card.title)}">
  <span class="card__ring" aria-hidden="true"></span>
  <span class="card__frame">${renderArt(card, { loading })}</span>
</button>`;
}

export function renderTile(card, index, order) {
  const button = { class: 'tile', type: 'button', 'data-game-index': index };
  return `<li class="library__slot">
  <button ${attributes(button)} style="--order: ${Number(order)}">
    <span class="tile__media">
      <span class="tile__ring" aria-hidden="true"></span>
      <span class="tile__frame">${renderArt(card, { loading: 'lazy' })}</span>
    </span>
    <span class="tile__text">
      <span class="tile__title">${escapeHtml(card.title)}</span>
      <span class="tile__genre">${escapeHtml(card.genre)}</span>
    </span>
  </button>
</li>`;
}

export function renderBackdrop(card, index) {
  if (card.bannerSrc === '') {
    return `<div class="backdrop" data-game-index="${escapeHtml(index)}"></div>`;
  }
  const source = { media: NARROW_MEDIA, srcset: card.posterSrc };
  const image = { class: 'backdrop__img', src: card.bannerSrc, alt: '', decoding: 'async' };
  return `<picture class="backdrop" data-game-index="${escapeHtml(index)}">
  <source ${attributes(source)} />
  <img ${attributes(image)} />
</picture>`;
}

export const renderDot = (_card, index) =>
  `<span class="pager__dot" data-game-index="${escapeHtml(index)}"></span>`;

export const renderAll = (cards, render) => cards.map(render).join('\n');
