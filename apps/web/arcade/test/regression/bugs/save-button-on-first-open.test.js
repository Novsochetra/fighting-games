// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { byId, stopHomes, waitUntil } from '../../support/home-harness.js';
import { bootBeforeTheWorker, fakeSaveWorker } from '../../support/save-worker.js';

// Added to the home screen and opened for the first time, the arcade showed no save button on
// Steel & Dust until the app was closed and opened again. That first page loads before the arcade's
// worker has taken it over, so the home's question about the game's save reached the server, which
// has no such address, and the home never asked again once the worker had the page. It now asks
// again as the worker takes over, and an answer from before then that comes back late is dropped.
const cardSave = () => byId('card-save');
const tileSave = () => byId('tile-save-steel-and-dust');
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
const offered = () =>
  waitUntil(() => {
    expect(cardSave()?.getAttribute('aria-label')).toBe('Save Steel & Dust for offline');
    expect(tileSave()).not.toBeNull();
  });

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('the save button on the arcade’s first open', () => {
  it('shows once the worker takes the page over', async () => {
    const first = await bootBeforeTheWorker(fakeSaveWorker());

    first.answerFromServer();
    await settle();

    expect(cardSave()).toBeNull();
    first.takeOver();
    await offered();
  });

  it('stays when the server’s answer from before the worker comes back after the worker’s', async () => {
    const first = await bootBeforeTheWorker(fakeSaveWorker());

    first.takeOver();
    await offered();
    first.answerFromServer();
    await settle();

    expect(cardSave()).not.toBeNull();
    expect(tileSave()).not.toBeNull();
  });
});
