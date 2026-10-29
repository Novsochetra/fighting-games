// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COFFEE_NOTE_DELAY_MS } from '../../../src/home/use-coffee-note.ts';
import { boot, byId, startHome, stopHomes, tick } from '../../support/home-harness.js';

// Bug: the coffee note pops out a moment after the arcade opens and seats itself by the hero's
// buttons, which come only with the game list. Where the list took longer than that (a phone's
// connection) or did not come at all, the note measured buttons that were not there, and the error
// took the whole arcade off the page.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  document.body.innerHTML = '';
});

afterEach(() => {
  stopHomes();
  vi.useRealTimers();
});

describe('the coffee note, before the games are in', () => {
  it('pops out beside its button and leaves the arcade standing', async () => {
    startHome(() => new Promise(() => {}));

    expect(byId('notice').dataset.tone).toBe('loading');
    tick(COFFEE_NOTE_DELAY_MS);

    expect(byId('coffee-open')).not.toBeNull();
    expect(byId('coffee-note').hidden).toBe(false);
    expect(byId('coffee-note').dataset.spot).toBe('beside');
  });

  it('does the same when the game list does not load', async () => {
    await boot(async () => {
      throw new TypeError('Failed to fetch');
    });

    tick(COFFEE_NOTE_DELAY_MS);

    expect(byId('coffee-open')).not.toBeNull();
    expect(byId('coffee-note').hidden).toBe(false);
  });
});
