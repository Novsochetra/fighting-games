// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

const mouseDown = (element) => {
  const event = new window.MouseEvent('mousedown', { bubbles: true, cancelable: true });

  element.dispatchEvent(event);

  return event;
};

// Clicking a key, a bundle or a pile focused it, so Enter then pressed that button again (an
// extra 000 on the pad, another piece on the cloth) and never gave the count.
describe('a key, bundle or pile pressed with the mouse', () => {
  it('takes no focus away from the counter', () => {
    const page = openPage({ settings: { input: 'keypad' } });

    expect(mouseDown(document.querySelector('.key[data-key="000"]')).defaultPrevented).toBe(true);
    expect(mouseDown(page.bundle(500)).defaultPrevented).toBe(true);
  });
});
