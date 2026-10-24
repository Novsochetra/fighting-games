import { createActionSwap } from './action-swap.js';
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
    playLabel: byId('play-label'),
    details: byId('details-open'),
    favorite: byId('favorite'),
    heart: document.querySelector('#favorite .favorite__heart'),
    actions: document.querySelector('.spotlight__actions'),
  };
}

// A swipe that lands mid-rise carries on from how far the text has risen; starting over from
// nothing made quick swipes blink.
function rise(element, previous) {
  const document = element.ownerDocument;
  const isRising = previous?.playState === 'running';
  const shown = isRising ? Number(document.defaultView.getComputedStyle(element).opacity) : 0;
  previous?.cancel();
  const offset = Number.parseFloat(readToken(document, '--offset-rise')) || 0;
  const timing = readTiming(document, { duration: '--duration-rise', easing: '--easing-spring' });
  return animateWith(
    element,
    [
      { opacity: shown, transform: `translateY(${offset * (1 - shown)}px)` },
      { opacity: 1, transform: 'none' },
    ],
    timing,
  );
}

// The heart pops only when it is tapped, never when a swipe brings back a game kept as a favorite.
function popHeart(heart) {
  const document = heart.ownerDocument;
  const scale = readToken(document, '--scale-heart-pop') || '1';
  const timing = readTiming(document, { duration: '--duration-ring', easing: '--easing-pop' });
  animateWith(heart, [{ scale: '1' }, { scale, offset: 0.4 }, { scale: '1' }], timing);
}

// A teaser's Play turns into a quiet Coming Soon, like a film not out yet, and there is nothing to
// read in Details or to keep in Favorites.
function showActions(elements, card) {
  const isSoon = Boolean(card.isComingSoon);
  const { play } = elements;
  play.classList.toggle('is-unavailable', isSoon);
  elements.playLabel.textContent = isSoon ? 'Coming Soon' : 'Play';
  if (isSoon) {
    play.removeAttribute('href');
    play.removeAttribute('aria-label');
  } else {
    play.setAttribute('href', card.href);
    play.setAttribute('aria-label', `Play ${card.title}`);
  }
  elements.details.hidden = isSoon;
  elements.favorite.hidden = isSoon;
}

function setFavorite({ favorite, heart }, isFavorite, { pop = false } = {}) {
  favorite.setAttribute('aria-pressed', String(isFavorite));
  if (pop && isFavorite) {
    popHeart(heart);
  }
}

export function createSpotlightView(document) {
  const elements = findElements(document);
  const swapActions = createActionSwap({
    row: elements.actions,
    apply: (card) => showActions(elements, card),
    modeOf: (card) => (card.isComingSoon ? 'soon' : 'game'),
  });
  let rising = null;

  function show(card, index, { animate = false } = {}) {
    elements.title.textContent = card.title;
    elements.meta.textContent = card.meta;
    elements.summary.textContent = card.summary;
    swapActions(card, { animate });
    for (const backdrop of elements.backdrops.querySelectorAll('.backdrop')) {
      backdrop.classList.toggle('is-active', Number(backdrop.dataset.gameIndex) === index);
    }
    if (animate) {
      rising = rise(elements.text, rising);
    }
  }

  return {
    elements,
    render: (cards) => {
      elements.backdrops.innerHTML = renderAll(cards, renderBackdrop);
    },
    show,
    setFavorite: (isFavorite, options) => setFavorite(elements, isFavorite, options),
  };
}
