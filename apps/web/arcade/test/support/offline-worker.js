import { keepApiReads } from '@/service-worker/api-cache.js';
import { keepArcade } from '@/service-worker/arcade-cache.js';
import { createGameActivity } from '@/service-worker/game-activity.js';
import { createDownloads } from '@/service-worker/game-downloads.js';
import { respondTo } from '@/service-worker/respond.js';
import { fakeCaches, fakeNetwork } from './fake-caches.js';

// The arcade's worker as a browser runs it (src/service-worker/sw.js), answering requests from what it
// keeps and from a network that can go away.
export const SCOPE = 'https://arcade.test/';
export const GAME = `${SCOPE}games/steel-and-dust/`;
export const SAVE = 'api/offline/steel-and-dust';
const MANIFEST = [
  { url: 'index.html', revision: 'a1' },
  { url: 'supporters/index.html', revision: 'b1' },
  { url: 'build/main-3f9a.js', revision: null },
  // a game's card art, which the arcade keeps with its own files (catalog-art.js)
  { url: 'games/steel-and-dust/assets/screenshots/angkor-wat.png', revision: 'c1' },
];

export const gameAt = (revision, files) => ({
  [`${GAME}offline.json`]: JSON.stringify({ revision, files: Object.keys(files) }),
  ...Object.fromEntries(Object.entries(files).map(([file, body]) => [`${GAME}${file}`, body])),
});

export const server = () => ({
  [`${SCOPE}index.html`]: 'the arcade',
  [`${SCOPE}supporters/index.html`]: 'the supporters',
  [`${SCOPE}build/main-3f9a.js`]: 'the app',
  [`${SCOPE}api/games`]: '{"games":[]}',
  [`${GAME}assets/screenshots/angkor-wat.png`]: 'the card art',
  ...gameAt('r1', { 'index.html': 'steel & dust 1', 'src/main.js': 'game 1' }),
});

export async function startWorker(files = server()) {
  // the worker's clock, which moves on only as a download waits for the game to stop asking
  const clock = { now: 0 };
  const caches = fakeCaches();
  const network = fakeNetwork(files, clock);
  const services = {
    activity: createGameActivity({
      now: () => clock.now,
      wait: async (ms) => {
        clock.now += ms;
      },
    }),
    caches,
    downloads: createDownloads(),
    fetch: network.fetch,
    manifest: MANIFEST,
    scope: SCOPE,
  };

  // as the worker installs (sw.js)
  await Promise.all([keepArcade(services), keepApiReads(services)]);

  const request = async (path, { mode = 'cors', method = 'GET', headers = new Headers() } = {}) => {
    const waits = [];
    const event = {
      request: { url: `${SCOPE}${path}`, mode, method, headers },
      waitUntil: (promise) => waits.push(promise),
    };
    const response = await respondTo(event, services);

    await Promise.all(waits);

    return response;
  };

  const open = (path) => request(path, { mode: 'navigate' });

  return { caches, clock, network, files, request, open };
}

export const text = async (response) => (await response).text();
export const json = async (response) => (await response).json();
export const save = (worker) => worker.request(SAVE, { method: 'POST' });
export const remove = (worker) => worker.request(SAVE, { method: 'DELETE' });
export const caught = async (worker) =>
  (await worker.caches.keys()).filter((name) => name.startsWith('game-'));
