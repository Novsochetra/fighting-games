import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { APPEARANCE_TRANSITION } from '../../src/home/appearance.js';
import {
  backLinkTarget,
  gamePages,
  modulesOf,
  pagesUnderTheArcade,
  stylesheetsOf,
} from '../support/arcade-pages.js';

// The arcade and every page under it change like screens in an iOS navigation stack, through a view
// transition across documents that both pages of a move must opt in to. The pseudo-elements belong
// to the page arrived at, so the arcade's sheet pops and every other page's pushes. A page under the
// arcade also goes Back through history, so the arcade comes back as it was left. The pages are found
// on disk, so one added later fails here until it does the same. A game keeps its own launch.
const OPTS_IN = /@view-transition\s*\{\s*navigation:\s*auto;?\s*\}/;
const MARK = `:root:not([data-transition='${APPEARANCE_TRANSITION}'])`;

async function motionSheetOf(page) {
  const sheets = (await stylesheetsOf(page)).filter((sheet) => OPTS_IN.test(sheet.css));
  return sheets.length === 1 ? sheets[0] : null;
}

const ARCADE = path.join(WEB_ROOT, 'index.html');
const BACK_LINK = path.join(WEB_ROOT, 'src', 'home', 'back-link.js');
const PAGES = await pagesUnderTheArcade();
const named = (page) => path.relative(WEB_ROOT, page);

describe('the arcade', () => {
  it('pops a page off as it comes back, leaving the light and dark switch to its cross-fade', async () => {
    const { css } = await motionSheetOf(ARCADE);
    expect(css).toMatch(/@keyframes page-pop-out/);
    expect(css).toContain(`${MARK}::view-transition-old(root)`);
    expect(css).toContain(`${MARK}::view-transition-new(root)`);
  });

  it('finds every page under it, the credits and supporters pages among them', () => {
    expect(PAGES.map(named)).toEqual(
      expect.arrayContaining(['credits/index.html', 'supporters/index.html']),
    );
  });
});

describe.each(PAGES.map(named))('the page %s, under the arcade', (name) => {
  const page = path.join(WEB_ROOT, name);

  it('slides in like an iOS screen, leaving the light and dark switch to its cross-fade', async () => {
    const sheet = await motionSheetOf(page);
    expect(sheet, `${name} should load src/home/page-push.css`).not.toBeNull();
    expect(sheet.css).toMatch(/@keyframes page-push-in/);
    expect(sheet.css).toContain(`${MARK}::view-transition-old(root)`);
    expect(sheet.css).toContain(`${MARK}::view-transition-new(root)`);
  });

  it('has a Back link to the arcade that goes back through history', async () => {
    expect(await backLinkTarget(page)).toBe(WEB_ROOT);
    expect((await modulesOf(page)).has(BACK_LINK), `${name} should wire back-link.js`).toBe(true);
  });
});

describe('the games', () => {
  it('keep their own launch and opt in to no slide', async () => {
    const games = await gamePages();
    expect(games.length).toBeGreaterThan(0);
    for (const page of games) {
      expect(await motionSheetOf(page)).toBeNull();
    }
  });
});
