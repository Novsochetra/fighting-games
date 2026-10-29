// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HAPTIC_CUES } from '../../../src/data/haptics.js';
import { openPage } from '../../support/menu-page.js';

// happy-dom lays nothing out: each control gets a 100px square around its spot, and the stick's
// zone the left half of an 844x390 screen
const SPOTS = { light: [724, 298], dpad: [140, 275], stick: [90, 300] };

function stubRects() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
    if (this.classList.contains('pad-zone')) {
      return { left: 0, top: 0, right: 422, bottom: 390, width: 422, height: 390 };
    }
    const [x, y] = SPOTS[this.dataset.control] ?? [-500, -500];
    return { left: x - 50, top: y - 50, right: x + 50, bottom: y + 50, width: 100, height: 100 };
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function width() {
    return this.classList.contains('pad-knob') ? 44 : 100;
  });
}

function pointer(target, type, [x, y], pointerId = 1) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId, clientX: x, clientY: y }),
  );
}

const real = (control) => document.querySelector(`#touch [data-control="${control}"]`);

describe('the feel of the touch controls in play', () => {
  let page;
  let vibrate;

  beforeEach(() => {
    stubRects();
    page = openPage();
    vibrate = vi.fn();
    page.game.io.vibrate = vibrate;
    page.game.device.coarsePointer = true;
    page.layout.applyTouchSettings();
  });

  afterEach(() => vi.restoreAllMocks());

  it('ticks under the thumb on each press, never on letting go', () => {
    pointer(real('light'), 'pointerdown', SPOTS.light);
    pointer(real('light'), 'pointerup', SPOTS.light);
    pointer(real('light'), 'pointerdown', SPOTS.light);

    expect(vibrate.mock.calls).toEqual([[HAPTIC_CUES.tap], [HAPTIC_CUES.tap]]);
  });

  it('ticks as the stick turns a new way, not while it holds one', () => {
    const zone = document.querySelector('#touch .pad-zone');
    const [x, y] = SPOTS.stick;

    pointer(zone, 'pointerdown', [x, y]);
    pointer(zone, 'pointermove', [x + 40, y]);
    pointer(zone, 'pointermove', [x + 45, y]);
    pointer(zone, 'pointermove', [x + 40, y - 40]);
    pointer(zone, 'pointerup', [x + 40, y - 40]);

    expect(vibrate).toHaveBeenCalledTimes(2);
  });

  it('ticks a d-pad corner once for each of its two directions', () => {
    page.game.settings.skin = 'dusk';
    page.layout.applyTouchSettings();
    const [x, y] = SPOTS.dpad;

    pointer(real('dpad'), 'pointerdown', [x + 40, y - 40]);
    pointer(real('dpad'), 'pointerup', [x + 40, y - 40]);

    expect(vibrate).toHaveBeenCalledTimes(2);
  });

  it('stays still with Vibration off', () => {
    page.game.settings.haptics = false;
    pointer(real('light'), 'pointerdown', SPOTS.light);

    expect(vibrate).not.toHaveBeenCalled();
    expect(page.game.input.pressed.light).toBe(true);
  });

  it('pops a ring on each press, afresh even before the last one is over', () => {
    pointer(real('light'), 'pointerdown', SPOTS.light);
    expect(real('light').dataset.pulse).toBe('a');
    pointer(real('light'), 'pointerdown', SPOTS.light, 2);
    expect(real('light').dataset.pulse).toBe('b');
  });
});
