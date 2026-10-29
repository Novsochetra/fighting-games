import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAD_STYLES } from '../../../../packages/touch-pad/src/pad-styles.js';
import { CLASSIC } from '../../src/data/skins/classic.js';
import { STICK_RADIUS } from '../../src/ui/screen/stage-layout.js';

const css = readFileSync(new URL('../../styles/touch-buttons.css', import.meta.url), 'utf8');
const stickCss = readFileSync(new URL('../../styles/touch.css', import.meta.url), 'utf8');

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

// the classic skin draws the controls the touch pad (packages/touch-pad) stands and sizes, and
// leaves where they stand to styles/touch-buttons.css
describe('the original touch button layout', () => {
  it('draws the stick and the five buttons, named and in their order', () => {
    const { landscape, portrait } = CLASSIC.layouts;

    expect(portrait).toBe(landscape);
    expect(landscape.items.map(({ id, label, class: names }) => [id, label, names])).toEqual([
      ['stick', undefined, 'classic-stick'],
      ['ult', 'ULT', 'tb tb-ult'],
      ['dash', 'DASH', 'tb tb-dash'],
      ['jump', 'JUMP', 'tb tb-jump'],
      ['heavy', 'HEAVY', 'tb tb-heavy'],
      ['light', 'ATTACK', 'tb tb-atk'],
    ]);
    expect(landscape.items.some((item) => item.at)).toBe(false);
  });

  it('keeps every button where it was and as big as it was', () => {
    for (const [selector, [size, right, bottom]] of Object.entries(ORIGINAL)) {
      const rule = ruleOf(selector);
      expect(rule).toContain(`--pad-base: ${size}px;`);
      expect(rule).toContain(`right: calc(${right}px * var(--btn));`);
      expect(rule).toContain(`bottom: calc(${bottom}px * var(--btn));`);
    }
  });

  it('anchors the cluster bottom right and centres each button on its point', () => {
    expect(ruleOf('.pad-controls')).toContain('right: calc(14px + var(--sar));');
    expect(ruleOf('.pad-controls')).toContain('bottom: calc(14px + var(--sab));');
    expect(ruleOf(':root', stickCss)).toContain('--pad-scale: var(--btn);');
    expect(PAD_STYLES).toContain(
      '--pad-diameter: calc(var(--pad-base, 64px) * var(--pad-scale, 1) * var(--pad-size, 1));',
    );
    expect(ruleOf('.tb')).toContain('translate: 50% 50%;');
    expect(ruleOf('.tb.on')).toContain('scale: 0.93;');
  });

  it('moves ULT up between JUMP and DASH on an upright phone', () => {
    const portrait = css.match(/@media \(orientation: portrait\) \{([\s\S]*?)\n\}/)[1];
    expect(ruleOf('.tb-ult', portrait)).toContain('right: calc(100px * var(--btn));');
    expect(ruleOf('.tb-ult', portrait)).toContain('bottom: calc(212px * var(--btn));');
  });

  it('only places a button by its centre inside a placed layout', () => {
    expect(css).not.toContain('--pad-x');
    expect(PAD_STYLES.match(/var\(--pad-x\)/g)).toHaveLength(1);
    expect(PAD_STYLES).toContain('.pad-placed > .pad-button, .pad-placed > .pad-dpad {');
  });

  it('keeps the stick in the left 48% of the screen, as big as it was', () => {
    const zone = ruleOf('.pad-zone', stickCss);
    expect(zone).toContain('left: 0;');
    expect(zone).toContain('width: 48%;');
    // 128px across, its knob 56px (0.4375 of it), centred on where it rests, times the Button size
    expect(PAD_STYLES).toContain(
      '--pad-diameter: calc(var(--pad-base, 128px) * var(--pad-scale, 1) * var(--pad-size, 1));',
    );
    expect(PAD_STYLES).toContain('width: calc(var(--pad-diameter) * 0.4375);');
    // the rest position and a placed stick's zone are worked out from the same radius
    expect(STICK_RADIUS).toBe(64);
  });
});
