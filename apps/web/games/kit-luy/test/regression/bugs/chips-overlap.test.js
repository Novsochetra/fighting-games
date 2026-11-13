// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openPage } from '../../support/open-page.js';

const CHIP_WIDTH = 130;
const GAP = 4;

// Chips were set out a fixed 90px apart, and a chip is wider than that, so each covered the
// label of the one before it.
describe('the chips a payment earns', () => {
  afterEach(() => vi.restoreAllMocks());

  it('start side by side, none over another', () => {
    const page = openPage();
    const measure = window.HTMLElement.prototype.getBoundingClientRect;

    vi.spyOn(window.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function box() {
        return this.classList.contains('score-chip')
          ? { left: 0, top: 0, width: CHIP_WIDTH, height: 30 }
          : measure.call(this);
      },
    );
    page.count();
    page.give();
    page.step();

    const starts = [...document.querySelectorAll('.score-chip')].map((chip) =>
      parseFloat(chip.style.getPropertyValue('--from-x')),
    );

    expect(starts.length).toBeGreaterThan(1);
    starts
      .slice(1)
      .forEach((x, i) => expect(x - starts[i]).toBeGreaterThanOrEqual(CHIP_WIDTH + GAP));
  });
});
