// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// A change of language or numerals wrote the bill again from scratch: the pencilled total of the
// pieces on the cloth went blank, and a "Short!" just written was wiped.
describe('changing the numerals with pieces on the cloth', () => {
  it('writes the pencilled total again in the new numerals', () => {
    const page = openPage();

    page.deal(500);
    page.step();
    page.click('#app [data-act="settings"]');
    page.click('[data-setting="numerals"]');

    expect(page.text('total')).toBe('៥០០');
    expect(page.text('serial')).toBe('No ០០០១');
  });

  it('keeps what the seller was just told', () => {
    const page = openPage();

    page.deal(500);
    page.give();
    page.step();
    page.click('#app [data-act="settings"]');
    page.click('[data-setting="lang"]');

    expect(page.text('mend')).toBe('Short!');
  });
});
