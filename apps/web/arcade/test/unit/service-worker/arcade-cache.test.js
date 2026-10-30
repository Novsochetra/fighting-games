import { describe, expect, it } from 'vitest';
import {
  arcadeCacheName,
  dropOtherArcades,
  fromArcade,
  keepArcade,
} from '@/service-worker/arcade-cache.js';
import { fakeCaches, fakeNetwork } from '../../support/fake-caches.js';

const SCOPE = 'https://arcade.test/';
const MANIFEST = [
  { url: 'index.html', revision: 'a1' },
  { url: 'build/main-3f9a.js', revision: null },
];
const FILES = {
  [`${SCOPE}index.html`]: '<title>Arcade</title>',
  [`${SCOPE}build/main-3f9a.js`]: 'export {};',
};

describe('the arcade’s cache', () => {
  it('is named by the build, so a deploy that changes a file fills a new one', () => {
    const changed = [{ url: 'index.html', revision: 'b2' }, MANIFEST[1]];

    expect(arcadeCacheName(MANIFEST)).toMatch(/^arcade-build-[0-9a-f]+$/);
    expect(arcadeCacheName(MANIFEST)).toBe(arcadeCacheName([...MANIFEST]));
    expect(arcadeCacheName(changed)).not.toBe(arcadeCacheName(MANIFEST));
  });

  it('keeps every file of the build, each checked with the server', async () => {
    const caches = fakeCaches();
    const network = fakeNetwork(FILES);

    await keepArcade({ caches, fetch: network.fetch, manifest: MANIFEST, scope: SCOPE });

    expect(network.requests.map((request) => request.cache)).toEqual(['no-cache', 'no-cache']);
    const page = await fromArcade({ caches, manifest: MANIFEST, scope: SCOPE, key: 'index.html' });

    expect(await page.text()).toBe('<title>Arcade</title>');
  });

  it('fails the install when a file does not come, so the build before stays', async () => {
    const network = fakeNetwork({ [`${SCOPE}index.html`]: 'page' });
    const keeping = keepArcade({
      caches: fakeCaches(),
      fetch: network.fetch,
      manifest: MANIFEST,
      scope: SCOPE,
    });

    await expect(keeping).rejects.toThrow('main-3f9a.js answered 404');
  });

  it('lets the builds before go once the new one takes over, and nothing else', async () => {
    const caches = fakeCaches();

    await caches.open('arcade-build-old');
    await caches.open(arcadeCacheName(MANIFEST));
    await caches.open('arcade-api');
    await caches.open('game-steel-and-dust@1');
    await dropOtherArcades({ caches, manifest: MANIFEST });

    expect(await caches.keys()).toEqual([
      arcadeCacheName(MANIFEST),
      'arcade-api',
      'game-steel-and-dust@1',
    ]);
  });
});
