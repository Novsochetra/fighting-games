import { createBrowserStorage } from '../home/preferences.js';
import { browserAudioContext } from '../home/sound-player.js';
import { bootSupporters } from './boot.js';

bootSupporters({
  document,
  fetch: (url, options) => window.fetch(url, options),
  storage: createBrowserStorage(window),
  createAudioContext: () => browserAudioContext(window),
  locale: navigator.language,
  visit: { openDonate: window.location.hash === '#give', now: () => Date.now() },
});
