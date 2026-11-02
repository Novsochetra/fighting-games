import { describe, expect, it } from 'vitest';
import { iconsOf, withIconVersions } from '../../../build-steps/version-icons.js';

const PAGE = `<head>
    <link rel="manifest" href="assets/manifest.webmanifest" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/icon-32.png" />
    <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png" />
    <link rel="preload" href="assets/icons/icon-32.png" as="image" />
  </head>`;

describe('a page’s icons', () => {
  it('names the tab and home-screen icons the page links, and nothing else', () => {
    expect(iconsOf(PAGE)).toEqual([
      'assets/icons/icon-32.png',
      'assets/icons/apple-touch-icon.png',
    ]);
  });

  it('finds no icons on a page that links none', () => {
    expect(iconsOf('<head><title>No icons</title></head>')).toEqual([]);
  });

  it('puts each icon’s version on its address and leaves the rest of the page as it was', () => {
    const versions = new Map([
      ['assets/icons/icon-32.png', 'a1b2c3d4'],
      ['assets/icons/apple-touch-icon.png', 'e5f6a7b8'],
    ]);

    expect(withIconVersions(PAGE, versions)).toBe(`<head>
    <link rel="manifest" href="assets/manifest.webmanifest" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/icon-32.png?v=a1b2c3d4" />
    <link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png?v=e5f6a7b8" />
    <link rel="preload" href="assets/icons/icon-32.png" as="image" />
  </head>`);
  });
});
