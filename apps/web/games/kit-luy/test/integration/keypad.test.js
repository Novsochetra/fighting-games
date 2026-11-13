// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../support/open-page.js';

const press = (key) =>
  document
    .querySelector(`.key[data-key="${key}"]`)
    .dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0 }));

describe('answering on the number pad', () => {
  it('shows the pad in place of the cloth and the till, with the lesson on the bill', () => {
    openPage({ settings: { input: 'keypad' } });

    expect(document.getElementById('app').dataset.input).toBe('keypad');
    expect(document.querySelectorAll('.key')).toHaveLength(14);
  });

  it('writes the amount typed in the blank and pays it with Give', () => {
    const page = openPage({ settings: { input: 'keypad' } });

    press('1');
    press('000');
    page.step();
    expect(page.text('total')).toBe('1,000');

    page.give();
    page.step();
    expect(page.game.run.served).toBe(1);
    expect(page.text('mend')).toBe('+1,500៛');
  });

  it('erases a figure and clears them all', () => {
    const page = openPage({ settings: { input: 'keypad' } });

    press('1');
    press('5');
    press('erase');
    page.step();
    expect(page.text('total')).toBe('1');

    press('clear');
    page.step();
    expect(page.text('total')).toBe('');
  });

  it('types from the keyboard, both rows of figures, Backspace erasing', () => {
    const page = openPage({ settings: { input: 'keypad' } });

    page.typeKey('Digit1');
    page.typeKey('Numpad0');
    page.typeKey('Digit0');
    page.typeKey('Digit5');
    page.typeKey('Backspace');
    page.typeKey('Digit0');
    page.typeKey('Enter');
    page.step();

    expect(page.game.run.served).toBe(1);
  });

  it('writes the pad’s keys in Khmer numerals when those are chosen', () => {
    openPage({ settings: { input: 'keypad', numerals: 'khmer' } });

    expect(document.querySelector('.key[data-key="7"]').textContent).toBe('៧');
  });

  it('switches from Settings on the title, which opens the stall afresh on the pad', () => {
    const page = openPage();

    page.click('#app [data-act="settings"]');
    page.click('[data-setting="input"]');
    page.step();

    expect(page.game.run.mode).toBe('keypad');
    expect(document.getElementById('app').dataset.input).toBe('keypad');
  });

  it('keeps its own best day apart from counting money', () => {
    const page = openPage({ settings: { input: 'keypad' } });

    press('1');
    press('000');
    page.give();
    page.wait(60000);

    expect(page.saved().records.keypad.plays).toBe(1);
    expect(page.saved().records.money.plays).toBe(0);
  });
});
