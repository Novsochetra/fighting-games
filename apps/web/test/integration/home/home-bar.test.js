// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { bootWithRealCatalog, byId, onPage, stopHomes } from '../../support/home-harness.js';

// The arcade's bar stays at the top as the arcade scrolls, like an iOS 26 navigation bar, and the
// arcade fades out under it as soon as it passes under (scroll-edge.test.js holds every bar to that).
const TOPBAR = path.join(WEB_ROOT, 'src', 'home', 'topbar.css');
const TOKENS = path.join(WEB_ROOT, 'src', 'home', 'tokens.css');
const RANGE = ['--scroll-home-condense-start', '--scroll-home-condense-end'];

const cssOf = (file) => readFile(file, 'utf8');

beforeEach(async () => {
  document.body.innerHTML = '';
  await bootWithRealCatalog();
});

afterEach(stopHomes);

describe("the arcade's bar", () => {
  it('heads the home outside the hero, so the hero scrolling away leaves it in place', () => {
    const bar = document.querySelector('.topbar');
    expect(byId('home').firstElementChild).toBe(bar);
    expect(bar.nextElementSibling).toBe(byId('hero'));
    expect(byId('hero').contains(bar)).toBe(false);
  });

  it('shows the logo beside the title', () => {
    const logo = document.querySelector('#home-title > img.topbar__logo');

    expect(logo.getAttribute('src')).toBe(onPage('assets/icons/icon-192.png'));
    expect(logo.getAttribute('alt')).toBe('');
  });

  it('keeps the arcade named and its buttons in reach', () => {
    const bar = document.querySelector('.topbar');
    expect(bar.querySelector('h1').id).toBe('home-title');
    expect(byId('hero').getAttribute('aria-labelledby')).toBe('home-title');
    for (const id of ['supporters-link', 'appearance-toggle', 'sound-toggle']) {
      expect(bar.contains(byId(id)), id).toBe(true);
    }
  });

  it('sticks on scroll-driven animations, its edge coming in at a range of its own', async () => {
    const css = await cssOf(TOPBAR);
    expect(css).toBeDefined();
    const pinned = css.slice(css.indexOf('@supports (animation-timeline: scroll())'));
    expect(pinned).toMatch(/\.topbar \{\s*position: sticky;/);
    expect(css).toContain(`--scroll-edge-start: var(${RANGE[0]})`);
    expect(css).toContain(`--scroll-edge-end: var(${RANGE[1]})`);
    for (const property of RANGE) {
      expect(await cssOf(TOKENS)).toContain(`${property}:`);
    }
  });

  it('wears white over the painting in the light appearance, as the hero type does', async () => {
    const tokens = await cssOf(TOKENS);
    expect(tokens).toContain(".topbar:has(+ .hero[data-backdrop='art'])");
  });
});
