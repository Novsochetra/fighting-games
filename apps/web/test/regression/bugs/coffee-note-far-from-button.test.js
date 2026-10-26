import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';

// Bug: on a phone where the coffee note did not fit beside the coffee button, it floated above the
// hero's buttons, so Play, Details and the heart stood between it and the button it speaks for. It
// now sits right above the coffee button, as it does on a wider screen, over those buttons only for
// the few seconds it shows.
const COFFEE_CSS = path.join(WEB_ROOT, 'src', 'home', 'coffee.css');

const phoneRules = (css) => css.slice(css.indexOf('@media (max-width: 40rem)'));

describe('the coffee note on a phone', () => {
  it('sits right above the coffee button where it does not fit beside it', async () => {
    const css = await readFile(COFFEE_CSS, 'utf8');

    expect(css).toMatch(
      /\.coffee-note \{\s*position: fixed;\s*inset-block-end: calc\(\s*max\(var\(--offset-coffee-fab\), env\(safe-area-inset-bottom\)\) \+ var\(--size-coffee-fab\) \+\s*var\(--space-3\)\s*\);/,
    );
    expect(phoneRules(css)).not.toMatch(/\.coffee-note \{/);
  });
});
