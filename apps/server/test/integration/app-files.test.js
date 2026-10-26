import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createBuiltFiles } from '../../src/routes/app-files.js';
import { startTestServer } from '../support/test-server.js';

let distRoot;
let server;

// A build as Vite leaves it: the pages, the content-named modules and the art copied as it is.
async function writeBuild(root) {
  const files = {
    'index.html': '<!doctype html><title>Arcade</title>',
    'supporters/index.html': '<!doctype html><title>Supporters</title>',
    'build/main-3f9a1c.js': 'export {};',
    'assets/icons/icon-32.png': 'png',
  };

  for (const [name, body] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), body);
  }
}

beforeAll(async () => {
  distRoot = await mkdtemp(path.join(tmpdir(), 'arcade-dist-'));
  await writeBuild(distRoot);
  server = await startTestServer({ serveFiles: await createBuiltFiles({ distRoot }) });
});

afterAll(async () => {
  await server.close();
  await rm(distRoot, { recursive: true, force: true });
});

const get = (pathname) => fetch(`${server.baseUrl}${pathname}`);

describe('the built arcade', () => {
  it('serves each page of the build, which the browser checks on every visit', async () => {
    for (const [pathname, title] of [
      ['/', 'Arcade'],
      ['/supporters/', 'Supporters'],
    ]) {
      const response = await get(pathname);

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-cache');
      expect(await response.text()).toContain(`<title>${title}</title>`);
    }
  });

  it('lets the browser keep a content-named module for a year, and the art for a visit', async () => {
    const module = await get('/build/main-3f9a1c.js');
    const art = await get('/assets/icons/icon-32.png');

    expect(module.headers.get('content-type')).toBe('text/javascript; charset=utf-8');
    expect(module.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(art.headers.get('cache-control')).toBe('no-cache');
  });

  it('refuses to start without a build', async () => {
    const empty = await mkdtemp(path.join(tmpdir(), 'arcade-unbuilt-'));

    await expect(createBuiltFiles({ distRoot: empty })).rejects.toThrow('run npm run build');
    await rm(empty, { recursive: true, force: true });
  });
});
