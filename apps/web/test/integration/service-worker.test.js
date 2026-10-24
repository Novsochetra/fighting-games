import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';

class FakeUrlPattern {
  constructor(init) {
    this.init = init;
  }
}

// Runs sw.js the way a browser does, as a classic script with its own global scope, and hands back
// the listeners it adds.
async function loadWorker({ scope = 'http://localhost:8765/', fetch = vi.fn() } = {}) {
  const source = await readFile(path.join(WEB_ROOT, 'sw.js'), 'utf8');
  const listeners = new Map();
  const self = {
    registration: { scope },
    skipWaiting: vi.fn(),
    addEventListener: (type, listener) => listeners.set(type, listener),
  };
  vm.runInNewContext(source, { self, fetch, Response, URL, URLPattern: FakeUrlPattern });
  return { self, listeners, fetch };
}

function installWorker(worker, { canRoute = true } = {}) {
  const event = {
    addRoutes: canRoute ? vi.fn(async () => {}) : undefined,
    waitUntil: vi.fn(),
  };
  worker.listeners.get('install')(event);
  return event;
}

function fetchThroughWorker(worker, request) {
  const event = { request, respondWith: vi.fn() };
  worker.listeners.get('fetch')(event);
  return event;
}

describe('the service worker', () => {
  it('sends every game file straight to the network', async () => {
    const worker = await loadWorker();
    const event = installWorker(worker);
    expect(worker.self.skipWaiting).toHaveBeenCalled();
    const [route] = event.addRoutes.mock.calls[0];
    expect(route.source).toBe('network');
    expect(route.condition.urlPattern.init).toEqual({ pathname: '/games/*' });
    expect(event.waitUntil).toHaveBeenCalledOnce();
  });

  it('routes the games under the GitHub Pages sub path too', async () => {
    const worker = await loadWorker({ scope: 'https://example.github.io/fighting-games/' });
    const [route] = installWorker(worker).addRoutes.mock.calls[0];
    expect(route.condition.urlPattern.init).toEqual({ pathname: '/fighting-games/games/*' });
  });

  it('installs in a browser without static routing', async () => {
    const worker = await loadWorker();
    const event = installWorker(worker, { canRoute: false });
    expect(event.waitUntil).not.toHaveBeenCalled();
    expect(worker.self.skipWaiting).toHaveBeenCalled();
  });

  it('loads pages from the network and leaves every other file alone', async () => {
    const page = new Response('<p>arcade</p>');
    const worker = await loadWorker({ fetch: vi.fn(async () => page) });
    const navigation = fetchThroughWorker(worker, { mode: 'navigate', url: 'http://localhost/' });
    await expect(navigation.respondWith.mock.calls[0][0]).resolves.toBe(page);

    const image = fetchThroughWorker(worker, { mode: 'no-cors', url: 'http://localhost/a.png' });
    expect(image.respondWith).not.toHaveBeenCalled();
    expect(worker.fetch).toHaveBeenCalledOnce();
  });

  it('answers a page load that fails offline with a page that says so', async () => {
    const worker = await loadWorker({ fetch: vi.fn(async () => Promise.reject(new TypeError())) });
    const navigation = fetchThroughWorker(worker, { mode: 'navigate', url: 'http://localhost/' });
    const response = await navigation.respondWith.mock.calls[0][0];
    expect(response.status).toBe(503);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    const html = await response.text();
    expect(html).toContain('You are offline');
    expect(html).toContain('Try again');
  });
});
