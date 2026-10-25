// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bootCredits } from '../../../src/credits/boot.js';
import { clickAndSeeIfHeld, loadCreditsMarkup } from '../../support/credits-harness.js';

// Bug: Arcade on the credits page loaded the arcade as a new page, so it came back at the top and
// played its whole entrance again. Opened from the arcade, Back now goes back in history, and the
// browser brings the arcade back as it was left.
const ARCADE = 'http://localhost:8765/';

const booted = [];

function bootFrom(referrer) {
  const history = { length: 3, back: vi.fn() };
  booted.push(bootCredits({ document, history, referrer }));
  return history;
}

const back = () => document.getElementById('back');

beforeEach(async () => {
  window.happyDOM.setURL(`${ARCADE}credits/`);
  document.body.innerHTML = '';
  await loadCreditsMarkup();
});

afterEach(() => booted.splice(0).forEach((page) => page.stop()));

describe('Back on the credits page', () => {
  it('goes back in history to the arcade it was opened from, not to a new copy of it', () => {
    const history = bootFrom(ARCADE);
    expect(clickAndSeeIfHeld(back())).toBe(true);
    expect(history.back).toHaveBeenCalledOnce();
  });

  it('goes back the same way when the arcade was opened under a query', () => {
    const history = bootFrom(`${ARCADE}?from=share`);
    expect(clickAndSeeIfHeld(back())).toBe(true);
    expect(history.back).toHaveBeenCalledOnce();
  });

  it('stays a plain link to the arcade on a page opened on its own', () => {
    const history = bootFrom('');
    expect(clickAndSeeIfHeld(back())).toBe(false);
    expect(history.back).not.toHaveBeenCalled();
  });

  it('stays a plain link after a visit from another page or another site', () => {
    for (const referrer of [`${ARCADE}supporters/`, 'https://www.google.com/']) {
      const history = bootFrom(referrer);
      expect(clickAndSeeIfHeld(back())).toBe(false);
      expect(history.back).not.toHaveBeenCalled();
      booted.splice(0).forEach((page) => page.stop());
    }
  });

  it('leaves a click that opens a new tab to the link', () => {
    const history = bootFrom(ARCADE);
    expect(clickAndSeeIfHeld(back(), { metaKey: true })).toBe(false);
    expect(clickAndSeeIfHeld(back(), { ctrlKey: true })).toBe(false);
    expect(history.back).not.toHaveBeenCalled();
  });
});
