import { isIosDevice } from './install-offer.js';

const APP_DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui'];

function isInstalled(window) {
  const inMode = (mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches === true;
  return window.navigator.standalone === true || APP_DISPLAY_MODES.some(inMode);
}

// Only a browser with an install prompt needs the service worker; anywhere else it would just stand
// between the page and its files. It sits at the arcade's root, whichever screen the tab opened on.
function registerWorker(window, root) {
  if (!('onbeforeinstallprompt' in window) || !window.navigator.serviceWorker) {
    return Promise.resolve(null);
  }
  return window.navigator.serviceWorker.register(new URL('sw.js', root)).catch(() => null);
}

export function browserInstaller(window, root) {
  return {
    events: window,
    isIos: isIosDevice(window.navigator),
    isInstalled: () => isInstalled(window),
    registerWorker: () => registerWorker(window, root),
    now: () => Date.now(),
  };
}
