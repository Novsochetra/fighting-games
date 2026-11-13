import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const GAME = new URL('../../', import.meta.url);
const MANIFEST = new URL('assets/manifest.webmanifest', GAME);
const page = readFileSync(new URL('index.html', GAME), 'utf8');
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const game = JSON.parse(readFileSync(new URL('game.json', GAME), 'utf8'));

// a PNG says its size in its first chunk, at bytes 16 to 23
function pngSize(url) {
  const bytes = readFileSync(url);

  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

const linked = (pattern) => [...page.matchAll(pattern)].map((match) => match[1]);

describe('the game’s files', () => {
  it('names icons in the manifest that exist at the size they claim, a maskable one among them', () => {
    for (const icon of manifest.icons) {
      expect(pngSize(new URL(icon.src, MANIFEST))).toBe(icon.sizes);
    }

    expect(manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual(
      expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']),
    );
  });

  it('links a tab icon at the size it claims and a 180 pixel icon for iPhones', () => {
    expect(pngSize(new URL('assets/icons/icon-32.png', GAME))).toBe('32x32');
    expect(pngSize(new URL('assets/icons/apple-touch-icon.png', GAME))).toBe('180x180');
  });

  it('ships every stylesheet, font and script its page names', () => {
    const files = linked(/(?:href|src)="((?:styles|assets|src)\/[^"]+)"/g);

    expect(files.length).toBeGreaterThan(12);
    expect(files.filter((file) => !existsSync(new URL(file, GAME)))).toEqual([]);
  });

  it('ships every font its stylesheet names, with each family’s licence', () => {
    const css = readFileSync(new URL('styles/fonts.css', GAME), 'utf8');
    const fonts = [...css.matchAll(/url\('\.\.\/(assets\/fonts\/[^']+)'\)/g)].map(
      (match) => match[1],
    );

    expect(fonts).toHaveLength(8);
    expect(fonts.filter((font) => !existsSync(new URL(font, GAME)))).toEqual([]);

    for (const family of ['moul', 'fasthand', 'kantumruy-pro']) {
      expect(existsSync(new URL(`assets/fonts/OFL-${family}.txt`, GAME)), family).toBe(true);
    }
  });

  it('ships the art its catalog entry shows on the arcade’s home page', () => {
    for (const field of ['cover', 'banner', 'poster', 'screenshot']) {
      expect(existsSync(new URL(game[field], GAME)), field).toBe(true);
    }

    expect(pngSize(new URL(game.cover, GAME))).toBe('512x512');
  });

  it('colours the browser around the page as the manifest does', () => {
    const themeColor = page.match(/<meta name="theme-color" content="([^"]+)"/)[1];

    expect(manifest.theme_color).toBe(themeColor);
    expect(manifest.background_color).toBe(themeColor);
  });
});
