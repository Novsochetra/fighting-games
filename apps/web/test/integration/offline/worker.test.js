import { describe, expect, it } from 'vitest';
import { keepApiReads } from '../../../src/offline/api-cache.js';
import { keepArcade } from '../../../src/offline/arcade-cache.js';
import { createDownloads } from '../../../src/offline/game-downloads.js';
import { respondTo } from '../../../src/offline/respond.js';
import { fakeCaches, fakeNetwork } from '../../support/fake-caches.js';

// The arcade's worker as a browser runs it (src/offline/sw.js), answering requests from what it
// keeps and from a network that can go away.
const SCOPE = 'https://arcade.test/';
const GAME = `${SCOPE}games/steel-and-dust/`;
const PROGRESS = 'games/steel-and-dust/.offline-progress';
const MANIFEST = [
  { url: 'index.html', revision: 'a1' },
  { url: 'supporters/index.html', revision: 'b1' },
  { url: 'build/main-3f9a.js', revision: null },
  // a game's card art, which the arcade keeps with its own files (catalog-art.js)
  { url: 'games/steel-and-dust/assets/screenshots/angkor-wat.png', revision: 'c1' },
];

const gameAt = (revision, files) => ({
  [`${GAME}offline.json`]: JSON.stringify({ revision, files: Object.keys(files) }),
  ...Object.fromEntries(Object.entries(files).map(([file, body]) => [`${GAME}${file}`, body])),
});

const server = () => ({
  [`${SCOPE}index.html`]: 'the arcade',
  [`${SCOPE}supporters/index.html`]: 'the supporters',
  [`${SCOPE}build/main-3f9a.js`]: 'the app',
  [`${SCOPE}api/games`]: '{"games":[]}',
  [`${GAME}assets/screenshots/angkor-wat.png`]: 'the card art',
  ...gameAt('r1', { 'index.html': 'steel & dust 1', 'src/main.js': 'game 1' }),
});

async function startWorker(files = server()) {
  const caches = fakeCaches();
  const network = fakeNetwork(files);
  const services = {
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

  return { caches, network, files, request, open: (path) => request(path, { mode: 'navigate' }) };
}

const text = async (response) => (await response).text();
const json = async (response) => (await response).json();

describe('the arcade offline', () => {
  it('opens its pages from the build it keeps, with any query or fragment', async () => {
    const worker = await startWorker();

    worker.network.online = false;

    expect(await text(worker.open('supporters/?from=share#give'))).toBe('the supporters');
    expect(await text(worker.open(''))).toBe('the arcade');
    expect(await text(worker.request('build/main-3f9a.js'))).toBe('the app');
  });

  it('shows each game’s card art, kept with the arcade, before the game is ever played', async () => {
    const worker = await startWorker();

    worker.network.online = false;

    expect(
      await text(worker.request('games/steel-and-dust/assets/screenshots/angkor-wat.png')),
    ).toBe('the card art');
  });

  it('lists the games offline from the first visit, read as the worker came in', async () => {
    const worker = await startWorker();

    worker.network.online = false;

    expect(await text(worker.request('api/games'))).toBe('{"games":[]}');
  });

  it('lists the games and supporters it last read, and says so when it read none', async () => {
    const worker = await startWorker();

    worker.files[`${SCOPE}api/games`] = '{"games":[{"id":"new"}]}';
    expect(await text(worker.request('api/games'))).toBe('{"games":[{"id":"new"}]}');
    worker.network.online = false;

    expect(await text(worker.request('api/games'))).toBe('{"games":[{"id":"new"}]}');
    await expect(worker.request('api/supporters')).rejects.toThrow('Failed to fetch');
  });

  it('leaves a gift sent to the network', async () => {
    const worker = await startWorker();

    expect(await worker.request('api/supporters', { method: 'POST' })).toBeNull();
  });
});

describe('a game offline', () => {
  it('comes down whole behind its first play, then plays without the network', async () => {
    const worker = await startWorker();

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
    worker.network.online = false;

    expect(await text(worker.open('games/steel-and-dust/?from=arcade'))).toBe('steel & dust 1');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 1');
  });

  it('plays from the network until all of it is in, never from half a download', async () => {
    const files = server();

    delete files[`${GAME}src/main.js`];
    const worker = await startWorker(files);

    await worker.open('games/steel-and-dust/');
    worker.network.online = false;
    const page = await worker.open('games/steel-and-dust/');

    expect(page.status).toBe(503);
    expect(await page.text()).toContain('You are offline');
  });

  it('plays the revision it has while a deploy’s comes down, then the new one', async () => {
    const worker = await startWorker();

    await worker.open('games/steel-and-dust/');
    Object.assign(
      worker.files,
      gameAt('r2', { 'index.html': 'steel & dust 2', 'src/main.js': 'game 2' }),
    );

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 2');
    expect(await worker.caches.keys()).not.toContain('game-steel-and-dust@r1');
  });

  it('downloads nothing for a prefetch, which only the arcade’s hover asked for', async () => {
    const worker = await startWorker();
    const prefetch = new Headers({ 'Sec-Purpose': 'prefetch' });

    await worker.request('games/steel-and-dust/', { mode: 'navigate', headers: prefetch });

    expect(await worker.caches.keys()).not.toContain('game-steel-and-dust@r1');
    expect(worker.network.requests.map((request) => request.address)).not.toContain(
      `${GAME}offline.json`,
    );
  });

  it('says the arcade is offline for a game not played here yet', async () => {
    const worker = await startWorker();

    worker.network.online = false;
    const page = await worker.open('games/steel-and-dust/');

    expect(page.status).toBe(503);
  });
});

describe('a game’s loading screen asking how much of it is kept', () => {
  it('hears how far the download is, then that the game plays offline', async () => {
    const worker = await startWorker();

    expect(await json(worker.request(PROGRESS))).toEqual({
      ready: false,
      done: 0,
      total: 0,
      failed: false,
    });
    expect(await json(worker.request(PROGRESS))).toEqual({ ready: true });
    worker.network.online = false;

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
  });

  it('shares one download with the play that opened the game', async () => {
    const worker = await startWorker();

    await Promise.all([worker.open('games/steel-and-dust/'), worker.request(PROGRESS)]);
    const asked = worker.network.requests.filter(({ address }) => address === `${GAME}src/main.js`);

    expect(asked).toHaveLength(1);
  });

  it('hears that the download failed, and the next play tries again', async () => {
    const files = server();
    const mainJs = files[`${GAME}src/main.js`];

    delete files[`${GAME}src/main.js`];
    const worker = await startWorker(files);

    await worker.open('games/steel-and-dust/');

    expect(await json(worker.request(PROGRESS))).toMatchObject({ ready: false, failed: true });
    worker.files[`${GAME}src/main.js`] = mainJs;
    await worker.open('games/steel-and-dust/');

    expect(await json(worker.request(PROGRESS))).toEqual({ ready: true });
  });
});
