// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearBannerClasses, createFakeAnalytics } from '../../support/fake-analytics.js';
import {
  cards,
  jsonReply,
  realCatalogJson,
  settled,
  startHome,
  stopHomes,
} from '../../support/home-harness.js';

// Bug: the deploy that added analytics left the home page empty for browsers that still held the
// older preferences.js (Cloudflare had let browsers keep modules for 4 hours). The new analytics.js
// asked that copy for the analytics answer, a function it did not have, and the boot threw.
vi.mock('@/services/preferences.js', async (importOriginal) => {
  const real = await importOriginal();
  const withoutAnalytics = (preferences) =>
    Object.fromEntries(Object.entries(preferences).filter(([name]) => !/analytics/i.test(name)));
  return {
    ...real,
    createPreferences: (storage) => withoutAnalytics(real.createPreferences(storage)),
  };
});

beforeEach(async () => {
  document.body.innerHTML = '';
  clearBannerClasses();
});

afterEach(stopHomes);

describe('the home page on an older preferences.js', () => {
  it('still boots, shows the games and asks the analytics question', async () => {
    const body = await realCatalogJson();
    const { setup } = createFakeAnalytics();
    startHome(async () => jsonReply(body), { analytics: setup });
    await settled();
    expect(cards().length).toBeGreaterThan(0);
    expect(document.getElementById('consent').hidden).toBe(false);
  });
});
