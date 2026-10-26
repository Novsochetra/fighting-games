import { browserAnalytics } from '../home/google-tag.js';
import { browserInstaller } from '../home/install-platform.js';
import { createBrowserStorage } from '../home/preferences.js';
import { browserAudioContext } from '../home/sound-player.js';
import { startArcade } from './arcade.js';

const installer = browserInstaller(window);

startArcade({
  window,
  fetch: (url, options) => window.fetch(url, options),
  storage: createBrowserStorage(window),
  createAudioContext: () => browserAudioContext(window),
  locale: navigator.language,
  home: {
    navigate: (href) => window.location.assign(href),
    gamepads: {
      events: window,
      getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []),
      requestFrame: (callback) => window.requestAnimationFrame(callback),
    },
    installer,
    analytics: browserAnalytics(window, { isInstalled: installer.isInstalled() }),
  },
});
