import { describe, expect, it } from 'vitest';
import { PAD_STYLES } from '../../src/pad-styles.js';

// the declarations of the pad's own rule for exactly this selector
function ruleFor(selector) {
  const rule = PAD_STYLES.split('}').find((block) => block.split('{')[0].trim() === selector);

  return rule?.split('{')[1] ?? '';
}

// Bug: the Clear skins' keys wore the browser's own button border, a white outset rim round each
// one, as their skin drew no border of its own; Classic and Dusk each draw one, so theirs hid it
describe('a button the pad draws', () => {
  it("wears none of the browser's own border, padding or margin, whatever the skin draws", () => {
    const rule = ruleFor('.pad-button');

    expect(rule).toMatch(/\bborder: 0;/);
    expect(rule).toMatch(/\bpadding: 0;/);
    expect(rule).toMatch(/\bmargin: 0;/);
  });
});
