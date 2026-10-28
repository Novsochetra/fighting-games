import { describe, expect, it } from 'vitest';
import { caught, gameAt, save, server, startWorker, text } from '../../support/offline-worker.js';

// Bug: after a deploy, a play of a saved game brings the new revision down behind the one it plays,
// and the worker let the old one go the moment the new one was in, even while the game was still
// loading from it. Every module the page asked for after that came from the new revision, mixed in
// with the old ones it had, and a file the deploy took away went to the network, which has it no
// more (or is not there offline), so Steel & Dust's loading screen stayed at 97% for good. A phone
// meets it most: a game of about a thousand modules loads slowly there, and its download is slower.
const deploy = (worker) =>
  Object.assign(
    worker.files,
    gameAt('r2', { 'index.html': 'steel & dust 2', 'src/main.js': 'game 2' }),
  );

async function savedThenDeployed() {
  const worker = await startWorker({
    ...server(),
    ...gameAt('r1', {
      'index.html': 'steel & dust 1',
      'src/main.js': 'game 1',
      'src/gone-in-r2.js': 'a module the deploy took away',
    }),
  });

  await save(worker);
  deploy(worker);

  return worker;
}

describe('a saved game played across a deploy', () => {
  it('keeps loading the page from the revision it opened on once the new one is in', async () => {
    const worker = await savedThenDeployed();

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
    expect(await caught(worker)).toContain('game-steel-and-dust@r2');
    worker.network.online = false;

    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 1');
    expect(await text(worker.request('games/steel-and-dust/src/gone-in-r2.js'))).toBe(
      'a module the deploy took away',
    );
  });

  it('opens the next play on the new revision, and lets the old one go then', async () => {
    const worker = await savedThenDeployed();

    await worker.open('games/steel-and-dust/');

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 2');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 2');
    expect(await caught(worker)).toEqual(['game-steel-and-dust@r2']);
  });
});
