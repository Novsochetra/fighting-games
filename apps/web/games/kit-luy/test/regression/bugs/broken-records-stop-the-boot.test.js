// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

// Reading the records of each way of answering asked `'best' in` of whatever was stored, which
// throws on a number, a string or true, and the page never came up.
describe('a save whose records are not an object', () => {
  it.each([7, 'x', true])('still opens the stall (%s)', (records) => {
    const page = openPage({ records });

    expect(page.view()).toBe('title');
    expect(page.game.records.money.best).toBe(0);
  });
});
