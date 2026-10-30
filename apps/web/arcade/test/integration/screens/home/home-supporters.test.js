// @vitest-environment happy-dom
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PAGES_ROOT } from '../../../../../../server/src/paths.js';
import { bootWithRealCatalog, byId, onPage, stopHomes } from '../../../support/home-harness.js';

const linksToSupporters = () =>
  [...document.querySelectorAll('a')].filter((link) => link.href === onPage('supporters/'));

beforeEach(async () => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('the way to the supporters page', () => {
  it('starts at a heart in the top bar, named for screen readers on any screen', async () => {
    await bootWithRealCatalog();
    const link = byId('supporters-link');
    expect(link.closest('.topbar')).not.toBeNull();
    expect(link.getAttribute('aria-label')).toBe('Supporters');
    expect(linksToSupporters()).toContain(link);
  });

  it('is offered again under the library, once the games are in', async () => {
    await bootWithRealCatalog();
    const callout = document.querySelector('.support-callout');
    expect(callout.closest('#library').hidden).toBe(false);
    expect(linksToSupporters().filter((link) => callout.contains(link))).toHaveLength(1);
  });

  it('leads to a real page', async () => {
    const page = await stat(path.join(PAGES_ROOT, 'supporters', 'index.html'));
    expect(page.isFile()).toBe(true);
  });
});
