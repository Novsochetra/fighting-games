// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// Backspace took back the last piece the page had drawn, kept as each frame showed a deal. A key
// pressed in the same frame as the deal found nothing to take, and the wrong count was given.
describe('Backspace pressed in the frame a piece was dealt', () => {
  it('takes that piece back', () => {
    const page = openPage();

    page.typeKey('Digit3');
    page.typeKey('Digit2');
    page.typeKey('Backspace');
    page.typeKey('Enter');
    page.step();

    expect(document.getElementById('blank').classList.contains('is-paid')).toBe(true);
  });
});
