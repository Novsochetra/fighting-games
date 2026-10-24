import { isFilter, libraryPage } from './library-filter.js';

export function createLibraryController({ view, preferences, sound, selectedIndex }) {
  const state = { cards: [], filter: 'all', expanded: false };

  function refresh() {
    const page = libraryPage(state.cards, {
      filter: state.filter,
      favorites: preferences.favorites(),
      recent: preferences.recent(),
      expanded: state.expanded,
    });
    view.render(page, state.filter);
    view.select(selectedIndex());
  }

  const update = (changes) => {
    Object.assign(state, changes);
    refresh();
  };

  function setFilter(filter) {
    if (!isFilter(filter) || filter === state.filter) {
      return false;
    }
    sound.play('segment');
    update({ filter, expanded: false });
    return true;
  }

  return {
    setCards: (cards) => update({ cards, expanded: false }),
    setFilter,
    showMore: () => update({ expanded: true }),
    refreshIf: (filter) => state.filter === filter && refresh(),
  };
}
