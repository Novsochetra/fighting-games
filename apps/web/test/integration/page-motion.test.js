// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { SCREENS } from '../../src/arcade/screens.ts';
import { ORIGIN, screenOf, startArcadeAt, stopArcades } from '../support/arcade-harness.js';
import { gamePages, pagesUnderTheArcade, stylesheetsOf } from '../support/arcade-pages.js';

// The arcade and every page under it are screens of one React app (src/arcade/): each page starts
// the same app and names the screen it opens on, so a tap between them changes the screen in the
// page, sliding like an iOS navigation stack (ScreenStack.tsx); a screen under the arcade goes Back
// to it. The pages are found on disk, so one added later fails here until it does the same. A game
// is a page of its own and keeps its own launch.
const ARCADE = path.join(WEB_ROOT, 'index.html');
const APP = path.join(WEB_ROOT, 'src', 'main.tsx');
const STACK = path.join(WEB_ROOT, 'src', 'arcade', 'stack.css');
const PAGES = [ARCADE, ...(await pagesUnderTheArcade())];
const named = (page) => path.relative(WEB_ROOT, page);
const pathOf = (page) => path.relative(WEB_ROOT, path.dirname(page)).replace(/(.+)$/, '$1/');

async function moduleScriptsOf(page) {
  const html = await readFile(page, 'utf8');

  return [...html.matchAll(/<script type="module" src="([^"]+)"/g)].map((match) =>
    path.resolve(path.dirname(page), match[1]),
  );
}

async function screensIn(page) {
  const html = await readFile(page, 'utf8');

  return [...html.matchAll(/\bdata-screen="([^"]+)"/g)].map((match) => match[1]);
}

afterEach(stopArcades);

describe('the arcade’s screens', () => {
  it('are every page of the arcade found on disk, the supporters and credits among them', () => {
    expect(SCREENS.map((screen) => screen.path).sort()).toEqual(PAGES.map(pathOf).sort());
    expect(PAGES.map(named)).toEqual(
      expect.arrayContaining(['credits/index.html', 'supporters/index.html']),
    );
  });

  it('slide on the navigation tokens, and every screen is its own scroller', async () => {
    const tokens = await readFile(path.join(WEB_ROOT, 'src', 'home', 'tokens.css'), 'utf8');
    const stack = await readFile(STACK, 'utf8');

    for (const token of ['--duration-navigation', '--easing-navigation', '--offset-under']) {
      expect(tokens).toContain(`${token}:`);
    }

    expect(stack).toMatch(/\.screen-layer \{[^}]*overflow: hidden auto;/);
  });
});

describe.each(PAGES.map(named))('the page %s', (name) => {
  const page = path.join(WEB_ROOT, name);

  it('starts the arcade’s app, and nothing of its own', async () => {
    expect(await moduleScriptsOf(page)).toEqual([APP]);
  });

  it('names the one screen it opens on, which the app knows by its path', async () => {
    const screen = SCREENS.find(({ path: own }) => own === pathOf(page));

    expect(await screensIn(page)).toEqual([screen.id]);
  });
});

describe.each(SCREENS.filter((screen) => screen.depth > 0).map((screen) => screen.id))(
  'the %s screen, over the arcade',
  (id) => {
    it('has a Back link to the arcade', () => {
      startArcadeAt(id);

      expect(screenOf(id).querySelector('[data-back]').href).toBe(ORIGIN);
    });
  },
);

describe('the games', () => {
  it('keep their own launch: not the arcade’s app, its screens or its stack', async () => {
    const games = await gamePages();

    expect(games.length).toBeGreaterThan(0);

    for (const page of games) {
      const sheets = (await stylesheetsOf(page)).map((sheet) => sheet.file);

      expect(await moduleScriptsOf(page)).not.toContain(APP);
      expect(sheets).not.toContain(STACK);
      expect(await screensIn(page)).toEqual([]);
    }
  });
});
