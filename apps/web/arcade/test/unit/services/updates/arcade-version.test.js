// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { pageVersion, servedVersion } from '@/services/updates/arcade-version.js';
import { servedAs } from '../../../support/fake-workers.js';

const ROOT = new URL('https://arcade.test/arcade/');

afterEach(() => {
  document.head.innerHTML = '';
});

describe('pageVersion', () => {
  it('is the version the build wrote into the page’s head', () => {
    document.head.innerHTML = '<meta name="arcade-version" content="06f31ee" />';

    expect(pageVersion(document)).toBe('06f31ee');
  });

  it('is none on a page Vite serves as it is written', () => {
    expect(pageVersion(document)).toBeNull();
    document.head.innerHTML = '<meta name="arcade-version" content="" />';
    expect(pageVersion(document)).toBeNull();
  });
});

describe('servedVersion', () => {
  it('checks version.json at the arcade’s root with the server, past the browser’s cache', async () => {
    const fetch = servedAs('a1b2c3d');

    expect(await servedVersion(fetch, ROOT)).toBe('a1b2c3d');
    expect(fetch).toHaveBeenCalledWith('https://arcade.test/arcade/version.json', {
      cache: 'no-cache',
    });
  });

  it('is none where the server can’t say: offline, a failed answer, or no version in it', async () => {
    const offline = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const missing = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));

    expect(await servedVersion(offline, ROOT)).toBeNull();
    expect(await servedVersion(missing, ROOT)).toBeNull();
    expect(await servedVersion(servedAs(undefined), ROOT)).toBeNull();
  });
});
