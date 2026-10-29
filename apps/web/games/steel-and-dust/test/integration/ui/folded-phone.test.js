// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { openMenu, openPage } from '../../support/menu-page.js';

const rect = (x, y, width, height) => ({ x, y, width, height });
const FOLD_FLAT = [rect(0, 0, 1104, 884)];
const FOLD_ON_TABLE = [rect(0, 0, 1104, 442), rect(0, 442, 1104, 442)];
const DUO_AS_BOOK = [rect(0, 0, 540, 720), rect(574, 0, 540, 720)];
const FLIP_ON_TABLE = [rect(0, 0, 412, 502), rect(0, 502, 412, 502)];

// Chrome hands the page its segments on window.viewport; happy-dom has none, so the test folds
// the phone by hand
function fold(segments) {
  Object.defineProperty(window, 'viewport', { value: { segments }, configurable: true });
}

// happy-dom lays nothing out, so the app takes the phone's size by hand
function holdPhone(width, height) {
  const app = document.getElementById('app');
  Object.defineProperties(app, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
  });
  window.dispatchEvent(new Event('resize'));
}

function stage() {
  const { left, top, width, height } = document.getElementById('stage').style;

  return rect(...[left, top, width, height].map(parseFloat));
}

// the real stick, which rests on every fit, as main.js has it
const realStick = () => document.querySelector('#touch .pad-stick');

function openLayoutEditor(page) {
  page.openLayoutEditor();
  expect(openMenu().id).toBe('m-layout');
}

const preview = () => document.querySelector('#m-layout .layout-preview');
const boxOf = ({ style }) => [style.left, style.top, style.width, style.height];
const menuWidth = () => document.getElementById('menus').style.getPropertyValue('--menu-width');

describe('the page on a folded phone', () => {
  let posture;
  let page;

  beforeEach(() => {
    posture = new EventTarget();
    Object.defineProperty(window.navigator, 'devicePosture', {
      value: posture,
      configurable: true,
    });
    fold(FOLD_FLAT);
    page = openPage();
    page.game.device.coarsePointer = true;
  });

  afterEach(() => {
    delete window.viewport;
    delete window.navigator.devicePosture;
  });

  it('stands the game over the touch buttons on an unfolded Fold', () => {
    holdPhone(1104, 884);

    expect(stage()).toEqual(rect(0, 0, 1104, 621));
  });

  it('moves the game to the top half as the Fold is folded on a table, with no resize', () => {
    holdPhone(1104, 884);
    fold(FOLD_ON_TABLE);
    posture.dispatchEvent(new Event('change'));

    expect(stage()).toEqual(rect(159, 0, 785, 442));
  });

  it('keeps the stick, the buttons and pause on the bottom half of a Fold on a table', () => {
    const stick = realStick();

    fold(FOLD_ON_TABLE);
    holdPhone(1104, 884);
    const stickY = parseFloat(stick.style.top);

    expect(boxOf(document.getElementById('touch'))).toEqual(['0px', '442px', '1104px', '442px']);
    expect(stickY).toBeGreaterThan(64);
    expect(stickY).toBeLessThan(442 - 64);
  });

  it("moves pause from the game's HUD row to the bottom half as a Flip is folded on a table", () => {
    const app = document.getElementById('app').style;

    fold([rect(0, 0, 412, 1004)]);
    holdPhone(412, 1004);

    expect([app.getPropertyValue('--pause-top'), app.getPropertyValue('--pause-right')]).toEqual([
      '0px',
      '88px',
    ]);

    fold(FLIP_ON_TABLE);
    posture.dispatchEvent(new Event('change'));

    expect(app.getPropertyValue('--pause-top')).toBe('');
  });

  it('gives the touch controls the whole screen again once the Fold lies flat', () => {
    fold(FOLD_ON_TABLE);
    holdPhone(1104, 884);
    fold(FOLD_FLAT);
    posture.dispatchEvent(new Event('change'));

    expect(document.getElementById('touch').style.top).toBe('');
  });

  it("lays the button layout editor's controls where the real ones stand, as the phone folds", () => {
    fold(FOLD_ON_TABLE);
    holdPhone(1104, 884);
    openLayoutEditor(page);

    expect(boxOf(preview())).toEqual(['0px', '442px', '1104px', '442px']);

    fold(FOLD_FLAT);
    posture.dispatchEvent(new Event('change'));

    expect(boxOf(preview())).toEqual(['', '', '', '']);
  });

  it('keeps the game and the menus on one screen of a Surface Duo held like a book', () => {
    fold(DUO_AS_BOOK);
    holdPhone(1114, 720);
    const { x, width } = stage();

    expect(x + width).toBeLessThanOrEqual(540);
    expect(menuWidth()).toBe('540px');
  });

  it('gives the menus the whole screen again once the phone lies flat', () => {
    fold(DUO_AS_BOOK);
    holdPhone(1114, 720);
    fold([rect(0, 0, 1114, 720)]);
    posture.dispatchEvent(new Event('change'));

    expect(menuWidth()).toBe('');
    expect(stage().width).toBeGreaterThan(540);
  });
});
