import { moveSelection } from './navigation.js';
import { buildShelf } from './view-models.js';

export function createHomeController({ view, loadGames, navigate }) {
  const state = { cards: [], selected: -1 };

  function select(index, options = {}) {
    if (index < 0 || index >= state.cards.length) {
      return;
    }
    state.selected = index;
    view.select(index, state.cards[index], options);
  }

  async function load() {
    state.cards = [];
    state.selected = -1;
    view.showLoading();
    try {
      const shelf = buildShelf(await loadGames());
      state.cards = shelf.cards;
      view.showShelf(shelf);
      select(0);
    } catch (error) {
      view.showError(error);
    }
  }

  function handleAction(action) {
    if (state.selected < 0) {
      return false;
    }
    if (action === 'start') {
      navigate(state.cards[state.selected].href);
      return true;
    }
    const count = state.cards.length;
    const columns = view.countColumns();
    select(moveSelection({ index: state.selected, count, columns, direction: action }), {
      focus: true,
    });
    return true;
  }

  return { load, select, handleAction, selectedIndex: () => state.selected };
}
