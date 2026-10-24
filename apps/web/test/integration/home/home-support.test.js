// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage, STORAGE_KEYS } from '../../../src/home/preferences.js';
import { SUPPORT_RESHOW_MS, SUPPORT_SNOOZE_MS } from '../../../src/home/support-offer.js';
import { createFakeInstaller } from '../../support/fake-installer.js';
import {
  bootWithRealCatalog,
  byId,
  click,
  loadHomeMarkup,
  press,
  stopHomes,
} from '../../support/home-harness.js';

const banner = () => byId('support');
const isShown = () => !banner().hidden;

function fanStorage({ plays = 3, gaveAt = null, snoozedUntil = null } = {}) {
  const storage = createMemoryStorage();
  storage.write(STORAGE_KEYS.plays, plays);
  storage.write(STORAGE_KEYS.gaveAt, gaveAt);
  storage.write(STORAGE_KEYS.supportSnoozedUntil, snoozedUntil);
  return storage;
}

function visitFrom({ cameFromGame, time = 1_000_000 }) {
  const clock = { time };
  return { clock, visit: { cameFromGame, now: () => clock.time } };
}

// happy-dom's PageTransitionEvent drops the persisted flag, so the event carries it by hand.
function restoreFromCache() {
  const event = new Event('pageshow');
  Object.defineProperty(event, 'persisted', { value: true });
  window.dispatchEvent(event);
}

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('the support banner', () => {
  it('asks a player who comes back from their third game, and links to the donate sheet', async () => {
    const storage = fanStorage();
    const { visit, clock } = visitFrom({ cameFromGame: true });
    await bootWithRealCatalog({ storage, visit });
    expect(isShown()).toBe(true);
    expect(document.documentElement.classList.contains('has-support-banner')).toBe(true);
    expect(byId('support-give').getAttribute('href')).toBe('supporters/#give');
    expect(storage.read(STORAGE_KEYS.supportSnoozedUntil)).toBe(clock.time + SUPPORT_RESHOW_MS);
  });

  it('stays hidden on arrival, before the third play, and after a gift', async () => {
    await bootWithRealCatalog({ storage: fanStorage(), ...visitFrom({ cameFromGame: false }) });
    expect(isShown()).toBe(false);
    stopHomes();

    await loadHomeMarkup();
    await bootWithRealCatalog({
      storage: fanStorage({ plays: 2 }),
      ...visitFrom({ cameFromGame: true }),
    });
    expect(isShown()).toBe(false);
    stopHomes();

    await loadHomeMarkup();
    await bootWithRealCatalog({
      storage: fanStorage({ gaveAt: 5 }),
      ...visitFrom({ cameFromGame: true }),
    });
    expect(isShown()).toBe(false);
  });

  it('asks on a return through the back/forward cache too', async () => {
    await bootWithRealCatalog({ storage: fanStorage(), ...visitFrom({ cameFromGame: false }) });
    expect(isShown()).toBe(false);
    restoreFromCache();
    expect(isShown()).toBe(true);
  });

  it('goes away for a month on Not now', async () => {
    const storage = fanStorage();
    const { visit, clock } = visitFrom({ cameFromGame: true });
    await bootWithRealCatalog({ storage, visit });
    click(byId('support-close'));
    expect(isShown()).toBe(false);
    expect(document.documentElement.classList.contains('has-support-banner')).toBe(false);
    expect(storage.read(STORAGE_KEYS.supportSnoozedUntil)).toBe(clock.time + SUPPORT_SNOOZE_MS);

    clock.time += SUPPORT_SNOOZE_MS - 1;
    restoreFromCache();
    expect(isShown()).toBe(false);
    clock.time += 1;
    restoreFromCache();
    expect(isShown()).toBe(true);
  });

  it('waits while the install banner is up, so only one asks at a time', async () => {
    const installer = createFakeInstaller({ isIos: true });
    await bootWithRealCatalog({
      installer,
      storage: fanStorage(),
      ...visitFrom({ cameFromGame: true }),
    });
    expect(byId('install').hidden).toBe(false);
    expect(isShown()).toBe(false);
  });

  it('counts each game opened as a play', async () => {
    const storage = fanStorage({ plays: 0 });
    const { navigate } = await bootWithRealCatalog({
      storage,
      ...visitFrom({ cameFromGame: false }),
    });
    press('Enter');
    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(storage.read(STORAGE_KEYS.plays)).toBe(1);
  });
});
