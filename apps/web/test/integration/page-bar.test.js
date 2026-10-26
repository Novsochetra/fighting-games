// @vitest-environment happy-dom
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../server/src/paths.js';
import { SCREENS } from '../../src/arcade/screens.ts';
import { ORIGIN, screenOf, startArcadeAt, stopArcades } from '../support/arcade-harness.js';

// The screens over the arcade head with the same bar, like an iOS navigation bar: the large title
// hands over to it as it scrolls away, at a point each screen sets for its own large title.
const PUSHED = SCREENS.filter((screen) => screen.depth > 0).map((screen) => screen.id);
const SOURCE = path.join(WEB_ROOT, 'src');
const RANGE = ['--page-bar-condense-start', '--page-bar-condense-end'];

async function ownCss(id) {
  const folder = path.join(SOURCE, id);
  const sheets = (await readdir(folder)).filter((name) => name.endsWith('.css'));

  return (await Promise.all(sheets.map((name) => readFile(path.join(folder, name), 'utf8')))).join(
    '\n',
  );
}

afterEach(stopArcades);

it("loads the arcade's page bar for every screen", async () => {
  const shared = await readFile(path.join(SOURCE, 'arcade', 'global-styles.ts'), 'utf8');

  expect(shared).toContain("import '../home/page-bar.css';");
});

describe.each(PUSHED)('the %s screen', (id) => {
  it('sets where its large title scrolls under the bar', async () => {
    const css = await ownCss(id);

    for (const property of RANGE) {
      expect(css, `${id} should set ${property}`).toContain(`${property}:`);
    }
  });

  it('names the screen in the bar as in its large title, the small copy hidden from readers', () => {
    startArcadeAt(id);
    const screen = screenOf(id);
    const title = screen.querySelector('.page-bar .page-bar__title');

    expect(title.textContent.trim()).toBe(screen.querySelector('h1').textContent.trim());
    expect(title.getAttribute('aria-hidden')).toBe('true');
  });

  it('leads back to the arcade, named even where a phone shows its chevron alone', () => {
    startArcadeAt(id);
    const back = screenOf(id).querySelector('.page-bar > [data-back]');

    expect(back.getAttribute('href')).toBe(ORIGIN);
    expect(back.getAttribute('aria-label')).toBe('Arcade');
  });
});
