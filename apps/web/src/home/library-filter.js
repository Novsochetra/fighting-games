import { formatGameCount } from './view-models.js';

export const LIBRARY_PAGE_SIZE = 8;
export const FILTERS = ['all', 'recent', 'favorites'];

export const TITLES = { all: 'All Games', recent: 'Recently Played', favorites: 'Favorites' };

export const EMPTY_MESSAGES = {
  all: 'No games yet.',
  recent: 'Games you play show up here.',
  favorites: 'No favorites yet. Tap the heart under a game to add it here.',
};

export function isFilter(value) {
  return FILTERS.includes(value);
}

const byId = (cards) => new Map(cards.map((card, index) => [card.id, { card, index }]));

// Recent keeps the order games were last played in, newest first; the others keep the catalog's.
export function filterEntries(cards, { filter, favorites, recent }) {
  if (filter === 'recent') {
    const entries = byId(cards);
    return recent.map((id) => entries.get(id)).filter(Boolean);
  }
  const entries = cards.map((card, index) => ({ card, index }));
  return filter === 'favorites'
    ? entries.filter(({ card }) => favorites.includes(card.id))
    : entries;
}

function countLabel({ filter, shown, total }) {
  if (filter === 'all' && shown < total) {
    return `Showing ${shown} of ${total}`;
  }
  return formatGameCount(shown);
}

export function libraryPage(cards, { filter, favorites, recent, expanded }) {
  const matching = filterEntries(cards, { filter, favorites, recent });
  const isPaged = filter === 'all' && !expanded;
  const entries = isPaged ? matching.slice(0, LIBRARY_PAGE_SIZE) : matching;
  return {
    entries,
    title: TITLES[filter],
    label: countLabel({ filter, shown: entries.length, total: matching.length }),
    canShowMore: isPaged && matching.length > LIBRARY_PAGE_SIZE,
    isAtEnd: filter === 'all' && expanded && matching.length > LIBRARY_PAGE_SIZE,
    emptyMessage: entries.length === 0 ? EMPTY_MESSAGES[filter] : '',
  };
}
