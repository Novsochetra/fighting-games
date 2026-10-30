// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PAGES_ROOT } from '../../../../../server/src/paths.js';
import { clearBannerClasses, createFakeAnalytics } from '../../support/fake-analytics.js';
import { bootWithRealCatalog, byId, click, stopHomes } from '../../support/home-harness.js';

// The arcade's promise: Google hears nothing from a player who has not said yes. Its tag is never in
// the page itself; only google-tag.js adds it, and only after Allow.
beforeEach(async () => {
  document.body.innerHTML = '';
  clearBannerClasses();
});

afterEach(stopHomes);

describe('no tracking before a yes', () => {
  it('keeps Google out of the pages themselves', async () => {
    for (const page of ['index.html', 'supporters/index.html', 'credits/index.html']) {
      const html = await readFile(path.join(PAGES_ROOT, page), 'utf8');
      expect(html).not.toMatch(/googletagmanager|google-analytics|gtag\(/);
    }
  });

  it('loads no tag while the question waits, however the page is used', async () => {
    const { loadTag, setup } = createFakeAnalytics();
    await bootWithRealCatalog({ analytics: setup });
    click(byId('favorite'));
    click(byId('sound-toggle'));
    click(document.querySelector('[data-value="recent"]'));
    click(byId('details-open'));
    expect(loadTag).not.toHaveBeenCalled();
  });
});
