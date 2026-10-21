import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../styles/touch-buttons.css', import.meta.url), 'utf8');

function ruleOf(selector, source = css) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rule = source.match(new RegExp(`(?:^|\\n)\\s*${escaped} \\{([^}]*)\\}`));
  expect(rule, selector).not.toBeNull();
  return rule[1];
}

// the original layout, as it stood before the buttons could be moved: each button's size and its
// centre's distance from the cluster's right and bottom edges, in px times the Button size setting
const ORIGINAL = {
  '.tb-atk': [96, 52, 52],
  '.tb-heavy': [78, 146, 40],
  '.tb-jump': [76, 46, 150],
  '.tb-dash': [62, 130, 128],
  '.tb-ult': [56, 214, 112],
};

describe('the original touch button layout', () => {
  it('keeps every button where it was and as big as it was', () => {
    for (const [selector, [size, right, bottom]] of Object.entries(ORIGINAL)) {
      const rule = ruleOf(selector);
      expect(rule).toContain(`--tb-base: ${size}px;`);
      expect(rule).toContain(`right: calc(${right}px * var(--btn));`);
      expect(rule).toContain(`bottom: calc(${bottom}px * var(--btn));`);
    }
  });

  it('anchors the cluster bottom right and centres each button on its point', () => {
    expect(ruleOf('.btns')).toContain('right: calc(14px + var(--sar));');
    expect(ruleOf('.btns')).toContain('bottom: calc(14px + var(--sab));');
    const button = ruleOf('.tb');
    expect(button).toContain('width: calc(var(--tb-base) * var(--btn) * var(--tb-size, 1));');
    expect(button).toContain('translate: 50% 50%;');
    expect(ruleOf('.tb.on')).toContain('scale: 0.93;');
  });

  it('moves ULT up between JUMP and DASH on an upright phone', () => {
    const portrait = css.match(/@media \(orientation: portrait\) \{([\s\S]*?)\n\}/)[1];
    expect(ruleOf('.tb-ult', portrait)).toContain('right: calc(100px * var(--btn));');
    expect(ruleOf('.tb-ult', portrait)).toContain('bottom: calc(212px * var(--btn));');
  });

  it('only places a button by its custom centre inside a custom layout', () => {
    expect(css.match(/var\(--tb-x\)/g)).toHaveLength(1);
    expect(ruleOf('.btns.custom .tb')).toContain('var(--tb-x)');
  });
});
