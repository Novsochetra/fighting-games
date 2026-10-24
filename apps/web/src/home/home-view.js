import { countGridColumns } from './navigation.js';
import { renderAppGrid } from './render-app.js';
import { formatGameCount } from './view-models.js';

export const LOADING_MESSAGE = 'Loading games…';
export const ERROR_MESSAGE = 'The game list did not load. Check your connection, then try again.';
export const EMPTY_MESSAGE = 'No games yet.';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    home: byId('home'),
    notice: byId('notice'),
    status: byId('status'),
    retry: byId('retry'),
    count: byId('game-count'),
    grid: byId('app-grid'),
  };
}

function showNotice(elements, { message, tone }) {
  elements.notice.hidden = false;
  elements.notice.dataset.tone = tone;
  elements.status.textContent = message;
  elements.retry.hidden = tone !== 'error';
  elements.grid.hidden = true;
}

function showGrid(elements, cards) {
  elements.count.textContent = formatGameCount(cards.length);
  if (cards.length === 0) {
    showNotice(elements, { message: EMPTY_MESSAGE, tone: 'empty' });
    return;
  }
  elements.notice.hidden = true;
  elements.status.textContent = '';
  elements.grid.innerHTML = renderAppGrid(cards);
  elements.grid.hidden = false;
}

function selectApp(elements, index, { focus = false }) {
  for (const link of elements.grid.querySelectorAll('[data-game-index]')) {
    const isSelected = Number(link.dataset.gameIndex) === index;
    link.classList.toggle('is-selected', isSelected);
    link.tabIndex = isSelected ? 0 : -1;
    if (isSelected && focus) {
      link.focus({ preventScroll: true });
      link.scrollIntoView?.({ block: 'nearest' });
    }
  }
}

export function createHomeView(document) {
  const elements = findElements(document);
  const readTrackList = () =>
    document.defaultView.getComputedStyle(elements.grid).gridTemplateColumns;
  return {
    elements,
    showLoading: () => {
      elements.count.textContent = '';
      showNotice(elements, { message: LOADING_MESSAGE, tone: 'loading' });
    },
    showError: () => showNotice(elements, { message: ERROR_MESSAGE, tone: 'error' }),
    showGrid: (cards) => showGrid(elements, cards),
    select: (index, options = {}) => selectApp(elements, index, options),
    findLink: (index) => elements.grid.querySelector(`[data-game-index="${Number(index)}"]`),
    countColumns: () => countGridColumns(readTrackList()),
  };
}
