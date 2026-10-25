import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../../server/src/catalog/read-catalog.js';
import { GAMES_ROOT, WEB_ROOT } from '../../../server/src/paths.js';

// Search engines and link previews want whole addresses, so these name the arcade's domain where
// every other URL in the pages is relative.
const SITE = 'https://www.khmerarcade.games/';

const readWebFile = (relativePath) => readFile(path.join(WEB_ROOT, relativePath));
const readWebText = async (relativePath) => (await readWebFile(relativePath)).toString('utf8');

// A game on its own site is found there; only the pages this server sends belong in the sitemap.
async function pagesServedHere() {
  const { games } = await loadCatalog({ gamesRoot: GAMES_ROOT, warn: () => {} });
  const gamePages = games.filter((game) => game.url === undefined).map((game) => game.path);
  return ['', 'supporters/', ...gamePages];
}

const PAGES = await pagesServedHere();
const GAME_PAGES = PAGES.filter((page) => page.startsWith('games/'));

const metaContent = (html, key) =>
  html.match(new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`))?.[1];
const canonicalOf = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];

// A JPEG keeps its size in its start-of-frame segment (SOF0 to SOF3), height before width.
function jpegSize(bytes) {
  let offset = 2;
  while (offset + 8 < bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xc3) {
      return `${bytes.readUInt16BE(offset + 7)}x${bytes.readUInt16BE(offset + 5)}`;
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  return null;
}

describe('what search engines and link previews see', () => {
  it('lists every page served here in the sitemap, and nothing else', async () => {
    const sitemap = await readWebText('sitemap.xml');
    const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(listed.sort()).toEqual(PAGES.map((page) => `${SITE}${page}`).sort());
  });

  it('points crawlers at the sitemap and blocks nothing', async () => {
    const robots = await readWebText('robots.txt');
    expect(robots).toMatch(new RegExp(`^Sitemap: ${SITE}sitemap\\.xml$`, 'm'));
    // Google renders the home page, whose list of games comes from api/games.
    expect(robots).not.toMatch(/^Disallow:\s*\S/m);
  });

  it.each(PAGES)('gives /%s one canonical address and a large link preview', async (page) => {
    const html = await readWebText(`${page}index.html`);
    expect(canonicalOf(html)).toBe(`${SITE}${page}`);
    expect(metaContent(html, 'og:url')).toBe(`${SITE}${page}`);
    expect(metaContent(html, 'og:title')).toBeTruthy();
    expect(metaContent(html, 'og:description')).toBeTruthy();
    expect(metaContent(html, 'og:image:alt')).toBeTruthy();
    expect(metaContent(html, 'twitter:card')).toBe('summary_large_image');
  });

  it.each(PAGES)('shares /%s with a 1200x630 image the server sends', async (page) => {
    const html = await readWebText(`${page}index.html`);
    const image = metaContent(html, 'og:image');
    expect(image.startsWith(SITE)).toBe(true);
    const size = jpegSize(await readWebFile(image.slice(SITE.length)));
    const claimed = `${metaContent(html, 'og:image:width')}x${metaContent(html, 'og:image:height')}`;
    expect(size).toBe(claimed);
    expect(size).toBe('1200x630');
  });

  it.each(GAME_PAGES)('keeps the share image of /%s in its own folder', async (page) => {
    const image = metaContent(await readWebText(`${page}index.html`), 'og:image');
    expect(image.startsWith(`${SITE}${page}`)).toBe(true);
  });

  it('names the site for search results', async () => {
    const html = await readWebText('index.html');
    const [, json] = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(JSON.parse(json)).toMatchObject({ '@type': 'WebSite', name: 'Retro Arcade', url: SITE });
  });
});
