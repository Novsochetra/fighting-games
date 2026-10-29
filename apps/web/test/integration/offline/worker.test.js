import { describe, expect, it } from 'vitest';
import {
  caught,
  GAME,
  gameAt,
  json,
  remove,
  SAVE,
  SCOPE,
  save,
  server,
  startWorker,
  text,
} from '../../support/offline-worker.js';

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
  it('plays from the network, and saves nothing the player has not saved', async () => {
    const worker = await startWorker();

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
    expect(await caught(worker)).toEqual([]);
    worker.network.online = false;
    const page = await worker.open('games/steel-and-dust/');

    expect(page.status).toBe(503);
    expect(await page.text()).toContain('You are offline');
  });

  it('plays a saved game without the network', async () => {
    const worker = await startWorker();

    await save(worker);
    worker.network.online = false;

    expect(await text(worker.open('games/steel-and-dust/?from=arcade'))).toBe('steel & dust 1');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 1');
  });

  it('reads each file of a game it plays from the one revision it plays, and nothing more', async () => {
    const worker = await startWorker();

    await save(worker);
    Object.assign(worker.files, gameAt('r2', { 'index.html': 'steel & dust 2' }));
    await worker.open('games/steel-and-dust/');
    const reads = [];
    const { keys, match } = worker.caches;

    worker.caches.keys = () => reads.push('keys') && keys();
    worker.caches.match = (key, options) => reads.push(options?.cacheName) && match(key, options);

    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 1');
    expect(reads).toEqual(['game-steel-and-dust@r1']);
  });

  it('plays from the network until all of it is in, never from half a download', async () => {
    const files = server();

    delete files[`${GAME}src/main.js`];
    const worker = await startWorker(files);

    await save(worker);
    worker.network.online = false;
    const page = await worker.open('games/steel-and-dust/');

    expect(page.status).toBe(503);
  });

  it('keeps a saved game fresh: a play brings a deploy’s revision down behind the one it plays', async () => {
    const worker = await startWorker();

    await save(worker);
    Object.assign(
      worker.files,
      gameAt('r2', { 'index.html': 'steel & dust 2', 'src/main.js': 'game 2' }),
    );

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 1');
    expect(await caught(worker)).toEqual(['game-steel-and-dust@r1', 'game-steel-and-dust@r2']);
    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 2');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 2');
    expect(await caught(worker)).toEqual(['game-steel-and-dust@r2']);
  });

  it('lets a download left half done go once a whole revision comes in', async () => {
    const worker = await startWorker();
    const mainJs = worker.files[`${GAME}src/main.js`];

    delete worker.files[`${GAME}src/main.js`];
    await save(worker);
    Object.assign(
      worker.files,
      gameAt('r2', { 'index.html': 'steel & dust 2', 'src/main.js': mainJs }),
    );
    await save(worker);

    expect(await caught(worker)).toEqual(['game-steel-and-dust@r2']);
  });

  it('downloads nothing for a prefetch, which only the arcade’s hover asked for', async () => {
    const worker = await startWorker();
    const prefetch = new Headers({ 'Sec-Purpose': 'prefetch' });

    await save(worker);
    worker.files[`${GAME}offline.json`] = JSON.stringify({ revision: 'r2', files: [] });
    worker.network.requests.length = 0;
    await worker.request('games/steel-and-dust/', { mode: 'navigate', headers: prefetch });

    expect(worker.network.requests.map((request) => request.address)).not.toContain(
      `${GAME}offline.json`,
    );
  });
});

describe('saving a game for offline from the arcade', () => {
  it('downloads nothing while the arcade only looks', async () => {
    const worker = await startWorker();

    expect(await json(worker.request(SAVE))).toEqual({ state: 'not-saved' });
    expect(worker.network.requests.map(({ address }) => address)).not.toContain(
      `${GAME}offline.json`,
    );
  });

  it('hears how far the save is, then that the game is saved', async () => {
    const worker = await startWorker();

    expect(await json(save(worker))).toEqual({ state: 'saving', done: 0, total: 0 });
    expect(await json(worker.request(SAVE))).toEqual({ state: 'saved' });
  });

  it('downloads each file once for two taps at once', async () => {
    const worker = await startWorker();

    await Promise.all([save(worker), save(worker)]);
    const asked = worker.network.requests.filter(({ address }) => address === `${GAME}src/main.js`);

    expect(asked).toHaveLength(1);
  });

  it('hears that the save failed, and saves on the next try', async () => {
    const files = server();
    const mainJs = files[`${GAME}src/main.js`];

    delete files[`${GAME}src/main.js`];
    const worker = await startWorker(files);

    await save(worker);

    expect(await json(worker.request(SAVE))).toEqual({ state: 'failed' });
    worker.files[`${GAME}src/main.js`] = mainJs;
    await save(worker);

    expect(await json(worker.request(SAVE))).toEqual({ state: 'saved' });
  });
});

describe('removing a saved game', () => {
  it('frees every revision it kept, and a play does not bring it back', async () => {
    const worker = await startWorker();

    await save(worker);

    expect(await json(remove(worker))).toEqual({ state: 'not-saved' });
    expect(await caught(worker)).toEqual([]);
    await worker.open('games/steel-and-dust/');

    expect(await caught(worker)).toEqual([]);
    expect(await json(worker.request(SAVE))).toEqual({ state: 'not-saved' });
  });

  it('stops a download on its way and keeps none of it', async () => {
    const worker = await startWorker();
    const held = Promise.withResolvers();

    worker.network.hold = held.promise;
    const saving = save(worker);

    await new Promise((resolve) => setTimeout(resolve, 0));
    await remove(worker);
    held.resolve();
    await saving;

    expect(await json(worker.request(SAVE))).toEqual({ state: 'not-saved' });
    expect(await caught(worker)).toEqual([]);
  });
});
