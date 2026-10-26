import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, vi } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { startArcade } from '../../src/arcade/arcade.js';
import { SCREENS } from '../../src/arcade/routes.js';
import { createMemoryStorage } from '../../src/home/preferences.js';
import { realCatalogJson } from './home-harness.js';
import { samplePayload } from './supporters-harness.js';

export const ORIGIN = 'http://localhost:8765/';

const pathOf = (id) => SCREENS.find((screen) => screen.id === id).path;
const pageFile = (id) => path.join(WEB_ROOT, pathOf(id), 'index.html');
const readPage = (id) => readFile(pageFile(id), 'utf8');

const reply = (body, status = 200) => ({
  ok: status === 200,
  status,
  text: async () => body,
  json: async () => JSON.parse(body),
});

// Stands in for the server: each screen's own page from disk, the real catalog, and a sample list
// of supporters. `fail` names screens whose page does not come.
export function arcadeFetch({ fail = [] } = {}) {
  return vi.fn(async (url) => {
    const { pathname } = new URL(url, window.location.href);
    const screen = SCREENS.find(
      ({ id, path: own }) => `/${own}` === pathname && !fail.includes(id),
    );

    if (pathname === '/api/games') {
      return reply(await realCatalogJson());
    }

    if (pathname === '/api/supporters') {
      return reply(JSON.stringify(samplePayload()));
    }

    return screen ? reply(await readPage(screen.id)) : reply('Not found', 404);
  });
}

export const pageRequests = (fetchFn) =>
  fetchFn.mock.calls
    .map(([url]) => new URL(url, ORIGIN).pathname)
    .filter((pathname) => !pathname.startsWith('/api/'));

const started = [];

// The arcade as a visitor opens it at one of its screens: that screen's page in the document (its
// body only, as happy-dom would fetch the head's files), started as its module would start it.
export async function startArcadeAt(id, { referrer = '', fail } = {}) {
  // happy-dom fetches no stylesheet; each is reported as loaded, as the browser would report it
  window.happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
  window.happyDOM.setURL(`${ORIGIN}${pathOf(id)}`);
  const html = await readPage(id);
  const [, body] = /<body[^>]*>([\s\S]*)<\/body>/.exec(html);
  const fetchFn = arcadeFetch({ fail });
  const navigate = vi.fn();

  expect(body).not.toMatch(/<script|<link/);
  document.body.innerHTML = body;
  document.title = /<title>([^<]*)<\/title>/.exec(html)[1];

  const arcade = startArcade({
    window,
    fetch: fetchFn,
    storage: createMemoryStorage(),
    locale: 'en-US',
    referrer,
    home: { navigate },
  });

  started.push(arcade);

  return { arcade, fetchFn, navigate };
}

export function stopArcades() {
  started.splice(0).forEach((arcade) => arcade.stop());
  window.history.replaceState(null, '');
}

export const screenOf = (id) => document.querySelector(`[data-screen="${id}"]`);
export const showing = () =>
  [...document.querySelectorAll('[data-screen]')]
    .filter((screen) => !screen.hasAttribute('inert'))
    .map((screen) => screen.dataset.screen);

export const tap = (target, init = {}) =>
  target.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }),
  );

// Every screen in, as they are once the browser has been idle a moment.
export const settle = (arcade) =>
  Promise.all([...arcade.screens.values()].map((screen) => screen.ready()));

// The screen change finishes after the page it brings in has its styles; the boots then run.
export const changed = () => new Promise((resolve) => setTimeout(resolve, 0));
