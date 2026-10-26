import { describe, expect, it } from 'vitest';
import { catalogArtEntries } from '../../src/offline/catalog-art.js';
import { GAMES_ROOT, WEB_ROOT } from '../../src/paths.js';

describe('the card art the arcade keeps offline', () => {
  it('names every game’s cover, banner, poster and screenshot, each with its revision', async () => {
    const entries = await catalogArtEntries({ webRoot: WEB_ROOT, gamesRoot: GAMES_ROOT });
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('games/steel-and-dust/assets/screenshots/angkor-wat.png');
    expect(urls).toContain('games/morodok-angkor/assets/key-art/banner.jpg');
    expect(new Set(urls).size).toBe(urls.length);
    expect(entries.every((entry) => /^[0-9a-f]{16}$/.test(entry.revision))).toBe(true);
  });
});
