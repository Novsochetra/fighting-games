import { describe, expect, it } from 'vitest';
import { QUIET_MS } from '@/service-worker/game-activity.js';
import { GAME, caught, gameAt, save, startWorker, text } from '../../support/offline-worker.js';

// Bug: a play of a saved game after a deploy brought the new revision down, some 13 MB six files at
// a time, right as the game asked the same worker for its own thousand modules, so on a phone the
// game's loading screen waited behind the download. It now waits for the game to stop asking.
describe('a saved game brought fresh as it is played', () => {
  it('downloads the new revision only once the game has stopped asking for its files', async () => {
    const worker = await startWorker();

    await save(worker);
    Object.assign(
      worker.files,
      gameAt('r2', { 'index.html': 'steel & dust 2', 'src/main.js': 'game 2' }),
    );
    worker.network.requests.length = 0;

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 1');
    const downloaded = worker.network.requests.filter(
      ({ address }) => address !== `${GAME}offline.json`,
    );

    expect(downloaded.map(({ at }) => at)).toEqual([QUIET_MS, QUIET_MS]);
    expect(await caught(worker)).toContain('game-steel-and-dust@r2');
  });
});
