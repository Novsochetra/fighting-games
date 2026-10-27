// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WEB_ROOT } from '../../../../server/src/paths.js';
import { byId, click, stopHomes, waitUntil } from '../../support/home-harness.js';
import { bootWithSaveWorker, fakeSaveWorker } from '../../support/save-worker.js';

// Bugs in the ring that fills around the save button as a game saves for offline:
// - on an iPhone it was drawn smaller than the button, up and to the left of it: WebKit does not
//   stretch an absolutely positioned svg between its insets, so it took the button's width and sat at
//   the top-left inset. The ring now sets its size outright.
// - it filled too fast, whole at about 60%: its stroke was kept from scaling with its viewBox, so it
//   was dashed at the page's scale while its pathLength measured the viewBox's. It now draws at the
//   page's scale.
// - it shared its class names with the details sheet's ring, so the button's styles took the sheet's
//   ring out of its button to the sheet's corner, and the sheet's faded the button's track away.
const SAVE_CSS = path.join(WEB_ROOT, 'src', 'home', 'save-button.css');
const RING = /\.save-button__ring \{([^}]*)\}/;
const AROUND_BUTTON = 'calc(100% + 2 * var(--save-ring-offset))';
const cardSave = () => byId('card-save');

async function saveSteelAndDust() {
  const worker = fakeSaveWorker();
  const named = (name) => expect(cardSave()?.getAttribute('aria-label')).toBe(name);

  await bootWithSaveWorker(worker, ['steel-and-dust']);
  await waitUntil(() => named('Save Steel & Dust for offline'));
  click(cardSave());
  worker.status = { state: 'saving', done: 2, total: 5 };
  await waitUntil(() => named('Saving Steel & Dust for offline, 40%'), { timeout: 3000 });
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('the ring of a saving game', () => {
  it('sets its own size, around the button', async () => {
    const css = await readFile(SAVE_CSS, 'utf8');
    const [, rule = ''] = css.match(RING) ?? [];

    expect(rule).toContain(`inline-size: ${AROUND_BUTTON};`);
    expect(rule).toContain(`block-size: ${AROUND_BUTTON};`);
  });

  it('draws at the page scale, so its dash measures the share saved', async () => {
    const css = await readFile(SAVE_CSS, 'utf8');

    await saveSteelAndDust();

    expect(cardSave().querySelector('.save-button__ring').hasAttribute('viewBox')).toBe(false);
    expect(css).not.toContain('non-scaling-stroke');
  });

  it('keeps its styles apart from the details sheet ring', async () => {
    const css = await readFile(SAVE_CSS, 'utf8');

    await saveSteelAndDust();

    expect(cardSave().querySelector('[class*="save-ring"]')).toBeNull();
    expect(css).not.toMatch(/\.save-ring\b/);
  });
});
