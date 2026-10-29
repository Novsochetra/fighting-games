import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { TOP_BAR_HEIGHT } from '../../../src/render/hud/top-bar.js';
import { pausePlace } from '../../../src/ui/screen/pause-place.js';

// Bug: on an upright phone the pause button stood half as tall again as the HUD's top row it sits
// in, hanging below the clock and the score, a smooth glass square among the carved plaques. It took
// a thumb's 44px as its size, where the row is about 28px. It is now one more plaque of the row, as
// tall as the row, and only its reach past its edges is a thumb's 44px.
const css = readFileSync(new URL('../../../styles/touch.css', import.meta.url), 'utf8');

function ruleOf(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rule = css.match(new RegExp(`(?:^|\\n)${escaped} \\{([^}]*)\\}`));

  expect(rule, selector).not.toBeNull();

  return rule[1];
}

const rect = (x, y, width, height) => ({ x, y, width, height });

describe('the pause button on an upright phone', () => {
  for (const [phone, stage] of [
    ['an iPhone 15', rect(0, 0, 393, 221)],
    ['an iPhone SE', rect(0, 20, 375, 211)],
    ['a narrow Android phone', rect(0, 24, 360, 203)],
  ]) {
    it(`is no taller than the HUD's top row on ${phone}`, () => {
      const place = pausePlace({
        rect: stage,
        controlsBelow: true,
        hinge: null,
        width: stage.width,
      });
      const row = (TOP_BAR_HEIGHT * stage.width) / VIEW_WIDTH;

      expect(place.top).toBe(stage.y);
      expect(place.size).toBeLessThanOrEqual(Math.round(row));
    });
  }

  it('takes the row’s size as a carved plaque, and a thumb’s 44px to press', () => {
    const button = ruleOf('.pause-in-hud .tb-pause');

    expect(button).toContain('width: var(--pause-size);');
    expect(button).toContain('height: var(--pause-size);');
    expect(ruleOf('.pause-in-hud .tb-pause::before')).toContain(
      "border-image: url('../assets/ui/hud/score-frame.png') 11 12 round;",
    );
    expect(ruleOf('.pause-in-hud .tb-pause::after')).toContain(
      'inset: min(0px, (var(--pause-size) - 44px) / 2);',
    );
  });
});
