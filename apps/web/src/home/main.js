import { bootHome } from './boot.js';
import { browserAnalytics } from './google-tag.js';
import { browserInstaller } from './install-platform.js';
import { createBrowserStorage } from './preferences.js';
import { browserAudioContext } from './sound-player.js';

const installer = browserInstaller(window);

bootHome({
  document,
  fetch: (url, options) => window.fetch(url, options),
  navigate: (href) => window.location.assign(href),
  gamepads: {
    events: window,
    getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []),
    requestFrame: (callback) => window.requestAnimationFrame(callback),
  },
  storage: createBrowserStorage(window),
  createAudioContext: () => browserAudioContext(window),
  installer,
  analytics: browserAnalytics(window, { isInstalled: installer.isInstalled() }),
  visit: { now: () => Date.now() },
});
