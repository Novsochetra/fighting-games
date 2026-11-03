// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WORLD_VIEW } from '../../../src/config.js';
import { installTouch } from '../../../src/input/touch.js';
import { createInput } from '../../../src/sim/input-state.js';
import { fitStage } from '../../../src/ui/stage.js';

// Held upright, a 375 x 812 phone showed the pitch as a 375 x 211 strip at its top over 350 px of
// black, the footballers 7 px tall and the HUD's words 4. Upright, a phone now shows a card asking
// for it sideways, and the match waits under it; sideways, a tablet upright and a desktop play on.
const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

let canvas;

const fit = ({ width, height, touchOn = true }) =>
  fitStage(
    { innerWidth: width, innerHeight: height, devicePixelRatio: 3 },
    { canvas, safe: NO_INSETS, touchOn },
  );

const card = () => document.getElementById('turn-card');
const isShown = () => document.documentElement.classList.contains('is-upright') && card() !== null;

beforeEach(() => {
  document.body.innerHTML =
    '<div id="app"><canvas id="pitch"></canvas><div id="touch"></div></div>';
  document.documentElement.className = 'touch-on';
  canvas = Object.assign(document.getElementById('pitch'), WORLD_VIEW);
});

describe('a phone held upright', () => {
  it.each([
    [375, 812],
    [390, 844],
    [430, 932],
    [320, 568],
  ])('asks to be turned sideways, %i x %i', (width, height) => {
    fit({ width, height });

    expect(isShown()).toBe(true);
    expect(card().textContent).toContain('Turn your phone sideways');
  });

  it('plays on once turned sideways', () => {
    fit({ width: 375, height: 812 });
    fit({ width: 812, height: 375 });

    expect(document.documentElement.classList.contains('is-upright')).toBe(false);
  });

  it('is not asked on a tablet upright or a desktop window shaped like a phone', () => {
    fit({ width: 768, height: 1024 });

    expect(isShown()).toBe(false);

    fit({ width: 375, height: 812, touchOn: false });

    expect(isShown()).toBe(false);
  });

  it('holds the match still under the card', () => {
    const onPause = vi.fn();
    const touch = installTouch(document.getElementById('touch'), {
      source: createInput().sources.touch,
      onPause,
    });
    const { portrait } = fit({ width: 375, height: 812 });

    touch.fit(portrait);
    document.documentElement.classList.add('is-playing');
    touch.show(null);

    expect(onPause).toHaveBeenCalledOnce();
  });
});
