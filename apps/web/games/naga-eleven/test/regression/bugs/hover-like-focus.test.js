import { describe, expect, it } from 'vitest';
import { pageRules } from '../../support/page-styles.js';

// A button or a row under the mouse took the very look of the one in focus (gold rim, gold words),
// so with the pad on one and the mouse resting on another two looked picked at once. Only focus
// turns gold; a mouse over one lights it in pale colours of its own.

const MENU_SHEETS = ['styles/buttons.css', 'styles/options.css'];
const GOLD = /--color-gold|--shadow-button-focus|--shadow-card-current/;

const menuRules = () => pageRules().filter((rule) => MENU_SHEETS.includes(rule.sheet));

const selectorsOf = (rule) => rule.selector.split(',').map((part) => part.trim());

const focusing = (part) => part.replace(/:not\(:focus\)/g, '').includes(':focus');

describe('a menu under the mouse', () => {
  it('never shares a rule with the one in focus', () => {
    const shared = menuRules().filter((rule) => {
      const selectors = selectorsOf(rule);

      return selectors.some((part) => part.includes(':hover')) && selectors.some(focusing);
    });

    expect(shared.map((rule) => rule.selector)).toEqual([]);
  });

  it('lights a button, a row or a tab without gold, and leaves the one in focus as it is', () => {
    const hovers = menuRules().filter((rule) => rule.selector.includes(':hover'));
    const gilded = hovers.filter(
      (rule) => GOLD.test(rule.body) && !rule.selector.includes('.step-button'),
    );
    const overFocus = hovers.filter(
      (rule) =>
        !rule.selector.includes('.step-button') &&
        !rule.selector.includes(':not([aria-selected') &&
        !selectorsOf(rule).every((part) => part.includes(':not(:focus)')),
    );

    expect(hovers.length).toBeGreaterThan(0);
    expect(gilded.map((rule) => rule.selector)).toEqual([]);
    expect(overFocus.map((rule) => rule.selector)).toEqual([]);
  });

  it('only lights on a screen with a mouse, so a tap never leaves a lit button behind', () => {
    const hovers = menuRules().filter((rule) => rule.selector.includes(':hover'));

    expect(hovers.filter((rule) => !rule.at.includes('(hover: hover)'))).toEqual([]);
  });

  it('still gilds the button and the row in focus, and points the cursor at the button', () => {
    const bodyOf = (selector) =>
      menuRules().find((rule) => selectorsOf(rule).includes(selector))?.body ?? '';

    expect(bodyOf('.btn:focus')).toMatch(/--shadow-button-focus/);
    expect(bodyOf('.btn:focus::before')).toMatch(/--shadow-cursor/);
    expect(bodyOf('.option-row:focus')).toMatch(/--shadow-card-current/);
    expect(bodyOf('.option-row:focus .option-label')).toMatch(/--color-gold-light/);
  });
});
