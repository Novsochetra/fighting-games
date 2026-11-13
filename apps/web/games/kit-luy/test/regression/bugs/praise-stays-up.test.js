// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

const shown = () => document.getElementById('praise').classList.contains('is-shown');

// The praise only faded by its animation, so with reduced motion, which has none, it stayed over
// the customers all day and on the next day's title.
describe('the praise for a quick payment', () => {
  it('goes once it has been read, motion or none', () => {
    const page = openPage();

    page.serve();
    page.count();
    page.give();
    page.step();
    expect(shown()).toBe(true);

    page.wait(1500);
    expect(shown()).toBe(false);
  });

  it('goes when the stall opens again', () => {
    const page = openPage();

    page.serve();
    page.count();
    page.give();
    page.step();
    page.game.run.strikes = 2;
    page.game.run.patience.left = 1;
    page.wait(3000);
    page.click('#m-over [data-act="again"]');
    page.step();

    expect(shown()).toBe(false);
  });
});
