import { readdir } from 'node:fs/promises';
import path from 'node:path';

const SPLASH_NAME = /^splash-(\d+)x(\d+)@(\d)x-(dark|light)\.png$/;

export function startupMedia(fileName) {
  const match = SPLASH_NAME.exec(fileName);

  if (!match) {
    return null;
  }

  const [width, height, ratio] = match.slice(1, 4).map(Number);
  const appearance = match[4];
  const orientation = width < height ? 'portrait' : 'landscape';

  return [
    `(device-width: ${Math.min(width, height)}px)`,
    `(device-height: ${Math.max(width, height)}px)`,
    `(-webkit-device-pixel-ratio: ${ratio})`,
    `(orientation: ${orientation})`,
    `(prefers-color-scheme: ${appearance})`,
  ].join(' and ');
}

export const startupImageTags = (fileNames, folderHref) =>
  fileNames
    .map((fileName) => ({ fileName, media: startupMedia(fileName) }))
    .filter(({ media }) => media)
    .map(({ fileName, media }) => ({
      tag: 'link',
      attrs: { rel: 'apple-touch-startup-image', media, href: `${folderHref}/${fileName}` },
      injectTo: 'head',
    }));

export const assetsHrefFrom = (pagePath) =>
  path.posix.relative(path.posix.dirname(pagePath), '/assets/splash');

// iOS shows no launch screen for an installed web app but an image the page links for the exact
// screen, orientation and appearance it opens in, so every page names one for each (tools/arcade_splash.py).
export function startupImages(splashRoot) {
  return {
    name: 'arcade-startup-images',
    async transformIndexHtml(_html, { path: pagePath }) {
      const fileNames = (await readdir(splashRoot)).sort();

      return startupImageTags(fileNames, assetsHrefFrom(pagePath));
    },
  };
}
