import { isIosDevice } from './install-offer.js';

const APP_DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui'];

function isInstalled(window) {
  const inMode = (mode) => window.matchMedia?.(`(display-mode: ${mode})`).matches === true;
  return window.navigator.standalone === true || APP_DISPLAY_MODES.some(inMode);
}

export function browserInstaller(window) {
  return {
    events: window,
    isIos: isIosDevice(window.navigator),
    isInstalled: () => isInstalled(window),
    now: () => Date.now(),
  };
}
