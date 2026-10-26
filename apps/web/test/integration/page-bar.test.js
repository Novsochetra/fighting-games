// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { stylesheetsOf } from '../support/arcade-pages.js';

// The credits and supporters pages head with the same bar, like an iOS navigation bar: the large
// title hands over to it as it scrolls away, at a point each page sets for its own large title.
const PAGES = ['credits/index.html', 'supporters/index.html'];
const PAGE_BAR = path.join(WEB_ROOT, 'src', 'home', 'page-bar.css');
const RANGE = ['--page-bar-condense-start', '--page-bar-condense-end'];

// Only the body: the head's stylesheet and module links would make happy-dom try to fetch them.
async function loadBody(page) {
  const html = await readFile(page, 'utf8');
  document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)[1];
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe.each(PAGES)('the page %s', (name) => {
  const page = path.join(WEB_ROOT, name);

  it("loads the arcade's page bar and sets where its large title scrolls under it", async () => {
    const sheets = await stylesheetsOf(page);
    expect(sheets.map((sheet) => sheet.file)).toContain(PAGE_BAR);
    const own = sheets.filter((sheet) => sheet.file !== PAGE_BAR).map((sheet) => sheet.css);
    for (const property of RANGE) {
      expect(own.join('\n'), `${name} should set ${property}`).toContain(`${property}:`);
    }
  });

  it('names the page in the bar as in its large title, the small copy hidden from readers', async () => {
    await loadBody(page);
    const title = document.querySelector('.page-bar .page-bar__title');
    expect(title.textContent.trim()).toBe(document.querySelector('h1').textContent.trim());
    expect(title.getAttribute('aria-hidden')).toBe('true');
  });

  it('leads back to the arcade, named even where a phone shows its chevron alone', async () => {
    await loadBody(page);
    const back = document.querySelector('.page-bar > #back');
    expect(back.getAttribute('href')).toBe('../');
    expect(back.getAttribute('aria-label')).toBe('Arcade');
  });
});
