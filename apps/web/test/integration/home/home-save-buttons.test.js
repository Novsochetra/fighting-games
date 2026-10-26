// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { byId, click, press, stopHomes, waitUntil } from '../../support/home-harness.js';
import { bootWithSaveWorker, fakeSaveWorker } from '../../support/save-worker.js';

// The round save buttons floating on the center card's corner and on each tile, against the
// arcade's worker.

// the worker is asked again every half second while it saves
const WHILE_SAVING = { timeout: 3000 };
const cardSave = () => byId('card-save');
const tileSave = (id = 'steel-and-dust') => byId(`tile-save-${id}`);
const named = (button, name) =>
  waitUntil(() => expect(button()?.getAttribute('aria-label')).toBe(name), WHILE_SAVING);
const tipOf = (button) => button.querySelector('.save-tip').textContent;
const iconOf = (button) => button.querySelector('.icon path').getAttribute('d');
const tagOn = (frame) => frame?.querySelector('.offline-tag')?.textContent ?? null;
const centerFrame = () => document.querySelector('#carousel-track .card.is-center .card__frame');
const tileFrame = () => document.querySelector('#library-grid .tile .tile__frame');
const ringShare = (button) =>
  Number(button.querySelector('.save-ring__value')?.style.strokeDashoffset ?? NaN);

async function bootSteelAndDust(worker) {
  await bootWithSaveWorker(worker, ['steel-and-dust']);
  await named(cardSave, 'Save Steel & Dust for offline');
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('the save buttons on the home screen', () => {
  it('float on the center card and on the tile, with a one-line tooltip of what a tap does', async () => {
    const worker = fakeSaveWorker();

    await bootSteelAndDust(worker);

    expect(cardSave().parentElement).toBe(byId('carousel'));
    expect(tileSave().parentElement.querySelector('.tile')).not.toBeNull();
    expect(byId('favorite').nextElementSibling).toBeNull();
    expect(tipOf(cardSave())).toBe('Save for offline');
    expect(cardSave().querySelector('.save-tip').getAttribute('aria-hidden')).toBe('true');
    expect(tagOn(centerFrame())).toBeNull();
    expect(worker.posts).toBe(0);
  });

  it('fill a ring around the button as the game saves, the tile and the sheet with it', async () => {
    const worker = fakeSaveWorker();

    await bootSteelAndDust(worker);
    click(cardSave());
    await named(tileSave, 'Saving Steel & Dust for offline, 0%');
    worker.status = { state: 'saving', done: 2, total: 4 };
    await named(cardSave, 'Saving Steel & Dust for offline, 50%');

    expect(ringShare(cardSave())).toBe(50);
    expect(tipOf(cardSave())).toBe('Saving… 50%');
    click(cardSave());
    click(byId('details-open'));
    await waitUntil(() => expect(byId('details-save').textContent).toBe('Saving 50%'));
    const saveIcon = iconOf(tileSave());

    worker.status = { state: 'saved' };
    await named(tileSave, 'Remove the offline copy of Steel & Dust');

    expect(cardSave().querySelector('.save-ring')).toBeNull();
    expect(iconOf(cardSave())).not.toBe(saveIcon);
    expect(tipOf(cardSave())).toBe('Remove offline copy');
    expect(worker.posts).toBe(1);
  });

  it('tag a saved game Available offline, and ask before removing it with the trash can', async () => {
    const worker = fakeSaveWorker();

    worker.status = { state: 'saved' };
    await bootWithSaveWorker(worker, ['steel-and-dust']);
    await named(tileSave, 'Remove the offline copy of Steel & Dust');

    expect(tagOn(centerFrame())).toBe('Available offline');
    expect(tagOn(tileFrame())).toBe('Available offline');
    click(tileSave());

    expect(byId('remove-save').open).toBe(true);
    expect(byId('remove-save-text').textContent).toMatch(/^Steel & Dust will need the internet/);
    click(byId('remove-save-cancel'));
    await waitUntil(() => expect(byId('remove-save').open).toBe(false));

    expect(worker.removes).toBe(0);
    click(cardSave());
    click(byId('remove-save-confirm'));
    await named(cardSave, 'Save Steel & Dust for offline');

    expect(worker.removes).toBe(1);
    expect(tileSave().getAttribute('aria-label')).toBe('Save Steel & Dust for offline');
    expect(tagOn(centerFrame())).toBeNull();
    expect(tagOn(tileFrame())).toBeNull();
  });

  it('show only for the arcade’s own games, and only where its worker answers', async () => {
    await bootWithSaveWorker(fakeSaveWorker());
    await waitUntil(() => expect(tileSave()).not.toBeNull());

    expect(tileSave('morodok-angkor')).toBeNull();
    while (byId('spotlight-title').textContent !== 'Morodok Angkor') {
      press('ArrowRight');
    }
    await waitUntil(() => expect(cardSave()).toBeNull());
    stopHomes();
    document.body.innerHTML = '';
    await bootWithSaveWorker(null, ['steel-and-dust']);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(cardSave()).toBeNull();
    expect(tileSave()).toBeNull();
  });
});
