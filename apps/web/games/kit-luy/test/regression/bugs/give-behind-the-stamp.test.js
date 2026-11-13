// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// For a moment after a payment the next customer is served while the paid bill is still in front.
// A wrong count given then was written under the paid bill, and wiped when the next bill came.
describe('a count given while the paid bill is still in front', () => {
  it('is refused on the bill it was judged against', () => {
    const page = openPage();

    page.deal(1000);
    page.give();
    page.step();
    page.deal(page.front().answer === 500 ? 1000 : 500);
    page.give();
    page.step();

    expect(page.text('serial')).toBe('No 0002');
    expect(page.text('mend')).toMatch(/^(Short|Too much)!$/);

    page.wait(400);
    expect(page.text('mend')).toMatch(/^(Short|Too much)!$/);
  });
});
