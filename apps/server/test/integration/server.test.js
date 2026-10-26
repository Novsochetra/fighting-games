import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serializeCatalog } from '../../src/catalog/build-catalog.js';
import { loadCatalog } from '../../src/catalog/read-catalog.js';
import { GAMES_ROOT, WEB_ROOT } from '../../src/paths.js';
import { rawRequest, startTestServer } from '../support/test-server.js';

let server;

beforeAll(async () => {
  server = await startTestServer();
});

afterAll(() => server.close());

const get = (pathname, init) => fetch(`${server.baseUrl}${pathname}`, init);

describe('GET /api/games', () => {
  it('returns the real catalog as JSON', async () => {
    const response = await get('/api/games');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json; charset=utf-8');
    const payload = await response.json();
    const steelAndDust = payload.games.find((game) => game.id === 'steel-and-dust');
    expect(steelAndDust).toMatchObject({
      title: 'Steel & Dust',
      path: 'games/steel-and-dust/',
      cover: 'games/steel-and-dust/assets/icons/icon-512.png',
      banner: 'games/steel-and-dust/assets/ui/select/bg-landscape.png',
      poster: 'games/steel-and-dust/assets/ui/select/bg-portrait.png',
      screenshot: 'games/steel-and-dust/assets/screenshots/angkor-wat.png',
    });
  });

  it('sends exactly what the catalog module serializes', async () => {
    const expected = serializeCatalog(await loadCatalog({ gamesRoot: GAMES_ROOT, warn: () => {} }));
    expect(await (await get('/api/games')).text()).toBe(expected);
  });

  it('points every piece of art at an image the server serves', async () => {
    const { games } = await (await get('/api/games')).json();
    const artPaths = games.flatMap((game) => [
      game.cover,
      game.banner,
      game.poster,
      game.screenshot,
    ]);
    for (const artPath of artPaths.filter(Boolean)) {
      const art = await get(`/${artPath}`);
      expect(art.status, artPath).toBe(200);
      expect(art.headers.get('content-type')).toMatch(/^image\//);
    }
  });

  it('answers HEAD with headers and no body', async () => {
    const response = await rawRequest(server.port, '/api/games', 'HEAD');
    expect(response.status).toBe(200);
    expect(Number(response.headers['content-length'])).toBeGreaterThan(0);
    expect(response.body).toBe('');
  });
});

describe('static files from apps/web', () => {
  it('serves the home page at /', async () => {
    const response = await get('/');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('cache-control')).toBe('no-cache');
    expect(await response.text()).toBe(await readFile(path.join(WEB_ROOT, 'index.html'), 'utf8'));
  });

  it.each([
    ['/src/home/appearance-early.js', 'text/javascript; charset=utf-8'],
    ['/src/home/tokens.css', 'text/css; charset=utf-8'],
    ['/games/steel-and-dust/assets/icons/icon-192.png', 'image/png'],
    [
      '/games/steel-and-dust/assets/manifest.webmanifest',
      'application/manifest+json; charset=utf-8',
    ],
    ['/robots.txt', 'text/plain; charset=utf-8'],
    ['/sitemap.xml', 'application/xml; charset=utf-8'],
    ['/assets/social/entry-screen.jpg', 'image/jpeg'],
  ])('serves %s as %s', async (pathname, contentType) => {
    const response = await get(pathname);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(contentType);
  });

  it('redirects a folder URL without the trailing slash', async () => {
    const response = await get('/games/steel-and-dust?from=test', { redirect: 'manual' });
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('/games/steel-and-dust/?from=test');
  });

  it('answers 404 with a short plain text body', async () => {
    const response = await get('/no-such-page.html');
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await response.text()).toBe('Not found\n');
  });

  it.each(['POST', 'PUT', 'DELETE'])('answers %s with 405', async (method) => {
    const response = await get('/', { method });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, HEAD');
  });

  it.each([
    '/..%2f..%2fpackage.json',
    '/games/../../package.json',
    '/%2e%2e/',
    '/%2e%2e/%2e%2e/package.json',
    '/games/steel-and-dust/..%2f..%2f..%2f..%2fpackage.json',
    '/index.html%00.png',
  ])('refuses the traversal attempt %s', async (rawPath) => {
    const response = await rawRequest(server.port, rawPath);
    expect(response.status).toBe(404);
    expect(response.body).toBe('Not found\n');
  });

  it('refuses traversal after fetch normalizes the URL as well', async () => {
    expect((await get('/games/../../package.json')).status).toBe(404);
  });

  it.each([
    '/test/unit/home/navigation.test.js',
    '/games/steel-and-dust/test/',
    '/package.json',
    '/games/steel-and-dust/.DS_Store',
  ])('does not serve the private path %s', async (pathname) => {
    expect((await rawRequest(server.port, pathname)).status).toBe(404);
  });
});
