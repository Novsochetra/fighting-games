// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { layoutOf } from '../../../src/data/skins/skins.js';
import { outlinesOn, tightestGap } from '../../support/control-room.js';
import { openPage } from '../../support/menu-page.js';

// Bug: at Button size Large a Clear skin's keys grew into each other on most phones: held upright
// JUMP stood on the d-pad and the d-pad on HEAVY, held sideways HEAVY ran into ULT. Each key's
// offset from its corner grew with it, and the screen between the corners did not
function holdPhone(width, height) {
  const app = document.getElementById('app');
  Object.defineProperties(app, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
  });
  window.dispatchEvent(new Event('resize'));
}

function wearAtLarge(phone) {
  const page = openPage();

  page.game.device.coarsePointer = true;
  Object.assign(page.game.settings, { skin: 'clear-jade', buttonSize: 2 });
  holdPhone(...phone);
  page.layout.applyTouchSettings();

  return Number(document.documentElement.style.getPropertyValue('--btn'));
}

const stageBottom = () => {
  const { top, height } = document.getElementById('stage').style;

  return parseFloat(top) + parseFloat(height);
};

describe('a Clear skin at Button size Large on the real page', () => {
  it('keeps its keys apart, and DASH and ULT under the bezel, held upright', () => {
    const scale = wearAtLarge([390, 844]);
    const outlines = outlinesOn(layoutOf('clear-jade', 'portrait').items, [390, 844], scale);
    const shoulders = outlines.filter(({ id }) => id === 'dash' || id === 'ult');
    const bezelBottom = stageBottom() + 12 * scale + 14;

    expect(scale).toBeGreaterThan(1);
    expect(tightestGap(outlines)).toBeGreaterThanOrEqual(12 * scale - 0.01);
    expect(shoulders.every(({ box }) => box.top >= bezelBottom)).toBe(true);
  });

  it('keeps HEAVY from ULT, held sideways on a short phone', () => {
    const scale = wearAtLarge([740, 360]);
    const outlines = outlinesOn(layoutOf('clear-jade', 'landscape').items, [740, 360], scale);

    expect(scale).toBeGreaterThan(1);
    expect(tightestGap(outlines)).toBeGreaterThanOrEqual(12 * scale - 0.01);
  });
});
