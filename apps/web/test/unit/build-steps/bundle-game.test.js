import { describe, expect, it } from 'vitest';
import { entriesOf, pointAtBundles } from '../../../build-steps/bundle-game.js';

const PAGE = `<head>
    <link rel="stylesheet" href="styles/page.css" />
    <script type="module" src="src/boot/boot-watch.js"></script>
    <script type="module" src="src/main.js"></script>
  </head>`;

describe('a game page and its bundles', () => {
  it('names the page’s module scripts in the order it runs them', () => {
    expect(entriesOf(PAGE)).toEqual(['src/boot/boot-watch.js', 'src/main.js']);
  });

  it('finds no scripts to bundle on a page without any', () => {
    expect(entriesOf('<head><title>Art only</title></head>')).toEqual([]);
  });

  it('points each script at its bundle and leaves the rest of the page as it was', () => {
    const bundles = new Map([
      ['src/boot/boot-watch.js', 'build/src-boot-boot-watch-a1.js'],
      ['src/main.js', 'build/src-main-b2.js'],
    ]);

    expect(pointAtBundles(PAGE, bundles)).toBe(`<head>
    <link rel="stylesheet" href="styles/page.css" />
    <script type="module" src="build/src-boot-boot-watch-a1.js"></script>
    <script type="module" src="build/src-main-b2.js"></script>
  </head>`);
  });
});
