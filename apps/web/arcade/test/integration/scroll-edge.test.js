// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ARCADE_SRC } from '../../../../server/src/paths.js';
import { SCREENS } from '@/navigation/routes/screens.ts';
import { screenOf, startArcadeAt, stopArcades } from '../support/arcade-harness.js';

// The arcade and every screen over it head with a bar that stays clear as in iOS 26, the screen
// fading out under it behind a soft edge, and frosting over as iOS bars did before where a blur cannot
// be masked. page-motion.test.js holds every page on disk to being a screen, so one added later
// fails here until it does the same. A game keeps its own screens.
const SCROLL_EDGE = path.join(ARCADE_SRC, 'styles', 'scroll-edge.css');

afterEach(stopArcades);

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

it('loads the soft edge for every screen', async () => {
  const shared = await readFile(path.join(ARCADE_SRC, 'styles', 'global-styles.ts'), 'utf8');

  expect(shared).toContain("import './scroll-edge.css';");
});

describe.each(SCREENS.map((screen) => screen.id))('the %s screen', (id) => {
  it('puts the soft edge under its bar', () => {
    startArcadeAt(id);
    const edges = screenOf(id).querySelectorAll('.scroll-edge');

    expect(edges).toHaveLength(1);
    expect(edges[0].matches('header.topbar, header.page-bar'), id).toBe(true);
  });
});
