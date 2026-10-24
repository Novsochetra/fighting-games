import { createAppearance } from '../home/appearance.js';
import { createMemoryStorage, createPreferences } from '../home/preferences.js';
import { createSoundPlayer } from '../home/sound-player.js';
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

  wireSort({ view, state, sound, signal });
  view.elements.retry.addEventListener('click', () => load(), { signal });
  return { ready: load(), stop: () => lifetime.abort() };
}
