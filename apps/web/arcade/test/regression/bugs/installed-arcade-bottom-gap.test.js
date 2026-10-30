import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARCADE_SRC } from '../../../../../server/src/paths.js';

// Bug: the arcade installed on an iPhone (iOS 26) stopped a status bar's height above the bottom of
// the screen, with a blank band under it. iOS 26 gives an installed web app with viewport-fit=cover
// and the black-translucent status bar a viewport that short while its page is no taller than it
// (WebKit bug 301108), and the screens' stack is exactly the viewport's height. The page now stands
// at least the screen's height there, capped at the large viewport where the status bar is opaque.
const PAGE_CSS = path.join(ARCADE_SRC, 'styles', 'page.css');
const STANDALONE = /@media \(display-mode: standalone\) \{\s*html \{([^}]*)\}/;

describe('the arcade installed on an iPhone', () => {
  it('stands at least as tall as the screen, under the status bar too', async () => {
    const css = await readFile(PAGE_CSS, 'utf8');
    const [, rule = ''] = css.match(STANDALONE) ?? [];

    expect(rule).toContain('min-block-size: min(100lvh, calc(100% + env(safe-area-inset-top)));');
  });
});
