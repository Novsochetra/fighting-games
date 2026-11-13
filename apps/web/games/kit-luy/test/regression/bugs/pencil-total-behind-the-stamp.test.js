// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// The next customer is served the moment the last is paid, while their bill still waits behind
// the stamp. Pieces counted in that moment were on the cloth, but the new bill was written with
// a pencilled total of nothing, and the player gave short trusting it.
describe('pieces counted while the stamp is still on the last bill', () => {
  it('are in the pencilled total of the next bill', () => {
    const page = openPage();

    page.deal(1000);
    page.give();
    page.step();
    page.deal(500);
    page.deal(500);
    page.wait(300);

    expect(page.text('serial')).toBe('No 0002');
    expect(page.text('total')).toBe('1,000');
  });
});
