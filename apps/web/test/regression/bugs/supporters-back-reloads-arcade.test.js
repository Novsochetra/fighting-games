// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clickAndSeeIfHeld } from '../../support/link-click.js';
import {
  bootPage,
  fakeApi,
  loadSupportersMarkup,
  stopPages,
} from '../../support/supporters-harness.js';

// Bug: Arcade on the supporters page loaded the arcade as a new page, so it came back at the top and
// played its whole entrance again. Opened from the arcade, Back now goes back in history, as on the
// credits page, and the browser brings the arcade back as it was left.
const ARCADE = 'http://localhost:8765/';

async function bootFrom(referrer) {
  const history = { length: 3, back: vi.fn() };
  await bootPage(fakeApi().fetchFn, { visit: { history, referrer } });
  return history;
}

const back = () => document.getElementById('back');

beforeEach(async () => {
  window.happyDOM.setURL(`${ARCADE}supporters/`);
  document.body.innerHTML = '';
  await loadSupportersMarkup();
});

afterEach(() => {
  stopPages();
  vi.restoreAllMocks();
});

describe('Back on the supporters page', () => {
  it('goes back in history to the arcade it was opened from, not to a new copy of it', async () => {
    const history = await bootFrom(ARCADE);
    expect(clickAndSeeIfHeld(back())).toBe(true);
    expect(history.back).toHaveBeenCalledOnce();
  });

  it('stays a plain link after a visit from the credits page or from nowhere', async () => {
    for (const referrer of [`${ARCADE}credits/`, '']) {
      const history = await bootFrom(referrer);
      expect(clickAndSeeIfHeld(back())).toBe(false);
      expect(history.back).not.toHaveBeenCalled();
      stopPages();
    }
  });
});
