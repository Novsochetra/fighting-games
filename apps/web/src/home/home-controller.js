import { moveSelection } from './navigation.js';
import { toGameCards } from './view-models.js';

const isInRange = (cards, index) => index >= 0 && index < cards.length;

function indexAfterMove({ state, view, direction }) {
  const count = state.cards.length;
  return moveSelection({ index: state.selected, count, columns: view.countColumns(), direction });
}

export function createHomeController({ view, loadGames, launch }) {
  const state = { cards: [], selected: -1 };

  function select(index, options = {}) {
    if (isInRange(state.cards, index)) {
      state.selected = index;
      view.select(index, options);
    }
  }

  async function load() {
    state.cards = [];
    state.selected = -1;
    view.showLoading();
    try {
      state.cards = toGameCards(await loadGames());
      view.showGrid(state.cards);
      select(0);
    } catch (error) {
      view.showError(error);
    }
  }

  function open(index) {
    if (!isInRange(state.cards, index)) {
      return false;
    }
    select(index);
    launch({ index, card: state.cards[index] });
    return true;
  }

  function handleAction(action) {
    if (state.selected < 0) {
      return false;
    }
    if (action === 'start') {
      return open(state.selected);
    }
    select(indexAfterMove({ state, view, direction: action }), { focus: true });
    return true;
  }

  return { load, select, open, handleAction, selectedIndex: () => state.selected };
}
