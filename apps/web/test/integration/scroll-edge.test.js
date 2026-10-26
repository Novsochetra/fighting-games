// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { pagesUnderTheArcade, stylesheetsOf } from '../support/arcade-pages.js';

// The arcade and every page under it head with a bar that stays clear as in iOS 26, the page fading
// out under it behind a soft edge, and frosting over as iOS bars did before where a blur cannot be
// masked. The pages are found on disk, so one added later fails here until it does the same. A game
// keeps its own screens.
const SCROLL_EDGE = path.join(WEB_ROOT, 'src', 'home', 'scroll-edge.css');
const ARCADE = path.join(WEB_ROOT, 'index.html');
const PAGES = [ARCADE, ...(await pagesUnderTheArcade())];
const named = (page) => path.relative(WEB_ROOT, page);

// Only the body: the head's stylesheet and module links would make happy-dom try to fetch them.
async function loadBody(page) {
  const html = await readFile(page, 'utf8');
  document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)[1];
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('the soft edge', () => {
  it('blurs what scrolls under a bar behind a mask, coming in at the range each bar sets', async () => {
    const css = await readFile(SCROLL_EDGE, 'utf8');
    expect(css).toMatch(/\.scroll-edge::before \{[^}]*mask-image:/);
    expect(css).toContain('animation-range: var(--scroll-edge-start) var(--scroll-edge-end)');
  });

  it('frosts over with the material where a blur cannot be masked', async () => {
    const css = await readFile(SCROLL_EDGE, 'utf8');
    const fallback = css.slice(css.indexOf('@supports not'));
    expect(fallback).toMatch(/^@supports not \(\s*\(mask-image: none\) and/);
    expect(fallback).toMatch(/\.scroll-edge::before \{[^}]*background: var\(--color-material\)/);
  });
});

describe.each(PAGES.map(named))('the page %s', (name) => {
  const page = path.join(WEB_ROOT, name);

  it('loads the soft edge and puts it under its bar', async () => {
    const sheets = await stylesheetsOf(page);
    expect(sheets.map((sheet) => sheet.file)).toContain(SCROLL_EDGE);
    await loadBody(page);
    const edges = document.querySelectorAll('.scroll-edge');
    expect(edges).toHaveLength(1);
    expect(edges[0].matches('header.topbar, header.page-bar'), name).toBe(true);
  });
});
