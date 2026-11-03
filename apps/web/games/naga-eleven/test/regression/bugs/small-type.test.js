import { describe, expect, it } from 'vitest';
import { pageRules, rulesOf, styleOf, valueOf } from '../../support/page-styles.js';

// the screens' second lines (chapter labels and states, the XP note, a move's kind and cost, the
// spirit line, How to play's notes, Continue's note, a goal's move) were 8 px Silkscreen and 12 px
// Khmer at every size; and at phone width a move card squeezed its name, wrapping POWER / SHOT
// and 20 / SPIRIT
const TOKENS = rulesOf(styleOf('tokens.css'));

const pxOf = (selector, token) =>
  parseFloat(valueOf(TOKENS.find((rule) => rule.selector === selector).body, token));

const screenRules = () => pageRules().filter((rule) => rule.sheet !== 'styles/touch.css');

const ruleFor = (selector, at = '') =>
  pageRules().find((rule) => rule.selector === selector && rule.at === at)?.body ?? '';

describe('the screens’ small words', () => {
  it('are no smaller than 16 px in English and 14 px in Khmer', () => {
    expect(pxOf(':root', '--font-size-note')).toBeGreaterThanOrEqual(16);
    expect(pxOf(':lang(en)', '--font-size-note')).toBeGreaterThanOrEqual(16);
    expect(pxOf(':lang(km)', '--font-size-note')).toBeGreaterThanOrEqual(14);
  });

  it('never use the old 8 px size on a screen', () => {
    const tiny = screenRules().filter((rule) => rule.body.includes('--font-size-micro)'));

    expect(tiny.map((rule) => `${rule.sheet} ${rule.selector}`)).toEqual([]);
  });

  it('say a move’s cost on one line, and let its name take the width that is left', () => {
    expect(valueOf(ruleFor('.move-cost'), 'white-space')).toBe('nowrap');
    expect(valueOf(ruleFor('.move-name'), 'min-width')).toBe('0');
    expect(valueOf(ruleFor('.move-list'), 'grid-template-columns')).toMatch(/minmax\(0, 1fr\)/);
  });

  it('put a move’s name under its kind and cost where a list is narrow', () => {
    const narrow = pageRules().find(
      (rule) => rule.selector === '.move' && rule.at.startsWith('@container moves'),
    );

    expect(narrow.body).toMatch(/'name name'/);
  });
});
