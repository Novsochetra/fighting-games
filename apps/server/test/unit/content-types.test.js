import { describe, expect, it } from 'vitest';
import { FALLBACK_CONTENT_TYPE, contentTypeFor } from '../../src/content-types.js';

describe('contentTypeFor', () => {
  it.each([
    ['index.html', 'text/html; charset=utf-8'],
    ['src/home/main.js', 'text/javascript; charset=utf-8'],
    ['src/home/page.css', 'text/css; charset=utf-8'],
    ['games/demo/game.json', 'application/json; charset=utf-8'],
    ['assets/icons/icon-192.png', 'image/png'],
    ['assets/logo.svg', 'image/svg+xml'],
    ['assets/manifest.webmanifest', 'application/manifest+json; charset=utf-8'],
    ['assets/fonts/pixel.woff2', 'font/woff2'],
    ['favicon.ico', 'image/x-icon'],
    ['robots.txt', 'text/plain; charset=utf-8'],
    ['sitemap.xml', 'application/xml; charset=utf-8'],
  ])('serves %s as %s', (filePath, expected) => {
    expect(contentTypeFor(filePath)).toBe(expected);
  });

  it('ignores the case of the extension', () => {
    expect(contentTypeFor('COVER.PNG')).toBe('image/png');
  });

  it('falls back to a download type for unknown or missing extensions', () => {
    expect(contentTypeFor('archive.xyz')).toBe(FALLBACK_CONTENT_TYPE);
    expect(contentTypeFor('api/games')).toBe(FALLBACK_CONTENT_TYPE);
  });
});
