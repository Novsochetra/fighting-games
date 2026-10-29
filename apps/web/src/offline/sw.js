import { keepApiReads } from './api-cache.js';
import { dropOtherArcades, keepArcade } from './arcade-cache.js';
import { createGameActivity } from './game-activity.js';
import { createDownloads } from './game-downloads.js';
import { respondTo } from './respond.js';

// vite-plugin-pwa writes the arcade's files, each with its revision, into this list as it builds
// the worker (apps/web/vite.config.ts).
const manifest = self.__WB_MANIFEST;
const downloads = createDownloads();
const activity = createGameActivity();

const services = () => ({
  activity,
  caches,
  downloads,
  fetch: (request) => fetch(request),
  manifest,
  scope: self.registration.scope,
});

// A new build takes over once all of it is in, without waiting for every tab to close; a page open
// on the old build keeps what it loaded, and its next load is the new one.
self.addEventListener('install', (event) => {
  const keeping = Promise.all([keepArcade(services()), keepApiReads(services())]);

  event.waitUntil(keeping.then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([dropOtherArcades(services()), self.clients.claim()]));
});

self.addEventListener('fetch', (event) => {
  const response = respondTo(event, services());

  if (response) {
    event.respondWith(response);
  }
});
