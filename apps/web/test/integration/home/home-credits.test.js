// @vitest-environment happy-dom
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { bootWithRealCatalog, byId, onPage, stopHomes } from '../../support/home-harness.js';
import { claimedAndRealSize } from '../../support/jpeg-size.js';

beforeEach(async () => {
  document.body.innerHTML = '';
  await bootWithRealCatalog();
});

afterEach(stopHomes);

describe('the way to the credits page', () => {
  it('signs off under the library, once the games are in, with who made the arcade', () => {
    const link = byId('credits-link');
    expect(link.closest('#library').hidden).toBe(false);
    expect(onPage(link.getAttribute('href'))).toBe(onPage('credits/'));
    expect(link.querySelector('.made-by__name').textContent).toBe('Nov Sochetra');
  });

  it('comes after the controls, which touch screens hide, so it shows on every screen', () => {
    const link = byId('credits-link');
    expect(link.closest('.hints')).toBeNull();
    expect(document.querySelector('.hints').compareDocumentPosition(link)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("shows the maker's photo, the size of its file", async () => {
    const photo = byId('credits-link').querySelector('.made-by__photo');
    const { claimed, real } = await claimedAndRealSize(photo, path.join(WEB_ROOT, 'index.html'));
    expect(real).toBe(claimed);
  });

  it('leads to a real page', async () => {
    const page = await stat(path.join(WEB_ROOT, 'credits', 'index.html'));
    expect(page.isFile()).toBe(true);
  });
});
