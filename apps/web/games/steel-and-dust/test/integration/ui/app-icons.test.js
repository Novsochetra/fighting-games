import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pngSize } from '../../support/png-size.js';

const GAME = new URL('../../../', import.meta.url);
const MANIFEST = new URL('assets/manifest.webmanifest', GAME);
const page = readFileSync(new URL('index.html', GAME), 'utf8');
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const game = JSON.parse(readFileSync(new URL('game.json', GAME), 'utf8'));

const sizeOf = (url) => {
  const { width, height } = pngSize(url);

  return `${width}x${height}`;
};

const iconLinks = () =>
  [...page.matchAll(/<link rel="(icon|apple-touch-icon)"([^>]*)href="([^"]+)"/g)].map(
    ([, rel, attributes, href]) => ({ rel, sizes: attributes.match(/sizes="([^"]+)"/)?.[1], href }),
  );

describe('the game icons', () => {
  it('names icons in the manifest that exist at the size they claim, a maskable one among them', () => {
    for (const icon of manifest.icons) {
      expect(sizeOf(new URL(icon.src, MANIFEST))).toBe(icon.sizes);
    }

    expect(manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual(
      expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']),
    );
  });

  it('links a small tab icon, a large one and the iOS icon, each at the size it claims', () => {
    const links = iconLinks();

    expect(links.map(({ rel, sizes }) => `${rel} ${sizes ?? ''}`.trim())).toEqual([
      'icon 32x32',
      'icon 192x192',
      'apple-touch-icon',
    ]);

    for (const { sizes, href } of links) {
      expect(sizeOf(new URL(href, GAME))).toBe(sizes ?? '180x180');
    }
  });

  it('shows the arcade the same icon the manifest names', () => {
    expect(manifest.icons.map((icon) => `assets/${icon.src}`)).toContain(game.cover);
  });
});
