import { describe, expect, it } from 'vitest';
import {
  caught,
  gameAt,
  json,
  SAVE,
  save,
  startWorker,
  text,
} from '../../support/offline-worker.js';

// Bug: a download reads the game's list (its revision and files) once, then each file. A deploy
// that landed in between had its files come down under the old revision's name, which was then
// marked whole, so a play mixed two deploys, which a download was never to do.
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

async function saveAcrossADeploy() {
  const worker = await startWorker();
  const listRead = Promise.withResolvers();
  const filesHeld = Promise.withResolvers();

  worker.network.hold = listRead.promise;
  const saving = save(worker);

  await settle();
  // the list is answered, and the files wait while the server deploys
  worker.network.hold = filesHeld.promise;
  listRead.resolve();
  await settle();
  Object.assign(
    worker.files,
    gameAt('r2', { 'index.html': 'steel & dust 2', 'src/main.js': 'game 2' }),
  );
  filesHeld.resolve();
  await saving;

  return worker;
}

describe('a game saved as a deploy lands', () => {
  it('keeps the deploy’s revision whole, never the one it started on mixed with it', async () => {
    const worker = await saveAcrossADeploy();

    expect(await caught(worker)).toEqual(['game-steel-and-dust@r2']);
    expect(await json(worker.request(SAVE))).toEqual({ state: 'saved' });
    worker.network.online = false;

    expect(await text(worker.open('games/steel-and-dust/'))).toBe('steel & dust 2');
    expect(await text(worker.request('games/steel-and-dust/src/main.js'))).toBe('game 2');
  });
});
