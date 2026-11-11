import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_ROOT } from '../../../../../../server/src/paths.js';
import { startupImages } from '../../../../build-steps/startup-images.js';
import { fileLoadedBy } from '../../../support/arcade-files.js';

const SPLASH_ROOT = path.join(PUBLIC_ROOT, 'assets', 'splash');
const PAGES = [
  '/index.html',
  '/leaderboard/index.html',
  '/supporters/index.html',
  '/credits/index.html',
];

async function pngSize(file) {
  const bytes = await readFile(file);

  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

const linksOf = (pagePath) => startupImages(SPLASH_ROOT).transformIndexHtml('', { path: pagePath });

describe('the installed arcade’s launch screens', () => {
  it('draws each image at its screen’s size in pixels', async () => {
    const names = await readdir(SPLASH_ROOT);

    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      const [, width, height, ratio] = /^splash-(\d+)x(\d+)@(\d)x-(?:dark|light)\.png$/
        .exec(name)
        .map(Number);

      expect(await pngSize(path.join(SPLASH_ROOT, name))).toEqual([width * ratio, height * ratio]);
    }
  });

  it('has every screen held both ways, in both appearances', async () => {
    const shown = (await readdir(SPLASH_ROOT)).map((name) => name.match(/(\d+)x(\d+)(@\dx-\w+)/));
    const portraits = shown.filter(([, width, height]) => Number(width) < Number(height));

    expect(portraits.length * 2).toBe(shown.length);

    for (const [, width, height, ratio] of portraits) {
      expect(shown.some((match) => match[0] === `${height}x${width}${ratio}`)).toBe(true);
    }
  });

  it.each(PAGES)('links every image from %s at an address that reaches it', async (pagePath) => {
    const links = await linksOf(pagePath);

    expect(links).toHaveLength((await readdir(SPLASH_ROOT)).length);

    for (const { attrs } of links) {
      expect((await stat(fileLoadedBy(pagePath, attrs.href))).isFile()).toBe(true);
    }
  });
});
