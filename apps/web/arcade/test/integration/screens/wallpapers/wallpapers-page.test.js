// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import {
  arcadeFetch,
  changed,
  homeLoaded,
  screenOf,
  showing,
  startArcadeAt,
  stopArcades,
  tap,
} from '../../../support/arcade-harness.js';
import { waitUntil } from '../../../support/render-arcade.tsx';

const CDN = /^https:\/\/[\w.]+\.cloudfront\.net\/wallpapers\//;

let screen = null;

const one = (selector) => screen.querySelector(selector);
const all = (selector) => [...screen.querySelectorAll(selector)];
const tiles = () => all('.wallpaper-tile');
const byId = (id) => document.getElementById(id);

function openWallpapers(ports) {
  startArcadeAt('wallpapers', ports);
  screen = screenOf('wallpapers');
}

function openTile(id) {
  tap(one(`[data-wallpaper="${id}"]`));

  return byId('wallpaper-sheet');
}

// a phone: a touch screen whose browser can share a file, and the CloudFront file it fetches
function onAPhone() {
  const share = vi.fn(async () => {});
  const shared = arcadeFetch();
  const fetchFile = vi.fn(async (url) =>
    CDN.test(url) ? new Response(new Blob(['jpeg'])) : shared(url),
  );

  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query === '(pointer: coarse)',
    addEventListener() {},
    removeEventListener() {},
  }));
  Object.assign(navigator, { canShare: () => true, share });

  return { share, fetchFile };
}

afterEach(() => {
  stopArcades();
  vi.restoreAllMocks();
  delete navigator.canShare;
  delete navigator.share;
});

describe('the wallpapers page', () => {
  it('names itself in the large title and in the bar that takes over from it', () => {
    openWallpapers();
    expect(one('h1').textContent).toBe('Wallpapers');
    expect(one('#wallpapers-bar-title').textContent).toBe('Wallpapers');
  });

  it('shows every wallpaper small from CloudFront, loading those below the first rows late', () => {
    openWallpapers();
    const images = all('.wallpaper-tile__image');

    expect(images).toHaveLength(24);
    for (const image of images) {
      expect(image.getAttribute('src')).toMatch(CDN);
      expect(image.getAttribute('srcset')).toMatch(/ 640w, .* 1280w$/);
    }
    expect(images.slice(0, 8).every((image) => image.loading === 'eager')).toBe(true);
    expect(images.slice(8).every((image) => image.loading === 'lazy')).toBe(true);
  });

  it('shows only the day or the night ones when asked', () => {
    openWallpapers();
    tap(one('#wallpaper-mood [data-value="night"]'));
    expect(tiles()).toHaveLength(13);
    tap(one('#wallpaper-mood [data-value="day"]'));
    expect(tiles()).toHaveLength(11);
    tap(one('#wallpaper-mood [data-value="all"]'));
    expect(tiles()).toHaveLength(24);
  });

  it('opens a wallpaper with its original PNG for a computer, and its phone cut on asking', () => {
    openWallpapers();
    const sheet = openTile('kulen-night');

    expect(sheet.open).toBe(true);
    expect(byId('wallpaper-title').textContent).toBe('Kulen');
    expect(byId('wallpaper-download').getAttribute('href')).toMatch(
      /kulen-night\/desktop-\w+\.png$/,
    );
    expect(byId('wallpaper-size').textContent).toMatch(/^Original PNG · 7680 × 4320 · [\d.]+ MB$/);

    tap(byId('wallpaper-shape').querySelector('[data-value="phone"]'));
    expect(byId('wallpaper-download').getAttribute('href')).toMatch(/kulen-night\/phone-\w+\.jpg$/);
    expect(byId('wallpaper-preview').getAttribute('src')).toMatch(/phone-view-\w+\.webp$/);
    expect(byId('wallpaper-share')).toBeNull();
  });

  it('loads the other cut only once asked for, then keeps both to fade from one to the other', () => {
    openWallpapers();
    openTile('entry-sunset');
    const cuts = () =>
      all('.wallpaper-preview__image').map((cut) => [cut.dataset.shape, cut.dataset.active]);

    expect(cuts()).toEqual([['desktop', 'true']]);
    tap(byId('wallpaper-shape').querySelector('[data-value="phone"]'));
    expect(cuts()).toEqual([
      ['desktop', 'false'],
      ['phone', 'true'],
    ]);
    expect(one('.wallpaper-preview__image[data-active="false"]').getAttribute('alt')).toBe('');
  });

  it('opens on the phone cut on a phone, and shares the phone file to save to Photos', async () => {
    const { share, fetchFile } = onAPhone();

    openWallpapers({ fetch: fetchFile });
    openTile('kulen-night');
    expect(byId('wallpaper-size').textContent).toMatch(/^JPEG · 1440 × 3120/);

    await act(async () => byId('wallpaper-share').click());
    await waitUntil(() => expect(share).toHaveBeenCalledTimes(1));

    const [{ files }] = share.mock.calls[0];
    expect(files[0].name).toBe('retro-arcade-kulen-night-phone.jpg');
    expect(fetchFile).toHaveBeenCalledWith(expect.stringMatching(/kulen-night\/phone-\w+\.jpg$/));
  });

  it('is pushed over the arcade from the card under its library', async () => {
    startArcadeAt('home');
    await homeLoaded();
    tap(byId('wallpapers-link'));
    await changed();

    expect(showing()).toEqual(['wallpapers']);
    expect(screenOf('home')).not.toBeNull();
  });
});
