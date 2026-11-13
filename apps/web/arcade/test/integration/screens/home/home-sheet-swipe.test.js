// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  bootWithSteelAndDust,
  byId,
  click,
  dispatch,
  stopHomes,
} from '../../../support/home-harness.js';

// A phone's sheet pulls down like a UIKit sheet: it follows the finger from its top, closes past a
// third of its height or on a flick, and otherwise goes back into place.
const sheet = () => byId('details');
const pull = () => sheet().style.getPropertyValue('--sheet-pull');

// happy-dom lays nothing out, so the sheet is given a phone's box: 600 tall from y 244 to the bottom.
function openOnPhone() {
  click(byId('details-open'));
  sheet().getBoundingClientRect = () => ({ left: 0, right: 390, top: 244, bottom: 844 });
  Object.defineProperty(sheet(), 'offsetHeight', { configurable: true, value: 600 });
}

function touch(type, { x = 200, y, time }) {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: type === 'touchend' ? [] : [{ clientX: x, clientY: y }],
  });

  Object.defineProperty(event, 'timeStamp', { value: time });

  return dispatch(sheet(), event);
}

function swipe(ys, { lift = true, x = 200 } = {}) {
  touch('touchstart', { y: 300, time: 0 });

  const moves = ys.map((y, i) => touch('touchmove', { x, y, time: 16 * (i + 1) }));

  if (lift) {
    touch('touchend', { y: ys.at(-1), time: 16 * (ys.length + 1) });
  }

  return moves;
}

const slowly = (from, to) => Array.from({ length: 20 }, (_, i) => from + ((to - from) * i) / 19);

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(stopHomes);

describe('pulling the sheet down', () => {
  it('moves the sheet with the finger and lifts the dimming as it goes', async () => {
    await bootWithSteelAndDust();
    openOnPhone();

    const moves = swipe([310, 430], { lift: false });

    expect(moves.every((move) => move.defaultPrevented)).toBe(true);
    expect(sheet().style.translate).toBe('0 120px');
    expect(sheet().classList.contains('is-dragging')).toBe(true);
    expect(pull()).toBe('0.2');
  });

  it('closes the sheet once pulled past a third of it', async () => {
    await bootWithSteelAndDust();
    openOnPhone();
    swipe(slowly(301, 560));

    expect(sheet().open).toBe(false);
    expect(sheet().style.translate).toBe('');
    expect(pull()).toBe('');
    expect(document.documentElement.classList.contains('has-open-sheet')).toBe(false);
  });

  it('closes the sheet on a flick, however short', async () => {
    await bootWithSteelAndDust();
    openOnPhone();
    swipe([310, 340, 380]);

    expect(sheet().open).toBe(false);
  });

  it('puts the sheet back after a short, slow pull', async () => {
    await bootWithSteelAndDust();
    openOnPhone();
    swipe(slowly(301, 400));

    expect(sheet().open).toBe(true);
    expect(sheet().style.translate).toBe('');
    expect(pull()).toBe('');
    expect(sheet().classList.contains('is-dragging')).toBe(false);
  });
});

describe('a touch that is not a pull', () => {
  it('scrolls a sheet scrolled down instead of pulling it', async () => {
    await bootWithSteelAndDust();
    openOnPhone();
    sheet().scrollTop = 80;

    const moves = swipe(slowly(301, 560));

    expect(moves.some((move) => move.defaultPrevented)).toBe(false);
    expect(sheet().open).toBe(true);
    expect(sheet().style.translate).toBe('');
  });

  it('leaves a move up or sideways to the page', async () => {
    await bootWithSteelAndDust();
    openOnPhone();

    expect(swipe([290, 200]).some((move) => move.defaultPrevented)).toBe(false);
    expect(swipe([302, 310], { x: 260 }).some((move) => move.defaultPrevented)).toBe(false);
    expect(sheet().open).toBe(true);
  });

  it('pulls nothing from the dimmed page above the sheet', async () => {
    await bootWithSteelAndDust();
    openOnPhone();
    touch('touchstart', { y: 100, time: 0 });
    touch('touchmove', { y: 500, time: 16 });
    touch('touchend', { y: 500, time: 32 });

    expect(sheet().style.translate).toBe('');
    expect(sheet().open).toBe(true);
  });
});
