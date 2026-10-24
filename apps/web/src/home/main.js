import { bootHome } from './boot.js';
import { browserInstaller } from './install-platform.js';
import { createBrowserStorage } from './preferences.js';
import { browserAudioContext } from './sound-player.js';

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
  installer: browserInstaller(window),
});
