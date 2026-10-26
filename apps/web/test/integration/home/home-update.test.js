// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { clearBannerClasses } from '../../support/fake-analytics.js';
import { createFakeInstaller } from '../../support/fake-installer.js';
import { createFakeWorkers } from '../../support/fake-workers.js';
import {
  boot,
  byId,
  click,
  jsonReply,
  onPage,
  realCatalogJson,
  stopHomes,
  waitUntil,
} from '../../support/home-harness.js';

const banner = () => byId('update');
const holdsOthersBack = () => document.documentElement.classList.contains('has-update-banner');

// The server after a deploy: the real catalog, and version.json naming the build it now holds.
async function serverHolding(version) {
  const catalog = await realCatalogJson();

  return vi.fn(async (url) =>
    new URL(url, window.location.href).pathname === '/version.json'
      ? jsonReply(JSON.stringify({ version }))
      : jsonReply(catalog),
  );
}

// The arcade as its worker kept it, on the build named 'old', with the server holding `served`.
async function openOld(served, options = {}) {
  const fakes = createFakeWorkers();
  const reload = vi.fn();
  const fetchFn = await serverHolding(served);
  const started = await boot(fetchFn, {
    version: 'old',
    workers: fakes.workers,
    reload,
    ...options,
  });

  return { ...started, ...fakes, fetchFn, reload };
}

beforeEach(() => {
  document.body.innerHTML = '';
  clearBannerClasses();
});

afterEach(stopHomes);

describe('the new version banner', () => {
  it('offers to reload once the deploy’s build is all in, and Reload loads the page', async () => {
    const { registration, settle, reload, fetchFn } = await openOld('new');

    expect(fetchFn).toHaveBeenCalledWith(onPage('version.json'), { cache: 'no-cache' });
    await waitUntil(() => expect(registration.installing).not.toBeNull());
    expect(banner().hidden).toBe(true);

    settle('activated');
    await waitUntil(() => expect(banner().hidden).toBe(false));
    expect(banner().querySelector('.install__title').textContent).toBe('New version ready');
    click(byId('update-reload'));
    expect(reload).toHaveBeenCalledOnce();
  });

  it('says nothing while the server holds the build the page runs', async () => {
    const { workers, fetchFn } = await openOld('old');

    await waitUntil(() =>
      expect(fetchFn).toHaveBeenCalledWith(onPage('version.json'), expect.anything()),
    );
    expect(workers.getRegistration).not.toHaveBeenCalled();
    expect(banner().hidden).toBe(true);
    expect(holdsOthersBack()).toBe(false);
  });

  it('goes for this visit on Not now, without reloading', async () => {
    const { settle, reload } = await openOld('new');

    settle('activated');
    await waitUntil(() => expect(banner().hidden).toBe(false));
    click(byId('update-close'));
    expect(banner().hidden).toBe(true);
    expect(holdsOthersBack()).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('takes the banners’ place first, as they come again after the reload', async () => {
    const { settle } = await openOld('new', { installer: createFakeInstaller({ isIos: true }) });
    const readCss = (name) => readFile(path.join(WEB_ROOT, 'src/home', name), 'utf8');

    expect(byId('install').hidden).toBe(false);
    settle('activated');
    await waitUntil(() => expect(holdsOthersBack()).toBe(true));
    expect(await readCss('install.css')).toMatch(
      /:root\.has-update-banner \.install:not\(\.install--update\) \{\s*display: none;/,
    );
    expect(await readCss('consent.css')).toMatch(
      /:root\.has-consent-banner \.install:not\(\.install--consent, \.install--update\)/,
    );
  });
});
