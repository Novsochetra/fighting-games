import { animateWith, readTiming, readToken } from './motion-tokens.js';
import { renderAll, renderBackdrop } from './render-cards.js';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    backdrops: byId('backdrops'),
    text: byId('spotlight-text'),
    title: byId('spotlight-title'),
    meta: byId('spotlight-meta'),
    summary: byId('spotlight-summary'),
    play: byId('play'),
    details: byId('details-open'),
    favorite: byId('favorite'),
  };
}

function rise(element) {
  const document = element.ownerDocument;
  const offset = readToken(document, '--offset-rise') || '0px';
  const timing = readTiming(document, { duration: '--duration-rise', easing: '--easing-spring' });
  animateWith(
    element,
    [
      { opacity: 0, transform: `translateY(${offset})` },
      { opacity: 1, transform: 'none' },
    ],
    timing,
  );
}

export function createSpotlightView(document) {
  const elements = findElements(document);

  function show(card, index, { animate = false } = {}) {
    elements.title.textContent = card.title;
    elements.meta.textContent = card.meta;
    elements.summary.textContent = card.summary;
    elements.play.setAttribute('href', card.href);
    elements.play.setAttribute('aria-label', `Play ${card.title}`);
    for (const backdrop of elements.backdrops.querySelectorAll('.backdrop')) {
      backdrop.classList.toggle('is-active', Number(backdrop.dataset.gameIndex) === index);
    }
    if (animate) {
      rise(elements.text);
    }
  }

  return {
    elements,
    render: (cards) => {
      elements.backdrops.innerHTML = renderAll(cards, renderBackdrop);
    },
    show,
    setFavorite: (isFavorite) => elements.favorite.setAttribute('aria-pressed', String(isFavorite)),
  };
}
