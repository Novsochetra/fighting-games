// @vitest-environment happy-dom
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import {
  bootWithRealCatalog,
  byId,
  loadHomeMarkup,
  stopHomes,
} from '../../support/home-harness.js';

beforeEach(async () => {
  document.body.innerHTML = '';
  await loadHomeMarkup();
});

afterEach(stopHomes);

describe('the way to the credits page', () => {
  it('signs off under the library, once the games are in, with who made the arcade', async () => {
    await bootWithRealCatalog();
    const link = byId('credits-link');
    expect(link.closest('#library').hidden).toBe(false);
    expect(link.getAttribute('href')).toBe('credits/');
    expect(link.querySelector('.made-by__name').textContent).toBe('Nov Sochetra');
  });

  it('comes after the controls, which touch screens hide, so it shows on every screen', () => {
    const link = byId('credits-link');
    expect(link.closest('.hints')).toBeNull();
    expect(document.querySelector('.hints').compareDocumentPosition(link)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('leads to a real page', async () => {
    const page = await stat(path.join(WEB_ROOT, 'credits', 'index.html'));
    expect(page.isFile()).toBe(true);
  });
});
