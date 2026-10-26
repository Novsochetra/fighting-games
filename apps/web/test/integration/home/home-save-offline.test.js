// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { byId, click, stopHomes, waitUntil } from '../../support/home-harness.js';
import { bootWithSaveWorker, fakeSaveWorker as fakeWorker } from '../../support/save-worker.js';

// The details sheet's Save offline against the arcade's worker.

// the worker is asked again every half second while it saves
const WHILE_SAVING = { timeout: 3000 };

async function bootWith(worker) {
  await bootWithSaveWorker(worker, ['steel-and-dust']);
  click(byId('details-open'));
}

const saveButton = () => byId('details-save');
const shows = (label) =>
  waitUntil(() => expect(saveButton()?.textContent).toBe(label), WHILE_SAVING);

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('saving a game for offline from its details sheet', () => {
  it('offers Save offline beside Play, and downloads nothing until it is tapped', async () => {
    const worker = fakeWorker();

    await bootWith(worker);
    await shows('Save offline');

    expect(saveButton().parentElement).toBe(byId('details-play').parentElement);
    expect(worker.posts).toBe(0);
  });

  it('shows how far the save is, then that the game is saved', async () => {
    const worker = fakeWorker();

    await bootWith(worker);
    await shows('Save offline');
    click(saveButton());
    await shows('Saving 0%');
    worker.status = { state: 'saving', done: 1, total: 4 };
    await shows('Saving 25%');
    worker.status = { state: 'saved' };
    await shows('Remove offline copy');

    expect(byId('details-art').parentElement.querySelector('.offline-tag')).not.toBeNull();
    expect(worker.posts).toBe(1);
  });

  it('asks before removing a saved game, in a sheet of its own', async () => {
    const worker = fakeWorker();

    worker.status = { state: 'saved' };
    await bootWith(worker);
    await shows('Remove offline copy');
    click(saveButton());

    expect(byId('details').open).toBe(false);
    expect(byId('remove-save').open).toBe(true);
    expect(worker.removes).toBe(0);
  });

  it('offers to try again after a save that failed', async () => {
    const worker = fakeWorker();

    worker.status = { state: 'failed' };
    await bootWith(worker);
    await shows('Try again');
    click(saveButton());

    await shows('Saving 0%');
    expect(worker.posts).toBe(1);
  });

  it('offers no save where no worker answers', async () => {
    await bootWith(null);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(saveButton()).toBeNull();
    expect(byId('details-play')).not.toBeNull();
  });
});
