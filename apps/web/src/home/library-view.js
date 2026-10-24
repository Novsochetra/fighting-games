import { setAriaFlag } from './aria.js';
import { FILTERS } from './library-filter.js';
import { renderTile } from './render-cards.js';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    section: byId('library'),
    title: byId('library-title'),
    grid: byId('library-grid'),
    count: byId('library-count'),
    empty: byId('library-empty'),
    filters: byId('filters'),
    showMore: byId('show-more'),
    end: byId('library-end'),
  };
}

function showFilter(filters, filter) {
  const segment = Math.max(0, FILTERS.indexOf(filter));
  filters.dataset.segment = String(segment);
  filters.style.setProperty('--segment', String(segment));
  for (const option of filters.querySelectorAll('[data-filter]')) {
    option.setAttribute('aria-pressed', String(option.dataset.filter === filter));
  }
}

export function createLibraryView(document) {
  const elements = findElements(document);
  const tileAt = (index) =>
    elements.grid.querySelector(`.tile[data-game-index="${Number(index)}"]`);

  function render(page, filter) {
    elements.grid.innerHTML = page.entries
      .map(({ card, index }, order) => renderTile(card, index, order))
      .join('\n');
    elements.title.textContent = page.title;
    elements.count.textContent = page.label;
    elements.empty.textContent = page.emptyMessage;
    elements.empty.hidden = page.emptyMessage === '';
    elements.showMore.hidden = !page.canShowMore;
    elements.end.hidden = !page.isAtEnd;
    showFilter(elements.filters, filter);
  }

  function select(selected, { focus = false } = {}) {
    for (const tile of elements.grid.querySelectorAll('.tile')) {
      const isSelected = Number(tile.dataset.gameIndex) === selected;
      tile.classList.toggle('is-selected', isSelected);
      setAriaFlag(tile, 'aria-current', isSelected);
    }
    if (focus) {
      tileAt(selected)?.focus({ preventScroll: false });
    }
  }

  return {
    elements,
    render,
    select,
    show: () => {
      elements.section.hidden = false;
    },
    hide: () => {
      elements.section.hidden = true;
    },
    tileAt,
    frameAt: (index) => tileAt(index)?.querySelector('.tile__frame'),
  };
}
