// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMemoryStorage, STORAGE_KEYS } from '../../../src/home/preferences.js';
import { changed, homeLoaded, screenOf, startArcadeAt, tap } from '../../support/arcade-harness.js';
import {
  bootWithRealCatalog,
  byId,
  restoreFromCache,
  stopHomes,
} from '../../support/home-harness.js';

// Bug: Support on the banner opens the donate sheet, and a gift there is recorded on the device; but
// Back brings the arcade out of the back/forward cache as it was left, banner and all, so it went on
// asking someone who had just given. It looks again on the way back and steps aside after a gift.
// The supporters are now a screen over the arcade, and Back pops to it with no page shown: it looks
// again then too.
function playerBackFromThirdGame() {
  const storage = createMemoryStorage();
  storage.write(STORAGE_KEYS.plays, 3);
  storage.write(STORAGE_KEYS.supportSeenPlays, 2);
  return storage;
}

beforeEach(async () => {
  document.body.innerHTML = '';
  document.documentElement.classList.remove('has-support-banner');
});

afterEach(stopHomes);

describe('the support banner on the way back from a gift', () => {
  it('steps aside once the device has given', async () => {
    const storage = playerBackFromThirdGame();
    await bootWithRealCatalog({ storage, visit: { now: () => 1_000_000 } });
    expect(byId('support').hidden).toBe(false);

    storage.write(STORAGE_KEYS.gaveAt, 1_000_500);
    restoreFromCache();
    expect(byId('support').hidden).toBe(true);
    expect(document.documentElement.classList.contains('has-support-banner')).toBe(false);
  });

  it('steps aside once Back pops to it from a gift on the supporters screen', async () => {
    const storage = playerBackFromThirdGame();

    startArcadeAt('home', { storage, now: () => 1_000_000 });
    await homeLoaded();
    expect(byId('support').hidden).toBe(false);

    tap(byId('support-give'));
    await changed();
    storage.write(STORAGE_KEYS.gaveAt, 1_000_500);
    tap(screenOf('supporters').querySelector('[data-back]'));
    await changed();

    expect(byId('support').hidden).toBe(true);
    expect(document.documentElement.classList.contains('has-support-banner')).toBe(false);
  });
});
