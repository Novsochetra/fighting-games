// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// The bill's motions were classes left on it. The stamp's jolt, once there, outranked the tear-in
// and the refusal's wobble, so neither played again after the first payment of a day.
describe('the bill after the first payment', () => {
  it('carries one motion at a time', () => {
    const page = openPage();
    const slip = document.getElementById('slip');
    const motions = () =>
      ['is-torn', 'is-refused', 'is-thumped'].filter((name) => slip.classList.contains(name));

    page.deal(1000);
    page.give();
    page.step();
    expect(motions()).toEqual(['is-thumped']);

    page.wait(300);
    expect(motions()).toEqual(['is-torn']);

    page.deal(page.front().answer === 500 ? 1000 : 500);
    page.give();
    page.step();
    expect(motions()).toEqual(['is-refused']);
  });
});
