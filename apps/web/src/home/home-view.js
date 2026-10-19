import { countGridColumns } from './navigation.js';
import { renderShelf } from './render-card.js';
import { formatGameCount } from './view-models.js';

export const LOADING_MESSAGE = 'Loading games…';
export const ERROR_MESSAGE = 'The game list did not load. Check your connection, then try again.';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    notice: byId('notice'),
    status: byId('status'),
    retry: byId('retry'),
    count: byId('game-count'),
    shelf: byId('shelf'),
    readout: byId('readout'),
    readoutTitle: byId('readout-title'),
    readoutText: byId('readout-text'),
  };
}

function showNotice(elements, { message, tone }) {
  elements.notice.hidden = false;
  elements.notice.dataset.tone = tone;
  elements.status.textContent = message;
  elements.retry.hidden = tone !== 'error';
  elements.shelf.hidden = true;
  elements.readout.hidden = true;
  elements.count.textContent = '';
}

function showShelf(elements, shelf) {
  elements.notice.hidden = true;
  elements.status.textContent = '';
  elements.shelf.innerHTML = renderShelf(shelf);
  elements.shelf.hidden = false;
  elements.readout.hidden = shelf.cards.length === 0;
  elements.count.textContent = formatGameCount(shelf.cards.length);
}

function selectCard(elements, { index, card, focus = false }) {
  for (const link of elements.shelf.querySelectorAll('[data-game-index]')) {
    const isSelected = Number(link.dataset.gameIndex) === index;
    link.classList.toggle('is-selected', isSelected);
    link.tabIndex = isSelected ? 0 : -1;
    if (isSelected && focus) {
      link.focus();
    }
  }
  elements.readoutTitle.textContent = card.title;
  elements.readoutText.textContent = card.description;
}

export function createHomeView(document) {
  const elements = findElements(document);
  const readTrackList = () =>
    document.defaultView.getComputedStyle(elements.shelf).gridTemplateColumns;
  return {
    elements,
    showLoading: () => showNotice(elements, { message: LOADING_MESSAGE, tone: 'loading' }),
    showError: () => showNotice(elements, { message: ERROR_MESSAGE, tone: 'error' }),
    showShelf: (shelf) => showShelf(elements, shelf),
    select: (index, card, options) => selectCard(elements, { index, card, ...options }),
    countColumns: () => countGridColumns(readTrackList()),
  };
}
