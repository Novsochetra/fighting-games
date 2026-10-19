import { bootHome } from './boot.js';

bootHome({
  document,
  fetch: (url, options) => window.fetch(url, options),
  navigate: (href) => window.location.assign(href),
  gamepads: {
    events: window,
    getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []),
    requestFrame: (callback) => window.requestAnimationFrame(callback),
  },
});
