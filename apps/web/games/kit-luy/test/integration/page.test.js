// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { TUNING } from '../../src/data/tuning.js';
import { openPage } from '../support/open-page.js';

describe('the stall on its page', () => {
  it('opens on the title with the first customer’s bill and the four everyday bundles', () => {
    const page = openPage({ records: { best: 42000, bestServed: 20, plays: 3 } });

    expect(page.view()).toBe('title');
    expect(page.openMenu()).toBeNull();
    expect(page.text('sum')).toBe('500+500');
    expect(page.text('signBest')).toBe('Best day: 42,000៛');
    expect(document.querySelectorAll('.bundle:not(.is-bare)')).toHaveLength(4);
    expect(document.querySelectorAll('.guest')).toHaveLength(2);
  });

  it('opens in Khmer, in Khmer numerals, for a player who chose them', () => {
    const page = openPage({ settings: { lang: 'km', numerals: 'khmer' } });

    expect(document.documentElement.lang).toBe('km');
    expect(page.text('give')).toBe('ឲ្យលុយ');
    expect(page.text('sum')).toBe('៥០០+៥០០');
    expect(document.querySelector('.bundle[data-value="5000"] .piece').textContent).toBe('៥០០០');
  });

  it('holds the clock until the first customer is paid: paying them starts the day', () => {
    const page = openPage();

    page.wait(20000);
    expect(page.game.run.elapsed).toBe(0);

    page.deal(1000);
    page.give();
    page.step();
    expect(page.view()).toBe('play');

    page.wait(1000);
    expect(page.game.run.elapsed).toBeGreaterThan(900);
  });

  it('lays each piece dealt on the cloth, fanned in a pile with its count, and pencils the total', () => {
    const page = openPage();

    page.deal(500);
    page.deal(500);
    page.step();

    const pile = document.querySelector('.pile[data-value="500"]');

    expect(pile.querySelectorAll('.piece')).toHaveLength(2);
    expect(pile.querySelector('.pile-count').textContent).toBe('×2');
    expect(page.text('total')).toBe('1,000');
  });

  it('takes a piece back off the cloth when its pile is tapped', () => {
    const page = openPage();

    page.deal(500);
    page.deal(1000);
    page.step();
    page.take(500);
    page.step();

    expect(document.querySelector('.pile[data-value="500"]')).toBeNull();
    expect(page.text('total')).toBe('1,000');
  });

  it('stamps a right count, says what it earned, and brings the next bill', () => {
    const page = openPage();

    page.deal(1000);
    page.give();
    page.step();
    expect(document.getElementById('blank').classList.contains('is-paid')).toBe(true);
    expect(page.text('mend')).toBe('+1,500៛  neat  quick');

    page.wait(320);
    expect(page.text('serial')).toBe('No 0002');
    expect(document.getElementById('blank').classList.contains('is-paid')).toBe(false);
    expect(document.querySelectorAll('.pile')).toHaveLength(0);
  });

  it('refuses a wrong count, says it is short, and leaves the pieces to be put right', () => {
    const page = openPage();

    page.deal(500);
    page.give();
    page.step();

    expect(page.text('mend')).toBe('Short!');
    expect(document.querySelector('.pile[data-value="500"]')).not.toBeNull();

    page.wait(TUNING.wrongLockMs + 50);
    page.deal(500);
    page.give();
    page.step();
    expect(page.text('mend')).toMatch(/^\+/);
  });

  it('says by how much from the second wrong count on a bill', () => {
    const page = openPage();

    page.deal(500);
    page.give();
    page.wait(TUNING.wrongLockMs + 50);
    page.give();
    page.step();

    expect(page.text('mend')).toBe('Short 500៛');
  });

  it('seats each customer who walks up, and rolls the takings up on the sign', () => {
    const page = openPage();

    page.serve();
    page.wait(TUNING.firstArrivalMs);

    expect(document.querySelectorAll('.guest').length).toBeGreaterThanOrEqual(3);
    expect(page.text('takings')).toBe('1,500៛');
  });

  it('closes when a customer finds every stool taken, then brings the shutter down on the tally', () => {
    const page = openPage();

    page.serve();
    page.wait(60000);
    expect(page.view()).toBe('over');

    page.wait(1200);
    expect(page.openMenu()).toBe('m-over');
    expect(page.text('overServed')).toBe('1 customers served');
    expect(page.text('overTakings')).toBe('1,500៛');
    expect(page.text('overStamp')).toBe('Best day!');
    expect(page.saved().records).toEqual({ best: 1500, bestServed: 1, plays: 1 });
    expect(document.querySelectorAll('#overPieces .piece').length).toBeGreaterThan(0);
  });

  it('counts at the keyboard: 1 to 8 a piece, Backspace one back, Enter to give', () => {
    const page = openPage();

    page.typeKey('Digit3');
    page.typeKey('Digit2');
    page.typeKey('Backspace');
    page.typeKey('Enter');
    page.step();

    expect(document.getElementById('blank').classList.contains('is-paid')).toBe(true);
  });

  it('opens a new day from the tally, from nothing', () => {
    const page = openPage();

    page.serve();
    page.wait(62000);
    page.click('#m-over [data-act="again"]');
    page.step();

    expect(page.view()).toBe('title');
    expect(page.game.run).toMatchObject({ served: 0, takings: 0 });
    expect(page.text('serial')).toBe('No 0001');
  });
});

describe('keys pressed faster than the page draws', () => {
  it('still take back the piece just dealt', () => {
    const page = openPage();

    page.typeKey('Digit2');
    page.typeKey('Digit2');
    page.typeKey('Digit3');
    page.typeKey('Backspace');
    page.typeKey('Backspace');
    page.step();

    expect(page.game.run.cloth).toEqual({ 500: 1 });
  });
});
