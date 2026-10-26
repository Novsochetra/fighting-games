import { createAppearance } from '../home/appearance.js';
import { createMemoryStorage, createPreferences } from '../home/preferences.js';
import { createSoundPlayer } from '../home/sound-player.js';
import { createDonateSheet } from './donate-sheet.js';
import { SORTS } from './ranking.js';
import { fetchSupporters } from './supporters-client.js';
import { createSupportersView } from './supporters-view.js';
import { supportersPage } from './view-model.js';

function wireSort({ view, state, sound, signal }) {
  const onClick = (event) => {
    const order = event.target.closest('[data-sort]')?.dataset.sort;
    if (!state.data || !SORTS.includes(order) || order === state.order) {
      return;
    }
    state.order = order;
    sound.play('switch');
    view.renderRoll(state.page());
  };
  view.elements.sort.addEventListener('click', onClick, { signal });
}

// The buttons wait hidden in the markup, so a page whose script never ran offers no dead button.
function wireDonateButtons({ document, donate, signal }) {
  for (const button of document.querySelectorAll('[data-donate]')) {
    button.hidden = false;
    button.addEventListener('click', () => donate.open(), { signal });
  }
}

// In the arcade the screens share the appearance and the sound; on its own the page makes its own.
function pageServices({ document, store, preferences, createAudioContext, shared, signal }) {
  if (!shared.appearance) {
    createAppearance({ document, storage: store, signal });
  }

  return (
    shared.sound ??
    createSoundPlayer({
      createContext: createAudioContext ?? (() => null),
      isEnabled: preferences.isSoundOn,
    })
  );
}

// Loading again after a gift keeps the list up until the new one is in, so it never blinks out.
function createLoad({ view, state, fetch }) {
  return async function load() {
    if (!view.showsList()) {
      view.showLoading();
    }

    try {
      state.data = await fetchSupporters(fetch);
      view.render(state.page());
    } catch {
      view.showError();
    }
  };
}

// The home page's Support banner links here with #give, so the donate sheet opens at once.
export function bootSupporters({
  document,
  fetch,
  storage,
  createAudioContext,
  locale,
  visit,
  shared = {},
}) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const store = storage ?? createMemoryStorage();
  const preferences = createPreferences(store);
  const { openDonate = false, now = () => Date.now() } = visit ?? {};
  const sound = pageServices({ document, store, preferences, createAudioContext, shared, signal });
  const view = createSupportersView(document);
  const state = { data: null, order: SORTS[0] };
  state.page = () => supportersPage(state.data, { order: state.order, locale });
  const load = createLoad({ view, state, fetch });

  // A gift from this device stops the home page asking for one.
  const onGiven = () => {
    preferences.recordGift(now());
    load();
  };
  const donate = createDonateSheet({ document, fetch, sound, signal, locale, onGiven });
  wireDonateButtons({ document, donate, signal });
  if (openDonate) {
    donate.open();
  }
  wireSort({ view, state, sound, signal });
  view.elements.retry.addEventListener('click', () => load(), { signal });
  return { ready: load(), donate, stop: () => lifetime.abort() };
}
