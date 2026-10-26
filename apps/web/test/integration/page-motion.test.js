import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { SCREENS } from '../../src/arcade/routes.js';
import { APPEARANCE_TRANSITION } from '../../src/home/appearance.js';
import {
  backLinkTarget,
  gamePages,
  pagesUnderTheArcade,
  stylesheetsOf,
} from '../support/arcade-pages.js';

// The arcade and every page under it are screens of one page (src/arcade/): each page starts the
// same shell and holds one screen the shell knows by the page's path, so a tap between them changes
// the screen in the page, sliding like an iOS navigation stack; a page under the arcade goes Back
// to it. The pages are found on disk, so one added later fails here until it does the same. A game
// is a page of its own and keeps its own launch.
const ARCADE = path.join(WEB_ROOT, 'index.html');
const SHELL = path.join(WEB_ROOT, 'src', 'arcade', 'main.js');
const SLIDES = path.join(WEB_ROOT, 'src', 'arcade', 'screens.css');
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

describe('the arcade’s screens', () => {
  it('are every page of the arcade found on disk, the supporters and credits among them', () => {
    expect(SCREENS.map((screen) => screen.path).sort()).toEqual(PAGES.map(pathOf).sort());
    expect(PAGES.map(named)).toEqual(
      expect.arrayContaining(['credits/index.html', 'supporters/index.html']),
    );
  });

  it('push and pop like an iOS stack, leaving the light and dark switch to its cross-fade', async () => {
    const css = await readFile(SLIDES, 'utf8');

    for (const kind of ['push', 'pop']) {
      expect(css).toContain(`:root[data-transition='${kind}']::view-transition-old(root)`);
      expect(css).toContain(`:root[data-transition='${kind}']::view-transition-new(root)`);
    }

    expect(css).toMatch(/@keyframes screen-push-in/);
    expect(css).toMatch(/@keyframes screen-pop-out/);
    expect(['push', 'pop']).not.toContain(APPEARANCE_TRANSITION);
  });
});

describe.each(PAGES.map(named))('the page %s', (name) => {
  const page = path.join(WEB_ROOT, name);

  it('starts the arcade’s shell, with its slides, and nothing of its own', async () => {
    const sheets = (await stylesheetsOf(page)).map((sheet) => sheet.file);

    expect(await moduleScriptsOf(page)).toEqual([SHELL]);
    expect(sheets, `${name} should load src/arcade/screens.css`).toContain(SLIDES);
  });

  it('holds the one screen the shell knows by its path', async () => {
    const screen = SCREENS.find(({ path: own }) => own === pathOf(page));

    expect(await screensIn(page)).toEqual([screen.id]);
  });
});

describe.each((await pagesUnderTheArcade()).map(named))('the page %s, under the arcade', (name) => {
  it('has a Back link to the arcade', async () => {
    expect(await backLinkTarget(path.join(WEB_ROOT, name))).toBe(WEB_ROOT);
  });
});

describe('the games', () => {
  it('keep their own launch: no shell, no screen and no slide', async () => {
    const games = await gamePages();

    expect(games.length).toBeGreaterThan(0);

    for (const page of games) {
      const sheets = (await stylesheetsOf(page)).map((sheet) => sheet.file);

      expect(await moduleScriptsOf(page)).not.toContain(SHELL);
      expect(sheets).not.toContain(SLIDES);
      expect(await screensIn(page)).toEqual([]);
    }
  });
});
