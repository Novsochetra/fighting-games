import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GAMES_ROOT, WEB_ROOT } from '../../../server/src/paths.js';
import { APPEARANCE_TRANSITION } from '../../src/home/appearance.js';

// The arcade and the credits page change like screens in an iOS navigation stack, through a view
// transition across documents that both pages must opt in to. Every other page keeps its own way in:
// a game its launch, the supporters page a plain load.
const OPTS_IN = /@view-transition\s*\{\s*navigation:\s*auto;?\s*\}/;

async function stylesheetsOf(page) {
  const html = await readFile(page, 'utf8');
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
    (match) => match[1],
  );
  const local = hrefs.filter((href) => !/^https?:/.test(href));
  return Promise.all(
    local.map(async (href) => {
      const file = path.resolve(path.dirname(page), href);
      return { file, css: await readFile(file, 'utf8') };
    }),
  );
}

async function motionSheetOf(page) {
  const sheets = (await stylesheetsOf(page)).filter((sheet) => OPTS_IN.test(sheet.css));
  return sheets.length === 1 ? sheets[0] : null;
}

async function gamePages() {
  const entries = await readdir(GAMES_ROOT, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));
  const pages = folders.map((entry) => path.join(GAMES_ROOT, entry.name, 'index.html'));
  const present = await Promise.all(
    pages.map((page) =>
      readFile(page).then(
        () => page,
        () => null,
      ),
    ),
  );
  return present.filter(Boolean);
}

const ARCADE = path.join(WEB_ROOT, 'index.html');
const CREDITS = path.join(WEB_ROOT, 'credits', 'index.html');
const SUPPORTERS = path.join(WEB_ROOT, 'supporters', 'index.html');

describe('the move between the arcade and the credits page', () => {
  it('opts both pages in to a transition across documents', async () => {
    expect(await motionSheetOf(ARCADE)).not.toBeNull();
    expect(await motionSheetOf(CREDITS)).not.toBeNull();
  });

  it('pops back to the arcade and pushes on to the credits, each set by the page arrived at', async () => {
    expect((await motionSheetOf(ARCADE)).css).toMatch(/@keyframes page-pop-out/);
    expect((await motionSheetOf(CREDITS)).css).toMatch(/@keyframes page-push-in/);
  });

  it('leaves the light and dark switch, marked by appearance.js, to its cross-fade', async () => {
    const mark = `:root:not([data-transition='${APPEARANCE_TRANSITION}'])`;
    for (const page of [ARCADE, CREDITS]) {
      const { css } = await motionSheetOf(page);
      expect(css).toContain(`${mark}::view-transition-old(root)`);
      expect(css).toContain(`${mark}::view-transition-new(root)`);
    }
  });

  it('leaves the supporters page and every game to load as they did', async () => {
    const games = await gamePages();
    expect(games.length).toBeGreaterThan(0);
    for (const page of [SUPPORTERS, ...games]) {
      expect(await motionSheetOf(page)).toBeNull();
    }
  });
});
