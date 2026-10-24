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

export function bootSupporters({ document, fetch, storage, createAudioContext, locale }) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const store = storage ?? createMemoryStorage();
  createAppearance({ document, storage: store, signal });
  const sound = createSoundPlayer({
    createContext: createAudioContext ?? (() => null),
    isEnabled: createPreferences(store).isSoundOn,
  });
  const view = createSupportersView(document);
  const state = { data: null, order: SORTS[0] };
  state.page = () => supportersPage(state.data, { order: state.order, locale });

  async function load() {
    view.showLoading();
    try {
      state.data = await fetchSupporters(fetch);
      view.render(state.page());
    } catch {
      view.showError();
    }
  }

  const donate = createDonateSheet({ document, fetch, sound, signal, locale, onGiven: load });
  wireDonateButtons({ document, donate, signal });
  wireSort({ view, state, sound, signal });
  view.elements.retry.addEventListener('click', () => load(), { signal });
  return { ready: load(), donate, stop: () => lifetime.abort() };
}
