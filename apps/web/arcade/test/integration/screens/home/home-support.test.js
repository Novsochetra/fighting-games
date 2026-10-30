// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage, STORAGE_KEYS } from '@/services/preferences.js';
import { SUPPORT_RESHOW_MS, SUPPORT_SNOOZE_MS } from '@/screens/home/banners/support-offer.js';
import { createFakeInstaller } from '../../../support/fake-installer.js';
import {
  bootWithRealCatalog,
  byId,
  click,
  press,
  stopHomes,
  waitUntil,
  onPage,
  restoreFromCache,
} from '../../../support/home-harness.js';

const banner = () => byId('support');
const isShown = () => !banner().hidden;

// By default the third game was opened since the banner last looked: a player just back from it.
function fanStorage({ plays = 3, seenPlays = plays - 1, gaveAt = null } = {}) {
  const storage = createMemoryStorage();
  storage.write(STORAGE_KEYS.plays, plays);
  storage.write(STORAGE_KEYS.supportSeenPlays, seenPlays);
  storage.write(STORAGE_KEYS.gaveAt, gaveAt);
  return storage;
}

function clockVisit(time = 1_000_000) {
  const clock = { time };
  return { clock, visit: { now: () => clock.time } };
}

async function bootFan(storage, extra = {}) {
  const { clock, visit } = clockVisit();
  const started = await bootWithRealCatalog({ storage, visit, ...extra });
  return { ...started, clock };
}

async function bootAgain(storage) {
  stopHomes();
  return bootFan(storage);
}

beforeEach(async () => {
  document.body.innerHTML = '';
});

afterEach(() => {
  stopHomes();
  vi.restoreAllMocks();
});

describe('the support banner', () => {
  it('asks a player back from their third game, and links to the donate sheet', async () => {
    const storage = fanStorage();
    const { clock } = await bootFan(storage);
    expect(isShown()).toBe(true);
    expect(document.documentElement.classList.contains('has-support-banner')).toBe(true);
    expect(onPage(byId('support-give').getAttribute('href'))).toBe(onPage('supporters/#give'));
    expect(storage.read(STORAGE_KEYS.supportSnoozedUntil)).toBe(clock.time + SUPPORT_RESHOW_MS);
    expect(storage.read(STORAGE_KEYS.supportSeenPlays)).toBe(3);
  });

  it('stays hidden with no game since it last looked, before the third play, and after a gift', async () => {
    await bootFan(fanStorage({ plays: 5, seenPlays: 5 }));
    expect(isShown()).toBe(false);
    await bootAgain(fanStorage({ plays: 2 }));
    expect(isShown()).toBe(false);
    await bootAgain(fanStorage({ gaveAt: 5 }));
    expect(isShown()).toBe(false);
  });

  it('only takes the count on its first look, so a player is not asked on arrival', async () => {
    const storage = fanStorage({ plays: 7, seenPlays: null });
    await bootFan(storage);
    expect(isShown()).toBe(false);
    expect(storage.read(STORAGE_KEYS.supportSeenPlays)).toBe(7);
  });

  it('asks after a game opened from here, when the browser brings the arcade back', async () => {
    const storage = fanStorage({ plays: 2, seenPlays: 2 });
    const { navigate } = await bootFan(storage);
    expect(isShown()).toBe(false);
    press('Enter');
    await waitUntil(() => expect(navigate).toHaveBeenCalled());
    expect(storage.read(STORAGE_KEYS.plays)).toBe(3);
    restoreFromCache();
    expect(isShown()).toBe(true);
  });

  it('asks after a game when the arcade loads again instead, as after a reload', async () => {
    const storage = fanStorage({ plays: 2, seenPlays: 2 });
    const { home } = await bootFan(storage);
    home.preferences.recordPlay('steel-and-dust');
    await bootAgain(storage);
    expect(isShown()).toBe(true);
  });

  it('goes away for a month on Not now', async () => {
    const storage = fanStorage();
    const { home, clock } = await bootFan(storage);
    click(byId('support-close'));
    expect(isShown()).toBe(false);
    expect(document.documentElement.classList.contains('has-support-banner')).toBe(false);
    expect(storage.read(STORAGE_KEYS.supportSnoozedUntil)).toBe(clock.time + SUPPORT_SNOOZE_MS);

    clock.time += SUPPORT_SNOOZE_MS - 1;
    home.preferences.recordPlay('steel-and-dust');
    restoreFromCache();
    expect(isShown()).toBe(false);
    clock.time += 1;
    home.preferences.recordPlay('steel-and-dust');
    restoreFromCache();
    expect(isShown()).toBe(true);
  });

  it('waits while the install banner is up, so only one asks at a time', async () => {
    await bootFan(fanStorage(), { installer: createFakeInstaller({ isIos: true }) });
    expect(byId('install').hidden).toBe(false);
    expect(isShown()).toBe(false);
  });
});
