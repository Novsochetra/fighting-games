// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONSENT_KEY } from '../../../src/home/analytics.ts';
import { createMemoryStorage, STORAGE_KEYS } from '../../../src/home/preferences.js';
import {
  clearBannerClasses,
  createFakeAnalytics,
  storageWithConsent,
} from '../../support/fake-analytics.js';
import { createFakeInstaller } from '../../support/fake-installer.js';
import { bootWithRealCatalog, byId, click, stopHomes } from '../../support/home-harness.js';

const isAsking = () => !byId('consent').hidden;
const holdsOthersBack = () => document.documentElement.classList.contains('has-consent-banner');

async function bootLive(storage = createMemoryStorage(), options = {}) {
  const analytics = createFakeAnalytics();
  const started = await bootWithRealCatalog({ storage, analytics: analytics.setup, ...options });
  return { ...started, ...analytics, storage };
}

async function bootAgain(storage) {
  stopHomes();
  return bootLive(storage);
}

beforeEach(async () => {
  document.body.innerHTML = '';
  clearBannerClasses();
});

afterEach(stopHomes);

describe('the analytics question', () => {
  it('is never asked off the live site', async () => {
    await bootWithRealCatalog();
    expect(isAsking()).toBe(false);
    expect(byId('privacy-choices').hidden).toBe(true);
  });

  it('comes first on the live site and holds the install and support banners back', async () => {
    const storage = createMemoryStorage();
    storage.write(STORAGE_KEYS.plays, 3);
    storage.write(STORAGE_KEYS.supportSeenPlays, 2);
    const installer = createFakeInstaller({ isIos: true });
    const { loadTag } = await bootLive(storage, { installer });
    expect(isAsking()).toBe(true);
    expect(holdsOthersBack()).toBe(true);
    expect(byId('support').hidden).toBe(true);
    expect(byId('privacy-choices').hidden).toBe(false);
    expect(loadTag).not.toHaveBeenCalled();
  });

  it("loads Google's tag on Allow and never asks again", async () => {
    const { loadTag, tag, storage } = await bootLive();
    click(byId('consent-allow'));
    expect(loadTag).toHaveBeenCalledOnce();
    expect(tag.grant).toHaveBeenCalledOnce();
    expect(isAsking()).toBe(false);
    expect(holdsOthersBack()).toBe(false);
    expect(storage.read(CONSENT_KEY)).toBe('granted');

    const again = await bootAgain(storage);
    expect(isAsking()).toBe(false);
    expect(again.loadTag).toHaveBeenCalledOnce();
  });

  it('loads nothing after No thanks, and asks again from Privacy choices', async () => {
    const { loadTag, storage } = await bootLive();
    click(byId('consent-refuse'));
    expect(isAsking()).toBe(false);
    expect(storage.read(CONSENT_KEY)).toBe('denied');
    click(byId('favorite'));
    expect(loadTag).not.toHaveBeenCalled();

    click(byId('privacy-open'));
    expect(isAsking()).toBe(true);
    click(byId('consent-allow'));
    expect(loadTag).toHaveBeenCalledOnce();
  });

  it('stops sending when a player who said yes says no', async () => {
    const { tag } = await bootLive(storageWithConsent('granted'));
    click(byId('privacy-open'));
    click(byId('consent-refuse'));
    expect(tag.deny).toHaveBeenCalledOnce();
    click(byId('favorite'));
    expect(tag.event).not.toHaveBeenCalled();
  });
});
