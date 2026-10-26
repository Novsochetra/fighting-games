import { browserAnalytics } from '../home/google-tag.js';
import { browserInstaller } from '../home/install-platform.js';
import { createBrowserStorage } from '../home/preferences.js';
import { browserAudioContext } from '../home/sound-player.js';
import type { ArcadePorts } from './arcade-context';

export function browserPorts(window: Window, root: URL): ArcadePorts {
  const installer = browserInstaller(window, root);
  const { navigator } = window;

  return {
    window,
    fetch: (url, options) => window.fetch(url, options),
    storage: createBrowserStorage(window),
    createAudioContext: () => browserAudioContext(window),
    locale: navigator.language,
    root,
    navigate: (href) => window.location.assign(new URL(href, root)),
    referrer: window.document.referrer,
    now: () => Date.now(),
    gamepads: {
      events: window,
      getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []),
      requestFrame: (callback) => window.requestAnimationFrame(callback),
    },
    installer,
    analyticsTag: browserAnalytics(window, { isInstalled: installer.isInstalled() }),
  };
}
