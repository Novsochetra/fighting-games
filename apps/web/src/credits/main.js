import { createBrowserStorage } from '../home/preferences.js';
import { bootCredits } from './boot.js';

bootCredits({
  document,
  storage: createBrowserStorage(window),
  history: window.history,
  referrer: document.referrer,
});
