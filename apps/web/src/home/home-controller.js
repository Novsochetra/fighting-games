import { isPlayable, withComingSoon } from './coming-soon.js';
import { createLibraryController } from './library-controller.js';
import { toGameCards } from './view-models.js';

const STEPS = { left: -1, right: 1 };
const wrapIndex = (index, count) => ((index % count) + count) % count;
const isInRange = ({ state }, index) =>
  Number.isInteger(index) && index >= 0 && index < state.cards.length;
const selectedCard = ({ state }) => state.cards[state.selected] ?? null;

function select(context, index, { cue = false, focus = null } = {}) {
  const { state, view, preferences, sound } = context;
  if (!isInRange(context, index)) {
    return false;
  }
  const isChange = index !== state.selected;
  const isFirst = state.selected < 0;
  state.selected = index;
  view.select(index, state.cards[index], { animate: isChange && !isFirst, focus });
  view.spotlight.setFavorite(preferences.isFavorite(state.cards[index].id));
  if (isChange && cue) {
    sound.play('switch');
  }
  return true;
}

// The arcade opens on the game played last, like a console's home screen.
function startIndex({ state, preferences }) {
  const lastPlayed = state.cards.findIndex((card) => card.id === preferences.recent()[0]);
  return Math.max(0, lastPlayed);
}

async function load(context) {
  const { state, view, loadGames, library } = context;
  state.cards = [];
  state.selected = -1;
  view.showLoading();
  try {
    state.cards = withComingSoon(toGameCards(await loadGames()));
  } catch {
    view.showError();
    return;
  }
  view.showGames(state.cards);
  if (state.cards.length > 0) {
    library.setCards(state.cards);
    select(context, startIndex(context));
  }
}

function step(context, delta, options = {}) {
  const { state } = context;
  if (state.selected < 0) {
    return false;
  }
  const index = wrapIndex(state.selected + delta, state.cards.length);
  return select(context, index, { cue: true, ...options });
}

// A teaser shakes its head, like a locked app on a phone, and opens nothing.
function refuse({ view, sound }, index) {
  sound.play('locked');
  view.carousel.nudge(index);
  return false;
}

function open(context, index) {
  const { state, launcher, preferences, sound } = context;
  if (!isInRange(context, index) || launcher.isFlying()) {
    return false;
  }
  select(context, index);
  const card = state.cards[index];
  if (!isPlayable(card)) {
    return refuse(context, index);
  }
  preferences.recordPlay(card.id);
  sound.play('launch');
  launcher.launch({ index, card });
  return true;
}

function handleAction(context, action, { focus = null } = {}) {
  if (context.state.selected < 0 || context.launcher.isFlying()) {
    return false;
  }
  if (action === 'start') {
    return open(context, context.state.selected);
  }
  return action in STEPS ? step(context, STEPS[action], { focus }) : false;
}

function toggleFavorite(context) {
  const { view, preferences, sound, library } = context;
  const card = selectedCard(context);
  if (!card || !isPlayable(card)) {
    return;
  }
  preferences.toggleFavorite(card.id);
  const isFavorite = preferences.isFavorite(card.id);
  view.spotlight.setFavorite(isFavorite, { pop: true });
  sound.play(isFavorite ? 'favoriteOn' : 'favoriteOff');
  library.refreshIf('favorites');
}

function pickTile(context, index) {
  if (select(context, index, { cue: true })) {
    context.view.revealHero();
  }
}

export function createHomeController({ view, loadGames, launcher, preferences, sound }) {
  const state = { cards: [], selected: -1 };
  const selectedIndex = () => state.selected;
  const library = createLibraryController({
    view: view.library,
    preferences,
    sound,
    selectedIndex,
  });
  const context = { state, view, loadGames, launcher, preferences, sound, library };
  return {
    load: () => load(context),
    select: (index, options) => select(context, index, options),
    step: (delta, options) => step(context, delta, options),
    open: (index) => open(context, index),
    handleAction: (action, options) => handleAction(context, action, options),
    toggleFavorite: () => toggleFavorite(context),
    pickTile: (index) => pickTile(context, index),
    setFilter: library.setFilter,
    showMore: library.showMore,
    refreshRecent: () => library.refreshIf('recent'),
    selectedIndex,
    selectedCard: () => selectedCard(context),
  };
}
