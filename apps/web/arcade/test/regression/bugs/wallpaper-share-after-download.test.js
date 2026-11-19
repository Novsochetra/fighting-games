// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import {
  arcadeFetch,
  screenOf,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../support/arcade-harness.js';
import { waitUntil } from '../../support/render-arcade.tsx';

// Bug: Share always ended on Try again once the wallpaper had been downloaded. The Download link
// asks CloudFront without an Origin, so its copy comes without Access-Control-Allow-Origin, and,
// sent as immutable for a year, the browser kept it and gave it to Share's fetch, which CORS then
// blocked. Fetching past that cache did not help: CloudFront leaves the header off a no-cache ask.
// Share now asks at an address of its own.
const CDN = /^https:\/\/[\w.]+\.cloudfront\.net\/wallpapers\//;
const byId = (id) => document.getElementById(id);

function browserCacheAfterDownload(downloaded) {
  const arcade = arcadeFetch();

  return vi.fn(async (url, options) => {
    if (!CDN.test(url)) {
      return arcade(url);
    }

    if (downloaded.has(url) || options?.cache) {
      throw new TypeError('Failed to fetch');
    }

    return new Response(new Blob(['jpeg']));
  });
}

function onAPhone() {
  const share = vi.fn(async () => {});

  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query === '(pointer: coarse)',
    addEventListener() {},
    removeEventListener() {},
  }));
  Object.assign(navigator, { canShare: () => true, share });

  return share;
}

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
  delete navigator.canShare;
  delete navigator.share;
});

describe('Share after the wallpaper was downloaded', () => {
  it('opens the share sheet rather than asking to try again', async () => {
    const share = onAPhone();

    const downloaded = new Set();
    startArcadeAt('wallpapers', { fetch: browserCacheAfterDownload(downloaded) });
    tap(screenOf('wallpapers').querySelector('[data-wallpaper="kulen-night"]'));
    downloaded.add(byId('wallpaper-download').getAttribute('href'));

    await act(async () => byId('wallpaper-share').click());
    await waitUntil(() => expect(share).toHaveBeenCalledTimes(1));

    expect(byId('wallpaper-share').dataset.state).toBe('idle');
  });
});
