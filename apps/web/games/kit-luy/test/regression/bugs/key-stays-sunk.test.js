// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// A figure typed on the keyboard sank its key on the pad and nothing ever let it up again.
describe('a pad key typed from the keyboard', () => {
  it('comes back up when the key is let go', () => {
    const page = openPage({ settings: { input: 'keypad' } });
    const key = document.querySelector('.key[data-key="5"]');

    page.typeKey('Digit5');
    expect(key.classList.contains('is-pressed')).toBe(true);

    window.dispatchEvent(new window.KeyboardEvent('keyup', { code: 'Digit5' }));
    expect(key.classList.contains('is-pressed')).toBe(false);
  });
});
