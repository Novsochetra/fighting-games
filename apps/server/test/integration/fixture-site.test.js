import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '../../src/catalog/read-catalog.js';
import { createFixtureSite } from '../support/fixture-site.js';
import { rawRequest, startTestServer } from '../support/test-server.js';

let site;
let server;
const warn = vi.fn();

beforeAll(async () => {
  site = await createFixtureSite();
  server = await startTestServer({ webRoot: site.webRoot, gamesRoot: site.gamesRoot, warn });
});

afterAll(async () => {
  await server.close();
  await site.remove();
});

describe('a game page', () => {
  it('serves the index.html of a game folder', async () => {
    const response = await fetch(`${server.baseUrl}/games/demo/`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await response.text()).toContain('Demo game');
  });

  it('redirects the folder URL without a slash, then serves the page', async () => {
    const response = await fetch(`${server.baseUrl}/games/demo`);
    expect(response.redirected).toBe(true);
    expect(response.url).toBe(`${server.baseUrl}/games/demo/`);
    expect(response.status).toBe(200);
  });

  it('answers 404 for a folder without index.html', async () => {
    expect((await rawRequest(server.port, '/games/empty/')).status).toBe(404);
  });

  it('answers 404 for a file requested with a trailing slash', async () => {
    expect((await rawRequest(server.port, '/games/demo/cover.png/')).status).toBe(404);
  });

  it('does not redirect a double slash to another host', async () => {
    expect((await rawRequest(server.port, '//games')).status).toBe(404);
  });

  it.each(['/games/demo/test/unit/demo.test.js', '/package.json', '/.env'])(
    'hides %s',
    async (pathname) => {
      expect((await rawRequest(server.port, pathname)).status).toBe(404);
    },
  );
});

describe('the catalog of a games folder', () => {
  it('lists valid games only and warns about the broken one', async () => {
    const response = await fetch(`${server.baseUrl}/api/games`);
    const { games } = await response.json();
    expect(games).toEqual([
      expect.objectContaining({ id: 'demo', path: 'games/demo/', cover: 'games/demo/cover.png' }),
    ]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/^Skipping games\/broken\/game.json: the file is not valid JSON/),
    );
    expect(warn).toHaveBeenCalledWith('Skipping games/empty/game.json: the file is missing');
  });

  it('is empty when the games folder does not exist', async () => {
    const catalog = await loadCatalog({ gamesRoot: `${site.webRoot}/missing`, warn });
    expect(catalog).toEqual({ games: [] });
  });
});
