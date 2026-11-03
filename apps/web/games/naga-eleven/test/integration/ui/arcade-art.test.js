import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { decodePng } from '../../support/png.js';

const GAME = new URL('../../../', import.meta.url);
const MANIFEST = new URL('assets/manifest.webmanifest', GAME);
const game = JSON.parse(readFileSync(new URL('game.json', GAME), 'utf8'));
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const page = readFileSync(new URL('index.html', GAME), 'utf8');

const imageAt = (url) => decodePng(readFileSync(url));
const sizeOf = (image) => `${image.width}x${image.height}`;
const isOpaque = (image) => image.data.every((value, i) => i % 4 !== 3 || value === 255);

const metaContent = (key) =>
  page.match(new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`))?.[1];

describe('the art the arcade shows for the game', () => {
  it.each(['cover', 'banner', 'poster', 'screenshot'])('names an opaque png as its %s', (field) => {
    const image = imageAt(new URL(game[field], GAME));

    expect(game[field]).toMatch(/^assets\/[\w/-]+\.png$/);
    expect(isOpaque(image)).toBe(true);
  });

  // the card and the details sheet show a frame of play at the canvas' own size, and the home page
  // fills its top with the banner, or the poster on a phone, scaled up block by block
  it('has a 16:9 frame of play, a 16:9 banner and a poster as tall as a phone', () => {
    expect(sizeOf(imageAt(new URL(game.screenshot, GAME)))).toBe('768x432');
    expect(sizeOf(imageAt(new URL(game.banner, GAME)))).toBe('384x216');
    expect(sizeOf(imageAt(new URL(game.poster, GAME)))).toBe('216x468');
  });
});

describe('the installed game', () => {
  it('names icons in the manifest that exist at the size they claim, a maskable one among them', () => {
    for (const icon of manifest.icons) {
      expect(sizeOf(imageAt(new URL(icon.src, MANIFEST)))).toBe(icon.sizes);
    }

    expect(manifest.icons.map((icon) => `${icon.sizes} ${icon.purpose}`)).toEqual(
      expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']),
    );
  });

  it('shows the arcade the same icon the manifest names', () => {
    expect(manifest.icons.map((icon) => `assets/${icon.src}`)).toContain(game.cover);
  });

  it('names wide screenshots for the install sheet that exist at the size they claim', () => {
    expect(manifest.screenshots.length).toBeGreaterThan(0);

    for (const shot of manifest.screenshots) {
      expect(sizeOf(imageAt(new URL(shot.src, MANIFEST)))).toBe(shot.sizes);
      expect(shot.form_factor).toBe('wide');
      expect(shot.label).toBeTruthy();
    }
  });
});

describe('the link preview', () => {
  it('describes the share image, the title art, to a reader who cannot see it', () => {
    expect(metaContent('og:image')).toMatch(/assets\/social\/share\.jpg$/);
    expect(metaContent('og:image:alt')).toMatch(/Naga Eleven/);
    expect(metaContent('og:image:alt')).toMatch(/Angkor Wat/);
  });
});
