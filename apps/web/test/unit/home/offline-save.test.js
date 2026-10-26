import { describe, expect, it } from 'vitest';
import {
  askSave,
  canSave,
  readSaveStatus,
  saveAddress,
  saveLabel,
  saveName,
  saveTip,
} from '../../../src/home/offline-save.js';

const card = (fields) => ({ id: 'steel-and-dust', href: 'games/steel-and-dust/', ...fields });

describe('a game’s save for offline', () => {
  it('is asked of the arcade’s worker among the arcade’s API, outside the game’s folder', () => {
    expect(saveAddress('steel-and-dust')).toBe('api/offline/steel-and-dust');
  });

  it('is offered for the arcade’s own games, never a teaser or a game on its own site', () => {
    expect(canSave(card())).toBe(true);
    expect(canSave(card({ isComingSoon: true }))).toBe(false);
    expect(canSave(card({ href: 'https://morodokangkor.com/' }))).toBe(false);
    expect(canSave(null)).toBe(false);
  });

  it('reads how far a save is, from none before the worker has read the game’s list', () => {
    expect(readSaveStatus({ state: 'saving', done: 0, total: 0 })).toEqual({
      state: 'saving',
      percent: 0,
    });
    expect(readSaveStatus({ state: 'saving', done: 357, total: 1429 })).toEqual({
      state: 'saving',
      percent: 24,
    });
    expect(readSaveStatus({ state: 'saved' })).toEqual({ state: 'saved', percent: 100 });
  });

  it('knows nothing from an answer that is not the worker’s, such as the games list', () => {
    expect(readSaveStatus({ games: [] })).toBeNull();
    expect(readSaveStatus(null)).toBeNull();
  });

  it('says what a tap does, or how far it has got', () => {
    expect(saveLabel({ state: 'not-saved' })).toBe('Save offline');
    expect(saveLabel({ state: 'saving', percent: 24 })).toBe('Saving 24%');
    expect(saveLabel({ state: 'saved' })).toBe('Remove offline copy');
    expect(saveLabel({ state: 'failed' })).toBe('Try again');
  });
});

describe('a save button’s tooltip and name', () => {
  it('says in one short line what a tap does, or how far the save is', () => {
    expect(saveTip({ state: 'not-saved' })).toBe('Save for offline');
    expect(saveTip({ state: 'saving', percent: 40 })).toBe('Saving… 40%');
    expect(saveTip({ state: 'saved' })).toBe('Remove offline copy');
    expect(saveTip({ state: 'failed' })).toBe('Save failed. Try again');
  });

  it('names the game, since a tile’s button sits among others', () => {
    expect(saveName({ state: 'not-saved' }, 'Steel & Dust')).toBe('Save Steel & Dust for offline');
    expect(saveName({ state: 'saving', percent: 40 }, 'Steel & Dust')).toBe(
      'Saving Steel & Dust for offline, 40%',
    );
    expect(saveName({ state: 'saved' }, 'Steel & Dust')).toBe(
      'Remove the offline copy of Steel & Dust',
    );
    expect(saveName({ state: 'failed' }, 'Steel & Dust')).toBe(
      'Try saving Steel & Dust for offline again',
    );
  });
});

describe('asking the worker', () => {
  it('asks unstored, and saves with a POST', async () => {
    const asked = [];
    const fetch = async (address, init) => {
      asked.push({ address, init });

      return new Response(JSON.stringify({ state: 'not-saved' }));
    };

    await askSave(fetch, 'offline/steel-and-dust');
    await askSave(fetch, 'offline/steel-and-dust', 'POST');

    expect(asked.map(({ init }) => init)).toEqual([
      { method: 'GET', cache: 'no-store' },
      { method: 'POST', cache: 'no-store' },
    ]);
  });

  it('hears nothing where no worker answers, or the network is gone', async () => {
    const notFound = async () => new Response('Not found', { status: 404 });
    const offline = async () => {
      throw new TypeError('Failed to fetch');
    };

    expect(await askSave(notFound, 'offline/steel-and-dust')).toBeNull();
    expect(await askSave(offline, 'offline/steel-and-dust')).toBeNull();
  });
});
