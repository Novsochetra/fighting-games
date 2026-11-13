import { describe, expect, it } from 'vitest';
import {
  assetsHrefFrom,
  startupImageTags,
  startupMedia,
} from '../../../build-steps/startup-images.js';

describe('the launch screens iOS shows an installed arcade', () => {
  it('matches a portrait image to the screen held upright', () => {
    expect(startupMedia('splash-402x874@3x-dark.png')).toBe(
      '(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait) and (prefers-color-scheme: dark)',
    );
  });

  it('matches a landscape image to the same screen turned on its side', () => {
    expect(startupMedia('splash-1376x1032@2x-light.png')).toBe(
      '(device-width: 1032px) and (device-height: 1376px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape) and (prefers-color-scheme: light)',
    );
  });

  it('links only the files named as launch screens', () => {
    const tags = startupImageTags(
      ['.DS_Store', 'splash-375x667@2x.png', 'splash-375x667@2x-light.png'],
      '../assets/splash',
    );

    expect(tags).toEqual([
      {
        tag: 'link',
        attrs: {
          rel: 'apple-touch-startup-image',
          media: startupMedia('splash-375x667@2x-light.png'),
          href: '../assets/splash/splash-375x667@2x-light.png',
        },
        injectTo: 'head',
      },
    ]);
  });

  it('reaches the art from the home page and from a page in a folder', () => {
    expect(assetsHrefFrom('/index.html')).toBe('assets/splash');
    expect(assetsHrefFrom('/credits/index.html')).toBe('../assets/splash');
  });
});
