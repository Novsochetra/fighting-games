import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGES_ROOT, PUBLIC_ROOT } from '../../../../../../server/src/paths.js';
import { fileAt } from '../../../support/arcade-files.js';

const MANIFEST = path.join(PUBLIC_ROOT, 'assets', 'manifest.webmanifest');

// A PNG keeps its width and height in the first chunk, eight bytes past the signature.
async function pngSize(file) {
  const bytes = await readFile(file);
  expect(bytes.subarray(1, 4).toString('latin1')).toBe('PNG');
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

const readManifest = async () => JSON.parse(await readFile(MANIFEST, 'utf8'));
const readPage = () => readFile(path.join(PAGES_ROOT, 'index.html'), 'utf8');

describe('the arcade as an installable app', () => {
  it('starts the app on the home page and keeps every game inside it', async () => {
    const manifest = await readManifest();
    const base = new URL('https://example.github.io/fighting-games/assets/manifest.webmanifest');
    expect(new URL(manifest.start_url, base).pathname).toBe('/fighting-games/');
    expect(new URL(manifest.scope, base).pathname).toBe('/fighting-games/');
    expect(manifest.name).toBe('Retro Arcade');
    expect(manifest.display).toBe('standalone');
  });

  it('names icons that exist at the size they claim, a maskable one among them', async () => {
    const { icons } = await readManifest();
    for (const icon of icons) {
      expect(await pngSize(path.join(path.dirname(MANIFEST), icon.src))).toBe(icon.sizes);
    }
    const purposes = icons.map((icon) => `${icon.sizes} ${icon.purpose}`);
    expect(purposes).toEqual(
      expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']),
    );
  });

  it('links the manifest, the tab icon and the iOS icon from the home page', async () => {
    const html = await readPage();
    const links = [
      ...html.matchAll(/<link rel="(manifest|icon|apple-touch-icon)"[^>]*href="([^"]+)"/g),
    ];
    expect(links.map(([, rel]) => rel).sort()).toEqual([
      'apple-touch-icon',
      'icon',
      'icon',
      'manifest',
    ]);
    for (const [, , href] of links) {
      expect((await stat(fileAt(href))).isFile()).toBe(true);
    }
    expect(await pngSize(path.join(PUBLIC_ROOT, 'assets', 'icons', 'apple-touch-icon.png'))).toBe(
      '180x180',
    );
    expect(html).not.toContain('href="data:,"');
  });
});
