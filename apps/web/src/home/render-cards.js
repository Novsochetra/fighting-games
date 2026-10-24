import { escapeHtml } from './escape-html.js';

// Phones fill their art from the poster, the tall crop of a game's key art.
export const NARROW_MEDIA = '(max-width: 43.75rem)';
// The cards near the center are seen at once; the rest load as the carousel brings them near.
export const EAGER_CARD_COUNT = 5;

const attributes = (pairs) =>
  Object.entries(pairs)
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(' ');

const artClass = (base, card) => (card.smoothArt ? `${base} is-smooth` : base);

const SPARKLES =
  '<svg class="art__glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3.5l1.6 4.9 4.9 1.6-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6zM18 13.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" /></svg>';

function renderComingSoon({ title }) {
  return `<span class="art art--soon" aria-hidden="true">${SPARKLES}<span class="art__label">${escapeHtml(title)}</span></span>`;
}

export function renderArt(card, { loading = 'eager' } = {}) {
  if (card.isComingSoon) {
    return renderComingSoon(card);
  }
  if (card.artSrc === '') {
    return `<span class="art art--monogram" aria-hidden="true">${escapeHtml(card.monogram)}</span>`;
  }
  const image = {
    class: artClass('art', card),
    src: card.artSrc,
    alt: '',
    loading,
    decoding: 'async',
  };
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
    const className = card.isComingSoon ? 'backdrop backdrop--soon' : 'backdrop';
    return `<div class="${className}" data-game-index="${escapeHtml(index)}"></div>`;
  }
  const source = { media: NARROW_MEDIA, srcset: card.posterSrc };
  const image = {
    class: artClass('backdrop__img', card),
    src: card.bannerSrc,
    alt: '',
    decoding: 'async',
  };
  return `<picture class="backdrop" data-game-index="${escapeHtml(index)}">
  <source ${attributes(source)} />
  <img ${attributes(image)} />
</picture>`;
}

export const renderDot = (_card, index) =>
  `<span class="pager__dot" data-game-index="${escapeHtml(index)}"></span>`;

export const renderAll = (cards, render) => cards.map(render).join('\n');
